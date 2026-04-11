import { useState, useCallback, useMemo, useRef } from 'react';
import { Background, Button, PopUp } from '../../../components/ui';
import type { Task, TaskPair } from '../../../types/game';
import styles from './MatchGame.module.css';

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

/** Parse description text with [term]{tooltip: "..."} syntax — renders term as highlighted span */
function parseDescription(text: string): React.ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"[^"]*"\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className={styles.termHighlight}>
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Shuffle array using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const pairs: TaskPair[] = step?.pairs ?? [];

  // Shuffled right-side indices (stable across renders)
  const shuffledRightIndices = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [wrongLeft, setWrongLeft] = useState<number | null>(null);
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<GameResult[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const isProcessing = useRef(false);

  const handleLeftTap = useCallback((index: number) => {
    if (matchedPairs.has(index) || isProcessing.current) return;
    setSelectedLeft((prev) => (prev === index ? null : index));
  }, [matchedPairs]);

  const handleRightTap = useCallback((pairIndex: number) => {
    if (matchedPairs.has(pairIndex) || selectedLeft === null || isProcessing.current) return;

    isProcessing.current = true;
    const isCorrect = selectedLeft === pairIndex;
    const pair = pairs[selectedLeft];

    const result: GameResult = {
      answer: `${pair?.left.label || pair?.left.description || 'Left'} → ${pairs[pairIndex]?.right.label || 'Right'}`,
      correct: isCorrect,
      explanation: pair?.explanation || '',
    };

    if (isCorrect) {
      setMatchedPairs((prev) => {
        const next = new Set(prev);
        next.add(pairIndex);
        return next;
      });
      setSelectedLeft(null);

      const updatedResults = [...results, result];
      setResults(updatedResults);

      // Check if all matched
      if (updatedResults.filter((r) => r.correct).length === pairs.length) {
        setTimeout(() => {
          if (task.feedback === 'instant') {
            setShowPopup(true);
          } else {
            onComplete(updatedResults);
          }
        }, 600);
      }

      isProcessing.current = false;
    } else {
      setWrongLeft(selectedLeft);
      setWrongRight(pairIndex);
      setResults((prev) => [...prev, result]);

      setTimeout(() => {
        setWrongLeft(null);
        setWrongRight(null);
        setSelectedLeft(null);
        isProcessing.current = false;
      }, 600);
    }
  }, [matchedPairs, selectedLeft, pairs, results, task.feedback, onComplete]);

  const handleRevealHint = useCallback((index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const getLeftCardClass = (index: number): string => {
    const classes = [styles.card];
    if (matchedPairs.has(index)) {
      classes.push(styles.cardCorrect, styles.cardMatched);
    } else if (wrongLeft === index) {
      classes.push(styles.cardWrong);
    } else if (selectedLeft === index) {
      classes.push(styles.cardSelected);
    }
    return classes.join(' ');
  };

  const getRightCardClass = (pairIndex: number): string => {
    const classes = [styles.card];
    if (matchedPairs.has(pairIndex)) {
      classes.push(styles.cardCorrect, styles.cardMatched);
    } else if (wrongRight === pairIndex) {
      classes.push(styles.cardWrong);
    }
    return classes.join(' ');
  };

  const renderLeftCard = (pair: TaskPair, index: number) => {
    const { left } = pair;

    if (left.type === 'character') {
      return (
        <div key={index} className={getLeftCardClass(index)} onClick={() => handleLeftTap(index)}>
          <div className={styles.characterRow}>
            {left.avatar && (
              <img src={left.avatar} alt="" className={styles.avatar} />
            )}
            {left.description && (
              <p className={styles.descriptionText}>
                {parseDescription(left.description)}
              </p>
            )}
          </div>
          {left.label && <p className={styles.cardLabel}>{left.label}</p>}
        </div>
      );
    }

    // type === 'code' or 'image'
    const isHidden = left.hidden === true && !revealedHints.has(index);
    const hintLabel = (left as Record<string, unknown>).hintLabel as string | undefined;

    return (
      <div key={index} className={getLeftCardClass(index)} onClick={() => !isHidden && handleLeftTap(index)}>
        {isHidden ? (
          <div className={styles.hiddenPlaceholder}>
            <Button
              label={hintLabel || 'Подсказка'}
              type="outline"
              onClick={() => handleRevealHint(index)}
            />
          </div>
        ) : (
          <>
            {left.image && (
              <img src={left.image} alt={left.label || ''} className={styles.cardImage} />
            )}
            {left.label && <p className={styles.cardLabel}>{left.label}</p>}
          </>
        )}
      </div>
    );
  };

  const renderRightCard = (pairIndex: number) => {
    const pair = pairs[pairIndex];
    if (!pair) return null;
    const { right } = pair;

    return (
      <div
        key={pairIndex}
        className={getRightCardClass(pairIndex)}
        onClick={() => handleRightTap(pairIndex)}
      >
        {right.image && (
          <img src={right.image} alt={right.label || ''} className={styles.cardImage} />
        )}
        {right.label && <p className={styles.cardLabel}>{right.label}</p>}
      </div>
    );
  };

  const allCorrect = results.filter((r) => r.correct).length === pairs.length;
  const overlayClass = orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        {step?.prompt && (
          <p className={styles.prompt}>{step.prompt}</p>
        )}

        <div className={styles.columns}>
          <div className={styles.column}>
            {pairs.map((pair, index) => renderLeftCard(pair, index))}
          </div>

          <div className={styles.column}>
            {shuffledRightIndices.map((pairIndex) => renderRightCard(pairIndex))}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className={overlayClass}>
          <PopUp
            icon={allCorrect ? 'done' : 'close'}
            iconColor={allCorrect ? 'blue' : 'red'}
            title={allCorrect ? 'Отлично!' : 'Результаты'}
            description={
              allCorrect
                ? 'Все пары найдены верно!'
                : `Верных совпадений: ${results.filter((r) => r.correct).length} из ${pairs.length}`
            }
            buttonLabel="Далее"
            onButtonClick={() => {
              setShowPopup(false);
              onComplete(results);
            }}
          />
        </div>
      )}
    </Background>
  );
}
