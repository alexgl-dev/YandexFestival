import type { ReactNode } from 'react';
import styles from './PopUp.module.css';
import { Icon } from './Icon';
import { Button } from './Button';

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
  className?: string;
  compact?: boolean;
}

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
  className,
  compact,
}: PopUpProps) {
  // Кастомные иконки вместо стандартных done/close
  const resolvedIconSrc =
    iconSrc ??
    (icon === 'close'
      ? '/icons/icon-red.svg'
      : icon === 'done'
        ? '/icons/icon-happe.svg'
        : undefined);

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ''} ${className ?? ''}`}>
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
        {secondaryButtonLabel && (
          <Button
            label={secondaryButtonLabel}
            type="secondary"
            onClick={onSecondaryButtonClick}
            className={styles.secondaryBtn}
          />
        )}
        <Button label={buttonLabel} type="blue" onClick={onButtonClick} />
      </div>
    </div>
  );
}
