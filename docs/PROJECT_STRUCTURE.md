# Project Structure

```text
01_Idle_Fishing_Village/
  GAME_DESIGN.md
  README.md
  app/
    package.json
    index.html
    capacitor.config.ts
    tsconfig.json
    vite.config.ts
    src/
      main.ts
      styles.css
      game/
        balance.ts
        state.ts
        storage.ts
  assets/
    art/
    audio/
    icons/
    splash/
  data/
    fish.json
    buildings.json
    boats.json
  docs/
    TECH_STACK.md
    ROADMAP.md
    GOOGLE_PLAY_CHECKLIST.md
    PROJECT_STRUCTURE.md
  marketing/
```

## Rules

- Game numbers live in `data/` or `src/game/balance.ts`, not inside UI handlers.
- Save format changes should be versioned.
- Native SDKs are added only after the browser prototype works.
- Android generated files stay under `app/android/` once `npx cap add android` is run.
- Store keys, signing keys, and real ad/billing IDs are never committed.

