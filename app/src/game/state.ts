import { BALANCE, BOATS, BUILDINGS, FISH, ZONES, upgradeCost, type BoatId, type BuildingId, type FishId, type ZoneId } from './balance';
import {
  EXPEDITIONS,
  getAquariumSetBonus,
  getDailyRewardStatus,
  getEventRewardById,
  getMilestoneBonus,
  getMilestoneById,
  getPearlTreeBonus,
  getRegattaGoalById
} from './progression';

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
  dailyReward: {
    streak: number;
    claimedDate: string;
  };
  activeExpedition: {
    id: string;
    startedAt: number;
    endsAt: number;
  } | null;
  eventTokens: number;
  claimedEventRewards: string[];
  claimedMilestones: string[];
  claimedRegattaGoals: string[];
  lifetimeFishSold: number;
  totalUpgradesPurchased: number;
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
    coins: 55,
    pearls,
    stars: 0,
    festivalCount,
    dailyReward: {
      streak: 0,
      claimedDate: ''
    },
    activeExpedition: null,
    eventTokens: 0,
    claimedEventRewards: [],
    claimedMilestones: [],
    claimedRegattaGoals: [],
    lifetimeFishSold: 0,
    totalUpgradesPurchased: 0,
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
    collection: createEmptyCollection(),
    orders: [],
    completedOrders: 0,
    lastSavedAt: now
  };

  return {
    ...state,
    orders: createOrders(state, 0)
  };
}

