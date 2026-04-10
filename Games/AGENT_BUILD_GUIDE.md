# AGENT_BUILD_GUIDE — Инструкция для агента-верстальщика

> Ты — агент, который верстает игровые разделы музейного тач-приложения.
> Перед началом работы ОБЯЗАТЕЛЬНО прочитай эти файлы в указанном порядке:
>
> 1. `CLAUDE.md` — общие правила проекта
> 2. `DESIGN_SYSTEM.md` — каталог компонентов и токенов
> 3. `Games/GAME_SPEC.md` — формат данных заданий и механик
> 4. Этот файл — как именно верстать

---

## 1. Что ты получаешь на вход

Папку `Games/XXX-formatted/` с файлами:

```
XXX-formatted/
├── section.md         # Мета раздела: id, title, professions, blocks
├── description.md     # Текст описания направления + профессий
├── videos.md          # Видео по профессиям
├── test.md            # Вопросы теста
└── tasks/
    ├── 01-slug.md     # Задание 1 (frontmatter + контент)
    ├── 02-slug.md     # Задание 2
    └── ...
```

Каждый файл задания содержит frontmatter с полями: `id`, `title`, `mechanic`, `profession`, `duration`, `mode`, `order`, `isLast`, `feedback` — и секции `# Intro`, `# Instruction`, `# Steps`, `# Moral`.

---

## 2. Что ты создаёшь

### Файловая структура

```
src/
├── App.tsx                          # Корневой роутер — BrowserRouter + Routes
├── pages/
│   ├── HomePage/                    # Главная: список всех разделов (/)
│   │   ├── HomePage.tsx
│   │   └── HomePage.module.css
│   │
│   ├── creative/                    # Раздел "Креативный трек" (/creative)
│   │   ├── CreativeLayout.tsx       # Layout с <Outlet />, данные раздела
│   │   ├── CreativeMenu.tsx         # Главное меню (/creative)
│   │   ├── CreativeMenu.module.css
│   │   ├── Description.tsx          # Блок описания (/creative/description)
│   │   ├── Description.module.css
│   │   ├── Profession.tsx           # Страница профессии (/creative/description/:professionId)
│   │   ├── Profession.module.css
│   │   ├── TaskList.tsx             # Список заданий (/creative/tasks)
│   │   ├── TaskList.module.css
│   │   ├── TaskPage.tsx             # Обёртка задания (/creative/tasks/:taskId)
│   │   ├── TaskPage.module.css
│   │   ├── Videos.tsx               # Блок видео (/creative/videos)
│   │   ├── Videos.module.css
│   │   ├── Test.tsx                 # Блок теста (/creative/test)
│   │   ├── Test.module.css
│   │   └── data.ts                  # Данные раздела (из .md → TypeScript)
│   │
│   ├── development/                 # Раздел "Разработка" (/development)
│   │   ├── DevelopmentLayout.tsx
│   │   ├── DevelopmentMenu.tsx
│   │   ├── ... (та же структура)
│   │   └── data.ts
│   │
│   └── shared/                      # Переиспользуемые экраны заданий
│       ├── TaskIntro.tsx            # Стартовый экран задания
│       ├── TaskIntro.module.css
│       ├── TaskMoral.tsx            # Экран морали
│       ├── TaskMoral.module.css
│       ├── TaskResult.tsx           # Экран результата
│       ├── TaskResult.module.css
│       └── games/                   # Механики — общие для всех разделов
│           ├── ChooseGame.tsx
│           ├── FindGame.tsx
│           ├── SequenceGame.tsx
│           ├── CategorizeGame.tsx
│           ├── MatchGame.tsx
│           ├── LabelGame.tsx
│           ├── MarkGame.tsx
│           ├── CatchGame.tsx
│           └── QuizGame.tsx
├── types/
│   └── game.ts                      # Общие типы (Task, Section, Mechanic...)
```

**Ключевой принцип:** каждый раздел — своя папка в `src/pages/`, имя папки = slug из `section.md`.

---

## 3. Роутинг (react-router v7)

Приложение использует `react-router` (уже установлен). Вся навигация — через URL.

### 3.1. Корневой роутер — `App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './pages/HomePage/HomePage';

