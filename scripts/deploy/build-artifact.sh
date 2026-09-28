#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This script must run inside Linux (WSL or compatible CI)." >&2
  exit 1
fi

command -v git >/dev/null || { echo "git is required." >&2; exit 1; }
command -v node >/dev/null || { echo "Node.js is required." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is required." >&2; exit 1; }
command -v tar >/dev/null || { echo "tar is required." >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum is required." >&2; exit 1; }
command -v strings >/dev/null || { echo "binutils (strings) is required." >&2; exit 1; }

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "Refusing to package a dirty repository. Commit Sprint 9 first." >&2
  git status --short >&2
  exit 1
fi

if [[ "$(node -p 'process.platform')" != "linux" ]]; then
  echo "The active Node.js runtime is not Linux-compatible." >&2
  exit 1
fi

node_version="$(node -p 'process.versions.node')"
if [[ "$node_version" != 22.* ]]; then
  echo "Node.js 22 is required; found $node_version." >&2
  exit 1
fi

git_sha="$(git rev-parse HEAD)"
short_sha="$(git rev-parse --short=12 HEAD)"
build_timestamp="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
artifact_dir="$repo_root/artifacts"
work_dir="$(mktemp -d)"
source_dir="$work_dir/source"
release_dir="$work_dir/release"
artifact_name="soccerxcamp-standalone-${short_sha}.tar.gz"

cleanup() { rm -rf -- "$work_dir"; }
trap cleanup EXIT

mkdir -p "$source_dir" "$release_dir" "$artifact_dir"
git archive --format=tar HEAD | tar -xf - -C "$source_dir"
cd "$source_dir"
export NEXT_TELEMETRY_DISABLED=1

echo "Installing the committed Linux dependency tree..."
npm ci
npm test
npm run lint
npx tsc --noEmit
npm run build

test -f .next/standalone/server.js
test -f .next/BUILD_ID
test -d .next/static
test -d public

cp -a .next/standalone/. "$release_dir/"
mkdir -p "$release_dir/.next"
cp -a .next/static "$release_dir/.next/static"
cp -a .next/BUILD_ID "$release_dir/.next/BUILD_ID"
cp -a public "$release_dir/public"

node scripts/deploy/generate-manifest.mjs \
  "$release_dir" \
  "$release_dir/ARTIFACT-MANIFEST.json" \
  "$git_sha" \
  "$build_timestamp"

if find "$release_dir" -type f \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name 'soccerxcamp.WordPress.*.xml' \) -print -quit | grep -q .; then
  echo "Forbidden secret or migration input found in release directory." >&2
  exit 1
fi

cd "$work_dir"
tar -czf "$artifact_dir/$artifact_name" -C "$release_dir" .
sha256sum "$artifact_dir/$artifact_name" > "$artifact_dir/$artifact_name.sha256"

artifact_sha="$(cut -d ' ' -f 1 "$artifact_dir/$artifact_name.sha256")"
artifact_bytes="$(stat -c '%s' "$artifact_dir/$artifact_name")"
node -e '
  const fs = require("node:fs");
  const [source, target, name, sha, bytes] = process.argv.slice(1);
  const data = JSON.parse(fs.readFileSync(source, "utf8"));
  data.artifact = { name, bytes: Number(bytes), sha256: sha };
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + "\n", "utf8");
' "$release_dir/ARTIFACT-MANIFEST.json" \
  "$artifact_dir/$artifact_name.manifest.json" \
  "$artifact_name" "$artifact_sha" "$artifact_bytes"

bash "$source_dir/scripts/deploy/verify-artifact.sh" "$artifact_dir/$artifact_name"

echo "Artifact: $artifact_dir/$artifact_name"
echo "Checksum: $artifact_dir/$artifact_name.sha256"
echo "Manifest: $artifact_dir/$artifact_name.manifest.json"
