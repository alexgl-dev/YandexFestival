# YandexSuperHot — Design System

> Справочник для AI-агентов. При вёрстке страниц всегда читай его первым.
> Источник: Figma «OUT_Яндекс Музей на МФМ 26» (`SSDPoqS5LxS4bVCZOJ7oUh`), страница `UI-kit` (id `1:2`).
> Живая витрина всех компонентов и механик — `/ui-kit` (`src/pages/TestScreen`).

## Правила

1. **Используй ТОЛЬКО компоненты из `src/components/ui/`** — не создавай новые UI-элементы
2. **Используй CSS-переменные из `src/tokens/tokens.css`** — не хардкодь значения
3. **Шрифты**: текст — `var(--font-family-text)` (YS Text), заголовки — `var(--font-family-wide)` (YS Text Wide Bold). Все `h1`–`h3` получают Wide Bold глобально (`src/index.css`)
4. **Letter-spacing** в макете везде −1% от кегля → `var(--letter-spacing-tight)` (−0.01em)
5. **CSS Modules** — каждый компонент страницы получает свой `.module.css`
6. **Импорт**: `import { Button, Card } from '../../components/ui'`
7. **Ассеты** — `public/` → абсолютные пути. Иконки из Figma: `/icons/figma/*.svg`, иллюстрации: `/illustrations/figma/*.svg`
8. **Сцена** фиксированная: 1920×1080 / 1080×1920, масштабируется `Background` (`useFitScale`). В `/ui-kit` полноэкранные компоненты оборачивай в `StagePreview`

---

## Токены (`src/tokens/tokens.css`)

### Цвета (палитра Figma)
| Переменная | Hex | Использование |
|---|---|---|
| `--color-blue-scene` | #1D69FC | **Основной синий**: фон сцены, кнопки, pressed карточек, бейджи |
| `--color-blue-light` | #6196FD | Pressed синих кнопок |
| `--color-blue-pressed-dark` | #404663 | Pressed кнопки «Назад» |
| `--color-black` | #141414 | Текст, Big pressed |
| `--color-white` | #FFFFFF | Карточки, попапы, кнопки на синем |
| `--color-grey-card` | #DFE3E7 | Бордеры, disabled, pressed белых кнопок |
| `--color-grey-dark` | #373940 | Вторичный текст (описания) |
| `--color-grey-light` | #F4F4F4 | Плейсхолдер картинки |
| `--color-tint-blue / -cream / -pink` | #D8DCFF / #FFF8E1 / #FFD8E3 | Тинты из палитры |
| `--color-overlay-blue-20` | rgba(66,97,255,.2) | Фон кнопки «Назад» (Back/Blue) |
| `--color-overlay-white-20` | rgba(255,255,255,.2) | Фон play/pause, «Назад» White |
| `--color-overlay-light` | rgba(0,0,0,.05) | Трек ProgressBar Main, оверлей Player |
| `--color-blue` | #4161FF | Старый бренд-синий (легаси, не использовать в новом) |
| `--color-red` | #FF3300 | Ошибки (Card wrong) |

### Типографика
| Токен | Значение | Где |
|---|---|---|
| `--font-family-text` | YS Text (400/500/700) | Весь текст |
| `--font-family-wide` | YS Text Wide (700) | Заголовки, Card title, PopUp title |
| `--font-size-2xs` | 16px | Card L текст, таймкоды |
| `--font-size-xs` | 24px | Card описание, метка Card M, ListItem L описание |
| `--font-size-sm` | 28px | ListItem название, ProgressBar подпись |
| `--font-size-md` | 32px | Badge, Message/ListItem L заголовок |
| `--font-size-lg` | 36px | Button main/secondary/outline |
| `--font-size-xl` | 40px | PopUp описание, Big_bottom |
| `--font-size-3xl` | 50px | Card M заголовок, Big-кнопки, пункты Menu |
| `--font-size-5xl` | 60px | PopUp заголовок, «Задание N» |

### Радиусы
`--radius-sm` (8, CheckList) · `--radius-image` (10, картинка в Card) · `--radius-md` (20, Card L, Badge, ListItem, Container) · `--radius-ml` (30, Card M, PopUp, Player, Message) · `--radius-full` (999, кнопки)

### Отступы
`--spacing-xs` (8) · `--spacing-sm` (16) · `--spacing-md` (20) · `--spacing-lg` (24) · `--spacing-xl` (30) · `--spacing-2xl` (40)

### Иконки
`--size-icon-xs` (36, People/Clock) · `--size-icon-s` (40, Done/Close S) · `--size-icon-m` (56, Done/Close M)

---

## Компоненты