// Lazy-загрузка разделов
import { CreativeLayout } from './pages/creative/CreativeLayout';
import { CreativeMenu } from './pages/creative/CreativeMenu';
// ... остальные страницы раздела

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Главная — список разделов */}
        <Route path="/" element={<HomePage />} />

        {/* Раздел "Креативный трек" */}
        <Route path="/creative" element={<CreativeLayout />}>
          <Route index element={<CreativeMenu />} />
          <Route path="description" element={<Description />} />
          <Route path="description/:professionId" element={<Profession />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="tasks/:taskId" element={<TaskPage />} />
          <Route path="videos" element={<Videos />} />
          <Route path="test" element={<Test />} />
        </Route>

        {/* Раздел "Разработка" */}
        <Route path="/development" element={<DevelopmentLayout />}>
          <Route index element={<DevelopmentMenu />} />
          {/* ... та же структура вложенных роутов */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 3.2. Карта URL-маршрутов

Каждый раздел со slug `{section}` получает набор маршрутов:

```
/{section}/                              → Главное меню раздела
/{section}/description                   → Описание направления
/{section}/description/{professionId}    → Страница профессии
/{section}/tasks                         → Список заданий
/{section}/tasks/{taskId}                → Задание (flow: intro → game → result → moral)
/{section}/videos                        → Видео-интервью
/{section}/test                          → Тест
```

**Конкретные примеры:**
```
/                                    → Список разделов
/creative/                           → Меню "Креативный трек"
/creative/description                → Описание креативного трека
/creative/description/ux-designer    → Страница "UX-дизайнер"
/creative/tasks                      → Список заданий
/creative/tasks/poster               → Задание "Афиша"
/creative/tasks/find-bug             → Задание "Найди проблему"
/creative/videos                     → Видео
/creative/test                       → Тест
/development/                        → Меню "Разработка"
/development/tasks/security-check    → Задание "Проверка безопасности"
```

### 3.3. Layout раздела — `{Section}Layout.tsx`

```tsx
import { Outlet } from 'react-router';
import { sectionData } from './data';

// Layout предоставляет данные раздела через контекст или пропы
export function CreativeLayout() {
  return <Outlet context={sectionData} />;
}
```

### 3.4. Навигация — `useNavigate`

```tsx
import { useNavigate, useParams } from 'react-router';

// В компонентах раздела:
const navigate = useNavigate();

// Назад в меню раздела
<IconButton type="back" variant="light" onClick={() => navigate('/creative')} />

// В список заданий
<Button label="Задания" type="secondary" onClick={() => navigate('/creative/tasks')} />

// В конкретное задание
<ListItem title="Афиша" onClick={() => navigate('/creative/tasks/poster')} />

// Следующее задание
<Button label="Следующее задание" type="main" onClick={() => navigate(`/creative/tasks/${nextTaskId}`)} />

// Назад (на один уровень)
<IconButton type="back" variant="light" onClick={() => navigate(-1)} />
```

### 3.5. Фазы внутри задания

Внутри `TaskPage.tsx` задание имеет фазы (intro → instruction → game → result → moral).
Фазы управляются через `useState` (НЕ через URL — они внутренние для задания):

```tsx
type Phase = 'intro' | 'instruction' | 'game' | 'result' | 'moral';

export function TaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const task = data.tasks.find(t => t.id === taskId)!;

  const [phase, setPhase] = useState<Phase>('intro');

  const goToMenu = () => navigate(`/${data.slug}`);
  const goToNextTask = () => {
    const next = data.tasks.find(t => t.order === task.order + 1);
    if (next) navigate(`/${data.slug}/tasks/${next.id}`);
    else goToMenu();
  };

  switch (phase) {
    case 'intro':
      return <TaskIntro task={task} onStart={() => setPhase(task.instruction ? 'instruction' : 'game')} onBack={() => navigate(-1)} />;
    case 'instruction':
      return <TaskInstruction task={task} onContinue={() => setPhase('game')} />;
    case 'game':
      return <GameRouter task={task} onComplete={(results) => { setResults(results); setPhase('result'); }} />;
    case 'result':
      return <TaskResult results={results} onContinue={() => setPhase('moral')} />;
    case 'moral':
      return <TaskMoral task={task} onNext={task.isLast ? goToMenu : goToNextTask} isLast={task.isLast} />;
  }
}
```

### 3.6. При добавлении нового раздела

Агент должен:
1. Прочитать `slug` из `section.md`
2. Создать папку `src/pages/{slug}/`
3. Добавить `<Route path="/{slug}" ...>` в `App.tsx`
4. Создать все компоненты страниц внутри папки
5. **Не трогать** другие разделы — только добавить свой Route

---

## 4. Компоненты UI — что для чего использовать

### Справочник пропсов

```tsx
// Background — обёртка экрана с фоном и кнопкой "назад"
<Background theme="cobalt" orientation="landscape" showBackButton onBack={goBack}>
  {children}
</Background>
// theme: 'cobalt' | 'orange'
// orientation: 'landscape' | 'portrait'

// Menu — главное меню раздела
<Menu theme="cobalt" items={[
  { label: 'Описание', onClick: () => goTo({ type: 'description' }) },
  { label: 'Задания', onClick: () => goTo({ type: 'taskList' }) },
  { label: 'Видео', onClick: () => goTo({ type: 'videos' }) },
  { label: 'Тест', onClick: () => goTo({ type: 'test' }) },
]} />

// Button — кнопки действий
<Button label="Начать" type="main" onClick={onStart} />
<Button label="Проверить" type="main" onClick={onCheck} />
<Button label="Графический дизайнер" type="secondary" onClick={...} />
<Button label="Следующее задание" type="outline" onClick={onNext} />
<Button label="Тифлокомментарий" type="big" icon={<Icon name="done" color="white" size="m" />} />
// type: 'main' | 'secondary' | 'outline' | 'big' | 'big_bottom'
// pressed: boolean — для toggle-состояний

// IconButton — навигационные иконки
<IconButton type="back" variant="light" onClick={goBack} />
<IconButton type="play" onClick={onPlay} />
// type: 'back' | 'play' | 'pause'
// variant: 'default' | 'light'

// Card — карточки заданий, вариантов, контента
<Card
  variant="Задание 1"
  title="Афиша"
  description="Выбери подходящую афишу"
  hint="5 мин"
  image="/assets/..."
  state="default"          // 'default' | 'disabled' | 'flipped' | 'pressed'
  size="l"                 // 'm' | 'l'
  onClick={...}
/>

// ListItem — строка в списке заданий
<ListItem
  title="Афиша"
  duration="5"
  showPeople={true}         // true = групповое (иконка 👥)
  state="default"           // 'default' | 'pressed'
  onClick={...}
/>

// Badge — метка (время, тип)
<Badge label="Групповое" type="filled" icon={<Icon name="people" color="white" size="xs" />} />
<Badge label="3 мин" type="outline" icon={<Icon name="clock" color="blue" size="xs" />} />
// type: 'filled' | 'outline'

// PopUp — модальное окно (мораль, результат, инструкция)
<PopUp
  icon="done"              // 'done' | 'close' | undefined
  iconColor="blue"         // 'blue' | 'red'
  title="Отлично!"
  description="Текст морали или результата"
  buttonLabel="Далее"
  onButtonClick={onNext}
/>

// Container — обёртка для контента
<Container state="default" size="l">{children}</Container>
// state: 'empty' | 'default'
// size: 'm' | 'l'

// Icon — иконки
<Icon name="done" color="blue" size="s" />
// name: 'done' | 'close' | 'clock' | 'people' | ...
// color: 'blue' | 'white' | 'red' | 'orange'
// size: 'xs' | 's' | 'm'

// ProgressBar — прогресс прохождения
<ProgressBar current={2} total={5} />

// Illustration — отображение изображений
<Illustration src="/illustrations/..." alt="описание" />

// CheckList — список с чекбоксами
<CheckList items={[{ label: 'Пункт 1', checked: true }, ...]} />

// Player — видеоплеер
<Player src="/videos/..." title="Название" />
```

---

## 5. Маппинг экранов → компоненты

### Главное меню (`/{section}/`)
```tsx
const navigate = useNavigate();

<Menu theme="cobalt" items={[
  { label: 'Описание', onClick: () => navigate('description') },
  { label: 'Задания', onClick: () => navigate('tasks') },
  { label: 'Видео', onClick: () => navigate('videos') },
  { label: 'Тест', onClick: () => navigate('test') },
]} />
```

### Описание направления (Description)
```tsx
// Описание — на белой карточке с чёрным текстом, заголовок по левому краю
<Background theme="cobalt" onBack={...}>
  <h2 className={styles.title}>{data.title}</h2>  {/* align-self: flex-start */}

  <div className={styles.card}>  {/* background: var(--color-white), border-radius: var(--radius-lg) */}
    <p className={styles.text}>{data.description}</p>  {/* color: var(--color-black) */}
  </div>

  {/* Профессии — Badge type="outline" без иконки, кликабельные */}
  {data.professions.map(prof => (
    <span key={prof.id} onClick={() => navigate(`description/${prof.id}`)}>
      <Badge label={prof.title} type="outline" />
    </span>
  ))}
</Background>
```

### Видео (Videos)
```tsx
// Видео — два в ряд, крупные 16:9 блоки на всю ширину экрана
// НЕ использовать max-width: var(--width-content) — нужно больше пространства
// Грид: grid-template-columns: 1fr 1fr, каждый элемент aspect-ratio: 16/9
// Player растягивается на всю ячейку: width: 100% !important; height: 100% !important
<div className={styles.grid}>
  {data.videos.map(video => (
    <div className={styles.item}>  {/* aspect-ratio: 16 / 9 */}
      <Player title={video.title} state="default" orientation="horizontal" />
    </div>
  ))}
</div>
```

### Бинго-тест (Test)
Тест в каждом разделе — это **бинго**: 8 вопросов, сравнение с ответами эксперта, результат в виде сетки 3×3.

**3 фазы (useState, не роутинг):**

**Фаза 1 — Intro:** белая карточка с `bingo.intro` + `bingo.instruction`, кнопка "Начать"
```tsx
<Background theme="cobalt" orientation="landscape" onBack={handleBack}>
  <div className={styles.wrapper}>
    <h2 className={styles.title}>Бинго</h2>
    <div className={styles.card}>  {/* background: white, border-radius: --radius-lg */}
      <p>{bingo.intro}</p>
      <p>{bingo.instruction}</p>
    </div>
    <Button label="Начать" type="main" onClick={() => setPhase('questions')} />
  </div>
</Background>
```

**Фаза 2 — Вопросы:** по 1 вопросу на экране, варианты как Card size="m" в сетке 2×2
```tsx
// Вопрос белым текстом по центру, варианты — Card size="m"
// Контент центрирован по обеим осям (Background.content делает это)
// Ширина контента: 80%
<p className={styles.questionPrompt}>{currentQuestion.prompt}</p>
<div className={styles.optionsGrid}>  {/* grid 2×2, gap: --spacing-sm, width: 80% */}
  {question.options.map((option, i) => (
    <Card
      variant={`Вариант ${String.fromCharCode(65 + i)}`}
      title={option}
      description=""
      size="m"
      state={answers[qi] === option ? 'pressed' : 'default'}
      onClick={() => handleSelect(qi, option)}
    />
  ))}
</div>
// Карточки перебивают хардкод-ширину: .optionsGrid > * { width: 100% !important }
// Внизу: заголовок "Бинго", счётчик "N / 8", кнопка "Далее"
// На последнем вопросе: "Посмотреть результат" (только когда все 8 отвечены)
```

**Фаза 3 — Результат:** сетка 3×3 слева + Card size="m" справа
```tsx
// Сетка: 3 колонки × 3 ряда по 200×200px, gap: --spacing-sm
// Центр = имя + роль эксперта (--color-blue фон)
// 8 ячеек = gridLabels: совпал → --color-blue, не совпал → --color-orange
// По тапу — flip-анимация (CSS 3D: perspective, rotateY, backface-visibility)
// На обороте — ответ эксперта
// Справа: Card size="m" с variant="Результат", title="Бинго!", description={resultText}
// Под карточкой: Button "В главное меню"
// Карточка растягивается по высоте сетки: .resultCard { flex: 1 }
// Ширина layout: 80%
```

### Стартовый экран задания (TaskIntro)
```tsx
// Тот же паттерн что Description/Profession:
// заголовок по левому краю, белая карточка с контентом, бейджи outline внутри карточки
<Background theme="cobalt" onBack={onBack}>
  <div className={styles.wrapper}>  {/* max-width: var(--width-content), flex column, gap */}
    <h2 className={styles.title}>{task.title}</h2>  {/* align-self: flex-start, color: var(--color-text-inverse) */}

    <div className={styles.card}>  {/* background: var(--color-white), border-radius: var(--radius-lg), padding: var(--spacing-xl) */}
      <div className={styles.badges}>
        <Badge label={modeLabel} type="filled" icon={<Icon name="people" color="white" size="xs" />} />
        <Badge label={durationLabel} type="filled" icon={<Icon name="clock" color="white" size="xs" />} />
      </div>
      {task.subtitle && <p className={styles.subtitle}>{task.subtitle}</p>}
      <p className={styles.intro}>{task.intro}</p>  {/* color: var(--color-black) */}
    </div>

    <Button label="Начать" type="main" onClick={onStart} />
  </div>
</Background>

// ВАЖНО: Единый стиль для всех страниц с описательным контентом:
// Description, Profession, TaskIntro — все используют белую карточку
// с чёрным текстом, заголовок белый по левому краю, бейджи outline
```

### Инструкция (опциональная, сворачиваемая)
```tsx
// Показывается как PopUp или Container после нажатия "Начать"
// Кнопка повторного вызова — маленькая иконка в углу экрана
const [showInstruction, setShowInstruction] = useState(true);

{showInstruction && (
  <PopUp
    title="Инструкция"
    description={task.instruction}
    buttonLabel="Понятно"
    onButtonClick={() => setShowInstruction(false)}
  />
)}
// Кнопка вызова:
<Button label="?" type="outline" onClick={() => setShowInstruction(true)} />
```

### Экран результата (TaskResult)
```tsx
// Дизайн результата ИДЕНТИЧЕН PopUp:
// — Одна карточка 800×500px, фон --color-grey-light, radius-lg
// — Иконка done/close size="m" сверху-слева
// — Заголовок "Результаты" (font-size-3xl, medium)
// — Список ответов (font-size-sm)
// — Кнопка "Далее" ВНУТРИ карточки (внизу по центру)
// — НЕ использовать эмодзи — только Icon из дизайн-системы

<div className={styles.card}>  {/* как PopUp: 800px, min-height 500px, justify-content: space-between */}
  <div className={styles.topContent}>
    <Icon name={allCorrect ? 'done' : 'close'} color={allCorrect ? 'blue' : 'red'} size="m" />
    <div className={styles.textBlock}>
      <h2>Результаты</h2>
      {results.map(r => (
        <p>{r.correct ? '● ' : '● '}{r.answer}{r.explanation ? ` — ${r.explanation}` : ''}</p>
      ))}
    </div>
  </div>
  <Button label="Далее" type="main" onClick={onContinue} />  {/* ВНУТРИ карточки */}
</div>
```

### Мораль (TaskMoral)
```tsx
<PopUp
  icon="done"
  iconColor="blue"
  title="Отлично!"
  description={task.moral}
  buttonLabel={task.isLast ? "В меню" : "Следующее задание"}
  onButtonClick={task.isLast ? () => navigate(`/${sectionSlug}`) : () => navigate(`/${sectionSlug}/tasks/${nextTaskId}`)}
/>
```

---

## 6. Реализация механик

> **ВАЖНО:** Правила для ВСЕХ игровых экранов:
> 1. Обёрнуты в `<Background>` с кнопкой "назад" (`onBack`)
> 2. **НЕ использовать ProgressBar** — убран со всех экранов
> 3. **НЕ использовать эмодзи** (✅❌) — только `<Icon>` из дизайн-системы
> 4. Попап после проверки показывать **ВСЕГДА** (не только при `feedback=instant`)
> 5. Кнопка "Проверить" — `position: absolute; bottom` чтобы не сдвигать контент
> 6. Использовать ТОЛЬКО существующие CSS-токены

### Общий интерфейс всех механик
```tsx
interface GameProps {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;  // кнопка "назад" в левом верхнем углу
}
```

### Существующие CSS-токены (использовать ТОЛЬКО их)
```
Цвета: --color-blue, --color-blue-dark, --color-blue-pressed, --color-black,
        --color-black-pressed, --color-white, --color-grey-light, --color-grey-secondary,
        --color-grey-disabled, --color-orange, --color-red, --color-green,
        --color-overlay-light, --color-text-muted, --color-bg-brand-translucent

⚠️ НЕ СУЩЕСТВУЮТ: --color-bg-surface, --color-border-default, --color-border-brand,
   --color-accent-green, --color-accent-red, --color-text-primary, --color-text-inverse
```

### Иконки для результатов
```tsx
// ТОЛЬКО Icon из дизайн-системы, НИКОГДА эмодзи
<Icon name="done" color="blue" size="s" />  // правильный ответ
<Icon name="close" color="red" size="s" />  // неправильный ответ
```

### Экран результата (TaskResult)
```tsx
// Дизайн ИДЕНТИЧЕН PopUp: карточка 800×500px, --color-grey-light, --radius-lg
// Кнопка "Далее" ВНУТРИ карточки (внизу по центру), НЕ снаружи
// Иконка done/close size="m" сверху-слева, заголовок font-size-3xl
// НЕ использовать state="disabled" с opacity — все карточки непрозрачные
```

### `choose` — Выбери правильный
```tsx
// Background + onBack, БЕЗ ProgressBar
// Варианты как Card size="l" с image в ряд
// По тапу: PopUp с пояснением (done/close)
// Неверная карточка: state="disabled", верная: state="flipped"
```

### `find` — Найди на экране
```tsx
// Два столбца: картинка слева, текстовые варианты Card size="m" справа
// Неверный ответ: card disabled + PopUp с hint, можно попробовать ещё
// Верный ответ: card pressed + PopUp, переход к следующему шагу
```

### `sequence` — Восстанови порядок
```tsx
// Два столбца по 50% шириной, центрированы (width: 80%, margin: 0 auto)
// ОБА столбца используют ListItem из дизайн-системы (НЕ Card, НЕ кастомные div)
// Левый: "Доступные шаги" — ListItem, selected = state="pressed"
// Правый: "Порядок" — ListItem с variant="Шаг N", пустой = текст-плейсхолдер
// Лишние блоки (order=null) НЕ показываются — фильтруются при инициализации
// ListItem растягивается по ширине: .left > div, .right > div { width: 100% !important }
// Блоки центрированы по вертикали экрана, заголовки колонок на одной линии
```

### `categorize` — Распредели по категориям
```tsx
// Две большие карточки в стиле Card size="l" (580px, --color-grey-light, --radius-lg)
// + drag & drop + тап-фоллбэк
// Иконки снизу в белых кружках (120px, --radius-full), подписи белые
// Лента иконок по центру
// Текст инструкции НАД карточками, по левому краю
// Кнопка "назад" есть
// При drag-over — синий контур на карточке (box-shadow: inset, НЕ прозрачный фон)
```

### `mark` — Отметь на макете
```tsx
// ДВА РЕЖИМА:
// 1. Зоновый (ux-review): рендерит AppMockup — интерактивный React-компонент
//    Пользователь тапает на элементы интерфейса (шапка, поиск, баннер и т.д.)
//    Выбранные зоны подсвечиваются синим контуром с номером-бейджиком
//    Отзывы пользователей справа — через ListItem
//    После проверки: зелёный/красный контур + цвет бейджика
// 2. Координатный (остальные): тап по картинке → маркер-кружок
//    Проверка через Euclidean distance до targets
// Попап всегда показывается после "Проверить"
```

### `match` — Соотнеси пары
```tsx
// Два столбца: left и right
// Игрок тапает left, потом right — создаёт связь
// Верная связь: подсвечивается var(--color-green)
// Неверная: подсвечивается var(--color-red), сбрасывается
```

### `catch` — Лови объекты (аркада)
```tsx
// Кастомный Canvas или абсолютное позиционирование
// Объекты "падают" сверху с CSS-анимацией или requestAnimationFrame
// Сачок/корзинка внизу — управление touch/swipe
// При поимке — PopUp с описанием бага
```

### `bingo` — Бинго-тест
```tsx
// Основная механика тестов во всех разделах
// 8 вопросов по 1 на экране, варианты — Card size="m" в сетке 2×2
// Ответы сравниваются с экспертом (нет "правильных" — только совпал/не совпал)
// Результат — сетка 3×3 с flip-анимацией по тапу
// Данные: data.bingo (BingoTest), НЕ data.test
// Подробнее см. секцию "Бинго-тест (Test)" выше
```

### `quiz` — Тест
```tsx
// Последовательные вопросы, БЕЗ ProgressBar
// Варианты ответов — Card size="m" (НЕ Button)
// В конце — PopUp со сводкой результатов
```

---

## 7. Данные: из .md в TypeScript

Прочитай файлы `XXX-formatted/` и создай `data.ts` внутри папки раздела.

Общие типы — в `src/types/game.ts` (создаётся один раз, используется всеми разделами):

```tsx
// src/types/game.ts
export type Mechanic = 'choose' | 'find' | 'sequence' | 'categorize' | 'match' | 'label' | 'mark' | 'catch' | 'bingo' | 'quiz';
export type Mode = 'group' | 'solo';
export type Feedback = 'instant' | 'onComplete';

export interface Profession {
  id: string;
  title: string;
  description: string;
}

export interface TaskOption {
  text?: string;
  image?: string;
  correct: boolean;
  explanation: string;
  hint?: string;
}

export interface TaskBlock {
  text?: string;
  code?: string;
  description?: string;
  order: number | null;       // null = лишний блок
  explanation?: string;
}

export interface TaskPair {
  left: { type: string; value?: string; image?: string; avatar?: string; description?: string; label?: string; hidden?: boolean };
  right: { type: string; value?: string; image?: string; label?: string };
  explanation: string;
}

export interface TaskCategory {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

export interface TaskItem {
  text?: string;
  icon?: string;
  image?: string;
  content?: { type: string; value: string; description?: string };
  belongs?: string[];
  correctLabel?: string;
  explanation: string;
}

export interface TaskLabel {
  id: string;
  title: string;
  icon?: string;
  color?: string;
}

export interface TaskTarget {
  area: { x: number; y: number; radius: number };
  explanation: string;
}

export interface CatchObject {
  icon: string;
  title: string;
  description: string;
  category: string;
}

export interface TaskStep {
  prompt?: string;
  image?: string;
  hints?: string;
  options?: TaskOption[];
  blocks?: TaskBlock[];
  pairs?: TaskPair[];
  categories?: TaskCategory[];
  items?: TaskItem[];
  labels?: TaskLabel[];
  targets?: TaskTarget[];
  objects?: CatchObject[];
  trash?: { enabled: boolean; label: string };
  catcher?: { type: string; label: string };
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  mechanic: Mechanic;
  profession: string;
  duration: number;
  mode: Mode;
  order: number;
  isLast: boolean;
  feedback: Feedback;
  intro: string;
  instruction?: string;
  steps: TaskStep[];
  moral: string;
}

export interface Video {
  profession: string;
  title: string;
  src: string;
  subtitles?: string;
}

export interface QuizQuestion {
  prompt: string;
  options: TaskOption[];
}

export interface BingoQuestion {
  gridLabel: string;        // short label for grid cell
  prompt: string;
  options: string[];        // 4 text options
  expertAnswer: string;     // expert's answer for comparison
}

export interface BingoExpert {
  name: string;
  role: string;
  profession: string;
}

export interface BingoTest {
  expert: BingoExpert;
  gridLabels: string[];     // 8 labels for 3×3 grid (center = expert)
  intro: string;
  instruction: string;
  resultText: string;
  questions: BingoQuestion[];
}

export interface SectionData {
  id: string;
  slug: string;
  title: string;
  professions: Profession[];
  description: string;
  tasks: Task[];
  videos: Video[];
  test?: QuizQuestion[];    // optional, legacy
  bingo?: BingoTest;        // bingo test data
}
```

Данные раздела — в `src/pages/{slug}/data.ts`:

```tsx
// src/pages/creative/data.ts
import type { SectionData } from '../../types/game';

export const sectionData: SectionData = {
  id: '001',
  slug: 'creative',
  title: 'Креативный трек',
  professions: [
    { id: 'graphic-designer', title: 'Графический дизайнер', description: '...' },
    { id: 'ux-designer', title: 'UX-дизайнер', description: '...' },
  ],
  description: 'Креативный трек — профессиональное направление...',
  tasks: [
    {
      id: 'poster',
      title: 'Афиша',
      mechanic: 'choose',
      profession: 'graphic-designer',
      duration: 5,
      mode: 'group',
      order: 1,
      isLast: false,
      feedback: 'instant',
      intro: 'Тебе предстоит выбрать подходящую афишу...',
      steps: [
        {
          prompt: 'Какая афиша подходит для открытия кафе ICE CREAM?',
          options: [
            { image: '/assets/games/001/poster/step1-a.png', correct: false, explanation: '...' },
            { image: '/assets/games/001/poster/step1-b.png', correct: true, explanation: '...' },
            { image: '/assets/games/001/poster/step1-c.png', correct: false, explanation: '...' },
          ],
        },
        // ... остальные шаги
      ],
      moral: 'Важно подбирать подходящий стиль...',
    },
    // ... остальные задания
  ],
  videos: [
    { profession: 'graphic-designer', title: 'Графический дизайнер', src: '/videos/001/graphic-designer.mp4' },
    { profession: 'ux-designer', title: 'UX-дизайнер', src: '/videos/001/ux-designer.mp4' },
  ],
  bingo: {
    expert: { name: 'Аня Козлова', role: 'Графический дизайнер', profession: 'graphic-designer' },
    gridLabels: ['напиток', 'локация', 'софт скилл', 'инструмент', 'вдохновение', 'суперсила', 'вызов', 'отдых'],
    intro: 'Это бинго! Ответь на вопросы...',
    instruction: 'Много ли у вас общего с нашей коллегой Аней?...',
    resultText: 'Бинго! Синим цветом выделены совпадения...',
    questions: [
      { gridLabel: 'напиток', prompt: 'Какой напиток...?', options: ['Кофе', 'Чай', 'Вода', 'Матча-латте'], expertAnswer: 'Матча-латте' },
      // ... 8 вопросов
    ],
  },
};
```

---

## 8. CSS — правила

```css
/* Всегда используй токены из tokens.css */
.title {
  font-family: var(--font-family);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  letter-spacing: var(--letter-spacing-md);
  line-height: var(--line-height-tight);
}

.section {
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

/* Состояния */
.correct { border-color: var(--color-green); }
.incorrect { border-color: var(--color-red); }

/* НИКОГДА не хардкодь:
   ❌ color: #4161FF
   ✅ color: var(--color-blue)

   ❌ font-size: 36px
   ✅ font-size: var(--font-size-lg)

   ❌ padding: 24px
   ✅ padding: var(--spacing-lg)

   ❌ border-radius: 32px
   ✅ border-radius: var(--radius-lg)
*/

/* ВАЖНО: Overlay для PopUp в играх.
   Background имеет фиксированный размер 1920×1080 и position: relative.
   НЕ используй position: fixed + 100vh — это привяжется к viewport, а не к контейнеру.
   Используй position: absolute с размерами Background:

   ✅ Правильно:
   .overlay {
     position: absolute;
     top: 0;
     left: 0;
     width: 1920px;
     height: 1080px;
     display: flex;
     align-items: center;
     justify-content: center;
     background: rgba(0, 0, 0, 0.5);
     z-index: 9999;
   }

   ❌ Неправильно:
   .overlay {
     position: fixed;
     inset: 0;
     width: 100vw;
     height: 100vh;
   }
*/
```

---

## 9. Чек-лист перед сдачей

### Роутинг и навигация
- [ ] Раздел доступен по `/{slug}/` (например `/creative/`)
- [ ] Все подстраницы доступны по прямому URL (`/{slug}/tasks`, `/{slug}/tasks/poster` и т.д.)
- [ ] Route раздела добавлен в `App.tsx`
- [ ] Главная страница `/` содержит ссылки на все разделы
- [ ] Кнопка [← Назад] работает на каждом экране (через `navigate(-1)` или прямой путь)
- [ ] Навигация между профессиями [← →] работает через `/{slug}/description/{professionId}`
- [ ] Последнее задание ведёт "В меню" (`/{slug}/`), остальные — "Следующее задание" (`/{slug}/tasks/{nextId}`)

### Задания
- [ ] Каждое задание проходит полный flow: Intro → [Instruction] → Game → Result → Moral
- [ ] Метаданные (время, тип) отображаются на карточках заданий
- [ ] Обратная связь работает согласно `feedback` (instant/onComplete)
- [ ] Тултипы для кликабельных терминов работают

### Код и стили
- [ ] Папка раздела = `src/pages/{slug}/` (имя = slug из section.md)
- [ ] Общие типы в `src/types/game.ts`
- [ ] Общие компоненты заданий в `src/pages/shared/`
- [ ] Все значения через CSS-токены, ни одного хардкода
- [ ] Все импорты UI из `../../components/ui` (или `../../../components/ui`)
- [ ] Шрифт везде `var(--font-family)`
- [ ] Нет новых UI-компонентов — только из кита
- [ ] `npm run build` проходит без ошибок

---

## 10. Пример промпта для запуска агента

### Вариант 1: Первый раздел (создаёт каркас приложения)

```
Сверстай раздел из Games/001-formatted/.

Прочитай файлы в таком порядке:
1. CLAUDE.md
2. DESIGN_SYSTEM.md
3. Games/GAME_SPEC.md
4. Games/AGENT_BUILD_GUIDE.md
5. Games/001-formatted/ — все файлы (section.md, description.md, tasks/*.md и т.д.)

Что нужно сделать:
1. Создай src/types/game.ts — общие типы (из раздела 7 AGENT_BUILD_GUIDE.md)
2. Создай src/pages/shared/ — переиспользуемые компоненты заданий (TaskIntro, TaskMoral, TaskResult, все механики games/)
3. Создай src/pages/creative/ — папку раздела (slug из section.md = "creative")
   - CreativeLayout.tsx, CreativeMenu.tsx, Description.tsx, Profession.tsx, TaskList.tsx, TaskPage.tsx, Videos.tsx, Test.tsx
   - data.ts — данные из .md файлов
4. Обнови src/App.tsx — добавь BrowserRouter, Route для / и /creative/*
5. Создай src/pages/HomePage/HomePage.tsx — главная со ссылками на разделы

Все страницы доступны по URL: /creative/, /creative/tasks, /creative/tasks/poster и т.д.
Навигация через react-router (useNavigate, useParams, Outlet).
Все механики реализуй согласно GAME_SPEC.md.
```

### Вариант 2: Добавление нового раздела (каркас уже есть)

```
Добавь раздел из Games/002-formatted/.

Прочитай:
1. CLAUDE.md, DESIGN_SYSTEM.md, Games/GAME_SPEC.md, Games/AGENT_BUILD_GUIDE.md
2. Games/002-formatted/ — все файлы
3. src/App.tsx — текущий роутер
4. src/types/game.ts — существующие типы
5. src/pages/shared/ — существующие общие компоненты

Что нужно сделать:
1. Создай src/pages/development/ — папку раздела (slug = "development")
   - DevelopmentLayout.tsx, DevelopmentMenu.tsx, и все остальные экраны
   - data.ts — данные из .md файлов
2. Добавь Route для /development/* в App.tsx
3. Добавь ссылку на раздел в HomePage
4. Если в заданиях есть механики, которых нет в src/pages/shared/games/ — создай их

НЕ трогай существующие разделы. Только добавь новый Route и папку.
```
```
