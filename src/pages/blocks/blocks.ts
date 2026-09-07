/**
 * Блоки выставки «Фестиваль молодёжи» — по одному устройству на блок.
 * Источник: «Фестиваль_молодежи_наполнение_зон.xlsx — Только интерактивы».
 * Каждый блок объединяет два трека: «Профориентация» (разделы YandexFireInMyHall)
 * и «Информатика во всём» (разделы src/pages/informatics/*).
 */
export interface BlockItem {
  label: string;
  to: string;
}

export interface BlockData {
  id: string;
  title: string;
  theme: 'cobalt' | 'orange';
  orientation: 'landscape' | 'portrait';
  items: BlockItem[];
}

export const blocks: BlockData[] = [
  {
    id: 'management',
    title: 'Блок 1 — Менеджмент',
    theme: 'orange',
    orientation: 'portrait',
    items: [
      { label: 'Календарь яндексоида', to: '/calendars' },
      { label: 'Менеджмент', to: '/management' },
      { label: 'Истории яндексоидов', to: '/block/management/videos' },
      { label: 'Цифровая доступность', to: '/access' },
    ],
  },
  {
    id: 'creative',
    title: 'Блок 2 — Креатив',
    theme: 'orange',
    orientation: 'portrait',
    items: [
      { label: 'Креативный трек', to: '/creative' },
      { label: 'Истории яндексоидов', to: '/block/creative/videos' },
      { label: 'Креативный директор', to: '/advertising' },
    ],
  },
  {
    id: 'data',
    title: 'Блок 3 — Аналитика',
    theme: 'cobalt',
    orientation: 'portrait',
    items: [
      { label: 'Истории яндексоидов', to: '/block/data/videos' },
      { label: 'Работа с данными', to: '/data' },
      { label: 'ML-инженер', to: '/ml/tasks/dataset' },
    ],
  },
  {
    id: 'development',
    title: 'Блок 4 — Разработка',
    theme: 'cobalt',
    orientation: 'landscape',
    items: [
      { label: 'Разработка', to: '/development' },
      { label: 'Истории яндексоидов', to: '/block/development/videos' },
      { label: 'AI-тренер', to: '/ai/tasks/poems' },
    ],
  },
];

export function findBlock(id?: string): BlockData | undefined {
  return blocks.find((b) => b.id === id);
}

/** Путь к меню блока (для кнопки «назад» из меню раздела). */
export function blockPath(id: string): string {
  return `/block/${id}`;
}