function createEmptyCollection(): Record<FishId, number> {
  return Object.fromEntries(FISH.map((fish) => [fish.id, 0])) as Record<FishId, number>;
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
    dailyReward: {
      streak: clampNumber(value.dailyReward?.streak, 0, 0),
      claimedDate: typeof value.dailyReward?.claimedDate === 'string' ? value.dailyReward.claimedDate : ''
    },
    activeExpedition: normalizeExpedition(value.activeExpedition),
    eventTokens: clampNumber(value.eventTokens, 0, 0),
    claimedEventRewards: Array.isArray(value.claimedEventRewards) ? value.claimedEventRewards.filter((id): id is string => typeof id === 'string') : [],
    claimedMilestones: Array.isArray(value.claimedMilestones) ? value.claimedMilestones.filter((id): id is string => typeof id === 'string') : [],
    claimedRegattaGoals: Array.isArray(value.claimedRegattaGoals) ? value.claimedRegattaGoals.filter((id): id is string => typeof id === 'string') : [],
    lifetimeFishSold: clampNumber(value.lifetimeFishSold, 0, Number.MAX_SAFE_INTEGER),
    totalUpgradesPurchased: clampNumber(value.totalUpgradesPurchased, 0, Number.MAX_SAFE_INTEGER),
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

export function getStats(state: GameState, zoneId?: ZoneId): DerivedStats {
  const activeZone = zoneId ?? getBestUnlockedZone(state);
  const unlockedFish = FISH.filter((fish) => state.unlockedZones.includes(fish.zone));
  const uniqueFish = FISH.filter((fish) => state.collection[fish.id] > 0).length;
  const aquariumSetBonus = getAquariumSetBonus(state);
  const milestoneBonus = getMilestoneBonus(state);
  const pearlTreeBonus = getPearlTreeBonus(state);
  const collectionBase = 1 + uniqueFish * BALANCE.aquariumCollectionBonus * Math.max(1, state.buildings.aquarium + 1);
  const collectionBonus = Math.min(1.72, collectionBase * aquariumSetBonus.productionMultiplier);
  const pearlProductionBonus = Math.min(2.75, (1 + state.pearls * BALANCE.pearlProductionBonus) * pearlTreeBonus.productionMultiplier);
  const pearlPriceBonus = Math.min(2.45, (1 + state.pearls * BALANCE.pearlPriceBonus) * pearlTreeBonus.priceMultiplier * aquariumSetBonus.priceMultiplier);
  const pierBonus = Math.min(1.55, 1 + Math.max(0, state.buildings.pier - 1) * BALANCE.pierFleetBonus);
  const activeBoats = getZoneBoatIds(activeZone);
  const workshopLevels = activeBoats.reduce((sum, id) => sum + state.boats[id], 0);
  const workshopBonus = Math.min(1.75, 1 + state.buildings.workshop * workshopLevels * BALANCE.workshopBoatBonus);
  const zoneMultiplier = ZONES.find((zone) => zone.id === activeZone)?.multiplier ?? 1;
  const rawFishPerSecond = BOATS.reduce((sum, boat) => {
    if (!activeBoats.includes(boat.id) || !state.unlockedZones.includes(boat.unlockZone)) {
      return sum;
    }

    const level = state.boats[boat.id];
    return sum + boat.baseFishPerSecond * level ** 1.12;
  }, 0);

  return {
    fishPerSecond: rawFishPerSecond * pierBonus * workshopBonus * collectionBonus * pearlProductionBonus * milestoneBonus.productionMultiplier * zoneMultiplier,
    fishPrice: BALANCE.baseFishPrice * BALANCE.marketPriceGrowth ** (state.buildings.market - 1) * pearlPriceBonus * milestoneBonus.priceMultiplier,
    storageCapacity: Math.floor(BALANCE.baseStorage * BALANCE.warehouseGrowth ** (state.buildings.warehouse - 1) * pearlTreeBonus.storageMultiplier),
    unlockedFish,
    uniqueFish,
    collectionBonus,
    pearlProductionBonus,
    pearlPriceBonus,
    bestZoneMultiplier: zoneMultiplier
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

export function applyIncome(state: GameState, seconds: number, collectSpecies = true, zoneId?: ZoneId): GameState {
  const stats = getStats(state, zoneId);
  const fishGained = stats.fishPerSecond * seconds;
  const fish = Math.min(stats.storageCapacity, state.fish + fishGained);
  const next: GameState = {
    ...state,
    fish
  };

  if (!collectSpecies || fishGained <= 0) {
    return next;
  }

  return collectFishSamples(next, Math.max(1, Math.floor(fishGained / 8)), zoneId);
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
    coins: state.coins + earned,
    lifetimeFishSold: state.lifetimeFishSold + Math.floor(state.fish)
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
    totalUpgradesPurchased: state.totalUpgradesPurchased + 1,
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
    totalUpgradesPurchased: state.totalUpgradesPurchased + 1,
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

export function claimDailyReward(state: GameState, now = Date.now()): GameState {
  const status = getDailyRewardStatus(state, now);

  if (status.claimed) {
    return state;
  }

  const stats = getStats(state);

  return {
    ...state,
    fish: Math.min(stats.storageCapacity, state.fish + status.reward.fish),
    coins: state.coins + status.reward.coins,
    pearls: state.pearls + status.reward.pearls,
    stars: state.stars + status.reward.stars,
    eventTokens: state.eventTokens + status.reward.eventTokens,
    dailyReward: {
      streak: state.dailyReward.streak + 1,
      claimedDate: status.dateKey
    }
  };
}

export function startExpedition(state: GameState, id: string, now = Date.now()): GameState {
  const expedition = EXPEDITIONS.find((item) => item.id === id);

  if (!expedition || state.activeExpedition || state.buildings.lighthouse < expedition.requiredLighthouse || state.coins < expedition.costCoins) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - expedition.costCoins,
    activeExpedition: {
      id: expedition.id,
      startedAt: now,
      endsAt: now + expedition.durationSeconds * 1000
    }
  };
}

export function claimExpedition(state: GameState, now = Date.now()): GameState {
  if (!state.activeExpedition || now < state.activeExpedition.endsAt) {
    return state;
  }

  const expedition = EXPEDITIONS.find((item) => item.id === state.activeExpedition?.id);
  if (!expedition) {
    return {
      ...state,
      activeExpedition: null
    };
  }

  const stats = getStats(state, expedition.zone);
  const rewarded: GameState = {
    ...state,
    fish: Math.min(stats.storageCapacity, state.fish + expedition.reward.fish),
    coins: state.coins + expedition.reward.coins,
    stars: state.stars + expedition.reward.stars,
    pearls: state.pearls + expedition.reward.pearls,
    eventTokens: state.eventTokens + expedition.reward.eventTokens,
    activeExpedition: null
  };

  return collectFishSamples(rewarded, expedition.reward.collectionSamples, expedition.zone);
}

export function claimMilestoneReward(state: GameState, id: string): GameState {
  const milestone = getMilestoneById(id);

  if (!milestone || state.claimedMilestones.includes(id)) {
    return state;
  }

  const currentLevel = milestone.kind === 'boat'
    ? state.boats[milestone.targetId as BoatId]
    : state.buildings[milestone.targetId as BuildingId];

  if (currentLevel < milestone.level) {
    return state;
  }

  const stats = getStats(state);

  return {
    ...state,
    fish: Math.min(stats.storageCapacity, state.fish + milestone.reward.fish),
    coins: state.coins + milestone.reward.coins,
    stars: state.stars + milestone.reward.stars,
    pearls: state.pearls + milestone.reward.pearls,
    eventTokens: state.eventTokens + milestone.reward.eventTokens,
    claimedMilestones: [...state.claimedMilestones, id]
  };
}

export function claimEventReward(state: GameState, id: string): GameState {
  const reward = getEventRewardById(id);

  if (!reward || state.claimedEventRewards.includes(id) || state.eventTokens < reward.costTokens) {
    return state;
  }

  const stats = getStats(state);

  return {
    ...state,
    fish: Math.min(stats.storageCapacity, state.fish + reward.reward.fish),
    coins: state.coins + reward.reward.coins,
    stars: state.stars + reward.reward.stars,
    pearls: state.pearls + reward.reward.pearls,
    eventTokens: state.eventTokens - reward.costTokens + reward.reward.eventTokens,
    claimedEventRewards: [...state.claimedEventRewards, id]
  };
}

export function claimRegattaGoalReward(state: GameState, id: string): GameState {
  const goal = getRegattaGoalById(id, state);

  if (!goal || !goal.ready || state.claimedRegattaGoals.includes(id)) {
    return state;
  }

  return {
    ...state,
    eventTokens: state.eventTokens + goal.rewardTokens,
    claimedRegattaGoals: [...state.claimedRegattaGoals, id]
  };
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

function collectFishSamples(state: GameState, samples: number, zoneId?: ZoneId): GameState {
  const options = FISH.filter((fish) => state.unlockedZones.includes(fish.zone) && (!zoneId || fish.zone === zoneId));
  const totalWeight = options.reduce((sum, fish) => sum + fish.weight, 0);
  if (totalWeight <= 0) {
    return state;
  }

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

function getBestUnlockedZone(state: GameState): ZoneId {
  return ZONES.filter((zone) => state.unlockedZones.includes(zone.id)).at(-1)?.id ?? 'quiet_bay';
}

function getZoneBoatIds(zoneId: ZoneId): BoatId[] {
  if (zoneId === 'quiet_bay') {
    return ['rowboat', 'motorboat'];
  }

  if (zoneId === 'coral_reef') {
    return ['netter'];
  }

  return ['trawler'];
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

function normalizeExpedition(value: unknown): GameState['activeExpedition'] {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const expedition = value as Partial<NonNullable<GameState['activeExpedition']>>;
  if (!expedition.id || !EXPEDITIONS.some((item) => item.id === expedition.id)) {
    return null;
  }

  return {
    id: expedition.id,
    startedAt: clampNumber(expedition.startedAt, 0, Date.now()),
    endsAt: clampNumber(expedition.endsAt, 0, Date.now())
  };
}
