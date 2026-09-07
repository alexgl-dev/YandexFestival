import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Badge } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Description.module.css';

export function Description() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const { t } = useTranslation('data');

  return (
    <Background theme="cobalt" orientation="portrait" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{t(data.title)}</h2>

        <div className={styles.card}>
          <p className={styles.text}>{t(data.description)}</p>
        </div>

        <div className={styles.professions}>
          <div className={styles.list}>
            {data.professions.map((prof) => (
              <span key={prof.id} onClick={() => navigate(`/${data.slug}/description/${prof.id}`)} className={styles.profLink}>
                <Badge label={t(prof.title)} type="outline" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Background>
  );
}
