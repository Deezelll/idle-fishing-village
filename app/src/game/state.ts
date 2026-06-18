import { BALANCE, BOATS, BUILDINGS, FISH, ZONES, upgradeCost, type BoatId, type BuildingId, type FishId, type ZoneId } from './balance';

export type Order = {
  id: string;
  title: string;
  fishRequired: number;
  rewardCoins: number;
  rewardStars: number;
  zone: ZoneId;
};

export type GameState = {
  saveVersion: 2;
  fish: number;
  coins: number;
  pearls: number;
  stars: number;
  festivalCount: number;
  boats: Record<BoatId, number>;
  buildings: Record<BuildingId, number>;
  unlockedZones: ZoneId[];
  collection: Record<FishId, number>;
  orders: Order[];
  completedOrders: number;
  lastSavedAt: number;
};

export type DerivedStats = {
  fishPerSecond: number;
  fishPrice: number;
  storageCapacity: number;
  unlockedFish: typeof FISH;
  uniqueFish: number;
  collectionBonus: number;
  pearlProductionBonus: number;
  pearlPriceBonus: number;
  bestZoneMultiplier: number;
};

const orderNames = ['Ужин у причала', 'Поставка на рынок', 'Корзины для таверны', 'Свежий улов для шефа', 'Заказ капитана'];

export function createInitialState(now = Date.now(), pearls = 0, festivalCount = 0): GameState {
  const state: GameState = {
    saveVersion: 2,
    fish: 0,
    coins: 35,
    pearls,
    stars: 0,
    festivalCount,
    boats: {
      rowboat: 1,
      motorboat: 0,
      netter: 0,
      trawler: 0
    },
    buildings: {
      pier: 1,
      market: 1,
      warehouse: 1,
      workshop: 0,
      lighthouse: 1,
      aquarium: 0
    },
    unlockedZones: ['quiet_bay'],
    collection: {
      sardine: 0,
      mackerel: 0,
      crab: 0,
      coral_perch: 0,
      tuna: 0,
      moon_eel: 0,
      pearl_ray: 0
    },
    orders: [],
    completedOrders: 0,
    lastSavedAt: now
  };

  return {
    ...state,
    orders: createOrders(state, 0)
  };
}

export function normalizeState(value: Partial<GameState> | null | undefined): GameState {
  if (!value || value.saveVersion !== 2) {
    return createInitialState();
  }

  const initial = createInitialState(Number(value.lastSavedAt ?? Date.now()), Number(value.pearls ?? 0), Number(value.festivalCount ?? 0));
  const normalized: GameState = {
    ...initial,
    fish: clampNumber(value.fish, 0, Number.MAX_SAFE_INTEGER),
    coins: clampNumber(value.coins, 0, Number.MAX_SAFE_INTEGER),
    pearls: clampNumber(value.pearls, 0, Number.MAX_SAFE_INTEGER),
    stars: clampNumber(value.stars, 0, Number.MAX_SAFE_INTEGER),
    festivalCount: clampNumber(value.festivalCount, 0, Number.MAX_SAFE_INTEGER),
    boats: { ...initial.boats, ...value.boats },
    buildings: { ...initial.buildings, ...value.buildings },
    unlockedZones: Array.from(new Set([...(value.unlockedZones ?? ['quiet_bay']), 'quiet_bay'])) as ZoneId[],
    collection: { ...initial.collection, ...value.collection },
    orders: value.orders?.length ? value.orders : initial.orders,
    completedOrders: clampNumber(value.completedOrders, 0, Number.MAX_SAFE_INTEGER),
    lastSavedAt: clampNumber(value.lastSavedAt, 0, Date.now())
  };

  return trimOrders(normalized);
}