### Button — Figma «Main Button»
```tsx
<Button label="Графический дизайнер" type="main" />          // синяя, 36px, auto-width
<Button label="Графический дизайнер" type="secondary" />     // белая — основная кнопка НА СИНЕМ ФОНЕ
<Button label="Графический дизайнер" type="outline" />       // прозрачная, серый бордер (для белых плашек)
<Button label="Пропустить задание" type="big" arrow />       // 908×131, бордер чёрный, текст 50
<Button label="Смотреть" type="big_white" />                 // 908×131, белая (CTA на синем экране, пункты меню)
<Button label="Попробовать снова" type="big_blue" />         // 908×131, синяя (primary в PopUp)
<Button label="Согласен" type="big_bottom" icon={<Icon name="done" color="blue" size="m" />} />
<Button label="..." type="main" pressed />
```
**Props:** `label`, `type`, `pressed`, `onClick`, `icon` (ReactNode слева), `arrow` (стрелка из макета справа, 44/65px), `className`. `type="blue"` — alias `big_blue`.

| Type | Default | Pressed | Текст |
|---|---|---|---|
| `main` | blue-scene | blue-light | 36 white |
| `secondary` | white | grey-card | 36 black |
| `outline` | transparent + border 2 grey-card | blue-scene | 36 black → white |
| `big` | border 2 black | black | 50 black → white |
| `big_white` | white | grey-card | 50 black |
| `big_blue` | blue-scene | blue-light | 50 white |
| `big_bottom` | white + border 3 blue | blue-scene | 40 Medium |

Ширину Big-кнопок можно переопределить `--button-big-width`.

### Card — Figma «Card / State × Size»
```tsx
<Card variant="ВАРИАНТ А" title="Яркий и игривый" description="..." hint="Нажми, чтобы выбрать" image="/..." state="default" size="l" />
<Card variant="ВАРИАНТ А" title="Заголовок" description="..." state="pressed" size="m" />
```
**Props:** `variant`, `title`, `description`, `hint` (L, синяя подсказка справа), `image`, `state` (default|disabled|flipped|wrong|pressed), `size` (m|l), `onClick`

- **L** — 400 wide, padding 28, radius 20; метка 16 + подсказка; заголовок Wide 24; описание 16; картинка 344×194 radius 10. `flipped` = синяя + белая галочка 40; `wrong` = белая + красный крест; `disabled` = серая, opacity .6
- **M** — 884×240, padding 40, radius 30, бордер 3 grey-card; слева метка 24 (колонка 140), справа заголовок Wide 50 + описание 24 dark-grey. `pressed` = синяя + галочка 45 в правом верхнем углу
- **Узкие/широкие M в играх** — переопредели в CSS игры: `--card-m-direction: column`, `--card-m-label-width: auto`, `--card-m-gap`, `--card-m-min-height`, `--card-m-padding`. Пустой `variant` убирает колонку метки. Размер текста: `--card-title-size`, `--card-desc-size`. Геометрия L: `--card-l-width`, `--card-l-padding`, `--card-l-image-height`, `--card-l-top-gap`, `--card-l-root-gap`

### PopUp — Figma «Pop-up / Type=White»
```tsx
<PopUp icon="close" title="Не совсем..." description="Фото — есть, посмотри внимательнее" buttonLabel="Попробовать снова" secondaryButtonLabel="Отменить" onButtonClick={retry} onSecondaryButtonClick={cancel} onClose={close} />
```
**Props:** `icon` (close = грустный смайл, done = весёлый), `iconSrc`, `title`, `description` (string | ReactNode, `\n` = перенос), `buttonLabel`, `onButtonClick`, `secondaryButtonLabel`, `onSecondaryButtonClick`, `onClose` (круглая кнопка ✕ 90 в правом верхнем углу), `compact`

960 wide, padding 40, radius 30; иллюстрация 120; заголовок Wide 60; текст 40 dark-grey; кнопки Big_blue + белая с серым бордером (131px).

### Icon
```tsx
<Icon name="done" color="white" size="s" />   // круг 40 (S) / 56 (M)
<Icon name="close" color="blue" size="m" />
<Icon name="people" color="white" size="xs" /> // плоские 36
<Icon name="clock" color="blue" size="xs" />
```
**Props:** `name` (done|close|people|clock), `color` (white|blue|red), `size` (xs 36 | s 40 | m 56). `done`/`people`/`clock` — векторы из Figma; `close` и `red` — прежние иконки проекта с тем же глифом.

### IconButton — Figma «Icon button»
```tsx
<IconButton type="back" onClick={back} />                 // pill «← Назад», 326×124, blur, синий полупрозрачный
<IconButton type="back" variant="light" pressed />        // белый полупрозрачный
<IconButton type="play" />  <IconButton type="pause" />   // pill 110×76
<IconButton type="close" />                               // белый круг 90 с синим ✕
```
**Props:** `type` (back|play|pause|close), `variant` (default|light|orange→light), `pressed`, `onClick`, `size` (игнорируется, для совместимости). Background сам ставит `variant="light"`.

### Badge
```tsx
<Badge label="Групповое" type="filled" icon={<Icon name="people" color="white" size="xs" />} />
<Badge label="Фишинг" type="filled_pill" />   // pill, Medium — в ListItem L
<Badge label="Графический дизайнер" type="outline" />
```
**Props:** `label`, `type` (filled | filled_pill | outline), `icon`, `iconPosition`. Текст 32, padding 15/20; filled radius 20; outline — белый, бордер 2 grey-card.

