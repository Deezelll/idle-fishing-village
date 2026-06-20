# Idle Fishing Village: краткий док для следующих агентов

Дата: 2026-06-20.

## Где проект

Рабочая папка:

`C:\Users\Deezelll\Desktop\Мобильные игры\01_Idle_Fishing_Village`

Код игры:

`C:\Users\Deezelll\Desktop\Мобильные игры\01_Idle_Fishing_Village\app`

Рабочая ветка:

`backup/good-version-2026-06-19`

Не делать `git reset`, `git clean`, удаление `output/` или откат чужих изменений без прямого разрешения пользователя.

## Платформы

Поддерживать две версии:

- Android / Google Play: `npm run build:mobile`, дальше Capacitor.
- Яндекс Игры: `npm run build:yandex`, SDK включается только для `VITE_GAME_TARGET=yandex`.

Мобильную версию не удалять и не смешивать с Yandex-only кодом.

## Главные файлы

- `app/src/main.ts`: UI, HUD, вкладки, overlays, клики.
- `app/src/styles.css`: адаптив, анимации, визуальный стиль.
- `app/src/game/balance.ts`: лодки, здания, бухты, рыбы, числа баланса.
- `app/src/game/state.ts`: изменение `GameState`, экономика, сохранение.
- `app/src/game/progression.ts`: долгосрочная прогрессия и pure-расчеты.
- `app/src/platform/yandex.ts`: SDK Яндекс Игр.
- `docs/YANDEX_GAMES_RELEASE.md`: требования Яндекс Игр.
- `docs/GOOGLE_PLAY_CHECKLIST.md`: требования Google Play.

## Уже есть

Базовый idle-loop, бухты, лодки, здания, рыбы, заказы, коллекция, фестиваль, оффлайн-доход, split mobile/yandex, стартовые 3D-like ассеты, ежедневная награда, экспедиции, мастерство бухт, наборы аквариума, жемчужные бонусы, цели главы, milestone-награды и магазин регаты.

Следующий агент должен продолжать с этого состояния, а не переписывать основу.

## Ассеты, уже подготовленные на будущее

Папка:

`app/public/assets/art/future`

Внутри:

- `boats-levels-sheet.svg`: варианты лодок по уровням.
- `biome-piers-sheet.svg`: пирсы для разных бухт.
- `biome-decor-sheet.svg`: декор биомов.
- `reward-vfx-sheet.svg`: VFX наград, монеты, рыба, жемчуг, жетоны.
- `regatta-event-banner.svg`: сезонная регата.
- `loading-screen-concept.svg`: loading screen для Яндекс Игр и Android.
- `future-assets-manifest.json`: краткий manifest.

## Что делать дальше

1. Сделать первый tutorial:
   - продать рыбу;
   - улучшить лодку;
   - открыть заказы;
   - открыть маяк;
   - показать карту;
   - забрать ежедневную награду.

2. Добавить недельные цели регаты:
   - цель на заказы;
   - цель на продажу рыбы;
   - цель на улучшения;
   - награды жетонами события без обязательной рекламы.

3. Усилить экспедиции:
   - редкие находки по биомам;
   - отдельные коллекционные награды;
   - позже: rewarded ad для ускорения.

4. Баланс поздней игры:
   - скорость роста склада;
   - цены зон;
   - окупаемость лодок;
   - темп до первого фестиваля.

5. Монетизация позже:
   - rewarded ads: x2 offline, ускорение экспедиции, extra daily chest;
   - interstitial только с cooldown;
   - Google Play Billing отдельно, без paywall.

## Проверка перед коммитом

```powershell
cd "C:\Users\Deezelll\Desktop\Мобильные игры\01_Idle_Fishing_Village\app"
npm run test
npm run build:mobile
npm run build:yandex
```

Browser/Playwright smoke:

- desktop viewport;
- mobile viewport `390x844`;
- первый экран;
- вкладки: гавань, апгрейд, маяк;
- overlays: событие, достижения, заказы, карта;
- кнопки: продажа, покупка, старт экспедиции, ежедневная награда;
- консоль без runtime errors;
- нет битых картинок и горизонтального overflow.
