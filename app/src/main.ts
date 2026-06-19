import './styles.css';
import { BOATS, BUILDINGS, FISH, ZONES, type BoatId, type BuildingId, type ZoneId } from './game/balance';
import { ZONE_SCENES, type BoatSlotConfig, type SceneLabelConfig, type ZoneSceneConfig } from './game/scene';
import {
  applyIncome,
  applyOfflineIncome,
  buyBoat,
  buyBuilding,
  canRunFestival,
  completeOrder,
  getBoatCost,
  getBuildingCost,
  getFestivalPearls,
  getNextGoal,
  getStats,
  runFestival,
  sellFish,
  unlockZone,
  type GameState
} from './game/state';
import { loadState, resetState, saveState } from './game/storage';

type TabId = 'harbor' | 'upgrades' | 'sea' | 'orders' | 'collection' | 'festival';
type OverlayId = 'map' | 'orders' | 'collection' | 'festival';
type UserSettings = {
  animations: boolean;
  compactHud: boolean;
  confirmReset: boolean;
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

const appRoot = app;

let activeTab: TabId = 'harbor';
let toast = '';
let game = loadState();
let activeZone: ZoneId = loadActiveZone(game.unlockedZones);
let activeOverlay: OverlayId | null = null;
let settingsOpen = false;
let userSettings = loadUserSettings();
const offline = applyOfflineIncome(game);
game = offline.state;
if (offline.offlineFish >= 1) {
  toast = `Оффлайн улов: +${formatNumber(offline.offlineFish)} рыбы`;
}
saveState(game);

function loadUserSettings(): UserSettings {
  const fallback: UserSettings = {
    animations: true,
    compactHud: false,
    confirmReset: true
  };
  const raw = localStorage.getItem('idle-fishing-village.settings.v1');

  if (!raw) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(raw)
    };
  } catch {
    return fallback;
  }
}

function saveUserSettings(): void {
  localStorage.setItem('idle-fishing-village.settings.v1', JSON.stringify(userSettings));
}

function loadActiveZone(unlockedZones: ZoneId[]): ZoneId {
  const saved = localStorage.getItem('idle-fishing-village.active-zone.v1') as ZoneId | null;
  if (saved && unlockedZones.includes(saved)) {
    return saved;
  }

  return 'quiet_bay';
}

function setActiveZone(zoneId: ZoneId): void {
  activeZone = zoneId;
  localStorage.setItem('idle-fishing-village.active-zone.v1', zoneId);
}

function ensureActiveZone(): void {
  if (!game.unlockedZones.includes(activeZone)) {
    setActiveZone('quiet_bay');
  }
}

function applyUserSettings(): void {
  appRoot.className = [
    'shell',
    userSettings.animations ? '' : 'reduce-motion',
    userSettings.compactHud ? 'compact-hud-mode' : ''
  ].filter(Boolean).join(' ');
}

function asset(name: string): string {
  return `/assets/art/${name}`;
}

function iconAsset(name: string): string {
  return asset(`3d/icon-${name}.png`);
}

function propAsset(name: string): string {
  return asset(`3d/prop-${name}.png`);
}

function buildingIcon(id: BuildingId): string {
  const icons: Record<BuildingId, string> = {
    pier: propAsset('pier'),
    market: propAsset('fish-market'),
    warehouse: propAsset('warehouse'),
    workshop: propAsset('fish-crate'),
    lighthouse: propAsset('lighthouse'),
    aquarium: iconAsset('aquarium')
  };

  return icons[id];
}

function getSceneMap(): string {
  return ZONE_SCENES[activeZone].map;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 10_000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return Math.floor(value).toLocaleString('ru-RU');
}

