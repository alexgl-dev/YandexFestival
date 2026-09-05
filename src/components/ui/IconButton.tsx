import styles from './IconButton.module.css';

export interface IconButtonProps {
  type: 'back' | 'play' | 'pause' | 'close';
  /** default — синяя полупрозрачная (Back/Blue); light — белая полупрозрачная (White); orange — как light */
  variant?: 'default' | 'light' | 'orange';
  pressed?: boolean;
  /** Оставлен для совместимости: у «Назад» размер в макете один — 326×124 */
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

/**
 * Icon button по Figma «OUT_Яндекс Музей» (28:614…77:491):
 * back — pill «← Назад» (стрелка 81×66 + YS Text Medium 45), blur-фон;
 * play/pause — pill 110×76; close — белый круг 90 с крестом.
 */
export function IconButton({ type, variant = 'default', pressed, onClick, className }: IconButtonProps) {
  const variantClass = variant === 'default' ? styles.blue : styles.light;

  if (type === 'back') {
    return (
      <button
        type="button"
        className={`${styles.back} ${variantClass} ${pressed ? styles.pressed : ''} ${className ?? ''}`}
        onClick={onClick}
      >
        <img src="/icons/figma/back-arrow-white.svg" alt="" className={styles.backArrow} />
        <span className={styles.backLabel}>Назад</span>
      </button>
    );
  }

  if (type === 'close') {
    return (
      <button
        type="button"
        className={`${styles.close} ${className ?? ''}`}
        onClick={onClick}
        aria-label="Закрыть"
      />
    );
  }

  return (
    <button
      type="button"
      className={`${styles.media} ${type === 'play' ? styles.play : styles.pause} ${className ?? ''}`}
      onClick={onClick}
      aria-label={type === 'play' ? 'Играть' : 'Пауза'}
    >
      {type === 'pause' && <img src="/icons/figma/pause-bars-white.svg" alt="" className={styles.pauseBars} />}
    </button>
  );
}
