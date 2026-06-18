# Idle Fishing Village

Android-first idle/tycoon game about a cozy 3D fishing village.

Target platform: Google Play.
Target build artifact: Android App Bundle (`.aab`).
Primary orientation: portrait.

## Product Vision

`Idle Fishing Village` is a cozy mobile idle/tycoon game where the player grows a small harbor into a busy seaside village. Boats catch fish automatically, the player sells the catch, upgrades the harbor, opens new sea zones, completes orders, fills an aquarium collection, and eventually runs the Sea Festival prestige loop for permanent pearl bonuses.

The target feel is premium casual 3D: bright turquoise water, toy-like buildings, chunky readable UI, satisfying upgrade cards, and a clear return loop.

## Current Build

Implemented prototype:

- 3D-style harbor maps and transparent 3D UI/prop assets.
- Fish, coins, pearls, stars.
- Automatic fish income and offline income.
- Storage limit and sell loop.
- Boat upgrades.
- Building upgrades.
- Sea zone unlocks.
- Orders board.
- Fish collection.
- Sea Festival prestige loop.
- Mobile portrait UI with HUD, scene labels, upgrade cards, bottom navigation.

## Stack

- Vite
- TypeScript
- Capacitor 8
- HTML/CSS mobile game UI
- Android Studio/Gradle for `.aab`

## Run

Install Node.js 22+ first.

```powershell
cd app
npm install
npm run dev
```

Then open the local Vite URL.

## Android Build Path

```powershell
cd app
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

From Android Studio, configure signing and build a signed Android App Bundle.

## Folders

- `app/` - playable web app and Capacitor root.
- `app/public/assets/art/` - runtime game assets.
- `assets/` - source/generated art archive.
- `data/` - economy and content data.
- `docs/` - production, release, tech and asset documentation.
- `marketing/` - future Google Play texts/screenshots.
