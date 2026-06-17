import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(clientRoot, ".next");

const CRITICAL_DEV_MANIFESTS = [
  "routes-manifest.json",
  "build-manifest.json",
  "prerender-manifest.json",
  "fallback-build-manifest.json",
];

export function removeNextCache() {
  if (!fs.existsSync(nextDir)) return false;
  fs.rmSync(nextDir, { recursive: true, force: true });
  return true;
}

function isBrokenJsonManifest(filePath) {
  if (!filePath.endsWith(".json")) return false;
  if (!fs.existsSync(filePath)) return false;

  const stat = fs.statSync(filePath);
  if (stat.size === 0) return true;

  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) return true;
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
}

function findJsonManifests(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findJsonManifests(fullPath, results);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json") && entry.name.includes("manifest")) {
      results.push(fullPath);
    }
  }

  return results;
}

function hasIncompleteDevCache() {
  const devDir = path.join(nextDir, "dev");
  if (!fs.existsSync(devDir)) return false;

  const hasServer = fs.existsSync(path.join(devDir, "server"));
  const hasStatic = fs.existsSync(path.join(devDir, "static"));
  if (!hasServer && !hasStatic) return false;

  for (const name of CRITICAL_DEV_MANIFESTS) {
    const manifestPath = path.join(devDir, name);
    if (!fs.existsSync(manifestPath) || isBrokenJsonManifest(manifestPath)) {
      return true;
    }
  }

  return false;
}

function ensureDevCache() {
  if (!fs.existsSync(nextDir)) return;

  const brokenManifests = findJsonManifests(nextDir).filter(isBrokenJsonManifest);

  if (brokenManifests.length > 0 || hasIncompleteDevCache()) {
    if (brokenManifests.length > 0) {
      console.warn("[chithra] Corrupt Next.js manifest cache detected:");
      for (const file of brokenManifests) {
        console.warn(`  - ${path.relative(clientRoot, file)}`);
      }
    } else {
      console.warn("[chithra] Incomplete .next/dev cache detected.");
    }

    removeNextCache();
    console.warn("[chithra] Cleared .next — starting a fresh dev compile.");
  }
}

ensureDevCache();
