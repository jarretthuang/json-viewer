const path = require("path");

function readInstalledNextVersion() {
  try {
    const installed = require(path.join(process.cwd(), "node_modules/next/package.json"));
    return installed.version;
  } catch {
    return undefined;
  }
}

const expectedVersion = require(path.join(process.cwd(), "package.json")).dependencies?.next;
const installedVersion = readInstalledNextVersion();

if (!installedVersion) {
  console.error("[pretest] Next.js is not installed. Run `npm ci` first.");
  process.exit(1);
}

if (expectedVersion !== installedVersion) {
  console.error(
    `[pretest] Installed next@${installedVersion} does not match package.json (${expectedVersion}).`,
  );
  console.error("[pretest] Run `npm ci` to sync node_modules with lockfile.");
  process.exit(1);
}
