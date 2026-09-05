import type { ReactNode } from 'react';
import styles from './ListItem.module.css';
import { Icon } from './Icon';
import { Badge } from './Badge';

export interface ListItemProps {
  title: string;
  /** m (по умолчанию) — строка 870×88: название + иконки; l — плашка 1230: бейдж + заголовок + описание + иконка */
  size?: 'm' | 'l';
  duration?: string;
  showPeople?: boolean;
  state?: 'default' | 'pressed';
  /** size="l": текст синего pill-бейджа слева */
  badge?: string;
  /** size="l": серая подпись под заголовком */
  description?: string;
  /** size="l": иконка справа (в макете — Close blue 56) */
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * ListItem по Figma «OUT_Яндекс Музей»:
 * List item (28:502/28:513) — 870×88, padding 15, radius 20, белый / pressed серый;
 * list item (28:481) — 1230, padding 40, radius 30, бейдж + YS Text Wide 32 + описание 24.
 */
export function ListItem({
  title,
  size = 'm',
  duration,
  showPeople = false,
  state = 'default',
  badge,
  description,
  icon,
  onClick,
  className,
}: ListItemProps) {
  const interactive = onClick ? { role: 'button', tabIndex: 0 } : {};

  if (size === 'l') {
    return (
      <div className={`${styles.rootL} ${styles[state]} ${className ?? ''}`} onClick={onClick} {...interactive}>
        <div className={styles.leftL}>
          {badge && <Badge label={badge} type="filled_pill" />}
          <div className={styles.textL}>
            <h3 className={styles.titleL}>{title}</h3>
            {description && <p className={styles.descriptionL}>{description}</p>}
          </div>
        </div>
        {icon && <span className={styles.iconL}>{icon}</span>}
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles[state]} ${className ?? ''}`} onClick={onClick} {...interactive}>
      <span className={styles.title}>{title}</span>

      <div className={styles.right}>
        {showPeople && (
          <span className={styles.peopleWrap}>
            <Icon name="people" color="blue" size="xs" />
          </span>
        )}
        {duration && (
          <span className={styles.time}>
            <Icon name="clock" color="blue" size="xs" />
            <span className={styles.duration}>{duration}</span>
          </span>
        )}
      </div>
    </div>
  );
}
