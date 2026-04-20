export const ZONES = [
  { id: 'hero-poster',      label: 'Баннер с афишей фильма' },
  { id: 'purchase-steps',   label: 'Шаги покупки билета' },
  { id: 'description-text', label: 'Описание фильма' },
  { id: 'schedule-btn',     label: 'Кнопка «Расписание»' },
  { id: 'reg-btn',          label: 'Кнопка «Зарегистрироваться»' },
  { id: 'calendar-dates',   label: 'Шаг с календарём' },
  { id: 'promo-banner',     label: 'Акционный баннер' },
  { id: 'payment-btn',      label: 'Кнопка «Оплатить билет»' },
  { id: 'profile-icon',     label: 'Иконка профиля' },
] as const;

export type ZoneId = typeof ZONES[number]['id'];

export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius?: number;
};

export const PROBLEM_ZONES = new Set<ZoneId>(['description-text', 'reg-btn', 'payment-btn', 'profile-icon']);

// Абсолютный контроль зон (в % относительно контейнера мокапа).
// Правь только эти значения, чтобы подогнать рамки/кликабельные области.
export const ZONE_RECTS: Record<ZoneId, Rect> = {
  'hero-poster': { top: 5.2, left: 3.7, width: 92.6, height: 22.5, radius: 14 },
  'reg-btn': { top: 0.6, left: 72.0, width: 26.0, height: 3.4, radius: 999 },
  'description-text': { top: 28.2, left: 3.7, width: 92.6, height: 7.8, radius: 8 },
  'profile-icon': { top: 40.5, left: 38.7, width: 20.6, height: 7.0, radius: 10 },
  'purchase-steps': { top: 50.2, left: 37.7, width: 60.6, height: 11.2, radius: 10 },
  'calendar-dates': { top: 50.5, left: 5.0, width: 30.0, height: 11.2, radius: 8 },
  'schedule-btn': { top: 62.2, left: 2.5, width: 95.0, height: 7, radius: 12 },
  'payment-btn': { top: 70.8, left: 2.5, width: 95.0, height: 5.6, radius: 12 },
  'promo-banner': { top: 77.0, left: 3.7, width: 92.6, height: 15.0, radius: 12 },
};

