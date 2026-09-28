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

function compareVersions(left, right) {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}

function isNativeRuntimeBinary(file) {
  return /(?:\.node|\.so(?:\.\d+)*)$/.test(file);
}

const packageJson = JSON.parse(readFileSync(join(releaseRoot, "package.json"), "utf8"));
const buildId = readFileSync(join(releaseRoot, ".next", "BUILD_ID"), "utf8").trim();
const glibcTarget = "2.28";
const nativeBinaries = filesBelow(releaseRoot)
  .filter(isNativeRuntimeBinary)
  .sort((left, right) => left.localeCompare(right))
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
const incompatibleBinaries = nativeBinaries.filter(
  ({ highestGlibcVersion }) =>
    highestGlibcVersion !== null && compareVersions(highestGlibcVersion, glibcTarget) > 0,
);

if (incompatibleBinaries.length > 0) {
  const details = incompatibleBinaries
    .map(({ path, highestGlibcVersion }) => `${path} requires GLIBC_${highestGlibcVersion}`)
    .join("\n");
  throw new Error(`Native runtime compatibility check failed for GLIBC_${glibcTarget}:\n${details}`);
}

const manifest = {
  application: "soccerxcamp-web",
  gitCommit,
  nextVersion: packageJson.dependencies?.next ?? null,
  nodeVersion: process.version,
  npmVersion: execFileSync("npm", ["--version"], { encoding: "utf8" }).trim(),
  buildTimestamp,
  buildId,
  nativeCompatibility: {
    glibcTarget,
    compatible: true,
    highestRequiredVersion:
      nativeBinaries
        .map(({ highestGlibcVersion }) => highestGlibcVersion)
        .filter(Boolean)
        .sort(compareVersions)
        .at(-1) ?? null,
  },
  nativeBinaries,
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
