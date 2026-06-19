import { BOATS, FISH, ZONES, type BoatId, type FishId, type ZoneId } from './balance';
import type { GameState } from './state';

export type DailyReward = {
  day: number;
  fish: number;
  coins: number;
  pearls: number;
  stars: number;
  eventTokens: number;
};

export type DailyRewardStatus = {
  dateKey: string;
  streak: number;
  claimed: boolean;
  reward: DailyReward;
};

export type ExpeditionReward = {
  fish: number;
  coins: number;
  stars: number;
  pearls: number;
  eventTokens: number;
  collectionSamples: number;
};

export type ExpeditionConfig = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  costCoins: number;
  requiredLighthouse: number;
  zone: ZoneId;
  icon: string;
  reward: ExpeditionReward;
};

export type ExpeditionProgress = {
  config: ExpeditionConfig;
  remainingSeconds: number;
  percent: number;
  ready: boolean;
};

export type ZoneMastery = {
  zone: ZoneId;
  discoveredFish: number;
  totalFish: number;
  localBoatLevels: number;
  percent: number;
};

export type AquariumSet = {
  id: string;
  title: string;
  description: string;
  fish: FishId[];
  productionBonus: number;
  priceBonus: number;
};

export type AquariumSetBonus = {
  completedSets: AquariumSet[];
  productionMultiplier: number;
  priceMultiplier: number;
};

export type PearlTreeBonus = {
  unlockedNodes: number;
  productionMultiplier: number;
  priceMultiplier: number;
  storageMultiplier: number;
  offlineHoursBonus: number;
};

export type ChapterGoal = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward: string;
};

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, fish: 30, coins: 80, pearls: 0, stars: 0, eventTokens: 5 },
  { day: 2, fish: 60, coins: 150, pearls: 0, stars: 1, eventTokens: 8 },
  { day: 3, fish: 90, coins: 260, pearls: 0, stars: 1, eventTokens: 12 },
  { day: 4, fish: 130, coins: 420, pearls: 0, stars: 2, eventTokens: 16 },
  { day: 5, fish: 180, coins: 650, pearls: 1, stars: 2, eventTokens: 22 },
  { day: 6, fish: 260, coins: 900, pearls: 1, stars: 3, eventTokens: 28 },
  { day: 7, fish: 360, coins: 1400, pearls: 2, stars: 4, eventTokens: 40 }
];

export const EXPEDITIONS: ExpeditionConfig[] = [
  {
    id: 'coastal_survey',
    title: 'Обход тихой бухты',
    description: 'Капитан проверяет сети у пирсов и приносит быстрый запас рыбы.',
    durationSeconds: 180,
    costCoins: 0,
    requiredLighthouse: 1,
    zone: 'quiet_bay',
    icon: '3d/icon-expedition-map.svg',
    reward: { fish: 90, coins: 140, stars: 1, pearls: 0, eventTokens: 8, collectionSamples: 2 }
  },
  {
    id: 'reef_charting',
    title: 'Карта кораллового рифа',
    description: 'Экспедиция отмечает безопасные проходы и привозит редкие образцы.',
    durationSeconds: 420,
    costCoins: 450,
    requiredLighthouse: 2,
    zone: 'coral_reef',
    icon: '3d/icon-expedition-map.svg',
    reward: { fish: 190, coins: 520, stars: 2, pearls: 0, eventTokens: 16, collectionSamples: 4 }
  },
  {
    id: 'deep_markers',
    title: 'Глубинные буйки',
    description: 'Команда ставит буйки в глубоких водах и повышает ценность маршрута.',
    durationSeconds: 900,
    costCoins: 2400,
    requiredLighthouse: 4,
    zone: 'deep_water',
    icon: '3d/icon-expedition-map.svg',
    reward: { fish: 520, coins: 1900, stars: 3, pearls: 1, eventTokens: 30, collectionSamples: 6 }
  },
  {
    id: 'mist_lanterns',
    title: 'Фонари туманного пролива',
    description: 'Долгая вылазка в туман за жемчужными находками и фестивальными жетонами.',
    durationSeconds: 1800,
    costCoins: 9800,
    requiredLighthouse: 7,
    zone: 'misty_strait',
    icon: '3d/icon-expedition-map.svg',
    reward: { fish: 1200, coins: 7200, stars: 5, pearls: 2, eventTokens: 60, collectionSamples: 10 }
  }
];

export const AQUARIUM_SETS: AquariumSet[] = [
  {
    id: 'quiet_bay_starters',
    title: 'Рыбы тихой бухты',
    description: 'Первый полный набор делает гавань стабильнее.',
    fish: ['bluefish', 'herring', 'sardine', 'salmon_trout', 'red_crab'],
    productionBonus: 0.08,
    priceBonus: 0.03
  },
  {
    id: 'reef_colors',
    title: 'Краски рифа',
    description: 'Коралловая витрина повышает интерес покупателей.',
    fish: ['clownfish', 'angel_fish', 'seahorse', 'lobster', 'coral_perch'],
    productionBonus: 0.12,
    priceBonus: 0.05
  },
  {
    id: 'deep_trophies',
    title: 'Глубинные трофеи',
    description: 'Редкие глубоководные экземпляры ускоряют весь флот.',
    fish: ['bluefin_tuna', 'pufferfish', 'manta_ray', 'anglerfish', 'bannerfish'],
    productionBonus: 0.16,
    priceBonus: 0.07
  },
  {
    id: 'mist_pearls',
    title: 'Жемчуг пролива',
    description: 'Финальная витрина усиливает престижные забеги.',
    fish: ['pearl_fish', 'ruby_fish', 'goldfish', 'moon_puffer', 'pearl_ray'],
    productionBonus: 0.22,
    priceBonus: 0.1
  }
];

