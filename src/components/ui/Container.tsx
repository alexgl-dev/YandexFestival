import type { ReactNode } from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  state?: 'empty' | 'default';
  size?: 'm' | 'l';
  children?: ReactNode;
  className?: string;
}

export function Container({
  state = 'default',
  size = 'l',
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={`${styles.root} ${styles[`size-${size}`]} ${className ?? ''}`}
    >
      {state === 'empty' ? (
        <span className={styles.placeholder}>Нет содержимого</span>
      ) : (
        children
      )}
    </div>
  );
}
