import { useRef, useEffect, useState } from 'react';
import styles from './Player.module.css';

export interface PlayerProps {
  title: string;
  state?: 'default' | 'playing' | 'fullscreen';
  orientation?: 'horizontal' | 'vertical';
  thumbnail?: string;
  src?: string;
  /** Показывать верхнюю плашку с названием (по умолчанию true). */
  showTitle?: boolean;
  // These remain for non-video usage (fake timer mode)
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

  // Sync external state → video element
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
    <div
      className={`${styles.root} ${styles[orientation]} ${className ?? ''}`}
      onClick={handleClick}
    >
      {/* Real video element */}
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

      {/* Static thumbnail (non-video) */}
      {!hasVideo && thumbnail && (
        <img src={thumbnail} alt="" className={styles.bgImage} />
      )}

      <div className={styles.bgOverlay} />

      {/* Title bar */}
      {!isFullscreen && showTitle && (
        <div className={styles.titleBar}>
          <span className={styles.title}>{title}</span>
        </div>
      )}

      {/* Play icon overlay — shown when not playing */}
      {!isFullscreen && !isPlaying && (
        <div className={styles.playOverlay}>
          <div className={styles.playIcon} />
        </div>
      )}

      {/* Timeline — slides in when playing, slides out when stopped */}
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
