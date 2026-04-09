import styles from './PopUp.module.css';
import { Icon } from './Icon';
import { Button } from './Button';

export interface PopUpProps {
  icon?: 'close' | 'done';
  iconColor?: 'blue' | 'red';
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick?: () => void;
  className?: string;
}

export function PopUp({
  icon,
  iconColor = 'blue',
  title,
  description,
  buttonLabel,
  onButtonClick,
  className,
}: PopUpProps) {
  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <div className={styles.topContent}>
        {icon && (
          <div className={styles.iconArea}>
            <Icon name={icon} color={iconColor} size="m" />
          </div>
        )}
        <div className={styles.textBlock}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      <div className={styles.buttonWrap}>
        <Button label={buttonLabel} type="main" onClick={onButtonClick} />
      </div>
    </div>
  );
}
