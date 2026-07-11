#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

function abort(msg) {
  console.error(`\n  ✖  ${msg}`);
  process.exit(1);
}

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

async function main() {
  console.log("\n  ── Chithra Cinema · Mobile Release ──\n");

  const gitStatus = run("git status --porcelain");
  if (gitStatus.length > 0) {
    abort("Git working tree is not clean. Commit or stash your changes first.");
  }

  const branch = run("git branch --show-current");
  if (!branch) {
    abort("Could not detect current Git branch.");
  }
  console.log(`  Branch:  ${branch}`);

  const pkgPath = path.join(ROOT, "mobile", "package.json");
  const appPath = path.join(ROOT, "mobile", "app.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const app = JSON.parse(fs.readFileSync(appPath, "utf8"));
  console.log(`  Current version:  ${pkg.version}\n`);

  const { version } = await prompts({
    type: "text",
    name: "version",
    message: "New version (e.g. 1.1.0)",
    initial: pkg.version,
    validate: (v) => (SEMVER_RE.test(v) ? true : "Must be semver: x.y.z"),
  });
  if (!version) abort("Version is required.");

  const oldVersionCode = app.expo?.android?.versionCode ?? 1;
  const newVersionCode = oldVersionCode + 1;

  pkg.version = version;
  app.expo.version = version;
  app.expo.android.versionCode = newVersionCode;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + "\n", "utf8");

  console.log(`\n  Version → ${version}`);
  console.log(`  versionCode → ${oldVersionCode} → ${newVersionCode}\n`);

  const notes = await prompts([
    {
      type: "text",
      name: "summary",
      message: "Release summary (one-liner)",
    },
    {
      type: "text",
      name: "features",
      message: "New features (comma-separated, or Enter to skip)",
    },
    {
      type: "text",
      name: "fixes",
      message: "Bug fixes (comma-separated, or Enter to skip)",
    },
    {
      type: "text",
      name: "performance",
      message: "Performance improvements (comma-separated, or Enter to skip)",
    },
    {
      type: "text",
      name: "breaking",
      message: "Breaking changes (comma-separated, or Enter to skip)",
    },
    {
      type: "text",
      name: "known",
      message: "Known issues (comma-separated, or Enter to skip)",
    },
  ]);

  const md = buildReleaseNotes(version, notes);
  const notesDir = path.join(ROOT, "release-notes", "mobile");
  fs.mkdirSync(notesDir, { recursive: true });
  const notesFile = path.join(notesDir, `mobile-v${version}.md`);
  fs.writeFileSync(notesFile, md, "utf8");

  const modifiedFiles = [
    path.relative(ROOT, pkgPath),
    path.relative(ROOT, appPath),
    path.relative(ROOT, notesFile),
  ];

  console.log("\n  ── Release Summary ──\n");
  console.log(`  Version:   ${version}`);
  console.log(`  Branch:    ${branch}`);
  console.log(`  Tag:       mobile-v${version}`);
  console.log(`  Files:`);
  for (const f of modifiedFiles) console.log(`    • ${f}`);

  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Commit, tag, and push?",
    initial: false,
  });

  if (!confirm) {
    console.log("\n  Aborted. Reverting file changes...\n");
    for (const f of modifiedFiles) {
      try {
        run(`git checkout -- "${f}"`);
      } catch {
        if (fs.existsSync(path.join(ROOT, f))) {
          fs.unlinkSync(path.join(ROOT, f));
        }
      }
    }
    console.log("  Done.\n");
    process.exit(0);
  }

  for (const f of modifiedFiles) {
    run(`git add "${f}"`);
  }

  run(`git commit -m "release: mobile v${version}"`);
  run(`git tag "mobile-v${version}"`);
  run(`git push origin ${branch}`);
  run(`git push origin "mobile-v${version}"`);

  console.log(`\n  ✔  Pushed mobile-v${version} to ${branch}\n`);
}

function buildReleaseNotes(version, notes) {
  const lines = [];
  lines.push(`# Mobile v${version}`);
  lines.push("");
  lines.push(`> ${notes.summary || "No summary provided."}`);
  lines.push("");

  const features = splitList(notes.features);
  if (features.length) {
    lines.push("## New Features");
    lines.push("");
    for (const item of features) lines.push(`- ${item}`);
    lines.push("");
  }

  const fixes = splitList(notes.fixes);
  if (fixes.length) {
    lines.push("## Bug Fixes");
    lines.push("");
    for (const item of fixes) lines.push(`- ${item}`);
    lines.push("");
  }

  const perf = splitList(notes.performance);
  if (perf.length) {
    lines.push("## Performance");
    lines.push("");
    for (const item of perf) lines.push(`- ${item}`);
    lines.push("");
  }

  const breaking = splitList(notes.breaking);
  if (breaking.length) {
    lines.push("## Breaking Changes");
    lines.push("");
    for (const item of breaking) lines.push(`- ${item}`);
    lines.push("");
  }

  const known = splitList(notes.known);
  if (known.length) {
    lines.push("## Known Issues");
    lines.push("");
    for (const item of known) lines.push(`- ${item}`);
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Released ${new Date().toISOString().slice(0, 10)}*`);
  lines.push("");
  return lines.join("\n");
}

function splitList(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
