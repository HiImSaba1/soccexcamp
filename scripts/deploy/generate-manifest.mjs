import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const [releaseRoot, outputPath, gitCommit, buildTimestamp] = process.argv.slice(2);

if (!releaseRoot || !outputPath || !gitCommit || !buildTimestamp) {
  throw new Error("Usage: node generate-manifest.mjs <release-root> <output> <git-sha> <timestamp>");
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(absolute) : [absolute];
  });
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function glibcVersions(file) {
  try {
    const output = execFileSync("strings", [file], { encoding: "utf8" });
    return [...new Set(output.match(/GLIBC_\d+(?:\.\d+)*/g) ?? [])]
      .map((value) => value.replace("GLIBC_", ""))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

const packageJson = JSON.parse(readFileSync(join(releaseRoot, "package.json"), "utf8"));
const buildId = readFileSync(join(releaseRoot, ".next", "BUILD_ID"), "utf8").trim();
const nativeModules = filesBelow(releaseRoot)
  .filter((file) => file.endsWith(".node"))
  .map((file) => {
    const versions = glibcVersions(file);
    return {
      path: relative(releaseRoot, file).replaceAll("\\", "/"),
      bytes: statSync(file).size,
      sha256: sha256(file),
      glibcVersions: versions,
      highestGlibcVersion: versions.at(-1) ?? null,
    };
  });

const manifest = {
  application: "soccerxcamp-web",
  gitCommit,
  nextVersion: packageJson.dependencies?.next ?? null,
  nodeVersion: process.version,
  npmVersion: execFileSync("npm", ["--version"], { encoding: "utf8" }).trim(),
  buildTimestamp,
  buildId,
  nativeModules,
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
