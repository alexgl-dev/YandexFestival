/** Вертикальная позиция в колонке дня → индекс слота начала (как при drop). */
export function computeStartSlotFromClientY(
  clientY: number,
  columnEl: HTMLDivElement,
  paddingV: number,
  slotUnit: number,
  slotCount: number,
  durationSlots: number,
): number {
  const rect = columnEl.getBoundingClientRect();
  const toLayout = columnEl.offsetHeight / rect.height;
  const relY = (clientY - rect.top) * toLayout - paddingV;
  return Math.min(Math.max(0, Math.round(relY / slotUnit)), slotCount - durationSlots);
}
