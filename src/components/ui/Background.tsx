import { createContext, useContext, type ReactNode } from 'react';
import styles from './Background.module.css';
import { IconButton } from './IconButton';
import { useFitScale, STAGE_SIZE } from './useFitScale';

/**
 * Встроенный режим сцены (для /ui-kit): вместо fixed на весь viewport сцена
 * рендерится в потоке документа с заданным масштабом. Провайдер — StagePreview.
 */
export const EmbeddedStageContext = createContext<{ scale: number } | null>(null);

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
  const fit = useFitScale(orientation);
  const embedded = useContext(EmbeddedStageContext);
  const { scale, offsetX, offsetY } = embedded ? { scale: embedded.scale, offsetX: 0, offsetY: 0 } : fit;
  const stage = STAGE_SIZE[orientation];

  return (
    <div
      className={`${styles.scene} ${embedded ? styles.sceneEmbedded : ''}`}
      style={embedded ? { width: stage.width * scale, height: stage.height * scale } : undefined}
    >
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
