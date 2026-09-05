import styles from './SlideIndicator.module.css';

export interface SlideIndicatorProps {
  /** default — серый, progress — серый с белой заливкой на `progress`%, filled — чёрный */
  state?: 'default' | 'progress' | 'filled';
  /** 0–100, только для state="progress" (в макете 58.73%) */
  progress?: number;
  className?: string;
}

/** Slide Indicator по Figma (28:1137…28:1142): 126×16, pill */
export function SlideIndicator({ state = 'default', progress = 59, className }: SlideIndicatorProps) {
  return (
    <div className={`${styles.root} ${styles[state]} ${className ?? ''}`}>
      {state === 'progress' && (
        <div className={styles.fill} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      )}
    </div>
  );
}
