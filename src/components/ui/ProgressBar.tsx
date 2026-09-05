import styles from './ProgressBar.module.css';
import { SlideIndicator } from './SlideIndicator';

export interface ProgressBarProps {
  type: 'mini' | 'main';
  /** 0–100 */
  progress: number;
  /** mini: если задано — сегментированный индикатор (Figma Type=Mini: 4 × Slide Indicator) */
  segments?: number;
  /** mini + segments: номер текущего сегмента (1-based); заполненные — чёрные, текущий — с белой заливкой */
  current?: number;
  /** main: подпись по центру («Загрузка данных 50%») */
  label?: string;
  currentTime?: string;
  totalTime?: string;
  className?: string;
}

/** Progress bar по Figma (28:605 Mini, 28:610 Main): Main — 1800×64, трек 5% чёрного, заливка синяя */
export function ProgressBar({
  type,
  progress,
  segments,
  current = 1,
  label,
  currentTime,
  totalTime,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  if (type === 'mini') {
    if (segments && segments > 0) {
      return (
        <div className={`${styles.segments} ${className ?? ''}`}>
          {Array.from({ length: segments }, (_, i) => {
            const n = i + 1;
            const state = n < current ? 'filled' : n === current ? 'progress' : 'default';
            return <SlideIndicator key={n} state={state} progress={n === current ? clamped : undefined} />;
          })}
        </div>
      );
    }
    return (
      <div className={`${styles.miniTrack} ${className ?? ''}`}>
        <div className={styles.miniFill} style={{ width: `${clamped}%` }} />
      </div>
    );
  }

  return (
    <div className={`${styles.mainWrapper} ${className ?? ''}`}>
      {currentTime && <span className={styles.time}>{currentTime}</span>}
      <div className={styles.mainTrack}>
        <div className={styles.mainFill} style={{ width: `${clamped}%` }} />
        {label && <span className={styles.label}>{label}</span>}
      </div>
      {totalTime && <span className={styles.time}>{totalTime}</span>}
    </div>
  );
}
