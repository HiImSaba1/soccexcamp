# Sprint 12 — GitHub Linux release

The `Build Papaki standalone release` workflow runs on every push to `main` and can also be started manually from GitHub Actions.

It uses Ubuntu 22.04 and Node.js 22.23.2 to:

1. export the committed Git snapshot into a clean temporary directory;
2. install the locked dependency tree with development dependencies;
3. run Vitest, ESLint, TypeScript, and the Next.js production build;
4. package the Next.js standalone server, static assets, and public assets;
5. verify the TAR structure and portable SHA256 checksum;
6. start the packaged server and call `/api/health/live`;
7. upload the verified files as the `soccerxcamp-papaki-linux-release` Actions artifact.

The downloadable artifact contains:

- `soccerxcamp-papaki-next-build.tar.gz`
- `soccerxcamp-papaki-next-build.tar.gz.sha256`
- `soccerxcamp-papaki-next-build.tar.gz.manifest.json`

No environment files or deployment credentials are added to the archive or workflow. SMTP and other production values stay in the server-side environment.

## Deployment boundary

This workflow builds and verifies the release only. It does not connect to Papaki, extract over an active release, restart the application, or alter production.

SSH promotion requires the confirmed host, port, username, release and current-symlink paths, Node.js location, process manager or Plesk restart command, ownership expectations, and rollback procedure. Those values must be documented before a deployment job is added, and credentials must be stored in GitHub Environment Secrets rather than workflow YAML.
