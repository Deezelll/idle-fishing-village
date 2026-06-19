import { createInitialState, normalizeState, type GameState } from './state';

const SAVE_KEY = 'idle-fishing-village.save.v2';
const LEGACY_SAVE_KEY = 'idle-fishing-village.save.v1';

export function loadState(): GameState {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as { coins?: number; pearls?: number; lastSavedAt?: number };
        const migrated = createInitialState(Number(parsed.lastSavedAt ?? Date.now()), Number(parsed.pearls ?? 0), 0);
        return {
          ...migrated,
          coins: Math.max(35, Number(parsed.coins ?? 35))
        };
      } catch {
        return createInitialState();
      }
    }

    return createInitialState();
  }

  try {
    return parseSerializedState(raw) ?? createInitialState();
  } catch {
    return createInitialState();
  }
}

export function parseSerializedState(raw: string | null | undefined): GameState | null {
  if (!raw) {
    return null;
  }

  try {
    return normalizeState(JSON.parse(raw) as Partial<GameState>);
  } catch {
    return null;
  }
}

export function serializeState(state: GameState): string {
  return JSON.stringify({
    ...state,
    lastSavedAt: Date.now()
  });
}

export function saveState(state: GameState): void {
  localStorage.setItem(SAVE_KEY, serializeState(state));
}

export function resetState(): GameState {
  const state = createInitialState();
  localStorage.removeItem(LEGACY_SAVE_KEY);
  saveState(state);
  return state;
}
