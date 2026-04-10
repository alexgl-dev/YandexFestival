import { useNavigate, useOutletContext } from 'react-router';
import { Background, Player } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Videos.module.css';

export function Videos() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  return (
    <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Истории яндексоидов</h2>

        <div className={styles.grid}>
          {data.videos.map((video, index) => (
            <div key={index} className={styles.item}>
              <Player
                title={video.title}
                state="default"
                orientation="horizontal"
                onPlay={() => console.log('play', video.src)}
              />
            </div>
          ))}
        </div>
      </div>
    </Background>
  );
}
