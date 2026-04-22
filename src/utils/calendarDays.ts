const DAY_IDS  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_ABBRS = ['Пн',  'Вт',  'Ср',  'Чт',  'Пт',  'Сб',  'Вс'];
// Fixed story dates: 14–20 марта (пн–вс)
const DAY_DATES = [
  '14 марта',
  '15 марта',
  '16 марта',
  '17 марта',
  '18 марта',
  '19 марта',
  '20 марта',
];

type DayId = typeof DAY_IDS[number];

export interface CalendarDay {
  id: DayId;
  abbr: string;
  date: string; // "14 марта"
}

/** Mon–Wed (or any count) — static story dates (14 марта = понедельник). */
export function getWeekDays(count = 3): CalendarDay[] {
  return Array.from({ length: count }, (_, i) => ({
    id: DAY_IDS[i],
    abbr: DAY_ABBRS[i],
    date: DAY_DATES[i],
  }));
}

