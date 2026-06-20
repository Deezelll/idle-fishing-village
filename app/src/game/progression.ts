import { BOATS, BUILDINGS, FISH, ZONES, type BoatId, type BuildingId, type FishId, type ZoneId } from './balance';
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

export type MilestoneReward = {
  coins: number;
  fish: number;
  stars: number;
  pearls: number;
  eventTokens: number;
};

export type MilestoneConfig = {
  id: string;
  kind: 'boat' | 'building';
  targetId: BoatId | BuildingId;
  level: number;
  title: string;
  description: string;
  reward: MilestoneReward;
  claimed: boolean;
};

export type MilestoneBonus = {
  claimedCount: number;
  productionMultiplier: number;
  priceMultiplier: number;
};

export type EventRewardConfig = {
  id: string;
  title: string;
  description: string;
  costTokens: number;
  icon: string;
  reward: MilestoneReward;
  claimed: boolean;
};

export type RegattaGoalConfig = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardTokens: number;
  claimed: boolean;
  ready: boolean;
};

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
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

const milestoneLevels = [5, 10, 25] as const;

export const MILESTONE_REWARDS: Omit<MilestoneConfig, 'claimed'>[] = [
  ...BOATS.flatMap((boat) => milestoneLevels.map((level) => ({
    id: `boat-${boat.id}-${level}`,
    kind: 'boat' as const,
    targetId: boat.id,
    level,
    title: `${boat.name} ур. ${level}`,
    description: `Порог флота: прокачай ${boat.name.toLowerCase()} до ${level} уровня.`,
    reward: {
      coins: level * 80,
      fish: level * 18,
      stars: level >= 10 ? 2 : 1,
      pearls: level >= 25 ? 1 : 0,
      eventTokens: level * 3
    }
  }))),
  ...BUILDINGS.flatMap((building) => milestoneLevels.map((level) => ({
    id: `building-${building.id}-${level}`,
    kind: 'building' as const,
    targetId: building.id,
    level,
    title: `${building.name} ур. ${level}`,
    description: `Порог деревни: улучши ${building.name.toLowerCase()} до ${level} уровня.`,
    reward: {
      coins: level * 95,
      fish: level * 12,
      stars: level >= 10 ? 2 : 1,
      pearls: level >= 25 ? 1 : 0,
      eventTokens: level * 4
    }
  })))
];

export const EVENT_REWARDS: Omit<EventRewardConfig, 'claimed'>[] = [
  {
    id: 'regatta_supply_chest',
    title: 'Сундук снабжения',
    description: 'Быстрый запас для следующего рывка гавани.',
    costTokens: 35,
    icon: 'future/reward-vfx-sheet.svg',
    reward: { coins: 1200, fish: 220, stars: 2, pearls: 0, eventTokens: 0 }
  },
  {
    id: 'regatta_pearl_prize',
    title: 'Жемчужный приз',
    description: 'Редкая награда регаты для постоянного прогресса.',
    costTokens: 80,
    icon: '3d/icon-pearl-tree.svg',
    reward: { coins: 900, fish: 120, stars: 2, pearls: 1, eventTokens: 0 }
  },
  {
    id: 'regatta_captain_bonus',
    title: 'Капитанский бонус',
    description: 'Набор для ускорения заказов и фестивального темпа.',
    costTokens: 120,
    icon: 'future/regatta-event-banner.svg',
    reward: { coins: 2400, fish: 360, stars: 4, pearls: 1, eventTokens: 0 }
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

export function getAvailableMilestones(state: GameState): MilestoneConfig[] {
  return MILESTONE_REWARDS
    .filter((milestone) => {
      const level = milestone.kind === 'boat'
        ? state.boats[milestone.targetId as BoatId]
        : state.buildings[milestone.targetId as BuildingId];

      return level >= milestone.level && !state.claimedMilestones.includes(milestone.id);
    })
    .map((milestone) => ({
      ...milestone,
      claimed: state.claimedMilestones.includes(milestone.id)
    }));
}

export function getMilestoneById(id: string): Omit<MilestoneConfig, 'claimed'> | undefined {
  return MILESTONE_REWARDS.find((milestone) => milestone.id === id);
}

export function getMilestoneBonus(state: GameState): MilestoneBonus {
  const claimedCount = state.claimedMilestones.length;

  return {
    claimedCount,
    productionMultiplier: 1 + claimedCount * 0.012,
    priceMultiplier: 1 + Math.floor(claimedCount / 2) * 0.008
  };
}

export function getAvailableEventRewards(state: GameState): EventRewardConfig[] {
  return EVENT_REWARDS
    .filter((reward) => state.eventTokens >= reward.costTokens && !state.claimedEventRewards.includes(reward.id))
    .map((reward) => ({
      ...reward,
      claimed: state.claimedEventRewards.includes(reward.id)
    }));
}

export function getEventRewardById(id: string): Omit<EventRewardConfig, 'claimed'> | undefined {
  return EVENT_REWARDS.find((reward) => reward.id === id);
}

export function getRegattaGoals(state: GameState): RegattaGoalConfig[] {
  const goals: Omit<RegattaGoalConfig, 'claimed' | 'ready'>[] = [
    {
      id: 'regatta_orders',
      title: 'Заказы недели',
      description: 'Выполни 3 заказа для жителей бухты.',
      current: Math.min(state.completedOrders, 3),
      target: 3,
      rewardTokens: 30
    },
    {
      id: 'regatta_sales',
      title: 'Большая продажа',
      description: 'Продай 600 рыбы за неделю регаты.',
      current: Math.min(state.lifetimeFishSold, 600),
      target: 600,
      rewardTokens: 25
    },
    {
      id: 'regatta_upgrades',
      title: 'Рост гавани',
      description: 'Купи 4 улучшения лодок или зданий.',
      current: Math.min(state.totalUpgradesPurchased, 4),
      target: 4,
      rewardTokens: 35
    }
  ];

  return goals.map((goal) => ({
    ...goal,
    claimed: state.claimedRegattaGoals.includes(goal.id),
    ready: goal.current >= goal.target && !state.claimedRegattaGoals.includes(goal.id)
  }));
}

export function getRegattaGoalById(id: string, state: GameState): RegattaGoalConfig | undefined {
  return getRegattaGoals(state).find((goal) => goal.id === id);
}

export function getTutorialSteps(state: GameState): TutorialStep[] {
  return [
    {
      id: 'sell_fish',
      title: 'Продай первый улов',
      description: 'Накопи рыбу и нажми продажу, чтобы получить монеты.',
      completed: state.lifetimeFishSold > 0,
      actionLabel: 'Продать'
    },
    {
      id: 'upgrade_boat',
      title: 'Улучши лодку',
      description: 'Прокачай первую лодку, чтобы ускорить добычу.',
      completed: state.boats.rowboat > 1,
      actionLabel: 'Апгрейд'
    },
    {
      id: 'complete_order',
      title: 'Выполни заказ',
      description: 'Отдай рыбу по заказу и получи монеты со звездами.',
      completed: state.completedOrders > 0,
      actionLabel: 'Заказы'
    },
    {
      id: 'claim_daily',
      title: 'Забери ежедневную награду',
      description: 'Ежедневный сундук дает жетоны регаты и стартовый запас.',
      completed: state.dailyReward.streak > 0,
      actionLabel: 'Событие'
    },
    {
      id: 'open_map',
      title: 'Открой новую бухту',
      description: 'Прокачай маяк и перейди к следующей зоне через карту.',
      completed: state.unlockedZones.length > 1,
      actionLabel: 'Карта'
    }
  ];
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
