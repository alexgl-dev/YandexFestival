import { useNavigate, useOutletContext } from 'react-router';
import { Background } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Test.module.css';

export function Test() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  const handleBack = () => navigate(`/${data.slug}`);

  return (
    <Background theme="cobalt" orientation="landscape" onBack={handleBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Тест</h2>
        <p className={styles.placeholder}>Тест в разработке</p>
      </div>
    </Background>
  );
}
