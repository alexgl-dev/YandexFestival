import { useNavigate, useOutletContext } from 'react-router';
import { Background } from '../../components/ui';
import type { SectionData } from '../../types/game';
import { BingoGame } from '../shared/games/BingoGame';
import styles from './Test.module.css';

export function Test() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  const handleBack = () => navigate(`/${data.slug}`);

  if (data.bingo) {
    return (
      <BingoGame
        bingo={data.bingo}
        onBack={handleBack}
        theme={data.theme}
      />
    );
  }

  return (
    <Background theme="cobalt" orientation="landscape" onBack={handleBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Бинго-знакомство</h2>
        <p className={styles.placeholder}>Бинго-знакомство в разработке</p>
      </div>
    </Background>
  );
}
