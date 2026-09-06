import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Badge, Button, Icon, PopUp } from '../../components/ui';
import type { Task, GlossaryTerm } from '../../types/game';
import { parseGlossarySegments } from './parseGlossarySegments';
import { minutesLabel } from '../../utils/plural';
import styles from './TaskIntro.module.css';

interface TaskIntroProps {
  task: Task;
  onStart: () => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskIntro({ task, onStart, onBack, theme = 'orange', orientation = 'portrait' }: TaskIntroProps) {
  const { t } = useTranslation('sharedOther');
  const modeLabel = task.mode === 'group' ? t("Групповое") : t("Индивидуальное");
  const durationLabel = minutesLabel(task.duration);
  const [activeTooltip, setActiveTooltip] = useState<GlossaryTerm | null>(null);

  // Глоссарий подсвечивается только для русского текста: перевод — это цельная
  // строка из словаря, подстрочный поиск терминов по ней не производится.
  const segments = parseGlossarySegments(t(task.intro), task.introTooltips ?? []);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      {task.id === 'shopping-list' && (
        <div className={styles.floatingRobot}>
          <img src="/illustrations/robot-blue.png" alt={t("Робот")} />
        </div>
      )}
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{t(task.title)}</h2>

        <div className={styles.card}>
          <div className={styles.badges}>
            {!task.hideIntroModeBadge && (
              <Badge
                label={modeLabel}
                type="filled"
                icon={<Icon name="people" color="white" size="xs" />}
              />
            )}
            <Badge
              label={durationLabel}
              type="filled"
              icon={<Icon name="clock" color="white" size="xs" />}
            />
          </div>

          {task.subtitle && (
            <p className={styles.subtitle}>{t(task.subtitle)}</p>
          )}

          <p className={styles.intro}>
            {segments.map((seg, i) =>
              seg.tooltip ? (
                <span
                  key={i}
                  className={styles.tooltipWord}
                  onClick={() => setActiveTooltip(seg.tooltip!)}
                >
                  {seg.text}
                </span>
              ) : (
                seg.text
              )
            )}
          </p>

        </div>

        <Button label={t("Начать")} type="big_white" onClick={onStart} />
      </div>

      {activeTooltip && (
        <div className={styles.overlay} onClick={() => setActiveTooltip(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTooltip.word.charAt(0).toUpperCase() + activeTooltip.word.slice(1)}
              description={activeTooltip.definition}
              buttonLabel={t("Понятно")}
              onButtonClick={() => setActiveTooltip(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