export function getDateKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function getDailyRewardStatus(state: GameState, now = Date.now()): DailyRewardStatus {
  const dateKey = getDateKey(now);
  const claimedDate = state.dailyReward?.claimedDate ?? '';
  const streak = Math.max(0, state.dailyReward?.streak ?? 0);
  const claimed = claimedDate === dateKey;
  const rewardIndex = claimed ? Math.max(0, (streak - 1) % DAILY_REWARDS.length) : streak % DAILY_REWARDS.length;

  return {
    dateKey,
    streak,
    claimed,
    reward: DAILY_REWARDS[rewardIndex]
  };
}

export function getExpeditionProgress(state: GameState, now = Date.now()): ExpeditionProgress | null {
  if (!state.activeExpedition) {
    return null;
  }

  const config = EXPEDITIONS.find((item) => item.id === state.activeExpedition?.id);
  if (!config) {
    return null;
  }

  const total = Math.max(1, state.activeExpedition.endsAt - state.activeExpedition.startedAt);
  const elapsed = Math.max(0, now - state.activeExpedition.startedAt);
  const remainingMs = Math.max(0, state.activeExpedition.endsAt - now);

  return {
    config,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    percent: Math.min(100, (elapsed / total) * 100),
    ready: remainingMs <= 0
  };
}

export function getZoneMastery(state: GameState, zone: ZoneId): ZoneMastery {
  const zoneFish = FISH.filter((fish) => fish.zone === zone);
  const discoveredFish = zoneFish.filter((fish) => state.collection[fish.id] > 0).length;
  const localBoatLevels = getZoneBoatIds(zone).reduce((sum, id) => sum + state.boats[id], 0);
  const fishScore = zoneFish.length > 0 ? (discoveredFish / zoneFish.length) * 70 : 0;
  const boatScore = Math.min(30, localBoatLevels * 5);

  return {
    zone,
    discoveredFish,
    totalFish: zoneFish.length,
    localBoatLevels,
    percent: Math.round(Math.min(100, fishScore + boatScore))
  };
}

export function getAquariumSetBonus(state: GameState): AquariumSetBonus {
  const completedSets = AQUARIUM_SETS.filter((set) => set.fish.every((fishId) => state.collection[fishId] > 0));
  const productionMultiplier = 1 + completedSets.reduce((sum, set) => sum + set.productionBonus, 0);
  const priceMultiplier = 1 + completedSets.reduce((sum, set) => sum + set.priceBonus, 0);

  return {
    completedSets,
    productionMultiplier,
    priceMultiplier
  };
}

export function getPearlTreeBonus(state: GameState): PearlTreeBonus {
  const pearls = Math.max(0, state.pearls);
  const unlockedNodes = Math.min(12, Math.floor(Math.sqrt(pearls * 2)));

  return {
    unlockedNodes,
    productionMultiplier: 1 + unlockedNodes * 0.025,
    priceMultiplier: 1 + Math.floor(unlockedNodes / 2) * 0.018,
    storageMultiplier: 1 + Math.floor(unlockedNodes / 3) * 0.04,
    offlineHoursBonus: Math.floor(unlockedNodes / 4)
  };
}

export function getChapterGoals(state: GameState): ChapterGoal[] {
  const coralUnlocked = state.unlockedZones.includes('coral_reef') ? 1 : 0;
  const deepUnlocked = state.unlockedZones.includes('deep_water') ? 1 : 0;
  const mistUnlocked = state.unlockedZones.includes('misty_strait') ? 1 : 0;
  const uniqueFish = FISH.filter((fish) => state.collection[fish.id] > 0).length;
  const totalBoatLevels = BOATS.reduce((sum, boat) => sum + state.boats[boat.id], 0);

  return [
    {
      id: 'unlock_coral_reef',
      title: 'Открыть коралловый риф',
      description: 'Прокачай маяк и накопи монеты для первой новой бухты.',
      current: coralUnlocked,
      target: 1,
      reward: '+1 звезда и новый сет рыб'
    },
    {
      id: 'complete_orders',
      title: 'Наладить заказы',
      description: 'Выполняй заказы, чтобы ускорить монеты и фестивальные звезды.',
      current: Math.min(state.completedOrders, 8),
      target: 8,
      reward: '+2 темпа прогресса'
    },
    {
      id: 'collect_species',
      title: 'Собрать аквариум',
      description: 'Открывай виды рыб через активный улов и экспедиции.',
      current: Math.min(uniqueFish, 12),
      target: 12,
      reward: 'бонусы аквариумных наборов'
    },
    {
      id: 'unlock_deep_water',
      title: 'Выйти на глубину',
      description: 'Подготовь флот и маяк для глубоких вод.',
      current: deepUnlocked,
      target: 1,
      reward: 'дорогая рыба и длинные экспедиции'
    },
    {
      id: 'festival_ready',
      title: 'Подготовить фестиваль',
      description: 'Собери звезды или монеты для первого Морского фестиваля.',
      current: Math.min(Math.max(state.stars / 12, state.coins / 12000), 1),
      target: 1,
      reward: 'жемчуг и постоянные бонусы'
    },
    {
      id: 'misty_strait_route',
      title: 'Туманный маршрут',
      description: 'Доберись до поздней бухты и собери жемчужные виды.',
      current: Math.max(mistUnlocked, Math.min(totalBoatLevels / 35, 1)),
      target: 1,
      reward: 'поздние цели и редкие находки'
    }
  ];
}

export function getCurrentChapterGoal(state: GameState): ChapterGoal {
  return getChapterGoals(state).find((goal) => goal.current < goal.target) ?? getChapterGoals(state).at(-1)!;
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
