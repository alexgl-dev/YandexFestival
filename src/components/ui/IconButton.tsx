import { useTranslation } from 'react-i18next';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  type: 'back' | 'play' | 'pause' | 'close';
  /** default — синяя полупрозрачная (Back/Blue); light — белая полупрозрачная (White); orange — как light */
  variant?: 'default' | 'light' | 'orange';
  pressed?: boolean;
  /** Оставлен для совместимости: у «Назад» размер один — 245×93 */
  size?: 'sm' | 'md' | 'lg';
  /** Показывать подпись «Назад» (false — только стрелка, для landscape) */
  showLabel?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Icon button по Figma «OUT_Яндекс Музей» (28:614…77:491):
 * back — pill «← Назад» (стрелка 60×50 + YS Text Medium 36), blur-фон;
 * play/pause — pill 110×76; close — белый круг 90 с крестом.
 */
export function IconButton({
  type,
  variant = 'default',
  pressed,
  showLabel = true,
  onClick,
  className,
}: IconButtonProps) {
  const { t } = useTranslation('common');
  const variantClass = variant === 'default' ? styles.blue : styles.light;

  if (type === 'back') {
    return (
      <button
        type="button"
        className={`${styles.back} ${!showLabel ? styles.backIconOnly : ''} ${variantClass} ${pressed ? styles.pressed : ''} ${className ?? ''}`}
        onClick={onClick}
        aria-label={t("Назад")}
      >
        <img src="/icons/figma/back-arrow-white.svg" alt="" className={styles.backArrow} />
        {showLabel && <span className={styles.backLabel}>{t("Назад")}</span>}
      </button>
    );
  }

  if (type === 'close') {
    return (
      <button
        type="button"
        className={`${styles.close} ${className ?? ''}`}
        onClick={onClick}
        aria-label={t("Закрыть")}
      />
    );
  }

  return (
    <button
      type="button"
      className={`${styles.media} ${type === 'play' ? styles.play : styles.pause} ${className ?? ''}`}
      onClick={onClick}
      aria-label={type === 'play' ? t("Играть") : t("Пауза")}
    >
      {type === 'pause' && <img src="/icons/figma/pause-bars-white.svg" alt="" className={styles.pauseBars} />}
    </button>
  );
}