export function getStats(state: GameState): DerivedStats {
  const unlockedFish = FISH.filter((fish) => state.unlockedZones.includes(fish.zone));
  const uniqueFish = FISH.filter((fish) => state.collection[fish.id] > 0).length;
  const collectionBonus = 1 + uniqueFish * BALANCE.aquariumCollectionBonus * Math.max(1, state.buildings.aquarium + 1);
  const pearlProductionBonus = 1 + state.pearls * BALANCE.pearlProductionBonus;
  const pearlPriceBonus = 1 + state.pearls * BALANCE.pearlPriceBonus;
  const pierBonus = 1 + Math.max(0, state.buildings.pier - 1) * BALANCE.pierFleetBonus;
  const workshopLevels = BOATS.reduce((sum, boat) => sum + state.boats[boat.id], 0);
  const workshopBonus = 1 + state.buildings.workshop * workshopLevels * BALANCE.workshopBoatBonus;
  const bestZoneMultiplier = Math.max(...ZONES.filter((zone) => state.unlockedZones.includes(zone.id)).map((zone) => zone.multiplier));
  const rawFishPerSecond = BOATS.reduce((sum, boat) => {
    if (!state.unlockedZones.includes(boat.unlockZone)) {
      return sum;
    }

    const level = state.boats[boat.id];
    return sum + boat.baseFishPerSecond * level ** 1.12;
  }, 0);

  return {
    fishPerSecond: rawFishPerSecond * pierBonus * workshopBonus * collectionBonus * pearlProductionBonus * bestZoneMultiplier,
    fishPrice: BALANCE.baseFishPrice * BALANCE.marketPriceGrowth ** (state.buildings.market - 1) * pearlPriceBonus,
    storageCapacity: Math.floor(BALANCE.baseStorage * BALANCE.warehouseGrowth ** (state.buildings.warehouse - 1)),
    unlockedFish,
    uniqueFish,
    collectionBonus,
    pearlProductionBonus,
    pearlPriceBonus,
    bestZoneMultiplier
  };
}

export function getBoatCost(state: GameState, id: BoatId): number {
  const boat = BOATS.find((item) => item.id === id);
  if (!boat) {
    return Number.MAX_SAFE_INTEGER;
  }

  return upgradeCost(boat.baseCost, boat.costGrowth, state.boats[id] + 1);
}

export function getBuildingCost(state: GameState, id: BuildingId): number {
  const building = BUILDINGS.find((item) => item.id === id);
  if (!building) {
    return Number.MAX_SAFE_INTEGER;
  }

  return upgradeCost(building.baseCost, building.costGrowth, state.buildings[id] + 1);
}

export function applyIncome(state: GameState, seconds: number, collectSpecies = true): GameState {
  const stats = getStats(state);
  const fishGained = stats.fishPerSecond * seconds;
  const fish = Math.min(stats.storageCapacity, state.fish + fishGained);
  const next: GameState = {
    ...state,
    fish
  };

  if (!collectSpecies || fishGained <= 0) {
    return next;
  }

  return collectFishSamples(next, Math.max(1, Math.floor(fishGained / 8)));
}

export function applyOfflineIncome(state: GameState, now = Date.now()): { state: GameState; offlineFish: number; offlineSeconds: number } {
  const elapsedSeconds = Math.max(0, Math.floor((now - state.lastSavedAt) / 1000));
  const cappedSeconds = Math.min(elapsedSeconds, BALANCE.maxOfflineHours * 60 * 60);
  const before = state.fish;
  const updated = applyIncome(state, cappedSeconds, true);

  return {
    state: {
      ...updated,
      lastSavedAt: now
    },
    offlineFish: updated.fish - before,
    offlineSeconds: cappedSeconds
  };
}

export function sellFish(state: GameState): GameState {
  const stats = getStats(state);
  const earned = Math.floor(state.fish * stats.fishPrice);

  return {
    ...state,
    fish: 0,
    coins: state.coins + earned
  };
}

export function buyBoat(state: GameState, id: BoatId): GameState {
  const boat = BOATS.find((item) => item.id === id);
  const cost = getBoatCost(state, id);

  if (!boat || !state.unlockedZones.includes(boat.unlockZone) || state.coins < cost) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - cost,
    boats: {
      ...state.boats,
      [id]: state.boats[id] + 1
    }
  };
}

export function buyBuilding(state: GameState, id: BuildingId): GameState {
  const cost = getBuildingCost(state, id);

  if (state.coins < cost) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - cost,
    buildings: {
      ...state.buildings,
      [id]: state.buildings[id] + 1
    }
  };
}

