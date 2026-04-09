import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  type: 'mini' | 'main';
  progress: number;
  currentTime?: string;
  totalTime?: string;
  className?: string;
}

export function ProgressBar({ type, progress, currentTime, totalTime, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  if (type === 'mini') {
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
      </div>
      {totalTime && <span className={styles.time}>{totalTime}</span>}
    </div>
  );
}
