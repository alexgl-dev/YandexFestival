import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Background, Button, PopUp } from '../../components/ui';
import type { GlossaryTerm, Task } from '../../types/game';
import { parseGlossarySegments } from './parseGlossarySegments';
import styles from './TaskMoral.module.css';

interface TaskMoralProps {
  task: Task;
  onNext: () => void;
  isLast: boolean;
  sectionSlug: string;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

function parseMoral(text: string): { main: string; question: string | null } {
  // Двойной перенос = несколько абзацев одного тона (без отдельного «вопроса»).
  if (text.includes('\n\n')) {
    return { main: text.trim(), question: null };
  }

  const newlineIdx = text.indexOf('\n');
  if (newlineIdx !== -1) {
    return {
      main: text.slice(0, newlineIdx).trim(),
      question: text.slice(newlineIdx).trim().replace(/^\n+/, ''),
    };
  }

  // Split before last sentence ending with ?
  const match = text.match(/^(.*[.!])\s+([^.!]+\?)$/s);
  if (match) {
    return { main: match[1].trim(), question: match[2].trim() };
  }

  return { main: text, question: null };
}

function MoralParagraph({
  text,
  tooltips,
  className,
  onTermClick,
}: {
  text: string;
  tooltips: GlossaryTerm[];
  className: string;
  onTermClick: (t: GlossaryTerm) => void;
}) {
  if (!tooltips.length) {
    return <p className={className}>{text}</p>;
  }
  const segments = parseGlossarySegments(text, tooltips);
  return (
    <p className={className}>
      {segments.map((seg, i) =>
        seg.tooltip ? (
          <span
            key={i}
            className={styles.tooltipWord}
            onClick={() => onTermClick(seg.tooltip!)}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

export function TaskMoral({ task, onNext, isLast, sectionSlug, theme = 'orange', orientation = 'portrait' }: TaskMoralProps) {
  const navigate = useNavigate();
  const { main, question } = parseMoral(task.moral);
  const moralTooltips = task.moralTooltips ?? [];
  const [activeTooltip, setActiveTooltip] = useState<GlossaryTerm | null>(null);

  const description = (
    <>
      <MoralParagraph
        text={main}
        tooltips={moralTooltips}
        className={styles.moralText}
        onTermClick={setActiveTooltip}
      />
      {question && (
        <MoralParagraph
          text={question}
          tooltips={moralTooltips}
          className={`${styles.moralText} ${styles.moralQuestion}`}
          onTermClick={setActiveTooltip}
        />
      )}
    </>
  );

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <PopUp
        description={description}
        buttonLabel={isLast ? 'В меню' : 'Следующее задание'}
        onButtonClick={onNext}
        secondaryButtonLabel="Меню заданий"
        onSecondaryButtonClick={() => navigate(`/${sectionSlug}/tasks`)}
      />
      {activeTooltip && (
        <div className={styles.overlay} onClick={() => setActiveTooltip(null)}>
          <div className={styles.tooltipCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.tooltipWord_title}>
              {activeTooltip.word.charAt(0).toUpperCase() + activeTooltip.word.slice(1)}
            </p>
            <p className={styles.tooltipWord_text}>{activeTooltip.definition}</p>
            <Button label="Понятно" type="main" onClick={() => setActiveTooltip(null)} />
          </div>
        </div>
      )}
    </Background>
  );
}