export function unlockZone(state: GameState, id: ZoneId): GameState {
  const zone = ZONES.find((item) => item.id === id);

  if (!zone || state.unlockedZones.includes(id) || state.coins < zone.unlockCost || state.buildings.lighthouse < zone.lighthouseLevel) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - zone.unlockCost,
    stars: state.stars + 1,
    unlockedZones: [...state.unlockedZones, id]
  };
}

export function completeOrder(state: GameState, id: string): GameState {
  const order = state.orders.find((item) => item.id === id);

  if (!order || state.fish < order.fishRequired) {
    return state;
  }

  const completedOrders = state.completedOrders + 1;
  const next: GameState = {
    ...state,
    fish: state.fish - order.fishRequired,
    coins: state.coins + order.rewardCoins,
    stars: state.stars + order.rewardStars,
    completedOrders,
    orders: state.orders.filter((item) => item.id !== id)
  };

  return trimOrders({
    ...next,
    orders: [...next.orders, ...createOrders(next, completedOrders).slice(0, 1)]
  });
}

export function runFestival(state: GameState): GameState {
  if (!canRunFestival(state)) {
    return state;
  }

  const earnedPearls = getFestivalPearls(state);
  return createInitialState(Date.now(), state.pearls + earnedPearls, state.festivalCount + 1);
}

export function canRunFestival(state: GameState): boolean {
  return state.stars >= BALANCE.festivalRequiredStars || state.coins >= BALANCE.festivalRequiredCoins;
}

export function getFestivalPearls(state: GameState): number {
  const fromStars = Math.floor(state.stars / 4);
  const fromCoins = Math.floor(Math.sqrt(state.coins / 4000));
  return Math.max(1, fromStars + fromCoins);
}

export function getNextGoal(state: GameState): string {
  if (!state.unlockedZones.includes('coral_reef')) {
    return 'Прокачать маяк до 2 уровня и открыть Коралловый риф';
  }

  if (state.completedOrders < 5) {
    return 'Выполнить 5 заказов на доске';
  }

  if (!state.unlockedZones.includes('deep_water')) {
    return 'Накопить на Глубокую воду';
  }

  if (!canRunFestival(state)) {
    return 'Собрать 12 звезд деревни для Морского фестиваля';
  }

  return 'Провести Морской фестиваль и получить жемчуг';
}

function collectFishSamples(state: GameState, samples: number): GameState {
  const options = FISH.filter((fish) => state.unlockedZones.includes(fish.zone));
  const totalWeight = options.reduce((sum, fish) => sum + fish.weight, 0);
  const collection = { ...state.collection };

  for (let i = 0; i < samples; i += 1) {
    let roll = Math.random() * totalWeight;
    for (const fish of options) {
      roll -= fish.weight;
      if (roll <= 0) {
        collection[fish.id] += 1;
        break;
      }
    }
  }

  return {
    ...state,
    collection
  };
}

function createOrders(state: GameState, seed: number): Order[] {
  const stats = getStats(state);
  const zones = ZONES.filter((zone) => state.unlockedZones.includes(zone.id));
  const base = Math.max(22, Math.floor(stats.storageCapacity * 0.28));

  return [0, 1, 2].map((index) => {
    const zone = zones[(seed + index) % zones.length];
    const amount = Math.floor(base * (1 + (seed + index) * 0.18) * zone.multiplier);
    return {
      id: `order-${Date.now()}-${seed}-${index}-${Math.floor(Math.random() * 9999)}`,
      title: orderNames[(seed + index) % orderNames.length],
      fishRequired: amount,
      rewardCoins: Math.floor(amount * stats.fishPrice * (2.6 + index * 0.35)),
      rewardStars: index === 2 ? 2 : 1,
      zone: zone.id
    };
  });
}

function trimOrders(state: GameState): GameState {
  if (state.orders.length >= 3) {
    return {
      ...state,
      orders: state.orders.slice(0, 3)
    };
  }

  return {
    ...state,
    orders: [...state.orders, ...createOrders(state, state.completedOrders)].slice(0, 3)
  };
}

function clampNumber(value: unknown, min: number, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(min, number);
}
