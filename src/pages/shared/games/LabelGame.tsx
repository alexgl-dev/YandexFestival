import { useState, useCallback } from 'react';
import { Background, PopUp } from '../../../components/ui';
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

export function LabelGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0]; // label games use a single step with multiple items
  const items = step?.items ?? [];
  const labels = step?.labels ?? [];

  const [currentItem, setCurrentItem] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);

  const item = items[currentItem];
  const totalItems = items.length;
  const isLastItem = currentItem >= totalItems - 1;

  const handleLabelSelect = useCallback(
    (labelId: string) => {
      if (!item || showPopup) return;

      const selectedLabel = labels.find((l) => l.id === labelId);
      const isCorrect = item.correctLabel === labelId;

      const result: GameResult = {
        answer: selectedLabel?.title || labelId,
        correct: isCorrect,
        explanation: item.explanation,
      };

      setLastResult(result);
      setResults((prev) => [...prev, result]);
      setShowPopup(true);
    },
    [item, labels, showPopup],
  );

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);

    if (isLastItem) {
      onComplete(results);
    } else {
      setCurrentItem((prev) => prev + 1);
      setLastResult(null);
    }
  }, [isLastItem, results, onComplete]);

  if (!item) return null;

  const overlayClass =
    orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        {/* Progress indicator */}
        <p className={styles.counter}>
          {currentItem + 1} / {totalItems}
        </p>

        {/* Prompt */}
        {step?.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        {/* Item content */}
        <div className={styles.contentArea}>
          {item.content?.value && (
            <img
              src={item.content.value}
              alt={item.content.description || ''}
              className={styles.contentImage}
            />
          )}

          {item.content?.description && (
            <p className={styles.description}>{item.content.description}</p>
          )}
        </div>

        {/* Label buttons */}
        <div className={styles.labelsRow}>
          {labels.map((label) => {
            const colorClass =
              label.color === 'green'
                ? styles.labelGreen
                : label.color === 'red'
                  ? styles.labelRed
                  : '';

            return (
              <button
                key={label.id}
                className={`${styles.labelButton} ${colorClass}`}
                onClick={() => handleLabelSelect(label.id)}
              >
                {label.icon && (
                  <img src={label.icon} alt="" className={styles.labelIcon} />
                )}
                <span className={styles.labelText}>{label.title}</span>
              </button>
            );
          })}
        </div>

        {/* PopUp overlay */}
        {showPopup && lastResult && (
          <div className={overlayClass}>
            <PopUp
              icon={lastResult.correct ? 'done' : 'close'}
              iconColor={lastResult.correct ? 'blue' : 'red'}
              title={lastResult.correct ? 'Верно!' : 'Не совсем...'}
              description={lastResult.explanation}
              buttonLabel={isLastItem ? 'Результаты' : 'Дальше'}
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
