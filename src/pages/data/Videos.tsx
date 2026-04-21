import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Background, Player } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Videos.module.css';

const TOTAL_DURATION = 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function Videos() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= TOTAL_DURATION - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  const handlePlay = useCallback((index: number) => {
    if (playingIndex === index) return;
    setPlayingIndex(index);
    setElapsed(0);
    startTimer();
  }, [playingIndex, startTimer]);

  const handlePause = useCallback(() => {
    stopTimer();
    setPlayingIndex(null);
  }, [stopTimer]);

  const activeVideo = playingIndex !== null ? data.videos[playingIndex] : null;

  return (
    <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>Истории яндексоидов</h2>

          <div className={styles.grid}>
            {data.videos.map((video, index) => (
              <div key={index} className={styles.item}>
                <Player
                  title={video.title}
                  state="default"
                  orientation="vertical"
                  totalTime={formatTime(TOTAL_DURATION)}
                  onPlay={() => handlePlay(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeVideo && (
        <div className={styles.videoOverlay} onClick={handlePause}>
          <div className={styles.videoOverlayInner} onClick={(e) => e.stopPropagation()}>
            <Player
              title={activeVideo.title}
              state="playing"
              orientation="vertical"
              currentTime={formatTime(elapsed)}
              totalTime={formatTime(TOTAL_DURATION)}
              progress={(elapsed / TOTAL_DURATION) * 100}
              onPause={handlePause}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
