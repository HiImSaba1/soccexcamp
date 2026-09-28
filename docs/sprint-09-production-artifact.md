# Sprint 9 — production artifact

Sprint 9 creates a reproducible Linux standalone artifact and stops before production. It does not upload files, change Plesk, restart Passenger, or touch the active WordPress site.

## Compatibility boundary

The Windows `.next` directory and Windows `node_modules` are never packaged. `build-artifact.sh` must run with Linux Node.js 22 inside WSL or compatible CI. It exports the committed Git snapshot into a temporary Linux directory, runs `npm ci`, all project quality gates, and `next build`, then packages the generated standalone server.

The production target is Node.js 22.23.2. The script enforces Node 22; the manifest records the exact version used. Use 22.23.2 for the release candidate so the build and host runtime match.

## Owner-run sequence

First commit and push the Sprint 9 tooling. A clean Git tree is an intentional packaging requirement. Then, from PowerShell at the repository root, invoke the Linux builder:

```powershell
wsl.exe bash -lc "cd /mnt/c/Users/sab_j/Desktop/Projects/Soccerxcamp/web && bash ./scripts/deploy/build-artifact.sh"
```

The output is written to ignored `artifacts/` files:

- `soccerxcamp-papaki-next-build.tar.gz`
- `soccerxcamp-papaki-next-build.tar.gz.sha256`
- `soccerxcamp-papaki-next-build.tar.gz.manifest.json`

The checksum contains only the archive filename, so it remains portable after downloading the GitHub Actions artifact.

Do not upload an artifact until the builder reports that integrity and content checks passed and the manifest has been reviewed.

## What is packaged

- standalone `server.js`, runtime `package.json`, and traced runtime dependencies;
- `.next/BUILD_ID` and `.next/static`;
- `public/` assets;
- an internal build manifest.

The verifier rejects `.env*`, PEM files, the WordPress XML, Git metadata, test output, migration reports, unsafe TAR paths, and missing runtime files.

## Native compatibility report

Every packaged `*.node` file is hashed and listed in both manifests. When GNU `strings` finds referenced `GLIBC_*` symbols, the report includes every version and the highest version for that binary. This is evidence for host-compatibility review; it is not permission to change production glibc or upload the artifact.

## Sprint boundary

Sprint 9 ends after local Linux artifact verification and manifest review. Upload, release-directory extraction, environment setup, Plesk cutover, Passenger restart, production health checks, and rollback recording belong to Sprint 10 and require explicit approval.
