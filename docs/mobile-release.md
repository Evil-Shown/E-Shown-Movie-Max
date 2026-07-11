# Mobile Release Process

This document describes how to create a production-ready mobile release using the automated release script and how the GitHub Actions workflow integrates.

---

## Overview

The release process is fully automated:

1. **Local**: Run `node scripts/release-mobile.mjs` — interactive script that bumps versions, generates release notes, commits, tags, and pushes.
2. **CI/CD**: Pushing the `mobile-v*` tag triggers the **Mobile Release Build** GitHub Action.
3. **Action**: Builds APK/AAB via EAS, parses the build URL, creates a GitHub Release with artifacts and release notes.

---

## Release Script (`scripts/release-mobile.mjs`)

### What It Does

1. **Safety Checks**
   - Verifies Git working tree is clean (no uncommitted changes)
   - Detects current branch dynamically (`git branch --show-current`)

2. **Version Bump**
   - Prompts for new version (semver: `x.y.z`)
   - Updates `mobile/package.json` version
   - Updates `mobile/app.json` version
   - Auto-increments `android.versionCode` in `app.json`

3. **Release Notes**
   - Prompts for structured sections:
     - Summary (one-liner)
     - New Features (comma-separated)
     - Bug Fixes (comma-separated)
     - Performance Improvements
     - Breaking Changes
     - Known Issues
   - Generates Markdown at `release-notes/mobile/mobile-v{VERSION}.md`

4. **Selective Staging**
   - Only stages modified files: `mobile/package.json`, `mobile/app.json`, and the new release notes file
   - Does NOT use `git add -A`

5. **Confirmation & Push**
   - Shows summary (version, branch, tag, files)
   - Asks for Y/N confirmation
   - On confirm: commits, tags `mobile-v{VERSION}`, pushes branch + tag

### Usage

```bash
# From repo root
node scripts/release-mobile.mjs

# Or via npm script
npm run release:mobile
```

### Example Session

```
  ── Chithra Cinema · Mobile Release ──

  Branch:  main
  Current version:  1.0.0

  New version (e.g. 1.1.0): 1.1.0

  Version → 1.1.0
  versionCode → 1 → 2

  Release summary (one-liner): Add offline caching and fix video playback

  New features (comma-separated, or Enter to skip): Offline movie caching, Dark mode toggle

  Bug fixes (comma-separated, or Enter to skip): Video stutter on low-end devices, Crash on rotation

  Performance improvements (comma-separated, or Enter to skip): Faster home screen load

  Breaking changes (comma-separated, or Enter to skip):

  Known issues (comma-separated, or Enter to skip): Subtitle sync on some streams

  ── Release Summary ──

  Version:   1.1.0
  Branch:    main
  Tag:       mobile-v1.1.0
  Files:
    • mobile/package.json
    • mobile/app.json
    • release-notes/mobile/mobile-v1.1.0.md

  Commit, tag, and push? (Y/n)
```

### Aborting

Press `Ctrl+C` at any prompt or answer `n` at the final confirmation. The script reverts all file changes automatically.

### Script Implementation Details

**Safety checks:**

```javascript
const gitStatus = run("git status --porcelain");
if (gitStatus.length > 0) abort("Git working tree is not clean...");

const branch = run("git branch --show-current");
```

**Version sync:**

```javascript
pkg.version = version;
app.expo.version = version;
app.expo.android.versionCode = (app.expo.android.versionCode ?? 1) + 1;
```

**Release notes file naming:**

```
release-notes/mobile/mobile-v{VERSION}.md
```

This matches the Git tag format (`mobile-v{VERSION}`) so the workflow's `body_path` resolves correctly.

**Selective staging:**

```javascript
for (const f of modifiedFiles) run(`git add "${f}"`);
```

**Commit & tag:**

```javascript
run(`git commit -m "release: mobile v${version}"`);
run(`git tag "mobile-v${version}"`);
run(`git push origin ${branch}`);
run(`git push origin "mobile-v${version}"`);
```

**Dependencies:** Uses `prompts` (installed as root devDependency) for interactive input.

---

## GitHub Actions Workflow (`.github/workflows/mobile-release.yml`)

### Trigger

