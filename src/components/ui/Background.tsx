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
}: BackgroundProps) {
  const bgSrc = bgMap[`${theme}-${orientation}`];

  return (
    <div className={`${styles.root} ${styles[orientation]} ${className ?? ''}`}>
      <img src={bgSrc} alt="" className={styles.bgImage} />

      {showBackButton && (
        <div className={styles.backButton}>
          <IconButton type="back" variant="light" size="lg" onClick={onBack} />
        </div>
      )}

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
