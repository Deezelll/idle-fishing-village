import './styles.css';
import { BOATS, BUILDINGS, FISH, ZONES, type BoatId, type BuildingId, type ZoneId } from './game/balance';
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

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

const appRoot = app;

let activeTab: TabId = 'harbor';
let toast = '';
let game = loadState();
const offline = applyOfflineIncome(game);
game = offline.state;
if (offline.offlineFish >= 1) {
  toast = `Оффлайн улов: +${formatNumber(offline.offlineFish)} рыбы`;
}
saveState(game);

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
  if (activeTab === 'festival') {
    return 'maps/map-night-harbor.png';
  }

  if (game.unlockedZones.includes('misty_strait')) {
    return 'maps/map-misty-strait.png';
  }

  if (game.unlockedZones.includes('coral_reef')) {
    return 'maps/map-coral-reef.png';
  }

  return 'maps/map-lighthouse-bay.png';
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

function render(): void {
  const stats = getStats(game);
  const storagePercent = (game.fish / stats.storageCapacity) * 100;

  appRoot.innerHTML = `
    <header class="topbar premium-hud">
      <div class="captain-card">
        <img src="${asset('captain-avatar.png')}" alt="" />
        <div class="level-badge">12</div>
      </div>
      <div class="xp-pill">
        <span>Опыт</span>
        <strong>${formatNumber(game.stars * 120 + game.completedOrders * 35)} / 2.20K</strong>
      </div>
      ${resourceCard(iconAsset('fish'), 'Рыба', formatNumber(game.fish))}
      ${resourceCard(iconAsset('coin'), 'Монеты', formatNumber(game.coins))}
      ${resourceCard(iconAsset('pearl'), 'Жемчуг', formatNumber(game.pearls))}
      <button class="icon-button gear" data-action="reset" title="Сбросить прогресс" aria-label="Сбросить прогресс">⚙</button>
    </header>

    <section class="resources compact-resources" aria-label="Ресурсы">
      ${resourceCard(iconAsset('fish'), 'Улов', `${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}`)}
      ${resourceCard(iconAsset('coin'), 'Доход', `+${formatNumber(stats.fishPerSecond * stats.fishPrice)}/сек`)}
      ${resourceCard(iconAsset('pearl'), 'Звезды', formatNumber(game.stars))}
    </section>

    <section class="village asset-scene" style="--scene-map: url('${asset(getSceneMap())}')" aria-label="Рыбацкая деревня">
      ${renderSceneOverlay()}
    </section>

    <section class="panel primary-panel">
      <div class="panel-row">
        <div>
          <p class="label">Склад</p>
          <strong>${formatNumber(game.fish)} / ${formatNumber(stats.storageCapacity)}</strong>
        </div>
        <button class="primary-action" data-action="sell" ${game.fish < 1 ? 'disabled' : ''}>Продать</button>
      </div>
      <div class="meter"><span style="width: ${percent(storagePercent)}"></span></div>
      <p class="hint">Цена: ${stats.fishPrice.toFixed(1)} монеты. Бонус коллекции: x${stats.collectionBonus.toFixed(2)}.</p>
    </section>

    <section class="content-shell">
      ${renderActiveTab()}
    </section>

    <footer class="next-goal">
      <span>Следующая цель</span>
      <strong>${getNextGoal(game)}</strong>
    </footer>

    <nav class="tabbar" aria-label="Разделы игры">
      ${tabButton('harbor', '⌂', 'Гавань')}
      ${tabButton('upgrades', '⇧', 'Апгрейд')}
      ${tabButton('sea', '◌', 'Море')}
      ${tabButton('orders', '☰', 'Заказы')}
      ${tabButton('collection', '◇', 'Рыбы')}
      ${tabButton('festival', '✦', 'Фест')}
    </nav>

    ${toast ? `<div class="toast">${toast}</div>` : ''}
  `;
}

