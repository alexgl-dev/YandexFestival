# YandexSuperHot — Design System

> Этот файл — справочник для AI-агентов. При вёрстке страниц всегда читай его первым.

## Правила

1. **Используй ТОЛЬКО компоненты из `src/components/ui/`** — не создавай новые UI-элементы
2. **Используй CSS-переменные из `src/tokens/tokens.css`** — не хардкодь значения
3. **Шрифт** — `var(--font-family)` (YS Geo), кроме Big-кнопок (YS Text Web)
4. **CSS Modules** — каждый компонент страницы получает свой `.module.css`
5. **Импорт**: `import { Button, Card } from '../../components/ui'`
6. **Ассеты** — `public/` → абсолютные пути (`/icons/...`, `/illustrations/...`)

---

## Токены (`src/tokens/tokens.css`)

### Цвета
| Переменная | Hex | Использование |
|---|---|---|
| `--color-blue` | #4161FF | Бренд, кнопки, бордеры |
| `--color-blue-dark` | #2530A2 | Тёмный синий |
| `--color-blue-pressed` | #2D44B9 | Pressed синих элементов |
| `--color-black` | #141414 | Текст, кнопки Main |
| `--color-black-pressed` | #242424 | Pressed чёрных элементов |
| `--color-white` | #FFFFFF | Белый фон, текст |
| `--color-grey-light` | #F4F4F4 | Основной фон, карточки |
| `--color-grey-secondary` | #E3E2E0 | Вторичный фон, Secondary |
| `--color-grey-disabled` | #C0C0C0 | Disabled/Pressed |
| `--color-orange` | #FB4E14 | Прогресс-бар, "красные" иконки |
| `--color-red` | #FF3300 | Ошибки |
| `--color-green` | #00FF09 | Успех |
| `--color-overlay-light` | rgba(0,0,0,0.05) | Полупрозрачный оверлей |
| `--color-text-muted` | rgba(0,0,0,0.5) | Приглушённый текст |
| `--color-bg-brand-translucent` | rgba(66,97,255,0.15) | Полупрозрачный синий фон |

### Типографика
| Токен | Значение | Где |
|---|---|---|
| `--font-size-2xs` | 16px | Таймкоды плеера |
| `--font-size-player` | 18px | Заголовок плеера |
| `--font-size-xs` | 24px | Метки, описания Card |
| `--font-size-sm` | 28px | Описания, Big-кнопки |
| `--font-size-md` | 32px | Бейджи |
| `--font-size-list` | 34px | Заголовки ListItem |
| `--font-size-lg` | 36px | Кнопки Main/Secondary/Outline |
| `--font-size-xl` | 40px | Заголовки Card, Big_bottom |
| `--font-size-3xl` | 50px | Заголовки PopUp |

### Отступы
`--spacing-xs` (8) · `--spacing-sm` (16) · `--spacing-md` (20) · `--spacing-lg` (24) · `--spacing-xl` (30) · `--spacing-2xl` (40)

### Радиусы
`--radius-xs` (5) · `--radius-sm` (8) · `--radius-lg` (32) · `--radius-full` (999)

### Бордеры
`--border-width-sm` (2px) · `--border-width-md` (4px)

### Letter-spacing
`--letter-spacing-xs` (-0.24px) · `--letter-spacing-sm` (-0.4px) · `--letter-spacing-md` (-0.5px)

### Line-height
`--line-height-tight` (1) · `--line-height-normal` (1.3) · `--line-height-relaxed` (1.4)

### Размеры иконок
`--size-icon-xs` (30px) · `--size-icon-s` (44px) · `--size-icon-m` (80px)

---

## Компоненты

### Button
```tsx
<Button label="Попробовать снова" type="main" />
<Button label="Графический дизайнер" type="secondary" />
<Button label="Графический дизайнер" type="outline" />
<Button label="Тифлокомментарий" type="big" />
<Button label="Влияет" type="big_bottom" icon={<Icon name="done" color="white" size="m" />} />
<Button label="Текст" type="main" pressed />
```
**Props:** `label`, `type` (main|secondary|outline|big|big_bottom), `pressed`, `onClick`, `icon`