function percent(value: number): string {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function getCaptainXp(): number {
  const boatLevels = totalBoatLevels();
  return game.stars * 120 + game.completedOrders * 45 + game.festivalCount * 520 + Math.max(0, boatLevels - 1) * 28;
}

function getCaptainLevel(): number {
  return Math.min(99, Math.floor(getCaptainXp() / 140));
}

function rarityLabel(rarity: (typeof FISH)[number]['rarity']): string {
  const labels: Record<(typeof FISH)[number]['rarity'], string> = {
    common: 'обычная',
    uncommon: 'необычная',
    rare: 'редкая',
    epic: 'эпическая',
    legendary: 'легендарная'
  };

  return labels[rarity];
}

function render(): void {
  ensureActiveZone();
  const stats = getStats(game, activeZone);
  const storagePercent = (game.fish / stats.storageCapacity) * 100;
  const scene = ZONE_SCENES[activeZone];
  const captainLevel = getCaptainLevel();
  const captainXp = getCaptainXp();
  const nextCaptainXp = Math.min(99, captainLevel + 1) * 140;
  const animationNow = Date.now();
  applyUserSettings();

  appRoot.innerHTML = `
    <header class="topbar premium-hud">
      <div class="captain-card">
        <img src="${asset('captain-avatar.png')}" alt="" />
        <div class="level-badge">${captainLevel}</div>
      </div>
      <div class="xp-pill" data-info="Опыт растет за звезды и выполненные заказы. Это общий прогресс капитана." title="Опыт растет за звезды и выполненные заказы.">
        <span>Опыт</span>
        <strong>${formatNumber(captainXp)} / ${formatNumber(nextCaptainXp || 140)}</strong>
      </div>
      ${resourceCard(iconAsset('fish'), 'Рыба', formatNumber(game.fish), 'top-fish', 'Рыба копится автоматически. Ее продают за монеты и тратят на заказы.')}
      ${resourceCard(iconAsset('coin'), 'Монеты', formatNumber(game.coins), 'top-coins', 'Монеты нужны для лодок, зданий и открытия новых зон.')}
      ${resourceCard(iconAsset('pearl'), 'Жемчуг', formatNumber(game.pearls), 'top-pearls', 'Жемчуг остается после фестиваля и дает постоянные бонусы.')}
      <button class="icon-button gear" data-action="open-settings" title="Настройки" aria-label="Открыть настройки">⚙</button>
    </header>

    <section class="resources compact-resources" aria-label="Ресурсы">
      ${resourceCard(iconAsset('fish'), 'Улов', `${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}`, 'compact-fish', 'Сколько рыбы сейчас лежит на складе.')}
      ${resourceCard(iconAsset('coin'), 'Доход', `+${formatNumber(stats.fishPerSecond * stats.fishPrice)}/сек`, 'compact-income', 'Примерная стоимость нового улова в секунду.')}
      ${resourceCard(iconAsset('pearl'), 'Звезды', formatNumber(game.stars), 'compact-stars', 'Звезды дают прогресс к Морскому фестивалю.')}
    </section>

    <section class="village asset-scene zone-${activeZone}" style="--scene-map: url('${asset(getSceneMap())}'); --scene-position: ${scene.mapPosition}; --boat-phase: -${animationNow % 4800}ms; --wake-phase: -${animationNow % 2700}ms; --water-phase: -${animationNow % 9000}ms; --wing-phase: -${animationNow % 720}ms; --gull-a-phase: -${animationNow % 14000}ms; --gull-b-phase: -${(animationNow + 8000) % 19000}ms;" aria-label="${zoneName(activeZone)}">
      ${renderSceneOverlay()}
    </section>

    <section class="panel primary-panel">
      <div class="panel-row">
        <div>
          <p class="label">Склад</p>
          <strong data-value="storage-summary">${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}</strong>
        </div>
        <button class="primary-action" data-action="sell" data-control="sell" ${game.fish < 1 ? 'disabled' : ''}>Продать</button>
      </div>
      <div class="meter"><span data-meter="storage" style="width: ${percent(storagePercent)}"></span></div>
      <p class="hint" data-value="price-hint">Цена: ${stats.fishPrice.toFixed(1)} монеты. Бонус коллекции: x${stats.collectionBonus.toFixed(2)}.</p>
    </section>

    <section class="content-shell" data-region="active-tab">
      ${renderActiveTab()}
    </section>

    <footer class="next-goal">
      <span>Следующая цель</span>
      <strong data-value="next-goal">${getNextGoal(game)}</strong>
    </footer>

    <nav class="tabbar compact-tabbar" aria-label="Основные разделы">
      ${tabButton('harbor', '⌂', 'Гавань')}
      ${tabButton('upgrades', '⇧', 'Апгрейд')}
      ${tabButton('sea', '♜', 'Маяк')}
    </nav>

    ${settingsOpen ? renderSettingsPanel() : ''}
    ${activeOverlay ? renderActionOverlay(activeOverlay) : ''}
    ${toast ? `<div class="toast">${toast}</div>` : ''}
  `;
}

function resourceCard(icon: string, label: string, value: string, valueKey?: string, info?: string): string {
  return `
    <article ${info ? `data-info="${info}" title="${info}"` : ''}>
      <img src="${icon}" alt="" />
      <span>${label}</span>
      <strong ${valueKey ? `data-value="${valueKey}"` : ''}>${value}</strong>
    </article>
  `;
}

function renderSceneOverlay(): string {
  const scene = ZONE_SCENES[activeZone];

  return `
    <div class="harbor-motion" aria-hidden="true">
      <span class="water-shine shine-a"></span>
      <span class="water-shine shine-b"></span>
      <span class="water-shine shine-c"></span>
      ${renderSceneBoats(scene)}
      <span class="gull gull-a"></span>
      <span class="gull gull-b"></span>
    </div>
    <div class="scene-markers" aria-hidden="true">
      ${renderBuildingLabels(scene)}
      ${renderBoatLabels(scene)}
    </div>
    <div class="side-actions">
      <button data-action="open-overlay" data-overlay="festival"><img src="${iconAsset('ticket')}" alt="" /><span>Событие</span></button>
      <button data-action="open-overlay" data-overlay="collection"><img src="${iconAsset('aquarium')}" alt="" /><span>Достижения</span></button>
      <button data-action="open-overlay" data-overlay="orders"><img src="${iconAsset('order')}" alt="" /><span>Заказы</span></button>
      <button data-action="open-overlay" data-overlay="map"><img src="${iconAsset('map')}" alt="" /><span>Карта</span></button>
    </div>
  `;
}

function renderBuildingLabels(scene: ZoneSceneConfig): string {
  return Object.values(scene.labels)
    .filter((label) => label.buildingId && game.buildings[label.buildingId] > 0)
    .map((label) => renderBuildingLabel(label))
    .join('');
}

function renderBuildingLabel(label: SceneLabelConfig): string {
  const buildingId = label.buildingId!;
  const level = game.buildings[buildingId];
  const anchor = label.style.includes('right:') ? 'right' : 'left';
  const wideClass = label.wide ? ' scene-label-wide' : '';

  return `
    <div class="scene-label scene-label-building${wideClass}" data-anchor="${anchor}" style="${label.style}">
      <strong>${label.title}</strong>
      <span>Ур. ${level}</span>
    </div>
  `;
}

function renderBoatLabels(scene: ZoneSceneConfig): string {
  return scene.boats
    .filter((slot) => slot.labelStyle && game.boats[slot.boatId] > 0)
    .map((slot) => renderBoatLabel(slot))
    .join('');
}

function renderBoatLabel(slot: BoatSlotConfig): string {
  const level = game.boats[slot.boatId];
  const anchor = slot.labelStyle!.includes('right:') ? 'right' : 'left';

  return `
    <div class="scene-label scene-label-boat" data-anchor="${anchor}" style="${slot.labelStyle}">
      <strong>${boatSceneName(slot.boatId)}</strong>
      <span>Ур. ${level}</span>
    </div>
  `;
}

function boatSceneName(id: BoatId): string {
  const boat = BOATS.find((item) => item.id === id);
  if (!boat) {
    return id;
  }

  return boat.name.split(' ')[0] ?? boat.name;
}

function renderSceneBoats(scene: ZoneSceneConfig): string {
  return scene.boats
    .filter((slot) => game.boats[slot.boatId] > 0)
    .map((slot) => renderSceneBoat(slot))
    .join('');
}

function renderSceneBoat(slot: BoatSlotConfig): string {
  const level = game.boats[slot.boatId];
  const tier = level >= 6 ? 'veteran' : level >= 3 ? 'upgraded' : 'fresh';

  return `
    <span class="boat-wake" style="${slot.wakeStyle}"></span>
    <img class="scene-prop scene-boat boat-tier-${tier} ${slot.mirror ? 'mirrored' : ''}" src="${asset(slot.asset)}" alt="" style="${slot.style}" />
  `;
}

function renderSettingsPanel(): string {
  return `
    <div class="settings-backdrop" data-action="close-settings" role="presentation"></div>
    <section class="settings-panel" role="dialog" aria-modal="true" aria-label="Настройки игры">
      <div class="settings-header">
        <div>
          <span>Удобство</span>
          <h2>Настройки</h2>
        </div>
        <button class="icon-button" data-action="close-settings" aria-label="Закрыть настройки">×</button>
      </div>
      ${settingsToggle('animations', 'Анимации сцены', 'Вода, лодки и чайки двигаются плавно.', userSettings.animations)}
      ${settingsToggle('compactHud', 'Компактный интерфейс', 'Больше места для гавани на маленьком экране.', userSettings.compactHud)}
      ${settingsToggle('confirmReset', 'Защита прогресса', 'Перед сбросом игра спросит подтверждение.', userSettings.confirmReset)}
      <button class="danger-action" data-action="reset-progress">Сбросить прогресс</button>
    </section>
  `;
}

function renderActionOverlay(overlay: OverlayId): string {
  const titles: Record<OverlayId, string> = {
    map: 'Карта бухт',
    orders: 'Заказы',
    collection: 'Достижения',
    festival: 'Событие'
  };

  return `
    <div class="overlay-backdrop" data-action="close-overlay" role="presentation"></div>
    <section class="action-overlay action-overlay-${overlay}" role="dialog" aria-modal="true" aria-label="${titles[overlay]}">
      <div class="overlay-header">
        <div>
          <span>${overlay === 'map' ? zoneName(activeZone) : 'Рыбацкая деревня'}</span>
          <h2>${titles[overlay]}</h2>
        </div>
        <button class="icon-button" data-action="close-overlay" aria-label="Закрыть">×</button>
      </div>
      ${overlay === 'map' ? renderMapOverlay() : ''}
      ${overlay === 'orders' ? renderOrders() : ''}
      ${overlay === 'collection' ? renderCollection() : ''}
      ${overlay === 'festival' ? renderFestival() : ''}
    </section>
  `;
}

function renderMapOverlay(): string {
  return `
    <article class="map-full" style="--map-preview: url('${asset('maps/zone-map.jpg')}')">
      <span>Выбери открытую бухту. Закрытые зоны станут доступны после прокачки маяка и накопления монет.</span>
    </article>
    <div class="zone-grid zone-map-grid overlay-zone-grid">
      ${ZONES.map((zone) => {
        const unlocked = game.unlockedZones.includes(zone.id);
        const canUnlock = game.coins >= zone.unlockCost && game.buildings.lighthouse >= zone.lighthouseLevel;
        const selected = activeZone === zone.id;
        const scene = ZONE_SCENES[zone.id];
        return `
          <article class="zone-card zone-map-card ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}" style="--zone-card-image: url('${asset(scene.map)}'); --zone-card-position: ${scene.cardPosition};">
            <div>
              ${!unlocked ? '<b class="zone-lock">🔒</b>' : ''}
              <strong>${zone.name}</strong>
              <p>${zone.description}</p>
              <span>x${zone.multiplier.toFixed(2)} добыча</span>
            </div>
            <button data-action="${unlocked ? 'select-zone' : 'unlock-zone'}" data-id="${zone.id}" ${selected || (!unlocked && !canUnlock) ? 'disabled' : ''}>
              ${selected ? 'Выбрано' : unlocked ? 'Перейти' : `${formatNumber(zone.unlockCost)} монет`}
            </button>
            ${!unlocked ? `<small>Нужен маяк ур. ${zone.lighthouseLevel}</small>` : ''}
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function settingsToggle(id: keyof UserSettings, title: string, text: string, enabled: boolean): string {
  return `
    <button class="settings-toggle ${enabled ? 'enabled' : ''}" data-action="toggle-setting" data-id="${id}" aria-pressed="${enabled}">
      <span>
        <strong>${title}</strong>
        <em>${text}</em>
      </span>
      <b>${enabled ? 'Вкл' : 'Выкл'}</b>
    </button>
  `;
}

function tabButton(id: TabId, icon: string, label: string): string {
  return `
    <button class="${activeTab === id ? 'active' : ''}" data-tab="${id}" aria-label="${label}">
      <span>${icon}</span>
      <em>${label}</em>
    </button>
  `;
}

function renderActiveTab(): string {
  if (activeTab === 'upgrades') {
    return renderUpgrades();
  }

  if (activeTab === 'sea') {
    return renderSea();
  }

  if (activeTab === 'orders') {
    return renderOrders();
  }

  if (activeTab === 'collection') {
    return renderCollection();
  }

  if (activeTab === 'festival') {
    return renderFestival();
  }

  return renderHarbor();
}

function renderHarbor(): string {
  return `
    <div class="section-title">
      <div>
        <span>Быстрые улучшения</span>
        <h2>Гавань</h2>
      </div>
      <strong>${formatNumber(game.coins)} монет</strong>
    </div>
    <div class="quick-upgrades">
      ${quickUpgrade('Лодка', `Ур. ${game.boats.rowboat}`, propAsset('motorboat'), 'Больше рыбы за рейс', getBoatCost(game, 'rowboat'), 'buy-boat', 'rowboat')}
      ${quickUpgrade('Рынок', `Ур. ${game.buildings.market}`, propAsset('fish-market'), 'Выше цена на рыбу', getBuildingCost(game, 'market'), 'buy-building', 'market')}
      ${quickUpgrade('Сеть', `Ур. ${game.boats.netter}`, propAsset('net'), 'Больше рыбы в сетях', getBoatCost(game, 'netter'), 'buy-boat', 'netter')}
      ${quickUpgrade('Пирс', `Ур. ${game.buildings.pier}`, propAsset('pier'), 'Больше места для лодок', getBuildingCost(game, 'pier'), 'buy-building', 'pier')}
    </div>
  `;
}

function quickUpgrade(title: string, level: string, icon: string, text: string, cost: number, action: string, id: string): string {
  const locked = action === 'buy-boat' && id === 'netter' && !game.unlockedZones.includes('coral_reef');
  return `
    <article class="shop-card">
      <i>!</i>
      <strong>${title}</strong>
      <span>${level}</span>
      <img src="${icon}" alt="" />
      <p>${locked ? 'Открой риф' : text}</p>
      <button data-action="${action}" data-id="${id}" ${locked || game.coins < cost ? 'disabled' : ''}>
        Улучшить <b><img src="${iconAsset('coin')}" alt="" />${formatNumber(cost)}</b>
      </button>
    </article>
  `;
}

function renderUpgrades(): string {
  return `
    <div class="section-title">
      <div>
        <span>Прокачка</span>
        <h2>Лодки</h2>
      </div>
    </div>
    <div class="upgrade-list">
      ${BOATS.map(renderBoatUpgrade).join('')}
    </div>
    <div class="section-title compact">
      <div>
        <span>Деревня</span>
        <h2>Здания</h2>
      </div>
    </div>
    <div class="upgrade-list">
      ${BUILDINGS.map(renderBuildingUpgrade).join('')}
    </div>
  `;
}

function renderBoatUpgrade(boat: (typeof BOATS)[number]): string {
  const level = game.boats[boat.id];
  const cost = getBoatCost(game, boat.id);
  const locked = !game.unlockedZones.includes(boat.unlockZone);
  const disabled = locked || game.coins < cost;

  return `
    <button class="upgrade-card" data-action="buy-boat" data-id="${boat.id}" ${disabled ? 'disabled' : ''}>
      <img src="${boat.id === 'rowboat' ? propAsset('rowboat') : propAsset('motorboat')}" alt="" />
      <span>
        <strong>${boat.name}</strong>
        <em>${locked ? 'Нужна зона: ' + zoneName(boat.unlockZone) : boat.description}</em>
      </span>
      <b>Ур. ${level}</b>
      <small>${locked ? 'Закрыто' : formatNumber(cost) + ' монет'}</small>
    </button>
  `;
}

function renderBuildingUpgrade(building: (typeof BUILDINGS)[number]): string {
  const level = game.buildings[building.id];
  const cost = getBuildingCost(game, building.id);

  return `
    <button class="upgrade-card" data-action="buy-building" data-id="${building.id}" ${game.coins < cost ? 'disabled' : ''}>
      <img src="${buildingIcon(building.id)}" alt="" />
      <span>
        <strong>${building.name}</strong>
        <em>${building.description}</em>
      </span>
      <b>Ур. ${level}</b>
      <small>${formatNumber(cost)} монет</small>
    </button>
  `;
}

function renderSea(): string {
  const stats = getStats(game, activeZone);
  const lighthouseCost = getBuildingCost(game, 'lighthouse');
  const nextLockedZone = ZONES.find((zone) => !game.unlockedZones.includes(zone.id));
  return `
    <div class="section-title">
      <div>
        <span>Открытие бухт</span>
        <h2>Маяк и экспедиции</h2>
      </div>
      <strong>Маяк ур. ${game.buildings.lighthouse}</strong>
    </div>
    <article class="wide-card sea-help-card">
      <img src="${buildingIcon('lighthouse')}" alt="" />
      <div>
        <strong>Прокачивай маяк, чтобы открыть новые бухты</strong>
        <p>Маяк открывает маршруты, повышает ценность экспедиций и ведёт к новым кораблям. Карта выбора бухты находится в правом HUD.</p>
      </div>
    </article>
    <div class="stat-grid lighthouse-stats">
      ${miniStat('Текущая бухта', zoneName(activeZone))}
      ${miniStat('Бонус зоны', `x${stats.bestZoneMultiplier.toFixed(2)}`)}
      ${miniStat('Уровень маяка', `${game.buildings.lighthouse}`)}
      ${miniStat('След. маяк', `${formatNumber(lighthouseCost)} монет`)}
    </div>
    ${nextLockedZone ? `<p class="sea-next">Следующая бухта: ${nextLockedZone.name}. Нужен маяк ур. ${nextLockedZone.lighthouseLevel} и ${formatNumber(nextLockedZone.unlockCost)} монет.</p>` : '<p class="sea-next">Все бухты открыты. Дальше копи звезды для Морского фестиваля.</p>'}
    <div class="zone-grid">
      ${ZONES.map((zone) => {
        const unlocked = game.unlockedZones.includes(zone.id);
        const canUnlock = game.coins >= zone.unlockCost && game.buildings.lighthouse >= zone.lighthouseLevel;
        return `
          <article class="zone-card ${unlocked ? 'unlocked' : ''}">
            <div>
              ${!unlocked ? '<b class="zone-lock">🔒</b>' : ''}
              <strong>${zone.name}</strong>
              <p>${zone.description}</p>
              <span>x${zone.multiplier.toFixed(2)} добыча</span>
            </div>
            <button data-action="unlock-zone" data-id="${zone.id}" ${unlocked || !canUnlock ? 'disabled' : ''}>
              ${unlocked ? 'Открыто' : `${formatNumber(zone.unlockCost)} монет`}
            </button>
            ${!unlocked ? `<small>Нужен маяк ур. ${zone.lighthouseLevel}</small>` : ''}
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderOrders(): string {
  return `
    <div class="section-title">
      <div>
        <span>Доска</span>
        <h2>Заказы</h2>
      </div>
      <strong>${formatNumber(game.completedOrders)} выполнено</strong>
    </div>
    <div class="order-list">
      ${game.orders.map((order) => `
        <article class="order-card">
          <img src="${iconAsset('order')}" alt="" />
          <div>
            <strong>${order.title}</strong>
            <p>${zoneName(order.zone)} просит ${formatNumber(order.fishRequired)} рыбы</p>
            <span>+${formatNumber(order.rewardCoins)} монет, +${order.rewardStars} зв.</span>
          </div>
          <button data-action="complete-order" data-id="${order.id}" ${game.fish < order.fishRequired ? 'disabled' : ''}>Отдать</button>
        </article>
      `).join('')}
    </div>
  `;
}

function renderCollection(): string {
  const stats = getStats(game);

  return `
    <div class="section-title">
      <div>
        <span>Аквариум</span>
        <h2>Коллекция</h2>
      </div>
      <strong>${stats.uniqueFish}/${FISH.length}</strong>
    </div>
    <div class="fish-grid">
      ${FISH.map((fish) => {
        const count = game.collection[fish.id];
        const discovered = count > 0;
        const available = game.unlockedZones.includes(fish.zone);
        return `
          <article class="fish-card ${discovered ? 'found' : ''} rarity-${fish.rarity}">
            <img src="${asset(`fish/${fish.icon}`)}" alt="" />
            <strong>${discovered || available ? fish.name : '???'}</strong>
            <span>${rarityLabel(fish.rarity)}</span>
            <em>${discovered ? `${formatNumber(count)} поймано` : available ? 'Можно поймать' : zoneName(fish.zone)}</em>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderFestival(): string {
  const stats = getStats(game);
  const canFestival = canRunFestival(game);
  const pearls = getFestivalPearls(game);

  return `
    <div class="section-title">
      <div>
        <span>Престиж</span>
        <h2>Морской фестиваль</h2>
      </div>
      <strong>${game.festivalCount} раз</strong>
    </div>
    <article class="festival-card">
      <img src="${iconAsset('ticket')}" alt="" />
      <div>
        <strong>${canFestival ? `Получить ${pearls} жемч.` : 'Фестиваль пока готовится'}</strong>
        <p>Фестиваль сбрасывает монеты, лодки, здания, зоны и коллекцию. Жемчуг остается навсегда и дает бонус к добыче и цене.</p>
      </div>
      <button class="primary-action" data-action="festival" ${canFestival ? '' : 'disabled'}>Провести</button>
    </article>
    <div class="stat-grid">
      ${miniStat('Нужно звезд', `${Math.min(game.stars, 12)}/12`)}
      ${miniStat('Нужно монет', `${formatNumber(game.coins)}/12K`)}
      ${miniStat('Бонус добычи', `x${stats.pearlProductionBonus.toFixed(2)}`)}
      ${miniStat('Бонус цены', `x${stats.pearlPriceBonus.toFixed(2)}`)}
    </div>
  `;
}

function miniStat(label: string, value: string): string {
  return `
    <article>
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function totalBoatLevels(): number {
  return BOATS.reduce((sum, boat) => sum + game.boats[boat.id], 0);
}

function zoneName(id: ZoneId): string {
  return ZONES.find((zone) => zone.id === id)?.name ?? id;
}

function setText(selector: string, value: string): void {
  const element = appRoot.querySelector<HTMLElement>(selector);
  if (element) {
    element.textContent = value;
  }
}

function setMeter(selector: string, value: string): void {
  const element = appRoot.querySelector<HTMLElement>(selector);
  if (element) {
    element.style.width = value;
  }
}

function renderToast(): void {
  const existingToast = appRoot.querySelector<HTMLElement>('.toast');
  if (!toast) {
    existingToast?.remove();
    return;
  }

  if (existingToast) {
    existingToast.textContent = toast;
    return;
  }

  appRoot.insertAdjacentHTML('beforeend', `<div class="toast">${toast}</div>`);
}

function refreshDynamicUi(): void {
  const stats = getStats(game, activeZone);
  const storagePercent = (game.fish / stats.storageCapacity) * 100;

  setText('[data-value="top-fish"]', formatNumber(game.fish));
  setText('[data-value="top-coins"]', formatNumber(game.coins));
  setText('[data-value="top-pearls"]', formatNumber(game.pearls));
  setText('[data-value="compact-fish"]', `${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}`);
  setText('[data-value="compact-income"]', `+${formatNumber(stats.fishPerSecond * stats.fishPrice)}/сек`);
  setText('[data-value="compact-stars"]', formatNumber(game.stars));
  setText('[data-value="storage-summary"]', `${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}`);
  setText('[data-value="price-hint"]', `Цена: ${stats.fishPrice.toFixed(1)} монеты. Бонус коллекции: x${stats.collectionBonus.toFixed(2)}.`);
  setText('[data-value="next-goal"]', getNextGoal(game));
  setMeter('[data-meter="storage"]', percent(storagePercent));

  const sellButton = appRoot.querySelector<HTMLButtonElement>('[data-control="sell"]');
  if (sellButton) {
    sellButton.disabled = game.fish < 1;
  }

  const activeTabRegion = appRoot.querySelector<HTMLElement>('[data-region="active-tab"]');
  if (activeTabRegion && (activeTab === 'orders' || activeTab === 'collection')) {
    activeTabRegion.innerHTML = renderActiveTab();
  }
}

function setToast(message: string): void {
  toast = message;
  renderToast();
  window.setTimeout(() => {
    toast = '';
    renderToast();
  }, 1800);
}

appRoot.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const info = target.closest<HTMLElement>('[data-info]');
  if (info?.dataset.info && !target.closest('button')) {
    setToast(info.dataset.info);
    return;
  }

  const tab = target.closest<HTMLButtonElement>('button[data-tab]');

  if (tab?.dataset.tab) {
    activeTab = tab.dataset.tab as TabId;
    render();
    return;
  }

  const button = target.closest<HTMLButtonElement>('button[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;
  const beforeCoins = game.coins;
  const beforeFish = game.fish;
  const beforePearls = game.pearls;

  if (action === 'open-settings') {
    settingsOpen = true;
    render();
    return;
  }

  if (action === 'close-settings') {
    settingsOpen = false;
    render();
    return;
  }

  if (action === 'open-overlay' && button.dataset.overlay) {
    activeOverlay = button.dataset.overlay as OverlayId;
    settingsOpen = false;
    render();
    return;
  }

  if (action === 'close-overlay') {
    activeOverlay = null;
    render();
    return;
  }

  if (action === 'toggle-setting' && id && id in userSettings) {
    userSettings = {
      ...userSettings,
      [id]: !userSettings[id as keyof UserSettings]
    };
    saveUserSettings();
    render();
    return;
  }

  if (action === 'reset-progress') {
    if (!userSettings.confirmReset || window.confirm('Сбросить весь прогресс деревни?')) {
      game = resetState();
      activeTab = 'harbor';
      setActiveZone('quiet_bay');
      settingsOpen = false;
      setToast('Прогресс сброшен');
      saveState(game);
      render();
    }
    return;
  }

  if (action === 'sell') {
    game = sellFish(game);
    setToast(`Продано на ${formatNumber(game.coins - beforeCoins)} монет`);
  }

  if (action === 'buy-boat' && id) {
    game = buyBoat(game, id as BoatId);
    if (game.coins !== beforeCoins) {
      setToast('Лодка улучшена');
    }
  }

  if (action === 'buy-building' && id) {
    game = buyBuilding(game, id as BuildingId);
    if (game.coins !== beforeCoins) {
      setToast('Здание улучшено');
    }
  }

  if (action === 'unlock-zone' && id) {
    game = unlockZone(game, id as ZoneId);
    if (game.coins !== beforeCoins) {
      setActiveZone(id as ZoneId);
      activeOverlay = null;
      setToast(`Открыта зона: ${zoneName(id as ZoneId)}`);
    }
  }

  if (action === 'select-zone' && id && game.unlockedZones.includes(id as ZoneId)) {
    setActiveZone(id as ZoneId);
    activeTab = 'harbor';
    activeOverlay = null;
    setToast(`Бухта выбрана: ${zoneName(id as ZoneId)}`);
  }

  if (action === 'complete-order' && id) {
    game = completeOrder(game, id);
    if (game.fish !== beforeFish) {
      setToast('Заказ выполнен');
    }
  }

  if (action === 'festival') {
    game = runFestival(game);
    if (game.pearls !== beforePearls) {
      activeTab = 'harbor';
      setActiveZone('quiet_bay');
      setToast('Фестиваль завершен');
    }
  }

  saveState(game);
  render();
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveState(game);
  }
});

setInterval(() => {
  game = applyIncome(game, 1, true, activeZone);
  saveState(game);
  refreshDynamicUi();
}, 1000);

render();
