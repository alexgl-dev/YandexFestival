import { useNavigate, useParams, useOutletContext } from 'react-router';
import { Background, Badge } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Profession.module.css';

export function Profession() {
  const navigate = useNavigate();
  const { professionId } = useParams();
  const data = useOutletContext<SectionData>();

  const profIndex = data.professions.findIndex((p) => p.id === professionId);
  const profession = data.professions[profIndex];

  if (!profession) {
    return (
      <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}/description`)}>
        <div className={styles.wrapper}>
          <p className={styles.notFound}>Профессия не найдена</p>
        </div>
      </Background>
    );
  }

  const prev = profIndex > 0 ? data.professions[profIndex - 1] : null;
  const next = profIndex < data.professions.length - 1 ? data.professions[profIndex + 1] : null;

  return (
    <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}/description`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{profession.title}</h2>

        <div className={styles.card}>
          <p className={styles.description}>{profession.description}</p>
        </div>

        <div className={styles.navigation}>
          {prev && (
            <span onClick={() => navigate(`/${data.slug}/description/${prev.id}`)} className={styles.navLink}>
              <Badge label={`← ${prev.title}`} type="outline" />
            </span>
          )}
          {next && (
            <span onClick={() => navigate(`/${data.slug}/description/${next.id}`)} className={styles.navLink}>
              <Badge label={`${next.title} →`} type="outline" />
            </span>
          )}
        </div>
      </div>
    </Background>
  );
}
