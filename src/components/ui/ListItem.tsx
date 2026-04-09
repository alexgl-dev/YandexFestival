import styles from './ListItem.module.css';
import { Icon } from './Icon';

export interface ListItemProps {
  title: string;
  duration?: string;
  showPeople?: boolean;
  state?: 'default' | 'pressed';
  onClick?: () => void;
  className?: string;
}

export function ListItem({
  title,
  duration,
  showPeople = false,
  state = 'default',
  onClick,
  className,
}: ListItemProps) {
  return (
    <div
      className={`${styles.root} ${styles[state]} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className={styles.title}>{title}</span>

      <div className={styles.right}>
        {showPeople && (
          <Icon name="people" color="blue" size="xs" />
        )}
        {duration && (
          <>
            <Icon name="clock" color="blue" size="xs" />
            <span className={styles.duration}>{duration}</span>
          </>
        )}
      </div>
    </div>
  );
}
