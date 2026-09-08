import type { PostProcessorModule } from 'i18next';

/**
 * Короткие предлоги/союзы/частицы, которые не должны оставаться
 * последним словом в строке. После них ставим неразрывный пробел.
 */
const SHORT_WORDS = new Set([
  // RU
  'а',
  'в',
  'во',
  'и',
  'к',
  'ко',
  'на',
  'но',
  'о',
  'об',
  'обо',
  'от',
  'по',
  'с',
  'со',
  'у',
  'за',
  'из',
  'над',
  'под',
  'при',
  'про',
  'для',
  'без',
  'до',
  'не',
  'ни',
  'же',
  'ли',
  'бы',
  'б',
  'ж',
  'то',
  'ну',
  // EN
  'a',
  'an',
  'as',
  'at',
  'by',
  'if',
  'in',
  'of',
  'on',
  'or',
  'to',
  'the',
  'and',
  'for',
  'but',
  'nor',
  'from',
  'with',
  'into',
  'onto',
  'upon',
  'over',
  'i',
]);

const NBSP = '\u00A0';

/** Склеивает короткое слово со следующим обычным пробелом → NBSP. Переносы \n не трогает. */
export function glueOrphans(text: string): string {
  if (!text || !text.includes(' ')) return text;

  // Lookbehind не съедает разделитель — иначе следующее короткое слово
  // (после обычного) пропускается: пробел уже ушёл в предыдущий матч.
  // Lookahead допускает открывающие кавычки/скобки: «с ·«умными»».
  return text.replace(
    /(?<![\p{L}\p{N}])([\p{L}]+)( +)(?=[«„“"'(\[]*[\p{L}\p{N}])/gu,
    (match, word: string) => {
      if (SHORT_WORDS.has(word.toLowerCase())) {
        return `${word}${NBSP}`;
      }
      return match;
    },
  );
}

export const glueOrphansPostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'glueOrphans',
  process(value) {
    if (typeof value !== 'string') return value;
    return glueOrphans(value);
  },
};
