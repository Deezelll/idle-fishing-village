# Roadmap

## Phase 0 - Project Foundation

Goal: make the project easy to build and reason about.

- Create Android-first folder structure.
- Choose stack and package name.
- Prepare Vite/TypeScript app skeleton.
- Keep all balance data outside UI code.
- Define the first vertical slice.

Exit criteria:

- `app/` has a runnable web prototype once Node.js is installed.
- Technical stack and Android build path are documented.

## Phase 1 - Playable Idle Core

Goal: the first session already feels like a tiny idle game.

- Fish production over time.
- Storage cap.
- Collect and sell loop.
- Coin economy.
- Upgrades for boat speed, boat capacity, market price, and storage.
- Local save/load.
- Offline income since last session.

Exit criteria:

- A player can return after several minutes and receive offline fish.
- The next useful upgrade is always visible.

## Phase 2 - Village Progression

Goal: give the player long-term reasons to return.

- Pier levels.
- Fish market levels.
- Warehouse levels.
- Boat workshop.
- Lighthouse sea zones.
- Aquarium collection shell.
- Orders board.

Exit criteria:

- At least three buildings have meaningful upgrade effects.
- At least three sea zones exist.

## Phase 3 - Android Wrapper

Goal: turn the web build into an Android app.

- Add Capacitor Android platform.
- Lock portrait orientation.
- Configure app icon and splash.
- Configure status/nav bar behavior.
- Test on Android emulator or device.
- Build debug APK.

Exit criteria:

- The game runs on Android from Android Studio.
- Save/load survives app restart.

## Phase 4 - Google Play Internal Test

Goal: prepare the first `.aab` upload.

- Version code and version name.
- Signing config.
- Basic privacy policy.
- Store listing draft.
- Internal testing track.
- Signed `.aab`.

Exit criteria:

- Google Play Console accepts the app bundle for internal testing.

## Phase 5 - Monetization Prototype

Goal: add monetization only after the loop is fun.

- Rewarded ad for temporary production boost.
- Rewarded ad for extra offline income.
- Remove-ads purchase.
- Billing restore flow.
- No forced ads in the first test build.

Exit criteria:

- Monetization can be disabled for testing.
- Economy still works without purchases.

