import type { BoatId, BuildingId, ZoneId } from './balance';

export type SceneLabelId = 'shipyard' | 'storage' | 'market';

export type SceneLabelConfig = {
  title: string;
  note: string;
  buildingId?: BuildingId;
  style: string;
};

export type BoatSlotConfig = {
  boatId: BoatId;
  style: string;
  wakeStyle: string;
  timerStyle: string;
  asset: string;
  mirror?: boolean;
};

export type ZoneSceneConfig = {
  id: ZoneId;
  map: string;
  mapPosition: string;
  cardPosition: string;
  routePosition: string;
  labels: Record<SceneLabelId, SceneLabelConfig>;
  boats: BoatSlotConfig[];
};

export const ZONE_SCENES: Record<ZoneId, ZoneSceneConfig> = {
  quiet_bay: {
    id: 'quiet_bay',
    map: 'maps/zone-quiet-bay.jpg',
    mapPosition: 'center 24%',
    cardPosition: '42% 18%',
    routePosition: '42% 22%',
    labels: {
      shipyard: { title: 'Верфь', note: 'сила флота', buildingId: 'pier', style: 'left: 15%; top: 47%;' },
      storage: { title: 'Склад', note: 'лимит улова', buildingId: 'warehouse', style: 'left: 43%; top: 35%;' },
      market: { title: 'Рынок', note: 'цена рыбы', buildingId: 'market', style: 'right: 17%; top: 40%;' }
    },
    boats: [
      {
        boatId: 'rowboat',
        asset: 'ships/ship-rowboat.png',
        style: 'left: 38%; top: 64%; width: 94px;',
        wakeStyle: 'left: 40%; top: 74%; width: 68px;',
        timerStyle: 'left: 44%; bottom: 36%;'
      },
      {
        boatId: 'motorboat',
        asset: 'ships/ship-motorboat.png',
        style: 'right: 30%; top: 70%; width: 112px;',
        wakeStyle: 'right: 33%; top: 81%; width: 80px;',
        timerStyle: 'right: 36%; bottom: 31%;',
        mirror: true
      }
    ]
  },
  coral_reef: {
    id: 'coral_reef',
    map: 'maps/zone-coral-reef.jpg',
    mapPosition: 'center 22%',
    cardPosition: '72% 24%',
    routePosition: '66% 26%',
    labels: {
      shipyard: { title: 'Причал', note: 'флот у рифа', buildingId: 'pier', style: 'left: 15%; top: 43%;' },
      storage: { title: 'Лагуна', note: 'запас улова', buildingId: 'warehouse', style: 'left: 45%; top: 35%;' },
      market: { title: 'Риф-рынок', note: 'цена редкой рыбы', buildingId: 'market', style: 'right: 16%; top: 43%;' }
    },
    boats: [
      {
        boatId: 'rowboat',
        asset: 'ships/ship-rowboat.png',
        style: 'left: 37%; top: 67%; width: 90px;',
        wakeStyle: 'left: 39%; top: 77%; width: 64px;',
        timerStyle: 'left: 42%; bottom: 34%;'
      },
      {
        boatId: 'motorboat',
        asset: 'ships/ship-coral-runner.png',
        style: 'right: 34%; top: 52%; width: 108px;',
        wakeStyle: 'right: 36%; top: 62%; width: 74px;',
        timerStyle: 'right: 39%; bottom: 49%;'
      },
      {
        boatId: 'netter',
        asset: 'ships/ship-netter.png',
        style: 'right: 25%; top: 72%; width: 126px;',
        wakeStyle: 'right: 28%; top: 84%; width: 86px;',
        timerStyle: 'right: 34%; bottom: 29%;',
        mirror: true
      }
    ]
  },
  deep_water: {
    id: 'deep_water',
    map: 'maps/zone-deep-water.jpg',
    mapPosition: 'center 21%',
    cardPosition: '48% 18%',
    routePosition: '54% 30%',
    labels: {
      shipyard: { title: 'Верфь', note: 'тяжелые суда', buildingId: 'pier', style: 'left: 17%; top: 41%;' },
      storage: { title: 'Снасти', note: 'лимит склада', buildingId: 'warehouse', style: 'left: 47%; top: 33%;' },
      market: { title: 'Порт', note: 'дорогой улов', buildingId: 'market', style: 'right: 15%; top: 43%;' }
    },
    boats: [
      {
        boatId: 'motorboat',
        asset: 'ships/ship-motorboat.png',
        style: 'left: 29%; top: 66%; width: 108px;',
        wakeStyle: 'left: 32%; top: 77%; width: 76px;',
        timerStyle: 'left: 36%; bottom: 35%;'
      },
      {
        boatId: 'netter',
        asset: 'ships/ship-deep-netter.png',
        style: 'right: 30%; top: 55%; width: 126px;',
        wakeStyle: 'right: 33%; top: 68%; width: 88px;',
        timerStyle: 'right: 38%; bottom: 43%;',
        mirror: true
      },
      {
        boatId: 'trawler',
        asset: 'ships/ship-deep-trawler.png',
        style: 'right: 22%; top: 72%; width: 144px;',
        wakeStyle: 'right: 26%; top: 87%; width: 100px;',
        timerStyle: 'right: 34%; bottom: 28%;'
      }
    ]
  },
  misty_strait: {
    id: 'misty_strait',
    map: 'maps/zone-misty-strait.jpg',
    mapPosition: 'center 18%',
    cardPosition: '50% 16%',
    routePosition: '50% 34%',
    labels: {
      shipyard: { title: 'Тихий док', note: 'поздний флот', buildingId: 'pier', style: 'left: 17%; top: 45%;' },
      storage: { title: 'Фонарь', note: 'ориентир рейсов', buildingId: 'warehouse', style: 'left: 45%; top: 35%;' },
      market: { title: 'Ночной рынок', note: 'лучшая цена', buildingId: 'market', style: 'right: 15%; top: 46%;' }
    },
    boats: [
      {
        boatId: 'netter',
        asset: 'ships/ship-mist-cutter.png',
        style: 'left: 30%; top: 69%; width: 120px;',
        wakeStyle: 'left: 33%; top: 81%; width: 82px;',
        timerStyle: 'left: 38%; bottom: 31%;'
      },
      {
        boatId: 'trawler',
        asset: 'ships/ship-trawler.png',
        style: 'right: 26%; top: 58%; width: 146px;',
        wakeStyle: 'right: 30%; top: 73%; width: 100px;',
        timerStyle: 'right: 36%; bottom: 39%;',
        mirror: true
      }
    ]
  }
};

