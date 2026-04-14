import { useState, useCallback } from 'react';
import { Background, Button, Icon } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import styles from './BurnoutGame.module.css';

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

type ProfileState = 'default' | 'correct' | 'wrong';

function getProfileName(option: TaskOption, index: number): string {
  if (option.name) return option.name;
  const [first] = (option.text ?? '').split(',');
  return first?.trim() || `Профиль ${index + 1}`;
}

function getProfileRole(option: TaskOption): string {
  if (option.role) return option.role;
  const parts = (option.text ?? '').split(',');
  return parts.slice(1).join(',').trim();
}

export function BurnoutGame({
  task,
  onComplete,
  onBack,
  theme = 'orange',
  orientation = 'portrait',
}: GameProps) {
  const step = task.steps[0];
  const options = step?.options ?? [];

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [cardStates, setCardStates] = useState<Record<number, ProfileState>>({});
  const [lockedCorrect, setLockedCorrect] = useState<number | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [showInstruction, setShowInstruction] = useState(false);

  const hasInstruction = Boolean(task.instruction?.trim());

  const handleOpen = useCallback(
    (index: number) => {
      if (lockedCorrect !== null) return;
      setPopupIndex(index);
      setVisited((prev) => {
        if (prev.has(index)) return prev;
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    },
    [lockedCorrect],
  );

  const handleClose = useCallback(() => {
    setPopupIndex(null);
  }, []);

  const handleChoose = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;

      const name = getProfileName(option, index);
      const role = getProfileRole(option);
      const answer = [name, role].filter(Boolean).join(', ');

      if (option.correct) {
        setCardStates((prev) => ({ ...prev, [index]: 'correct' }));
        setLockedCorrect(index);
        setResults((prev) => [
          ...prev,
          { answer, correct: true, explanation: option.explanation },
        ]);
      } else {
        setCardStates((prev) => ({ ...prev, [index]: 'wrong' }));
      }
    },
    [options],
  );

  const handleRetry = useCallback(
    (index: number) => {
      setCardStates((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setPopupIndex(null);
    },
    [],
  );

  const handleFinish = useCallback(() => {
    onComplete(results);
  }, [onComplete, results]);

  if (!step) return null;

  const popupOption = popupIndex !== null ? options[popupIndex] : null;
  const popupState =
    popupIndex !== null ? cardStates[popupIndex] ?? 'default' : 'default';
  const overlayClass =
    orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;

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
        {step.prompt && <h2 className={styles.prompt}>{step.prompt}</h2>}

        <div className={styles.counter}>
          Изучено: {visited.size}/{options.length}
        </div>

        <div className={styles.grid}>
          {options.map((option, index) => {
            const state = cardStates[index] ?? 'default';
            const isVisited = visited.has(index);
            const isCorrect = state === 'correct';
            const isWrong = state === 'wrong';
            const isLockedElsewhere =
              lockedCorrect !== null && lockedCorrect !== index;

            const name = getProfileName(option, index);
            const role = getProfileRole(option);
            const quote = option.quote ?? '';

            const cellClasses = [
              styles.cell,
              isVisited && !isCorrect && !isWrong ? styles.cellVisited : '',
              isCorrect ? styles.cellCorrect : '',
              isWrong ? styles.cellWrong : '',
              isLockedElsewhere ? styles.cellDimmed : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={index}
                type="button"
                className={cellClasses}
                onClick={() => handleOpen(index)}
              >
                <span className={styles.visitedBadge}>
                  {isCorrect && <Icon name="done" color="blue" size="s" />}
                  {isWrong && <Icon name="close" color="red" size="s" />}
                  {!isCorrect && !isWrong && (
                    <span className={styles.questionMark}>?</span>
                  )}
                </span>
                <span className={styles.role}>{role}</span>
                <span className={styles.name}>{name}</span>
                {quote && <span className={styles.quote}>«{quote}»</span>}
              </button>
            );
          })}
        </div>
      </div>

      {popupOption && popupIndex !== null && (
        <div className={overlayClass}>
          <div
            className={[
              styles.popup,
              popupState === 'correct' ? styles.popupCorrect : '',
              popupState === 'wrong' ? styles.popupWrong : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {popupState === 'default' && (
              <button
                type="button"
                className={styles.popupClose}
                onClick={handleClose}
                aria-label="Закрыть"
              >
                <Icon name="close" color="red" size="s" />
              </button>
            )}

            <div className={styles.popupHeader}>
              <span className={styles.popupRole}>
                {getProfileRole(popupOption)}
              </span>
              <h3 className={styles.popupName}>
                {getProfileName(popupOption, popupIndex)}
              </h3>
            </div>

            {popupOption.quote && (
              <p className={styles.popupQuote}>«{popupOption.quote}»</p>
            )}

            {popupOption.details && popupOption.details.length > 0 && (
              <ul className={styles.popupDetails}>
                {popupOption.details.map((line, i) => (
                  <li key={i} className={styles.popupDetailItem}>
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {popupState === 'default' && (
              <div className={styles.popupAction}>
                <Button
                  label="Это он / она"
                  type="main"
                  onClick={() => handleChoose(popupIndex)}
                />
              </div>
            )}

            {popupState === 'correct' && (
              <>
                <div className={styles.feedbackCorrect}>
                  <Icon name="done" color="white" size="s" />
                  <p className={styles.feedbackText}>
                    {popupOption.explanation}
                  </p>
                </div>
                <Button
                  label="Результаты"
                  type="main"
                  onClick={handleFinish}
                />
              </>
            )}

            {popupState === 'wrong' && (
              <>
                <div className={styles.feedbackWrong}>
                  <Icon name="close" color="red" size="s" />
                  <p className={styles.feedbackText}>
                    {popupOption.explanation}
                  </p>
                </div>
                <Button
                  label="Попробовать ещё раз"
                  type="main"
                  onClick={() => handleRetry(popupIndex)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {showInstruction && hasInstruction && (
        <div className={overlayClass}>
          <div className={styles.instructionPanel}>
            <button
              type="button"
              className={styles.instructionClose}
              onClick={() => setShowInstruction(false)}
              aria-label="Закрыть инструкцию"
            >
              ×
            </button>
            <h2 className={styles.instructionTitle}>Как играть</h2>
            <p className={styles.instructionBody}>{task.instruction}</p>
          </div>
        </div>
      )}
    </Background>
  );
}
