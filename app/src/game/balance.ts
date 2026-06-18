export type BoatId = 'rowboat' | 'motorboat' | 'netter' | 'trawler';
export type BuildingId = 'pier' | 'market' | 'warehouse' | 'workshop' | 'lighthouse' | 'aquarium';
export type ZoneId = 'quiet_bay' | 'coral_reef' | 'deep_water' | 'misty_strait';
export type FishId = 'sardine' | 'mackerel' | 'crab' | 'coral_perch' | 'tuna' | 'moon_eel' | 'pearl_ray';

export type BoatConfig = {
  id: BoatId;
  name: string;
  description: string;
  baseFishPerSecond: number;
  baseCost: number;
  costGrowth: number;
  unlockZone: ZoneId;
  icon: string;
};

export type BuildingConfig = {
  id: BuildingId;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  icon: string;
};

export type ZoneConfig = {
  id: ZoneId;
  name: string;
  description: string;
  unlockCost: number;
  lighthouseLevel: number;
  multiplier: number;
};

export type FishConfig = {
  id: FishId;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  zone: ZoneId;
  value: number;
  weight: number;
};

export const BALANCE = {
  saveVersion: 2,
  tickMs: 1000,
  maxOfflineHours: 8,
  baseStorage: 70,
  baseFishPrice: 2,
  marketPriceGrowth: 1.22,
  warehouseGrowth: 1.42,
  pierFleetBonus: 0.05,
  workshopBoatBonus: 0.08,
  aquariumCollectionBonus: 0.015,
  pearlProductionBonus: 0.08,
  pearlPriceBonus: 0.05,
  festivalRequiredStars: 12,
  festivalRequiredCoins: 12000
} as const;

export const BOATS: BoatConfig[] = [
  {
    id: 'rowboat',
    name: 'Весельная лодка',
    description: 'Надежная стартовая лодка для тихой бухты.',
    baseFishPerSecond: 0.8,
    baseCost: 25,
    costGrowth: 1.5,
    unlockZone: 'quiet_bay',
    icon: 'prop-rowboat.png'
  },
  {
    id: 'motorboat',
    name: 'Моторная лодка',
    description: 'Быстрее ходит к дальним сетям.',
    baseFishPerSecond: 2.2,
    baseCost: 180,
    costGrowth: 1.58,
    unlockZone: 'quiet_bay',
    icon: 'prop-motorboat.png'
  },
  {
    id: 'netter',
    name: 'Сетевой катер',
    description: 'Хорошо работает у кораллового рифа.',
    baseFishPerSecond: 6.5,
    baseCost: 1250,
    costGrowth: 1.66,
    unlockZone: 'coral_reef',
    icon: 'icon-boat.png'
  },
  {
    id: 'trawler',
    name: 'Глубинный траулер',
    description: 'Добывает редкую рыбу в глубоких водах.',
    baseFishPerSecond: 18,
    baseCost: 8500,
    costGrowth: 1.72,
    unlockZone: 'deep_water',
    icon: 'prop-motorboat.png'
  }
];

export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'pier',
    name: 'Пирс',
    description: 'Ускоряет весь флот.',
    baseCost: 50,
    costGrowth: 1.55,
    icon: 'prop-pier.png'
  },
  {
    id: 'market',
    name: 'Рыбный рынок',
    description: 'Повышает цену продажи рыбы.',
    baseCost: 60,
    costGrowth: 1.6,
    icon: 'icon-market.png'
  },
  {
    id: 'warehouse',
    name: 'Склад',
    description: 'Увеличивает лимит улова и оффлайн-доход.',
    baseCost: 70,
    costGrowth: 1.56,
    icon: 'icon-storage.png'
  },
  {
    id: 'workshop',
    name: 'Мастерская лодок',
    description: 'Дает бонус к добыче от каждого уровня лодок.',
    baseCost: 260,
    costGrowth: 1.65,
    icon: 'prop-warehouse.png'
  },
  {
    id: 'lighthouse',
    name: 'Маяк',
    description: 'Открывает новые зоны моря.',
    baseCost: 420,
    costGrowth: 1.8,
    icon: 'icon-lighthouse.png'
  },
  {
    id: 'aquarium',
    name: 'Аквариум',
    description: 'Усиливает деревню за коллекцию рыб.',
    baseCost: 550,
    costGrowth: 1.7,
    icon: 'icon-aquarium.png'
  }
];

export const ZONES: ZoneConfig[] = [
  {
    id: 'quiet_bay',
    name: 'Тихая бухта',
    description: 'Стартовая зона с простой рыбой.',
    unlockCost: 0,
    lighthouseLevel: 1,
    multiplier: 1
  },
  {
    id: 'coral_reef',
    name: 'Коралловый риф',
    description: 'Больше прибыли и первые редкие виды.',
    unlockCost: 900,
    lighthouseLevel: 2,
    multiplier: 1.45
  },
  {
    id: 'deep_water',
    name: 'Глубокая вода',
    description: 'Дорогая рыба и быстрый рост заказов.',
    unlockCost: 5200,
    lighthouseLevel: 4,
    multiplier: 2.1
  },
  {
    id: 'misty_strait',
    name: 'Туманный пролив',
    description: 'Поздняя зона с лучшими находками.',
    unlockCost: 22000,
    lighthouseLevel: 7,
    multiplier: 3.2
  }
];

export const FISH: FishConfig[] = [
  { id: 'sardine', name: 'Сардина', rarity: 'common', zone: 'quiet_bay', value: 2, weight: 58 },
  { id: 'mackerel', name: 'Скумбрия', rarity: 'common', zone: 'quiet_bay', value: 4, weight: 32 },
  { id: 'crab', name: 'Краб', rarity: 'uncommon', zone: 'quiet_bay', value: 8, weight: 10 },
  { id: 'coral_perch', name: 'Коралловый окунь', rarity: 'rare', zone: 'coral_reef', value: 22, weight: 18 },
  { id: 'tuna', name: 'Тунец', rarity: 'uncommon', zone: 'deep_water', value: 48, weight: 14 },
  { id: 'moon_eel', name: 'Лунный угорь', rarity: 'epic', zone: 'deep_water', value: 120, weight: 5 },
  { id: 'pearl_ray', name: 'Жемчужный скат', rarity: 'epic', zone: 'misty_strait', value: 260, weight: 4 }
];

export function upgradeCost(baseCost: number, growth: number, currentLevel: number): number {
  return Math.floor(baseCost * growth ** Math.max(0, currentLevel - 1));
}
