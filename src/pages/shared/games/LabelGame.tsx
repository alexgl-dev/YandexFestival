import { useState, useMemo, useCallback } from 'react';
import { Background, Button, Card, Icon } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './LabelGame.module.css';

interface GameResult {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface GameProps {
  task: Task;
  onComplete: (results: GameResult[]) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

interface InstructionItem {
  feature: string;
  check: string;
}

interface ParsedInstruction {
  title: string;
  items: InstructionItem[];
}

function parseInstruction(text?: string): ParsedInstruction {
  if (!text) return { title: '', items: [] };
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: '', items: [] };

  const title = lines[0];
  const items = lines.slice(1).map((line) => {
    const numbered = line.match(/^\d+\.\s*(.+)$/);
    const content = numbered ? numbered[1] : line;
    const parts = content.split(/\s[—–-]\s/);
    if (parts.length >= 2) {
      return { feature: parts[0].trim(), check: parts.slice(1).join(' — ').trim() };
    }
    return { feature: '', check: content };
  });

  return { title, items };
}

export function LabelGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const items = step?.items ?? [];
  const labels = step?.labels ?? [];

  const parsedInstruction = useMemo(() => parseInstruction(task.instruction), [task.instruction]);
  const hasInstruction = parsedInstruction.items.length > 0 || parsedInstruction.title.length > 0;

  const [showInstruction, setShowInstruction] = useState(hasInstruction);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const allAnswered = items.length > 0 && items.every((_, idx) => answers[idx]);

  const handleLabelSelect = useCallback(
    (itemIdx: number, labelId: string) => {
      setAnswers((prev) => (prev[itemIdx] ? prev : { ...prev, [itemIdx]: labelId }));
    },
    [],
  );

  const handleFinish = useCallback(() => {
    const results: GameResult[] = items.map((item, idx) => {
      const chosenId = answers[idx];
      const label = labels.find((l) => l.id === chosenId);
      return {
        answer: label?.title ?? '',
        correct: chosenId === item.correctLabel,
        explanation: item.explanation,
      };
    });
    onComplete(results);
  }, [answers, items, labels, onComplete]);

  const overlayClass =
    orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      {hasInstruction && (
        <button
          type="button"
          className={styles.instructionToggle}
          onClick={() => setShowInstruction(true)}
          aria-label="Открыть инструкцию"
        >
          ?
        </button>
      )}
      <div className={styles.wrapper}>
        {step?.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        <div className={styles.grid}>
          {items.map((item, idx) => {
            const chosenId = answers[idx];
            const answered = Boolean(chosenId);

            const cardTitle = `Письмо №${idx + 1}`;
            const cardDescription = item.content?.description ?? '';

            return (
              <div key={idx} className={styles.cell}>
                <Card
                  variant="ПИСЬМО"
                  title={cardTitle}
                  description={cardDescription}
                  state="default"
                  size="m"
                  className={styles.card}
                />
                <div className={styles.cellButtons}>
                  {labels.map((label) => {
                    const isChosen = chosenId === label.id;
                    return (
                      <Button
                        key={label.id}
                        label={label.title}
                        type={isChosen ? 'big' : 'main'}
                        pressed={isChosen}
                        icon={
                          isChosen ? (
                            <Icon name="done" color="white" size="s" />
                          ) : undefined
                        }
                        onClick={() =>
                          answered ? undefined : handleLabelSelect(idx, label.id)
                        }
                        className={styles.labelBtn}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.finishRow}>
          <Button
            label="Готово"
            type="main"
            onClick={handleFinish}
            className={!allAnswered ? styles.finishDisabled : ''}
          />
        </div>
      </div>

      {showInstruction && hasInstruction && (
        <div className={overlayClass}>
          <div className={styles.instructionPanel}>
            <h2 className={styles.instructionTitle}>{parsedInstruction.title}</h2>
            <ol className={styles.instructionList}>
              {parsedInstruction.items.map((entry, i) => (
                <li key={i} className={styles.instructionItem}>
                  {entry.feature ? (
                    <>
                      <span className={styles.instructionFeature}>{entry.feature}</span>
                      <span className={styles.instructionDash}> — </span>
                      <span className={styles.instructionCheck}>{entry.check}</span>
                    </>
                  ) : (
                    <span className={styles.instructionCheck}>{entry.check}</span>
                  )}
                </li>
              ))}
            </ol>
            <Button
              label="Закрыть"
              type="main"
              onClick={() => setShowInstruction(false)}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