| Type | Фон Default | Фон Pressed | Border | Ширина |
|---|---|---|---|---|
| `main` | --color-black | --color-black-pressed | нет | auto |
| `secondary` | --color-grey-secondary | --color-grey-disabled | нет | auto |
| `outline` | transparent | --color-blue | 4px --color-blue | auto |
| `big` | transparent | --color-blue | 4px --color-blue | 870px |
| `big_bottom` | --color-white | --color-blue | 4px --color-blue | 960×160 |

### Card
```tsx
<Card variant="ВАРИАНТ А" title="Яркий" description="Описание" state="default" size="l" />
<Card variant="ВАРИАНТ А" title="Заголовок" description="Текст" state="pressed" size="m" />
```
**Props:** `variant`, `title`, `description`, `hint`, `image`, `state` (default|disabled|flipped|pressed), `size` (m|l), `onClick`

- **L** (580px) — с изображением внизу. Flipped = синий фон + иконка Done
- **M** (870px) — только текст. Pressed = синий бордер + иконка Done
- **disabled** = точная копия default с opacity 0.6. Передавай тот же `hint` что и в default — он рендерится невидимым (`visibility: hidden`) чтобы сохранить идентичную высоту лейаута

### PopUp
```tsx
<PopUp
  icon="close" iconColor="blue"
  title="Не совсем..."
  description="Текст подсказки"
  buttonLabel="Попробовать снова"
  onButtonClick={handleRetry}
/>
```
**Props:** `icon` (close|done), `iconColor` (blue|red), `title`, `description`, `buttonLabel`, `onButtonClick`

800×500px, кнопка внутри — `<Button type="main" />`.

### Icon
```tsx
<Icon name="done" color="blue" size="m" />   // круглая с фоном
<Icon name="people" color="blue" size="xs" /> // плоская SVG
```
**Props:** `name` (done|close|people|clock), `color` (white|blue|red), `size` (xs|s|m)

- `done`, `close` — круглые иконки с цветным фоном (s=44px, m=80px)
- `people`, `clock` — плоские SVG без круга (xs=30px)
- `clock` color="white" — белый циферблат + синие стрелки (для filled-бейджей на синем фоне)
- `people` color="white" — белый силуэт (для filled-бейджей)

### IconButton
```tsx
<IconButton type="back" size="lg" />
<IconButton type="play" size="sm" />
<IconButton type="pause" size="sm" />
```
**Props:** `type` (back|play|pause), `variant` (default|light), `size` (sm|lg), `pressed`, `onClick`

- `default` — синий круг с серыми точками (для тёмных фонов)
- `light` — серый круг с синими точками (для градиентных фонов Background)

Back=150px, Play/Pause=90px. Компонент Background автоматически использует `variant="light"` для кнопки назад.

### Badge
```tsx
<Badge label="Групповое" type="filled" icon={<Icon name="people" color="white" size="xs" />} />
<Badge label="5 мин" type="filled" icon={<Icon name="clock" color="white" size="xs" />} />
<Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />
<Badge label="Графический дизайнер" type="outline" />  {/* без иконки — для кликабельных меток */}
```
**Props:** `label`, `type` (filled|outline), `icon` (опционально)

- `filled` — синий фон, белый текст, 32px
- `outline` — белый фон, чёрный текст, бордер 4px blue
- `icon` опционален — Badge без иконки используется как кликабельная метка (например, список профессий)

**Бейджи в заданиях (TaskIntro):** используй `type="filled"` с белыми иконками:
```tsx
// На экране описания задания — синие бейджи с белыми иконками
<Badge label="Групповое" type="filled" icon={<Icon name="people" color="white" size="xs" />} />
<Badge label="5 мин" type="filled" icon={<Icon name="clock" color="white" size="xs" />} />
```

### ListItem
```tsx
<ListItem title="Афиша" duration="5 мин" showPeople state="default" onClick={fn} />
```
**Props:** `title`, `duration`, `showPeople`, `state` (default|pressed), `onClick`

