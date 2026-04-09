# YandexSuperHot — CMNTY x Яндекс Музей

Интерактивное React-приложение для музейной выставки.

## Stack
- React + TypeScript + Vite
- CSS Modules (no Tailwind)
- react-router для навигации

## Перед вёрсткой страницы — ОБЯЗАТЕЛЬНО
1. Прочитай `DESIGN_SYSTEM.md` — там полный каталог компонентов с примерами
2. Используй **только** компоненты из `src/components/ui/`
3. Не создавай новые UI-компоненты — всё есть в ките
4. Цвета, размеры, отступы, радиусы — бери из CSS-переменных (`src/tokens/tokens.css`)
5. **Никогда не хардкодь значения** — всегда ищи подходящий токен

## Tokens
Все визуальные значения определены как CSS custom properties в `src/tokens/tokens.css`:
- Цвета: `--color-*`
- Шрифты: `--font-size-*`, `--font-weight-*`
- Отступы: `--spacing-*`
- Радиусы: `--radius-*`
- Бордеры: `--border-width-*`
- Letter-spacing: `--letter-spacing-*`
- Line-height: `--line-height-*`
- Overlay-цвета: `--color-overlay-*`, `--color-bg-brand-translucent`
- Размеры иконок: `--size-icon-*`
- Размеры компонентов: `--width-content`, `--width-player-*`

## Conventions
- Компоненты страниц: `src/pages/PageName/PageName.tsx` + `PageName.module.css`
- Импорт UI: `import { Button, Card, Icon } from '../../components/ui'`
- Шрифт: `font-family: var(--font-family)` — всегда, без исключений
- Язык интерфейса: русский
- Ассеты: из `public/` по абсолютным путям (`/icons/...`, `/illustrations/...`)

## Состояния компонентов
Компоненты управляются снаружи через пропы (controlled). Агент сам решает логику переключения:
```tsx
// Пример: кнопка с переключаемым состоянием
const [active, setActive] = useState(false);
<Button label="Текст" type="main" pressed={active} onClick={() => setActive(!active)} />

// Пример: карточка с выбором
<Card state={selectedId === id ? 'pressed' : 'default'} ... />
```

## Запуск
```bash
npm run dev   # dev server
npm run build # production build
```
