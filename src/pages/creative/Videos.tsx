import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Background, Player } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Videos.module.css';

export function Videos() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleBack = () => {
    setPlayingIndex(null);
    navigate(`/${data.slug}`);
  };

  const handleToggle = (index: number) => {
    setPlayingIndex((prev) => (prev === index ? null : index));
  };

  return (
    <Background theme="orange" orientation="portrait" onBack={handleBack}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>Истории яндексоидов</h2>

          <div className={styles.grid}>
            {data.videos.map((video, index) => {
              const isPlaying = playingIndex === index;
              return (
                <div key={index} className={styles.item}>
                  <Player
                    title={video.title}
                    state={isPlaying ? 'playing' : 'default'}
                    orientation="vertical"
                    src={video.src}
                    onPlay={() => handleToggle(index)}
                    onPause={() => handleToggle(index)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Background>
  );
}
