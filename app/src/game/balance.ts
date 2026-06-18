export type BoatId = 'rowboat' | 'motorboat' | 'netter' | 'trawler';
export type BuildingId = 'pier' | 'market' | 'warehouse' | 'workshop' | 'lighthouse' | 'aquarium';
export type ZoneId = 'quiet_bay' | 'coral_reef' | 'deep_water' | 'misty_strait';
export type FishId =
  | 'bluefish'
  | 'herring'
  | 'bluefin_tuna'
  | 'salmon_trout'
  | 'clownfish'
  | 'pufferfish'
  | 'angel_fish'
  | 'seahorse'
  | 'red_crab'
  | 'lobster'
  | 'manta_ray'
  | 'anglerfish'
  | 'pearl_fish'
  | 'ruby_fish'
  | 'goldfish'
  | 'bannerfish'
  | 'sardine'
  | 'coral_perch'
  | 'moon_puffer'
  | 'pearl_ray';

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
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  zone: ZoneId;
  value: number;
  weight: number;
  icon: string;
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
    baseFishPerSecond: 0.72,
    baseCost: 35,
    costGrowth: 1.58,
    unlockZone: 'quiet_bay',
    icon: 'prop-rowboat.png'
  },
  {
    id: 'motorboat',
    name: 'Моторная лодка',
    description: 'Быстрее ходит к дальним сетям.',
    baseFishPerSecond: 1.95,
    baseCost: 260,
    costGrowth: 1.66,
    unlockZone: 'quiet_bay',
    icon: 'prop-motorboat.png'
  },
  {
    id: 'netter',
    name: 'Сетевой катер',
    description: 'Хорошо работает у кораллового рифа.',
    baseFishPerSecond: 5.8,
    baseCost: 1900,
    costGrowth: 1.74,
    unlockZone: 'coral_reef',
    icon: 'icon-boat.png'
  },
  {
    id: 'trawler',
    name: 'Глубинный траулер',
    description: 'Добывает редкую рыбу в глубоких водах.',
    baseFishPerSecond: 15.5,
    baseCost: 12500,
    costGrowth: 1.82,
    unlockZone: 'deep_water',
    icon: 'prop-motorboat.png'
  }
];

export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'pier',
    name: 'Пирс',
    description: 'Ускоряет весь флот.',
    baseCost: 80,
    costGrowth: 1.62,
    icon: 'prop-pier.png'
  },
  {
    id: 'market',
    name: 'Рыбный рынок',
    description: 'Повышает цену продажи рыбы.',
    baseCost: 90,
    costGrowth: 1.66,
    icon: 'icon-market.png'
  },
  {
    id: 'warehouse',
    name: 'Склад',
    description: 'Увеличивает лимит улова и оффлайн-доход.',
    baseCost: 110,
    costGrowth: 1.64,
    icon: 'icon-storage.png'
  },
  {
    id: 'workshop',
    name: 'Мастерская лодок',
    description: 'Дает бонус к добыче от каждого уровня лодок.',
    baseCost: 420,
    costGrowth: 1.72,
    icon: 'prop-warehouse.png'
  },
  {
    id: 'lighthouse',
    name: 'Маяк',
    description: 'Открывает новые зоны моря.',
    baseCost: 650,
    costGrowth: 1.92,
    icon: 'icon-lighthouse.png'
  },
  {
    id: 'aquarium',
    name: 'Аквариум',
    description: 'Усиливает деревню за коллекцию рыб.',
    baseCost: 900,
    costGrowth: 1.78,
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
    unlockCost: 1600,
    lighthouseLevel: 2,
    multiplier: 1.45
  },
  {
    id: 'deep_water',
    name: 'Глубокая вода',
    description: 'Дорогая рыба и быстрый рост заказов.',
    unlockCost: 9500,
    lighthouseLevel: 4,
    multiplier: 2.1
  },
  {
    id: 'misty_strait',
    name: 'Туманный пролив',
    description: 'Поздняя зона с лучшими находками.',
    unlockCost: 42000,
    lighthouseLevel: 7,
    multiplier: 3.2
  }
];

