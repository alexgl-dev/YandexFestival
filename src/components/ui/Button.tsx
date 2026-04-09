import type { ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  label: string;
  type?: 'main' | 'secondary' | 'outline' | 'big' | 'big_bottom';
  pressed?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function Button({
  label,
  type = 'main',
  pressed,
  onClick,
  icon,
  className,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[type]} ${pressed ? styles.pressed : ''} ${className ?? ''}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label}
    </button>
  );
}
