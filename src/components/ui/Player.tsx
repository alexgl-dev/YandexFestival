import styles from './Player.module.css';
import { IconButton } from './IconButton';

export interface PlayerProps {
  title: string;
  state?: 'default' | 'playing' | 'fullscreen';
  orientation?: 'horizontal' | 'vertical';
  thumbnail?: string;
  currentTime?: string;
  totalTime?: string;
  progress?: number;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function Player({
  title,
  state = 'default',
  orientation = 'horizontal',
  thumbnail,
  currentTime = '00:00',
  totalTime = '00:00',
  progress = 0,
  onPlay,
  onPause,
  className,
}: PlayerProps) {
  const isPlaying = state === 'playing';
  const isFullscreen = state === 'fullscreen';

  return (
    <div className={`${styles.root} ${styles[orientation]} ${className ?? ''}`}>
      {/* Background thumbnail */}
      {thumbnail && (
        <img src={thumbnail} alt="" className={styles.bgImage} />
      )}
      <div className={styles.bgOverlay} />

      {/* Title bar — hidden in fullscreen */}
      {!isFullscreen && (
        <div className={styles.titleBar}>
          <span className={styles.title}>{title}</span>
        </div>
      )}

      {/* Play/Pause button centered — hidden in fullscreen */}
      {!isFullscreen && (
        <div className={styles.buttonWrap}>
          <IconButton
            type={isPlaying ? 'pause' : 'play'}
            size="sm"
            onClick={isPlaying ? onPause : onPlay}
          />
        </div>
      )}

      {/* Timeline — only when playing */}
      {isPlaying && (
        <div className={styles.timeline}>
          <span className={styles.time}>{currentTime}</span>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.time}>{totalTime}</span>
        </div>
      )}
    </div>
  );
}
