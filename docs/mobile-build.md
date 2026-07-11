# Mobile Build Guide

This document explains how to build the Chithra Cinema mobile app locally and on EAS Cloud, and how the `eas.json` profiles work.

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Android SDK** (for local builds) or **EAS account** (for cloud builds)
- **Java/JDK 17+** (required for Android builds)
- **Git** (for version management)

---

## Configuration Files

### `mobile/app.json`

Core app config:

- **name**: "Chithra Cinema"
- **version**: Synced with `mobile/package.json` (updated by release script)
- **android.versionCode**: Auto-incremented by release script
- **android.package**: `com.chithra.cinema`
- **scheme**: `chithra-cinema` (deep linking)
- **orientation**: portrait
- **userInterfaceStyle**: automatic
- **plugins**: expo-router, expo-splash-screen, expo-font, expo-image, react-native-video
- **experiments.typedRoutes**: true (Expo Router v3+)

### `mobile/eas.json`

Defines build profiles for EAS Build:

```json
{
  "cli": {
    "version": ">= 5.9.1",
    "promptToConfigurePushNotifications": false
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": { "production": {} }
}
```

| Profile       | Use Case                   | Output              | Distribution          |
| ------------- | -------------------------- | ------------------- | --------------------- |
| `development` | Dev client with hot reload | `.apk` (dev client) | Internal (QR/URL)     |
| `preview`     | QA / internal testing      | `.apk`              | Internal              |
| `production`  | Play Store release         | `.aab` (App Bundle) | Play Store / Internal |

### `mobile/package.json` Scripts

```json
{
  "scripts": {
    "mobile:dev": "eas build --platform android --profile development",
    "mobile:preview": "eas build --platform android --profile preview",
    "mobile:production": "eas build --platform android --profile production",
    "mobile:submit": "eas submit --platform android --profile production",
    "mobile:build:local": "eas build --platform android --profile preview --local"
  }
}
```

---

## Build Methods

### 1. EAS Cloud Build (Recommended)

Runs on Expo's infrastructure. No local Android SDK needed.

#### Preview APK (QA / Internal)

```bash
cd mobile
npm run mobile:preview
# or
eas build --platform android --profile preview
```

- Produces installable `.apk`
- Uploads to Expo artifact storage
- Download link in build logs / Expo dashboard
- Good for: sharing with testers, internal QA

#### Production AAB (Play Store)

```bash
cd mobile
npm run mobile:production
# or
eas build --platform android --profile production
```

- Produces `.aab` (Android App Bundle)
- Required for Play Store submission
- Can be downloaded from Expo dashboard for manual upload

#### Development Client

```bash
cd mobile
npm run mobile:dev
# or
eas build --platform android --profile development
```

- Includes `expo-dev-client` for live reload
- Use with `npx expo start --dev-client`
- Good for: developing native modules, testing native code changes

### 2. Local Build (`--local`)

Runs the entire build on your machine. Requires full Android SDK setup.

```bash
cd mobile
npm run mobile:build:local
# or
eas build --platform android --profile preview --local
```

**Requirements:**

- JDK 17+
- Android SDK (API 34)
- `ANDROID_HOME` set
- `adb` in PATH
- Gradle daemon enabled

**Pros:**

- No upload/download wait
- Full control over build environment
- Works offline

**Cons:**

- Heavy local dependencies
- Must maintain SDK/NDK versions
- Slower on modest hardware

### 3. `expo build` (Legacy / Classic)

> **Deprecated** — Use EAS Build instead. The classic build service is retired.

---

## Environment Variables in Builds

### Build-Time (Injected at Build)

Defined in **EAS Dashboard → Project → Build → Secrets**:

| Secret                | Profile(s) | Purpose              |
| --------------------- | ---------- | -------------------- |
| `EXPO_PUBLIC_API_URL` | All        | Backend API base URL |

These are embedded in the JS bundle at compile time. **Do not put secrets here.**

### Runtime (Read from `.env` at Startup)

Only used during `expo start` (development). **Not bundled in production builds.**

| File                | Used By                      |
| ------------------- | ---------------------------- |
| `mobile/.env`       | Local `npx expo start`       |
| `mobile/.env.local` | Local overrides (gitignored) |

> **Production builds ignore `.env` files.** All public config must come from EAS Secrets.

---

## Build Artifacts

| Profile       | Artifact              | Location                           |
| ------------- | --------------------- | ---------------------------------- |
| `preview`     | `app-preview.apk`     | Expo build page / `eas build:list` |
| `production`  | `app-production.aab`  | Expo build page                    |
| `development` | `app-development.apk` | Expo build page                    |

### Downloading Artifacts

```bash
# List recent builds
eas build:list --platform android --limit 5

# Download specific build
eas build:download --platform android --output ./builds/
```

---

## Submitting to Play Store

### Automated (via GitHub Action)

The release workflow handles this when you push a `mobile-v*` tag.