export const FISH: FishConfig[] = [
  { id: 'bluefish', name: 'Синяя рыбка', rarity: 'common', zone: 'quiet_bay', value: 2, weight: 46, icon: 'bluefish.png' },
  { id: 'herring', name: 'Сельдь', rarity: 'common', zone: 'quiet_bay', value: 3, weight: 42, icon: 'herring.png' },
  { id: 'sardine', name: 'Сардина', rarity: 'common', zone: 'quiet_bay', value: 4, weight: 38, icon: 'sardine.png' },
  { id: 'salmon_trout', name: 'Морская форель', rarity: 'uncommon', zone: 'quiet_bay', value: 8, weight: 18, icon: 'salmon_trout.png' },
  { id: 'red_crab', name: 'Красный краб', rarity: 'uncommon', zone: 'quiet_bay', value: 10, weight: 14, icon: 'red_crab.png' },
  { id: 'clownfish', name: 'Рыба-клоун', rarity: 'common', zone: 'coral_reef', value: 14, weight: 32, icon: 'clownfish.png' },
  { id: 'angel_fish', name: 'Рыба-ангел', rarity: 'uncommon', zone: 'coral_reef', value: 20, weight: 22, icon: 'angel_fish.png' },
  { id: 'seahorse', name: 'Морской конек', rarity: 'rare', zone: 'coral_reef', value: 34, weight: 12, icon: 'seahorse.png' },
  { id: 'lobster', name: 'Лобстер', rarity: 'rare', zone: 'coral_reef', value: 42, weight: 10, icon: 'lobster.png' },
  { id: 'coral_perch', name: 'Коралловый окунь', rarity: 'rare', zone: 'coral_reef', value: 48, weight: 9, icon: 'coral_perch.png' },
  { id: 'bluefin_tuna', name: 'Синий тунец', rarity: 'uncommon', zone: 'deep_water', value: 58, weight: 20, icon: 'bluefin_tuna.png' },
  { id: 'pufferfish', name: 'Иглобрюх', rarity: 'rare', zone: 'deep_water', value: 76, weight: 14, icon: 'pufferfish.png' },
  { id: 'manta_ray', name: 'Манта', rarity: 'rare', zone: 'deep_water', value: 110, weight: 9, icon: 'manta_ray.png' },
  { id: 'anglerfish', name: 'Удильщик', rarity: 'epic', zone: 'deep_water', value: 145, weight: 6, icon: 'anglerfish.png' },
  { id: 'bannerfish', name: 'Полосатый флаг', rarity: 'epic', zone: 'deep_water', value: 180, weight: 5, icon: 'bannerfish.png' },
  { id: 'pearl_fish', name: 'Жемчужная рыбка', rarity: 'rare', zone: 'misty_strait', value: 210, weight: 10, icon: 'pearl_fish.png' },
  { id: 'ruby_fish', name: 'Рубиновая рыбка', rarity: 'epic', zone: 'misty_strait', value: 260, weight: 7, icon: 'ruby_fish.png' },
  { id: 'goldfish', name: 'Золотая рыбка', rarity: 'epic', zone: 'misty_strait', value: 320, weight: 5, icon: 'goldfish.png' },
  { id: 'moon_puffer', name: 'Лунный соня', rarity: 'legendary', zone: 'misty_strait', value: 480, weight: 3, icon: 'moon_puffer.png' },
  { id: 'pearl_ray', name: 'Жемчужный скат', rarity: 'legendary', zone: 'misty_strait', value: 620, weight: 2, icon: 'pearl_ray.png' }
];

export function upgradeCost(baseCost: number, growth: number, currentLevel: number): number {
  return Math.floor(baseCost * growth ** Math.max(0, currentLevel - 1));
}
