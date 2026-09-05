import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  label: string;
  type: 'filled' | 'outline';
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  className?: string;
}

export function Badge({ label, type, icon, iconPosition = 'start', className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[type]} ${className ?? ''}`}>
      {icon && iconPosition === 'start' && <span className={styles.icon}>{icon}</span>}
      {label}
      {icon && iconPosition === 'end' && (
        <span className={`${styles.icon} ${styles.iconEnd}`}>{icon}</span>
      )}
    </span>
  );
}
