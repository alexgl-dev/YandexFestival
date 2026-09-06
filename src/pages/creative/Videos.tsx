import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Player } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Videos.module.css';

export function Videos() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const { t } = useTranslation('creative');

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleBack = () => {
    setPlayingIndex(null);
    navigate(`/${data.slug}`);
  };

  const closeOverlay = () => setPlayingIndex(null);
  const activeVideo = playingIndex !== null ? data.videos[playingIndex] : null;

  return (
    <Background theme="orange" orientation="portrait" onBack={handleBack}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t("Истории яндексоидов")}</h2>

          <div className={styles.grid}>
            {data.videos.map((video, index) => (
              <div key={index} className={styles.item}>
                <Player
                  title={t(video.title)}
                  state="default"
                  orientation="vertical"
                  src={video.src}
                  showTitle={false}
                  onPlay={() => setPlayingIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeVideo && (
        <div className={styles.videoOverlay} onClick={closeOverlay}>
          <div className={styles.videoOverlayInner} onClick={(e) => e.stopPropagation()}>
            <Player
              title={t(activeVideo.title)}
              state="playing"
              orientation="vertical"
              src={activeVideo.src}
              showTitle={false}
              onPause={closeOverlay}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
