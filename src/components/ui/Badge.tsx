import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  label: string;
  /** filled — синий, radius 20; filled_pill — синий pill, Medium; outline — белый, серый бордер */
  type: 'filled' | 'filled_pill' | 'outline';
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  className?: string;
}

/** Badge по Figma «OUT_Яндекс Музей» (badge / Type=filled | filled 2 | outline): текст 32, padding 15/20, иконка 36 */
export function Badge({ label, type, icon, iconPosition = 'start', className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[type]} ${className ?? ''}`}>
      {icon && iconPosition === 'start' && <span className={styles.icon}>{icon}</span>}
      {label}
      {icon && iconPosition === 'end' && <span className={`${styles.icon} ${styles.iconEnd}`}>{icon}</span>}
    </span>
  );
}
