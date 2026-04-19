import type { GlossaryTerm } from '../../types/game';

export type GlossarySegment = { text: string; tooltip?: GlossaryTerm };

/** Разбивает текст на сегменты по вхождениям слов из глоссария (как на экране вступления к заданию). */
export function parseGlossarySegments(text: string, tooltips: GlossaryTerm[]): GlossarySegment[] {
  if (!tooltips.length) return [{ text }];

  const positions: Array<{ start: number; end: number; tooltip: GlossaryTerm }> = [];
  for (const t of tooltips) {
    let idx = text.toLowerCase().indexOf(t.word.toLowerCase());
    while (idx !== -1) {
      positions.push({ start: idx, end: idx + t.word.length, tooltip: t });
      idx = text.toLowerCase().indexOf(t.word.toLowerCase(), idx + 1);
    }
  }
  positions.sort((a, b) => a.start - b.start);

  const segments: GlossarySegment[] = [];
  let pos = 0;
  for (const p of positions) {
    if (p.start < pos) continue;
    if (p.start > pos) segments.push({ text: text.slice(pos, p.start) });
    segments.push({ text: text.slice(p.start, p.end), tooltip: p.tooltip });
    pos = p.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}
