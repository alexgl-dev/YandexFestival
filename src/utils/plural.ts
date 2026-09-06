import i18n from '../i18n';

/**
 * Russian noun pluralization by number.
 * Pass three forms: [1, 2-4, 5+]. Example: pluralRu(5, ['минута', 'минуты', 'минут']) === 'минут'.
 */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  if (abs >= 11 && abs <= 14) return forms[2];
  const last = abs % 10;
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

/** Shortcut for «минута/минуты/минут» (or "minute(s)" when the UI language is English). */
export function minutesLabel(n: number): string {
  if (i18n.language === 'en') {
    return `${n} ${n === 1 ? 'minute' : 'minutes'}`;
  }
  return `${n} ${pluralRu(n, ['минута', 'минуты', 'минут'])}`;
}
