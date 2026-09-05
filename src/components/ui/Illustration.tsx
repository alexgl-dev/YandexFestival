import styles from './Illustration.module.css';

/** 3D-иллюстрации старого кита (PNG в /illustrations) */
export type LegacyIllustration =
  | 'laptop'
  | 'selector'
  | 'smart-watch'
  | 'mouse-red'
  | 'mouse-blue'
  | 'keyboard-stickers'
  | 'keyboard';

/** Линейные иллюстрации из Figma «OUT_Яндекс Музей» (Illustration / Type=*, 160×160, SVG в /illustrations/figma) */
export type FigmaIllustration =
  | 'bag'
  | 'calculator'
  | 'calendar'
  | 'computer'
  | 'cup'
  | 'faces'
  | 'hanger'
  | 'hoodie'
  | 'horse'
  | 'negative'
  | 'people'
  | 'percent'
  | 'playstation'
  | 'positive'
  | 'projector'
  | 'thumbs-up'
  | 'wand'
  | 'wc';

const FIGMA_TYPES = new Set<string>([
  'bag', 'calculator', 'calendar', 'computer', 'cup', 'faces', 'hanger', 'hoodie', 'horse',
  'negative', 'people', 'percent', 'playstation', 'positive', 'projector', 'thumbs-up', 'wand', 'wc',
]);

export interface IllustrationProps {
  type: LegacyIllustration | FigmaIllustration;
  /** Размер бокса; у Figma-иллюстраций по умолчанию 160 */
  size?: number;
  className?: string;
}

export function Illustration({ type, size, className }: IllustrationProps) {
  const isFigma = FIGMA_TYPES.has(type);
  const px = size ?? (isFigma ? 160 : 350);
  const src = isFigma ? `/illustrations/figma/${type}.svg` : `/illustrations/illustration-${type}.png`;

  return (
    <div className={`${styles.root} ${className ?? ''}`} style={{ width: px, height: px }}>
      <img src={src} alt={type} className={styles.image} />
    </div>
  );
}