870×88px. Иконки people/clock справа.

### Player
```tsx
// Горизонтальный (для списков, карусели)
<Player title="Графический дизайнер" state="default" orientation="horizontal" onPlay={...} />
<Player title="Графический дизайнер" state="playing" orientation="horizontal"
  currentTime="01:23" totalTime="03:45" progress={45} onPause={...} />
<Player title="Графический дизайнер" state="fullscreen" orientation="horizontal" />

// Вертикальный (полноразмерный, 540×960)
<Player title="Графический дизайнер" state="default" orientation="vertical" onPlay={...} />
<Player title="Графический дизайнер" state="playing" orientation="vertical"
  currentTime="01:23" totalTime="03:45" progress={38} onPause={...} />
<Player title="Графический дизайнер" state="fullscreen" orientation="vertical" />
```
**Props:** `title`, `state` (default|playing|fullscreen), `orientation` (horizontal|vertical), `thumbnail`, `currentTime`, `totalTime`, `progress`, `onPlay`, `onPause`

**Отличия vertical:**
- Размер: 540×960 (portrait) вместо 420×236
- Кнопка play/pause крупнее (×1.5)
- Таймлайн: шрифт 18px, отступы больше
- Title bar: шрифт 24px

### ProgressBar
```tsx
<ProgressBar type="mini" progress={60} />
<ProgressBar type="main" progress={45} currentTime="01:23" totalTime="03:45" />
```
**Props:** `type` (mini|main), `progress` (0-100), `currentTime`, `totalTime`

### Container
```tsx
<Container size="m" state="default"><Content /></Container>
```
**Props:** `state` (empty|default), `size` (m|l), `children`

### CheckList
```tsx
<CheckList checked={true} />
```
**Props:** `checked` (boolean)

### Illustration
```tsx
<Illustration type="laptop" size={350} />
```
**Props:** `type` (laptop|selector|smart-watch|mouse-red|mouse-blue|keyboard-stickers|keyboard), `size`

### Background
```tsx
<Background theme="cobalt" orientation="landscape" onBack={handleBack}>
  <YourPageContent />
</Background>

<Background theme="orange" orientation="portrait" showBackButton={false}>
  <Content />
</Background>
```
**Props:** `theme` (cobalt|orange), `orientation` (landscape|portrait), `showBackButton`, `onBack`, `children`

Полноэкранная обёртка с градиентным фоном + точечный паттерн + blur. Кнопка "назад" в левом верхнем углу (скрывается через `showBackButton={false}`).

### Menu
```tsx
<Menu
  theme="cobalt"
  orientation="landscape"
  items={[
    { label: 'Описание направления', onClick: () => navigate('/description') },
    { label: 'Мои задания', onClick: () => navigate('/tasks') },
    { label: 'Истории яндексоидов', onClick: () => navigate('/stories') },
    { label: 'Бинго-знакомство', onClick: () => navigate('/bingo') },
  ]}
/>
```
**Props:** `theme` (cobalt|orange), `orientation` (landscape|portrait), `items` (массив `{ label, onClick }`), `onBack`

Полноэкранное меню навигации. Пункты — pill-кнопки (60px, #F4F4F4), по центру экрана. Использует Background внутри.

---

## Ассеты

```
/icons/icon-{name}-{color}-{size}.svg     — done, close (s/m), people, clock (xs)
/icons/iconbtn-{type}.svg                  — back, play, pause (синий круг, default)
/icons/iconbtn-back-light.svg              — back кнопка (серый круг, для фонов)
/illustrations/illustration-{type}.png     — 7 3D-иллюстраций
```

---

## Структура

```
public/
  icons/              — SVG иконки
  illustrations/      — PNG иллюстрации
src/
  assets/fonts/       — YS Geo шрифты (.ttf)
  components/ui/      — все UI компоненты + index.ts
  tokens/             — tokens.css + theme.ts
  pages/              — страницы приложения
```