Runs on push of tags matching `mobile-v*` (e.g., `mobile-v1.1.0`).

```yaml
on:
  push:
    tags:
      - "mobile-v*"
```

### Permissions

```yaml
permissions:
  contents: write # Required for creating GitHub Release
```

### Jobs

#### `build` (ubuntu-latest)

| Step                | Description                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Checkout            | Full history (needed for release notes)                                                                                 |
| Setup Node 20       | Caches `node_modules`                                                                                                   |
| Setup Expo & EAS    | Authenticates with `EXPO_TOKEN` secret                                                                                  |
| Install deps        | `npm ci` in `mobile/`                                                                                                   |
| **Expo Doctor**     | Runs `npx expo doctor` — **fails build on issues**                                                                      |
| Tests (conditional) | Runs `npm test` **only if** `mobile/package.json` has a `test` script                                                   |
| EAS Build           | `eas build --platform android --profile preview --non-interactive --json > ../build-output.json`                        |
| Parse Build Output  | Node script extracts `buildId`, `status`, `downloadUrl`, `dashboardUrl` from JSON                                       |
| **GitHub Release**  | Creates release using `softprops/action-gh-release@v2` with `body_path: release-notes/mobile/${{ github.ref_name }}.md` |

### Workflow File (Full)

```yaml
name: Mobile Release Build

on:
  push:
    tags:
      - "mobile-v*"

permissions:
  contents: write

jobs:
  build:
    name: Build & Release Mobile App
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mobile

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: mobile/package-lock.json

      - name: Setup Expo & EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Expo Doctor
        run: npx expo doctor

      - name: Run tests (if defined)
        run: |
          if node -e "const p=require('./package.json'); if(!p.scripts||!p.scripts.test){process.exit(1)}"; then
            npm test
          else
            echo "No test script found in mobile/package.json — skipping."
          fi

      - name: Build Preview APK (JSON output)
        run: eas build --platform android --profile preview --non-interactive --json > ../build-output.json

      - name: Parse EAS build info
        id: eas-build
        run: |
          node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('../build-output.json', 'utf8'));
            const build = Array.isArray(data) ? data[0] : data;
            if (!build) { console.error('No build found in output'); process.exit(1); }
            const buildId   = build.id || 'unknown';
            const status    = build.status || 'unknown';
            const buildUrl  = build.artifacts?.build?.url || build.buildUrl || 'N/A';
            const pageUrl   = build.artifacts?.build?.url || ('https://expo.dev/accounts/chithra/projects/chithra-cinema/builds/' + buildId);
            console.log('Build ID   : ' + buildId);
            console.log('Status     : ' + status);
            console.log('Download   : ' + buildUrl);
            console.log('Dashboard  : ' + pageUrl);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, 'build_id=' + buildId + '\n');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, 'build_status=' + status + '\n');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, 'download_url=' + buildUrl + '\n');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, 'page_url=' + pageUrl + '\n');
          "

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: release-notes/mobile/${{ github.ref_name }}.md
          draft: false
          prerelease: false
          files: |
            build-output.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Required Secrets

| Secret         | Description                                                                      |
| -------------- | -------------------------------------------------------------------------------- |
| `EXPO_TOKEN`   | Expo access token (`expo auth:token --scope=write` or from `~/.eas/config.json`) |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions                                                  |

### Workflow Outputs

The workflow prints to logs:

```
Build ID   : abc123-def456
Status     : finished
Download   : https://expo.dev/artifacts/...
Dashboard  : https://expo.dev/accounts/.../builds/abc123
```

The GitHub Release includes:

- Auto-generated title: `Mobile v1.1.0`
- Body from `release-notes/mobile/mobile-v1.1.0.md`
- `build-output.json` attached as artifact (contains full EAS build metadata)

### Parsing EAS Build JSON

The `eas build --json` output is an array of build objects. Each object contains:

```json
{
  "id": "abc123-def456",
  "status": "finished",
  "platform": "android",
  "profile": "preview",
  "artifacts": {
    "build": {
      "url": "https://expo.dev/artifacts/.../app.apk",
      "type": "apk"
    }
  },
  "buildUrl": "https://expo.dev/accounts/.../builds/abc123",
  "createdAt": "2026-07-12T10:30:00.000Z",
  "finishedAt": "2026-07-12T10:45:00.000Z"
}
```

The parsing script handles both array and single-object formats.

---

## Release Notes Format

The script generates Markdown like:

```markdown
# Mobile v1.1.0

