import { readFile } from "node:fs/promises";
import path from "node:path";

type Summary = {
  source: { filename: string; bytes: number; sha256: string; wasModified: boolean };
  totals: { authors: number; records: number; attachments: number; links: number };
};

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const migrationRoot = path.join(repositoryRoot, "migration");

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

async function main(): Promise<void> {
  const summary = await readJson<Summary>(
    path.join(migrationRoot, "reports", "wxr-summary.json"),
  );
  const content = await readJson<unknown[]>(
    path.join(migrationRoot, "reports", "content-inventory.json"),
  );
  const authors = await readJson<unknown[]>(
    path.join(migrationRoot, "reports", "author-inventory.json"),
  );
  const links = await readJson<unknown[]>(
    path.join(migrationRoot, "reports", "link-inventory.json"),
  );
  const media = await readJson<unknown[]>(
    path.join(migrationRoot, "media-manifest.json"),
  );
  const routes = await readJson<unknown[]>(
    path.join(migrationRoot, "generated", "route-inventory.json"),
  );

  const checks: Array<[string, boolean]> = [
    ["source filename is recorded", Boolean(summary.source.filename)],
    ["source byte size is positive", summary.source.bytes > 0],
    ["source SHA-256 is valid", /^[a-f0-9]{64}$/.test(summary.source.sha256)],
    ["source remains read-only", summary.source.wasModified === false],
    ["author count matches summary", authors.length === summary.totals.authors],
    ["content count matches summary", content.length === summary.totals.records],
    ["media count matches summary", media.length === summary.totals.attachments],
    ["link count matches summary", links.length === summary.totals.links],
    ["route inventory cannot exceed content", routes.length <= content.length],
  ];

  for (const [label, passed] of checks) {
    console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
  }

  if (checks.some(([, passed]) => !passed)) {
    throw new Error("Migration analysis validation failed.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
