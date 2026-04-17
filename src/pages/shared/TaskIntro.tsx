import { useState } from 'react';
import { Background, Badge, Button, Icon } from '../../components/ui';
import type { Task, GlossaryTerm } from '../../types/game';
import styles from './TaskIntro.module.css';

interface TaskIntroProps {
  task: Task;
  onStart: () => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

function parseIntro(text: string, tooltips: GlossaryTerm[]): Array<{ text: string; tooltip?: GlossaryTerm }> {
  if (!tooltips.length) return [{ text }];

  const positions: Array<{ start: number; end: number; tooltip: GlossaryTerm }> = [];
  for (const t of tooltips) {
    let idx = text.toLowerCase().indexOf(t.word.toLowerCase());
    while (idx !== -1) {
      positions.push({ start: idx, end: idx + t.word.length, tooltip: t });
      idx = text.toLowerCase().indexOf(t.word.toLowerCase(), idx + 1);
    }
  }
  positions.sort((a, b) => a.start - b.start);

  const segments: Array<{ text: string; tooltip?: GlossaryTerm }> = [];
  let pos = 0;
  for (const p of positions) {
    if (p.start < pos) continue;
    if (p.start > pos) segments.push({ text: text.slice(pos, p.start) });
    segments.push({ text: text.slice(p.start, p.end), tooltip: p.tooltip });
    pos = p.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

export function TaskIntro({ task, onStart, onBack, theme = 'orange', orientation = 'portrait' }: TaskIntroProps) {
  const modeLabel = task.mode === 'group' ? 'Групповое' : 'Индивидуальное';
  const durationLabel = `${task.duration} минут`;
  const [activeTooltip, setActiveTooltip] = useState<GlossaryTerm | null>(null);

  const segments = parseIntro(task.intro, task.introTooltips ?? []);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{task.title}</h2>

        <div className={styles.card}>
          <div className={styles.badges}>
            <Badge
              label={modeLabel}
              type="filled"
              icon={<Icon name="people" color="white" size="xs" />}
            />
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
        </div>

        <Button label="Начать" type="main" onClick={onStart} />
      </div>

      {activeTooltip && (
        <div className={styles.overlay} onClick={() => setActiveTooltip(null)}>
          <div className={styles.tooltipCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.tooltipWord_title}>{activeTooltip.word.charAt(0).toUpperCase() + activeTooltip.word.slice(1)}</p>
            <p className={styles.tooltipWord_text}>{activeTooltip.definition}</p>
            <Button label="Понятно" type="main" onClick={() => setActiveTooltip(null)} />
          </div>
        </div>
      )}
    </Background>
  );
}
