import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Badge, PopUp } from '../../components/ui';
import type { SectionData, GlossaryTerm } from '../../types/game';
import styles from './Profession.module.css';

function renderWithGlossary(
  text: string,
  glossary: GlossaryTerm[],
  onTap: (term: GlossaryTerm) => void,
): React.ReactNode {
  if (!glossary.length) return text;

  const pattern = new RegExp(`(${glossary.map((g) => g.word).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const term = glossary.find((g) => g.word.toLowerCase() === part.toLowerCase());
    if (term) {
      return (
        <span key={i} className={styles.glossaryWord} onClick={() => onTap(term)}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export function Profession() {
  const navigate = useNavigate();
  const { professionId } = useParams();
  const data = useOutletContext<SectionData>();
  const { t } = useTranslation('creative');

  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);

  const profIndex = data.professions.findIndex((p) => p.id === professionId);
  const profession = data.professions[profIndex];

  if (!profession) {
    return (
      <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}/description`)}>
        <div className={styles.wrapper}>
          <p className={styles.notFound}>{t("Профессия не найдена")}</p>
        </div>
      </Background>
    );
  }

  const prev = profIndex > 0 ? data.professions[profIndex - 1] : null;
  const next = profIndex < data.professions.length - 1 ? data.professions[profIndex + 1] : null;

  const glossary = profession.glossary ?? [];
  const hasSections = profession.sections && profession.sections.length > 0;

  return (
    <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}/description`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{t(profession.title)}</h2>

        {hasSections ? (
          <div className={styles.sections}>
            {profession.sections!.map((section) => (
              <div key={section.heading} className={styles.sectionCard}>
                <h3 className={styles.sectionHeading}>{t(section.heading)}</h3>
                <p className={styles.sectionText}>
                  {renderWithGlossary(t(section.text), glossary, setActiveTerm)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.card}>
            <p className={styles.description}>{t(profession.description)}</p>
          </div>
        )}

        <div className={styles.navigation}>
          {prev && (
            <span onClick={() => navigate(`/${data.slug}/description/${prev.id}`)} className={styles.navLink}>
              <Badge
                label={t(prev.title)}
                type="outline"
                icon={<img src="/icons/icon-arrow.svg" alt="" className={styles.navArrowIconLeft} />}
              />
            </span>
          )}
          {next && (
            <span onClick={() => navigate(`/${data.slug}/description/${next.id}`)} className={styles.navLink}>
              <Badge
                label={t(next.title)}
                type="outline"
                icon={<img src="/icons/icon-arrow.svg" alt="" className={styles.navArrowIconRight} />}
                iconPosition="end"
              />
            </span>
          )}
        </div>
      </div>

      {activeTerm && (
        <div className={styles.overlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={t(activeTerm.word).charAt(0).toUpperCase() + t(activeTerm.word).slice(1)}
              description={t(activeTerm.definition)}
              buttonLabel={t("Понятно")}
              onButtonClick={() => setActiveTerm(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
