import { useNavigate, useOutletContext } from 'react-router';
import { Background, Badge } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Description.module.css';

export function Description() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  return (
    <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{data.title}</h2>

        <div className={styles.card}>
          <p className={styles.text}>{data.description}</p>
        </div>

        <div className={styles.professions}>
          <div className={styles.list}>
            {data.professions.map((prof) => (
              <span key={prof.id} onClick={() => navigate(`/${data.slug}/description/${prof.id}`)} className={styles.profLink}>
                <Badge label={prof.title} type="outline" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Background>
  );
}
