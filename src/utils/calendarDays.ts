const DAY_IDS  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_ABBRS = ['Пн',  'Вт',  'Ср',  'Чт',  'Пт',  'Сб',  'Вс'];

type DayId = typeof DAY_IDS[number];

export interface CalendarDay {
  id: DayId;
  abbr: string;
  date: string; // "14 марта"
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function getMondayOf(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

/** Mon–Wed (or any count) of the current week */
export function getWeekDays(count = 3): CalendarDay[] {
  const monday = getMondayOf(new Date());
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { id: DAY_IDS[i], abbr: DAY_ABBRS[i], date: formatDate(d) };
  });
}