function resourceCard(icon: string, label: string, value: string): string {
  return `
    <article>
      <img src="${icon}" alt="" />
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function renderSceneOverlay(): string {
  const stats = getStats(game);
  const firstOrder = game.orders[0];
  const orderProgress = firstOrder ? (game.fish / firstOrder.fishRequired) * 100 : 100;

  return `
    <div class="harbor-motion" aria-hidden="true">
      <span class="water-shine shine-a"></span>
      <span class="water-shine shine-b"></span>
      <span class="water-shine shine-c"></span>
      <img class="scene-prop boat-prop boat-prop-a" src="${propAsset('rowboat')}" alt="" />
      <img class="scene-prop boat-prop boat-prop-b" src="${propAsset('motorboat')}" alt="" />
      <img class="scene-prop boat-prop boat-prop-c" src="${propAsset('motorboat')}" alt="" />
      <img class="scene-prop dock-prop" src="${propAsset('fish-crate')}" alt="" />
      <span class="gull gull-a"></span>
      <span class="gull gull-b"></span>
    </div>
    <article class="task-board">
      <strong>Задания</strong>
      <span>${firstOrder ? firstOrder.title : 'Свежий улов'}</span>
      <div class="task-meter"><b style="width: ${percent(orderProgress)}"></b></div>
      <em>${firstOrder ? `${formatNumber(game.fish)} / ${formatNumber(firstOrder.fishRequired)}` : 'Готово'}</em>
    </article>
    <div class="side-actions">
      <button data-tab="festival"><img src="${iconAsset('ticket')}" alt="" /><span>Событие</span></button>
      <button data-tab="collection"><img src="${iconAsset('aquarium')}" alt="" /><span>Достижения</span></button>
      <button data-tab="orders"><img src="${iconAsset('order')}" alt="" /><span>Заказы</span></button>
    </div>
    ${sceneLabel('Верфь', game.boats.rowboat + game.boats.motorboat, '+ ' + formatNumber(stats.fishPerSecond * 0.34) + '/сек', 'left: 7%; top: 41%;')}
    ${sceneLabel('Хранилище', game.buildings.warehouse, '+ ' + formatNumber(stats.storageCapacity), 'left: 39%; top: 26%;')}
    ${sceneLabel('Рынок', game.buildings.market, '+ ' + formatNumber(stats.fishPrice * 100) + '%', 'right: 8%; top: 30%;')}
    ${boatTimer('+ ' + formatNumber(stats.fishPerSecond * 7.7), '00:12', 'left: 39%; bottom: 27%;')}
    ${boatTimer('+ ' + formatNumber(stats.fishPerSecond * 5.1), '00:15', 'right: 10%; bottom: 30%;')}
  `;
}

function sceneLabel(title: string, level: number, income: string, style: string): string {
  return `
    <div class="scene-label" style="${style}">
      <small>Ур. ${level}</small>
      <strong>${title}</strong>
      <span><img src="${iconAsset('coin')}" alt="" />${income}</span>
    </div>
  `;
}

function boatTimer(income: string, time: string, style: string): string {
  return `
    <div class="boat-timer" style="${style}">
      <strong><img src="${iconAsset('coin')}" alt="" />${income}</strong>
      <span>${time}</span>
    </div>
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
  return `
    <div class="section-title">
      <div>
        <span>Экспедиции</span>
        <h2>Зоны моря</h2>
      </div>
      <strong>Маяк ур. ${game.buildings.lighthouse}</strong>
    </div>
    <div class="zone-grid">
      ${ZONES.map((zone) => {
        const unlocked = game.unlockedZones.includes(zone.id);
        const canUnlock = game.coins >= zone.unlockCost && game.buildings.lighthouse >= zone.lighthouseLevel;
        return `
          <article class="zone-card ${unlocked ? 'unlocked' : ''}">
            <div>
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
          <article class="fish-card ${discovered ? 'found' : ''}">
            <img src="${iconAsset('fish')}" alt="" />
            <strong>${discovered || available ? fish.name : '???'}</strong>
            <span>${fish.rarity}</span>
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

function setToast(message: string): void {
  toast = message;
  window.setTimeout(() => {
    toast = '';
    render();
  }, 1800);
}

appRoot.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
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
      setToast(`Открыта зона: ${zoneName(id as ZoneId)}`);
    }
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
      setToast('Фестиваль завершен');
    }
  }

  if (action === 'reset') {
    game = resetState();
    activeTab = 'harbor';
    setToast('Прогресс сброшен');
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
  game = applyIncome(game, 1);
  saveState(game);
  render();
}, 1000);

render();
