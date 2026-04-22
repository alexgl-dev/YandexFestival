import { useState } from 'react';
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
  const modeLabel = task.mode === 'group' ? 'Групповое' : 'Индивидуальное';
  const durationLabel = minutesLabel(task.duration);
  const [activeTooltip, setActiveTooltip] = useState<GlossaryTerm | null>(null);

  const segments = parseGlossarySegments(task.intro, task.introTooltips ?? []);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{task.title}</h2>

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
            <p className={styles.subtitle}>{task.subtitle}</p>
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

          {task.steps[0]?.briefing && task.steps[0]?.prompt && (
            <p className={styles.introPrompt}>{task.steps[0].prompt}</p>
          )}
        </div>

        <Button label="Начать" type="main" onClick={onStart} />
      </div>

      {activeTooltip && (
        <div className={styles.overlay} onClick={() => setActiveTooltip(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTooltip.word.charAt(0).toUpperCase() + activeTooltip.word.slice(1)}
              description={activeTooltip.definition}
              buttonLabel="Понятно"
              onButtonClick={() => setActiveTooltip(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
