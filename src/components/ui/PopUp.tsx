import type { ReactNode } from 'react';
import styles from './PopUp.module.css';
import { Icon } from './Icon';
import { Button } from './Button';
import { IconButton } from './IconButton';

export interface PopUpProps {
  icon?: 'close' | 'done';
  iconColor?: 'blue' | 'red';
  iconSrc?: string;
  title?: string;
  description?: string | ReactNode;
  buttonLabel: string;
  onButtonClick?: () => void;
  secondaryButtonLabel?: string;
  onSecondaryButtonClick?: () => void;
  /** Если задан — в правом верхнем углу появляется круглая кнопка «закрыть» (Figma: Icon button 90). */
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * PopUp по Figma «OUT_Яндекс Музей» (PopUp / Type=White): белая плашка 960,
 * иллюстрация 120, заголовок YS Text Wide 60, текст 40, кнопки Main Button 131.
 */
export function PopUp({
  icon,
  iconColor = 'blue',
  iconSrc,
  title,
  description,
  buttonLabel,
  onButtonClick,
  secondaryButtonLabel,
  onSecondaryButtonClick,
  onClose,
  className,
  compact,
}: PopUpProps) {
  // Иллюстрации из макета: грустный / весёлый смайл вместо стандартных done/close
  const resolvedIconSrc =
    iconSrc ??
    (icon === 'close'
      ? '/icons/icon-red.svg'
      : icon === 'done'
        ? '/icons/icon-happe.svg'
        : undefined);

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ''} ${className ?? ''}`}>
      {onClose && <IconButton type="close" onClick={onClose} className={styles.closeBtn} />}

      <div className={styles.topContent}>
        {(icon || resolvedIconSrc) && (
          <div className={styles.iconArea}>
            {resolvedIconSrc ? (
              <img src={resolvedIconSrc} alt="" className={styles.customIcon} />
            ) : (
              <Icon name={icon!} color={iconColor} size="m" />
            )}
          </div>
        )}
        <div className={styles.textBlock}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <div className={styles.description}>{description}</div>}
        </div>
      </div>

      <div className={styles.buttonWrap}>
        <Button label={buttonLabel} type="blue" onClick={onButtonClick} className={styles.primaryBtn} />
        {secondaryButtonLabel && (
          <Button
            label={secondaryButtonLabel}
            type="secondary"
            onClick={onSecondaryButtonClick}
            className={styles.secondaryBtn}
          />
        )}
      </div>
    </div>
  );
}
