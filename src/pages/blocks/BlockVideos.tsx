import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Player } from '../../components/ui';
import { findBlock, blockPath } from './blocks';
import { videosForBlock } from './videos';
import styles from './BlockVideos.module.css';

/** «Истории яндексоидов» блока: ролики всех разделов блока на одном экране. */
export function BlockVideos() {
  const { t } = useTranslation(['blocks', 'management', 'creative', 'data', 'development', 'informatics']);
  const navigate = useNavigate();
  const { blockId } = useParams();
  const block = findBlock(blockId);
  const videos = videosForBlock(blockId);

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  if (!block) {
    return <div>{t('Блок не найден')}</div>;
  }

  const closeOverlay = () => setPlayingIndex(null);
  const activeVideo = playingIndex !== null ? videos[playingIndex] : null;

  const handleBack = () => {
    setPlayingIndex(null);
    navigate(blockPath(block.id));
  };

  return (
    <Background theme={block.theme} orientation={block.orientation} onBack={handleBack}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t('Истории яндексоидов')}</h2>

          <div className={`${styles.grid} ${styles[block.orientation]}`}>
            {videos.map((video, index) => (
              <div key={`${video.src}-${index}`} className={styles.item}>
                <Player
                  title={t(video.title, { ns: video.ns })}
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
              title={t(activeVideo.title, { ns: activeVideo.ns })}
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
