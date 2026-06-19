import { parseSerializedState, serializeState } from '../game/storage';
import type { GameState } from '../game/state';

const SDK_SRC = '/sdk.js';
const CLOUD_SAVE_KEY = 'idleFishingVillageSaveV2';
const IS_YANDEX_BUILD = import.meta.env.VITE_GAME_TARGET === 'yandex';

type YandexPlayer = {
  getData(keys?: string[]): Promise<Record<string, unknown>>;
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
};

type YandexGamesSdk = {
  features?: {
    LoadingAPI?: {
      ready(): void;
    };
    GameplayAPI?: {
      start(): void;
      stop(): void;
    };
  };
  getPlayer?: (options?: { scopes?: boolean }) => Promise<YandexPlayer>;
};

type YaGamesGlobal = {
  init(): Promise<YandexGamesSdk>;
};

declare global {
  interface Window {
    YaGames?: YaGamesGlobal;
  }
}

let sdkPromise: Promise<YandexGamesSdk | null> | null = null;
let playerPromise: Promise<YandexPlayer | null> | null = null;
let saveTimer: number | undefined;
let latestState: GameState | null = null;

function isLocalRuntime(): boolean {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function loadSdkScript(): Promise<void> {
  if (!IS_YANDEX_BUILD) {
    return Promise.reject(new Error('Yandex Games SDK is disabled for this build target.'));
  }

  if (window.YaGames) {
    return Promise.resolve();
  }

  if (isLocalRuntime()) {
    return Promise.reject(new Error('Yandex Games SDK is not available in local runtime.'));
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Yandex Games SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Yandex Games SDK.'));
    document.head.append(script);
  });
}

export function initYandexGames(): Promise<YandexGamesSdk | null> {
  if (!sdkPromise) {
    sdkPromise = loadSdkScript()
      .then(() => window.YaGames?.init() ?? null)
      .catch(() => null);
  }

  return sdkPromise;
}

async function getPlayer(): Promise<YandexPlayer | null> {
  if (!playerPromise) {
    playerPromise = initYandexGames()
      .then((sdk) => sdk?.getPlayer?.({ scopes: false }) ?? null)
      .catch(() => null);
  }

  return playerPromise;
}

export async function loadCloudState(): Promise<GameState | null> {
  const player = await getPlayer();
  if (!player) {
    return null;
  }

  const data = await player.getData([CLOUD_SAVE_KEY]).catch(() => null);
  const raw = data?.[CLOUD_SAVE_KEY];

  return typeof raw === 'string' ? parseSerializedState(raw) : null;
}

export function saveCloudState(state: GameState): void {
  latestState = state;

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const stateToSave = latestState;
    if (!stateToSave) {
      return;
    }

    void getPlayer().then((player) => player?.setData({ [CLOUD_SAVE_KEY]: serializeState(stateToSave) }, false).catch(() => undefined));
  }, 700);
}

export async function flushCloudState(state: GameState): Promise<void> {
  latestState = state;
  const player = await getPlayer();
  await player?.setData({ [CLOUD_SAVE_KEY]: serializeState(state) }, true).catch(() => undefined);
}

export function markGameReady(): void {
  void initYandexGames().then((sdk) => sdk?.features?.LoadingAPI?.ready());
}

export function gameplayStart(): void {
  void initYandexGames().then((sdk) => sdk?.features?.GameplayAPI?.start());
}

export function gameplayStop(): void {
  void initYandexGames().then((sdk) => sdk?.features?.GameplayAPI?.stop());
}
