# Yandex Games Release

## Build

Run the Yandex Games build from `app/`:

```bash
npm run build:yandex
```

Upload the generated `app/dist/` contents to Yandex Games.

The mobile / Google Play WebView build is separate:

```bash
npm run build:mobile
```

Use `npm run build:mobile` before Capacitor sync/open steps.

## Platform integration

- The Yandex build is enabled by `VITE_GAME_TARGET=yandex`.
- The mobile build is enabled by `VITE_GAME_TARGET=mobile` and does not load the Yandex SDK.
- The game loads the Yandex Games SDK from `/sdk.js` only in the Yandex build and only outside local `localhost` runtime.
- Local dev and preview continue to work without the SDK.
- On Yandex Games, the game calls:
  - `YaGames.init()`
  - `ysdk.features.LoadingAPI.ready()` after the first render
  - `ysdk.features.GameplayAPI.start()` / `stop()` on visibility changes
  - `ysdk.getPlayer({ scopes: false })` for cloud save sync

## Save behavior

The primary save is still local storage. On Yandex Games, the same save payload is mirrored into player data under:

```text
idleFishingVillageSaveV2
```

If a stronger cloud save is found at boot, it replaces the local runtime state.

## QA targets

- Desktop: `1280x720`
- Mobile: `390x844`
- Required checks: first screen, bottom tabs, right HUD, map, orders, collection, event, settings, console errors.