### ListItem
```tsx
<ListItem title="Афиша" duration="5 мин" showPeople state="default" onClick={fn} />
<ListItem size="l" badge="Фишинг" title="Срочно: подтвердите данные карты" description="support@..." icon={<Icon name="close" color="blue" size="m" />} />
```
**Props:** `title`, `size` (m|l), `duration`, `showPeople`, `state` (default|pressed), `badge`, `description`, `icon`, `onClick`
- **M** — 88px, padding 15, radius 20, белый / pressed grey-card; название Medium 28; иконки 36; время 22
- **L** — до 1230, padding 40, radius 30; бейдж pill + заголовок Wide 32 + описание 24 dark-grey; иконка справа

### Message
```tsx
<Message title="Заголовок" description="Подготовка инструментов" />
```
870 wide, padding 40, radius 30, белая; заголовок Wide 32, описание 24 dark-grey.

### CheckList
```tsx
<CheckList checked />  <CheckList checked={false} type="black" />
```
**Props:** `checked`, `type` (blue|black). Квадрат 44, radius 8, бордер 2; checked — SVG из макета.

### ProgressBar / SlideIndicator
```tsx
<ProgressBar type="mini" progress={60} />                          // одна полоса 528×16
<ProgressBar type="mini" progress={59} segments={4} current={2} /> // Figma Mini: 4 × SlideIndicator
<ProgressBar type="main" progress={50} label="Загрузка данных 50%" />
<SlideIndicator state="progress" progress={59} />                  // 126×16: default | progress | filled
```
Main — 1800×64, трек 5% чёрного, заливка синяя, подпись 28 по центру.

### Container
```tsx
<Container size="m" state="default" />   // синяя 300×132, «Открыть приложение»
<Container size="m" state="empty" />     // серый бордер
<Container size="l" state="empty" placeholder="Перетащи сюда ненужные шаги" />  // 1230×160, пунктир
<Container size="l">{children}</Container>
```

### Player
```tsx
<Player title="Графический дизайнер" state="default" orientation="horizontal" src="/videos/x.mp4" onPlay={...} onPause={...} />
<Player title="..." state="playing" orientation="vertical" currentTime="01:23" totalTime="03:45" progress={38} />
```
420×236 (vertical 540×960), radius 30, тень; название Medium 20 внизу слева; play/pause 110×76 по центру; таймлайн при воспроизведении (16 Medium, трек rgba(55,57,64,.4), заливка белая 8px).

### Illustration
```tsx
<Illustration type="bag" />            // Figma: 18 линейных SVG 160×160, чёрные
<Illustration type="laptop" size={250} />  // легаси 3D-PNG
```
Figma-типы: bag, calculator, calendar, computer, cup, faces, hanger, hoodie, horse, negative, people, percent, playstation, positive, projector, thumbs-up, wand, wc. Стрелки (8 шт.), eyes и guitar из макета пока не перенесены (в выгрузке они собраны из масок).

### Background / Menu
```tsx
<Background theme="cobalt" orientation="landscape" onBack={handleBack}>...</Background>
<Menu theme="cobalt" orientation="portrait" items={[{ label: 'Тифлокомментарий', onClick }]} onBack={back} />
```
Menu: логотип `/icons/figma/logo-white.svg` 343×104, пункты — Big_white 780 wide, gap 36. В `/ui-kit` любой Background внутри `StagePreview` рендерится встроенно (контекст `EmbeddedStageContext`).

### InfoButton
Не описан в Figma-ките, оставлен как есть (`/ui-kit` → InfoButton).

---

## Ассеты

```
/icons/figma/icon-done-{white|blue}-{s|m}.svg   — галочки 40/56
/icons/figma/icon-{people|clock}-{white|blue}.svg — плоские 36
/icons/figma/arrow-{44|65}-{white|black}.svg     — стрелка кнопок (повёрнута на 90° в CSS)
/icons/figma/back-arrow-white.svg, iconbtn-play.svg, pause-bars-white.svg
/icons/figma/checklist-true-{blue|black}.svg, container-l-dashed.svg
/icons/figma/logo-{white|color}.svg, logo-black-575.svg, pattern-museum.svg
/icons/figma/card-done-white-{40|45}.svg          — галочки Card
/illustrations/figma/*.svg                        — 18 линейных иллюстраций
/icons/icon-close-{white|blue|red}-{s|m}.svg      — крест (легаси-глиф, совпадает с макетом)
/icons/icon-red.svg, icon-happe.svg                — смайлы PopUp
```

## Структура

```
src/assets/fonts/     — YS Text (Regular/Medium/Bold), YS Text Wide (Bold), YS Geo (легаси)
src/components/ui/    — все UI-компоненты + index.ts
src/tokens/           — tokens.css + theme.ts
src/pages/TestScreen/ — /ui-kit: витрина + StagePreview + TaskPlayground (все механики на реальных данных)
```
