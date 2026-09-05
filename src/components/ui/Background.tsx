import type { ReactNode } from 'react';
import styles from './Background.module.css';
import { IconButton } from './IconButton';
import { useFitScale } from './useFitScale';

export interface BackgroundProps {
  theme: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
  showBackButton?: boolean;
  onBack?: () => void;
  children?: ReactNode;
  className?: string;
  /** Доп. класс для внутренней области (например overflow + выравнивание по верху). */
  contentClassName?: string;
}

const bgMap = {
  landscape: '/backgrounds/Меню.jpg',
  portrait: '/backgrounds/Экран 3.png',
} as const;

export function Background({
  theme,
  orientation = 'landscape',
  showBackButton = true,
  onBack,
  children,
  className,
  contentClassName,
}: BackgroundProps) {
  const bgSrc = bgMap[orientation];
  const { scale, offsetX, offsetY } = useFitScale(orientation);

  return (
    <div className={styles.scene}>
      <div
        className={`${styles.root} ${styles[orientation]} ${className ?? ''}`}
        style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }}
      >
        <img src={bgSrc} alt="" className={styles.bgImage} />

        {showBackButton && (
          <div className={styles.backButton}>
            <IconButton type="back" variant={theme === 'orange' ? 'orange' : 'light'} size={orientation === 'portrait' ? 'md' : 'lg'} onClick={onBack} />
          </div>
        )}

        <div
          className={
            contentClassName ? `${styles.content} ${contentClassName}` : styles.content
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
