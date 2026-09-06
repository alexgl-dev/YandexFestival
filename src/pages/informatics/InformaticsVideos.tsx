import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Player } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './InformaticsVideos.module.css';

/** Видео «Познакомься с …» раздела «Информатика во всём». Ориентация плеера — по ориентации раздела. */
export function InformaticsVideos() {
  const { t } = useTranslation('informatics');
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const playerOrientation = data.orientation === 'portrait' ? 'vertical' : 'horizontal';
  const activeVideo = playingIndex !== null ? data.videos[playingIndex] : null;
  const closeOverlay = () => setPlayingIndex(null);

  return (
    <Background theme={data.theme} orientation={data.orientation} onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{t("Познакомься со специалистом")}</h2>
        <div className={styles.grid}>
          {data.videos.map((video, index) => (
            <div key={index} className={`${styles.item} ${styles[playerOrientation]}`}>
              <Player
                title={t(video.title)}
                state="default"
                orientation={playerOrientation}
                src={video.src}
                onPlay={() => setPlayingIndex(index)}
              />
            </div>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div className={styles.videoOverlay} onClick={closeOverlay}>
          <div className={`${styles.videoOverlayInner} ${styles[playerOrientation]}`} onClick={(e) => e.stopPropagation()}>
            <Player
              title={t(activeVideo.title)}
              state="playing"
              orientation={playerOrientation}
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
