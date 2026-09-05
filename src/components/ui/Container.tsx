import type { ReactNode } from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  /** default — синяя плашка с текстом (M) / контент; empty — пустая зона: серый бордер (M) или пунктир (L) */
  state?: 'empty' | 'default';
  size?: 'm' | 'l';
  /** Текст-подсказка внутри (M: «Открыть приложение», L: «Перетащи сюда ненужные шаги») */
  placeholder?: string;
  children?: ReactNode;
  className?: string;
}

/** Container по Figma (28:470 L 1230×160, 28:474/28:477 M 300×132) */
export function Container({ state = 'default', size = 'l', placeholder, children, className }: ContainerProps) {
  const text = placeholder ?? (size === 'm' ? 'Открыть приложение' : 'Перетащи сюда ненужные шаги');

  return (
    <div className={`${styles.root} ${styles[`size-${size}`]} ${styles[state]} ${className ?? ''}`}>
      {children ?? <span className={styles.placeholder}>{text}</span>}
    </div>
  );
}
