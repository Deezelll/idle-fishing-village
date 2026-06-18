# Technical Stack

## Chosen Stack

The project should start as a small TypeScript web game and be packaged for Android with Capacitor 8.

Core stack:

- Vite
- TypeScript
- Vanilla DOM UI plus Canvas/SVG for animated game visuals
- Capacitor 8
- Android Studio and Gradle for Android builds

Package name draft:

```text
com.deezelll.idlefishingvillage
```

The package name can be changed before the first Google Play upload, but should become stable once internal testing starts.

## Why Capacitor

Capacitor is the better first choice than a fully custom Android WebView because:

- it creates a normal native Android app project;
- it has a standard path to Android Studio and Google Play release builds;
- it gives access to native plugins later;
- it keeps the main game loop in simple web technologies;
- it avoids maintaining a custom WebView shell too early.

## Why Not Unity For The First Version

Unity is powerful, but it adds more build weight, more tooling friction, and a slower content iteration loop for a simple 2D idle game. If the project later needs richer animation tooling, particle-heavy scenes, or a more advanced asset pipeline, Unity can be reconsidered for a future title.

## Runtime Requirements

Capacitor 8 currently requires Node.js 22 or higher for development. Android builds require Android Studio and an Android SDK installation. Android support starts at API 24 according to the Capacitor Android docs.

Local machine status checked on 2026-06-18:

- `node` is not currently available on `PATH`.
- `npm` is not currently available on `PATH`.

Install before running the app:

```powershell
node --version
npm --version
```

Then from `app/`:

```powershell
npm install
npm run dev
```

After web development works:

```powershell
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Android Release Path

The intended path to `.aab` is:

1. Build web assets with Vite.
2. Sync assets into the Capacitor Android project.
3. Open `android/` in Android Studio.
4. Configure app icon, splash, version code, version name, signing, privacy-sensitive permissions, and billing/ad SDKs when added.
5. Build a signed Android App Bundle.
6. Upload to Google Play Console internal testing.

## Monetization Integration Later

Do not add monetization SDKs in the first prototype. Keep the early code clean.

Planned integrations:

- AdMob: rewarded ads first, then optional interstitials with strict pacing.
- Google Play Billing: remove ads, starter pack, pearl bundle, festival pass only after economy validation.

Monetization hooks should be behind interfaces so the game can run without native plugins during local web development.