> Add offline caching and fix video playback

## New Features

- Offline movie caching
- Dark mode toggle

## Bug Fixes

- Video stutter on low-end devices
- Crash on rotation

## Performance

- Faster home screen load

## Known Issues

- Subtitle sync on some streams

---

_Released 2026-07-12_
```

The filename `mobile-v1.1.0.md` matches the Git tag `mobile-v1.1.0`, so the workflow's `body_path` resolves correctly.

---

## Versioning Strategy

| Component             | Source                            | Increment Rule                  |
| --------------------- | --------------------------------- | ------------------------------- |
| `version` (semver)    | `mobile/package.json`, `app.json` | Manual via release script       |
| `android.versionCode` | `app.json`                        | Auto-increment (+1) per release |
| Git tag               | `mobile-v{version}`               | Created by release script       |

### Version Code Strategy

- Starts at `1` in `app.json`
- Incremented by `+1` per release
- Must be unique per Play Store upload
- Semver `version` (e.g., `1.2.3`) is for humans; `versionCode` is for Play Store

---

## Rollback / Hotfix

### Patch Release (Hotfix)

```bash
# Checkout production tag
git checkout mobile-v1.1.0
git checkout -b hotfix/video-crash

# Fix the issue, then run release script (will prompt for 1.1.1)
node scripts/release-mobile.mjs
```

### Reverting a Bad Release

```bash
# Delete remote tag
git push origin --delete mobile-v1.1.0

# Delete local tag
git tag -d mobile-v1.1.0

# Reset branch to previous commit (if needed)
git push origin main --force-with-lease
```

### Manual Build (Bypass CI)

```bash
cd mobile
eas build --platform android --profile production --local
# or
eas build --platform android --profile production
```

---

## Troubleshooting

| Problem                             | Solution                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Working tree not clean"            | Commit or stash changes before running script                                                   |
| Tag already exists                  | Delete remote: `git push origin --delete mobile-v1.1.0`, then local: `git tag -d mobile-v1.1.0` |
| Expo Doctor fails                   | Run `npx expo doctor` locally and fix reported issues                                           |
| Build stuck in queue                | Check EAS dashboard for quota; wait or buy credits                                              |
| Release notes not in GitHub Release | Verify `release-notes/mobile/mobile-vX.Y.Z.md` exists and matches tag name                      |
| `versionCode` not incremented       | Check `app.json` has `expo.android.versionCode` as integer                                      |
| `EXPO_TOKEN` invalid                | Regenerate: `expo auth:token --scope=write`                                                     |
| EAS build fails on native code      | Ensure `package.json` deps match Expo SDK version                                               |
| iOS build fails on Windows          | iOS builds require macOS; use EAS cloud or a Mac                                                |

---

## Related Scripts

| Script                        | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `scripts/release-mobile.mjs`  | Interactive release automation     |
| `package.json:release:mobile` | Shortcut: `npm run release:mobile` |

---

## Branch Strategy

The script works on **any branch** (detected via `git branch --show-current`). Recommended workflow:

- **main** = production releases
- **release/** = release branches (optional)
- **hotfix/** = hotfix branches from tags

The tag `mobile-v*` is what triggers the CI, not the branch name.

---

## Multi-Platform Releases (Future)

When adding iOS:

```yaml
# In workflow, add iOS build step
- name: Build iOS Production
  run: eas build --platform ios --profile production --non-interactive --json > ../build-output-ios.json
```

Release script would need to handle both platforms (version sync is shared; build is separate).

---

## Audit Trail

Each release creates:

1. **Git commit**: `release: mobile vX.Y.Z`
2. **Git tag**: `mobile-vX.Y.Z`
3. **Release notes file**: `release-notes/mobile/mobile-vX.Y.Z.md`
4. **GitHub Release**: with build artifacts and notes
5. **EAS build record**: in Expo dashboard

This provides full traceability from source → build → release.
