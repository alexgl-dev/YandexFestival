import type { ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonType =
  | 'main'        // Figma Main: синяя, 36px, auto-width
  | 'secondary'   // белая, чёрный текст
  | 'outline'     // прозрачная, бордер серый, чёрный текст
  | 'big'         // 908×131, бордер чёрный, текст 50; pressed — чёрная
  | 'big_white'   // 908×131, белая
  | 'big_blue'    // 908×131, синяя (primary в PopUp)
  | 'big_bottom'  // 960×160, белая с синим бордером, иконка + текст 40
  | 'blue';       // alias big_blue (обратная совместимость)

export interface ButtonProps {
  label: string;
  type?: ButtonType;
  pressed?: boolean;
  onClick?: () => void;
  /** Произвольная иконка слева от текста (как раньше) */
  icon?: ReactNode;
  /** Стрелка «вперёд» из макета справа от текста (Main Button, Icon=Yes) */
  arrow?: boolean;
  className?: string;
}

const BIG_TYPES = new Set<ButtonType>(['big', 'big_white', 'big_blue', 'blue']);

/** Стрелка из Figma (iconamoon:arrow-up-2, повёрнута на 90°): 44px у обычных, 65px у Big_* */
function arrowSrc(type: ButtonType, pressed?: boolean): string {
  const big = BIG_TYPES.has(type);
  const size = big ? 65 : 44;
  const whiteText =
    type === 'main' || type === 'big_blue' || type === 'blue' || (pressed && (type === 'outline' || type === 'big'));
  return `/icons/figma/arrow-${size}-${whiteText ? 'white' : 'black'}.svg`;
}

/**
 * Button по Figma «OUT_Яндекс Музей» (Main Button / State × Type × Icon).
 * Текст — YS Text Regular (Big_bottom — Medium 40).
 */
export function Button({ label, type = 'main', pressed, onClick, icon, arrow, className }: ButtonProps) {
  const resolved: ButtonType = type === 'blue' ? 'big_blue' : type;

  return (
    <button
      className={`${styles.button} ${styles[resolved]} ${pressed ? styles.pressed : ''} ${className ?? ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label}
      {arrow && <img src={arrowSrc(resolved, pressed)} alt="" className={styles.arrow} />}
    </button>
  );
}
