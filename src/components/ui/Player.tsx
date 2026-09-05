import { useRef, useEffect, useState } from 'react';
import styles from './Player.module.css';
import { IconButton } from './IconButton';

export interface PlayerProps {
  title: string;
  state?: 'default' | 'playing' | 'fullscreen';
  orientation?: 'horizontal' | 'vertical';
  thumbnail?: string;
  src?: string;
  /** Показывать название в левом нижнем углу (по умолчанию true). */
  showTitle?: boolean;
  // Для режима без видео (фейковый таймер)
  currentTime?: string;
  totalTime?: string;
  progress?: number;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Player по Figma «OUT_Яндекс Музей» (28:582 Default, 28:585 Playing): 420×236, radius 30, тень,
 * название YS Text Medium 20 внизу слева, кнопка play/pause 110×76 по центру, таймлайн внизу при воспроизведении.
 */
export function Player({
  title,
  state = 'default',
  orientation = 'horizontal',
  thumbnail,
  src,
  showTitle = true,
  currentTime,
  totalTime,
  progress,
  onPlay,
  onPause,
  className,
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoCurrent, setVideoCurrent] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const isPlaying = state === 'playing';
  const isFullscreen = state === 'fullscreen';
  const hasVideo = Boolean(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
      if (state === 'default') {
        video.currentTime = 0;
        setVideoCurrent(0);
      }
    }
  }, [isPlaying, state]);

  const handleClick = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const displayCurrentTime = hasVideo ? formatTime(videoCurrent) : (currentTime ?? '00:00');
  const displayTotalTime = hasVideo ? formatTime(videoDuration) : (totalTime ?? '00:00');
  const displayProgress = hasVideo
    ? (videoDuration > 0 ? (videoCurrent / videoDuration) * 100 : 0)
    : (progress ?? 0);

  return (
    <div className={`${styles.root} ${styles[orientation]} ${className ?? ''}`} onClick={handleClick}>
      {hasVideo && (
        <video
          ref={videoRef}
          src={src}
          className={styles.bgImage}
          playsInline
          preload="metadata"
          onTimeUpdate={() => setVideoCurrent(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setVideoDuration(videoRef.current?.duration ?? 0)}
          onEnded={() => { onPause?.(); }}
        />
      )}

      {!hasVideo && thumbnail && <img src={thumbnail} alt="" className={styles.bgImage} />}

      <div className={styles.bgOverlay} />

      {/* Кнопка play / pause по центру */}
      {!isFullscreen && (
        <div className={styles.control}>
          <IconButton type={isPlaying ? 'pause' : 'play'} />
        </div>
      )}

      {/* Название — внизу слева (в default), уступает место таймлайну при воспроизведении */}
      {!isFullscreen && showTitle && !isPlaying && <span className={styles.title}>{title}</span>}

      {/* Таймлайн — внизу при воспроизведении */}
      <div className={`${styles.timeline} ${isPlaying ? styles.timelineVisible : ''}`}>
        <span className={styles.time}>{displayCurrentTime}</span>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${displayProgress}%` }} />
        </div>
        <span className={styles.time}>{displayTotalTime}</span>
      </div>
    </div>
  );
}
