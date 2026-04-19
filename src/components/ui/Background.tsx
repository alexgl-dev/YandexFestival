import type { ReactNode } from 'react';
import styles from './Background.module.css';
import { IconButton } from './IconButton';

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
  'cobalt-landscape': '/backgrounds/bg-cobalt-landscape.png',
  'cobalt-portrait': '/backgrounds/bg-cobalt-portrait.png',
  'orange-landscape': '/backgrounds/bg-orange-landscape.png',
  'orange-portrait': '/backgrounds/bg-orange-portrait.png',
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
  const bgSrc = bgMap[`${theme}-${orientation}`];

  return (
    <div className={`${styles.root} ${styles[orientation]} ${className ?? ''}`}>
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
  );
}
