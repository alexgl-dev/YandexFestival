import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  label: string;
  type: 'filled' | 'outline';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ label, type, icon, className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[type]} ${className ?? ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {label}
    </span>
  );
}
