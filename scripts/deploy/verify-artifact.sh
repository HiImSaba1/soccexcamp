#!/usr/bin/env bash
set -Eeuo pipefail

artifact="${1:-}"
[[ -n "$artifact" && -f "$artifact" ]] || { echo "Usage: verify-artifact.sh <artifact.tar.gz>" >&2; exit 1; }

checksum_file="$artifact.sha256"
[[ -f "$checksum_file" ]] || { echo "Missing checksum: $checksum_file" >&2; exit 1; }

cd "$(dirname "$artifact")"
sha256sum --check "$(basename "$checksum_file")"
tar -tzf "$(basename "$artifact")" >/dev/null

listing="$(tar -tzf "$(basename "$artifact")")"
for required in './server.js' './package.json' './.next/BUILD_ID' './.next/static/' './public/' './ARTIFACT-MANIFEST.json'; do
  grep -Fq "$required" <<<"$listing" || { echo "Missing required archive entry: $required" >&2; exit 1; }
done

if grep -Eq '(^|/)(\.git|node_modules/\.cache|\.env($|\.)|soccerxcamp\.WordPress\..*\.xml|migration/reports|playwright-report|test-results)(/|$)' <<<"$listing"; then
  echo "Archive contains a forbidden development, secret, or migration path." >&2
  exit 1
fi

if awk -F/ 'BEGIN{bad=0} /(^|\/)\.\.($|\/)|^\// {bad=1} END{exit bad ? 0 : 1}' <<<"$listing"; then
  echo "Archive contains an unsafe absolute or parent-traversal path." >&2
  exit 1
fi

echo "Artifact integrity and content checks passed."