### Manual

```bash
cd mobile
npm run mobile:production   # Build AAB
npm run mobile:submit       # Upload to Play Console
```

**Requires:**

- `google-services.json` in `mobile/` (for Play Integrity)
- Service account key with Play Developer API access
- `EAS_SUBMIT_GOOGLE_SERVICE_ACCOUNT_KEY` secret in EAS

---

## Troubleshooting

| Issue                      | Solution                                               |
| -------------------------- | ------------------------------------------------------ |
| `eas build` hangs          | Check Expo dashboard for logs; try `--local`           |
| `Gradle` OOM               | Add `org.gradle.jvmargs=-Xmx4g` to `gradle.properties` |
| `versionCode` conflict     | Run release script (auto-increments)                   |
| Keystore error             | `eas credentials` → configure keystore                 |
| Network timeout            | Use `--local` or check firewall/proxy                  |
| Build fails on native code | Ensure `package.json` deps match Expo SDK version      |

### Useful Commands

```bash
# Check EAS CLI version
eas --version

# Login / whoami
eas login
eas whoami

# Manage credentials
eas credentials

# View build logs
eas build:view <build-id>

# Cancel stuck build
eas build:cancel <build-id>
```

---

## Version Management

The **release script** (`scripts/release-mobile.mjs`) handles:

1. Bump `version` in `mobile/package.json` and `mobile/app.json`
2. Increment `android.versionCode` in `mobile/app.json`
3. Generate release notes
4. Commit, tag (`mobile-vX.Y.Z`), and push

```bash
npm run release:mobile
# or
node scripts/release-mobile.mjs
```

> **Never manually edit versionCode.** Let the script do it to avoid Play Store conflicts.

---

## CI/CD Integration

### GitHub Actions Workflow

`.github/workflows/mobile-release.yml` triggers on `mobile-v*` tags:

1. Checkout
2. Setup Node + Expo + EAS
3. `npm ci`
4. `npx expo doctor` (validates config)
5. Conditional `npm test`
6. `eas build --profile preview --json`
7. Parse build URL from JSON
8. Create GitHub Release with release notes

### Required GitHub Secrets

| Secret       | Description                                        |
| ------------ | -------------------------------------------------- |
| `EXPO_TOKEN` | `eas login` → copy token from `~/.eas/config.json` |

---

## Best Practices

1. **Always use `preview` for QA** — APK installs directly on devices
2. **Test `production` build locally** before submitting — AAB differs from APK
3. **Keep `eas.json` in sync** with `app.json` (version, package name)
4. **Use development client** for native module work
5. **Monitor build minutes** — EAS free tier has limits
6. **Archive artifacts** — GitHub Actions uploads `build-output.json`; download APKs from Expo dashboard

---

## Advanced Configuration

### Custom Gradle Properties

Create `mobile/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
android.enableR8.fullMode=true
```

### Build-Time Env Injection (EAS)

In `eas.json`, you can inject env vars at build time:

```json
{
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" },
      "env": {
        "MY_CUSTOM_VAR": "value"
      }
    }
  }
}
```

### Custom `eas-build-pre-install` / `eas-build-post-install`

Add to `package.json`:

```json
{
  "scripts": {
    "eas-build-pre-install": "echo 'Before install'",
    "eas-build-post-install": "echo 'After install'"
  }
}
```

---

## iOS Builds (Future)

When adding iOS support:

```json
{
  "build": {
    "preview": {
      "ios": { "buildConfiguration": "Release" }
    },
    "production": {
      "ios": { "buildConfiguration": "Release" }
    }
  },
  "submit": { "production": {} }
}
```

Workflow would build both platforms:

```yaml
run: eas build --platform all --profile preview --non-interactive --json > ../build-output.json
```

Version sync: iOS uses `CFBundleShortVersionString` (from `expo.version`) and `CFBundleVersion` (from `expo.ios.buildNumber` or `android.versionCode`).

---

## Security Checklist

- [ ] No secrets in `mobile/.env` or `mobile/.env.example`
- [ ] `EXPO_PUBLIC_API_URL` points to your backend (not TMDB directly)
- [ ] EAS Secrets contain only public config
- [ ] Keystore configured in EAS credentials
- [ ] `google-services.json` not committed (in `.gitignore`)

---

## Quick Reference

| Task                     | Command                                 |
| ------------------------ | --------------------------------------- |
| Preview build (cloud)    | `npm run mobile:preview`                |
| Production build (cloud) | `npm run mobile:production`             |
| Local build              | `npm run mobile:build:local`            |
| Development client       | `npm run mobile:dev`                    |
| Submit to Play Store     | `npm run mobile:submit`                 |
| Create release           | `npm run release:mobile`                |
| List builds              | `eas build:list --platform android`     |
| Download artifact        | `eas build:download --platform android` |
| View credentials         | `eas credentials`                       |
| Check config             | `npx expo doctor`                       |
