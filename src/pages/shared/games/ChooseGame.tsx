import { useState, useCallback } from 'react';
import { Background, Card, PopUp, Button } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import styles from './ChooseGame.module.css';

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

const VARIANT_LABELS = ['Вариант A', 'Вариант B', 'Вариант C', 'Вариант D', 'Вариант E', 'Вариант F'];

export function ChooseGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);

  const steps = task.steps;
  const step = steps[currentStep];
  const options = step?.options ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  // Image mode: options have images — use flip Card mechanic
  const isImageMode = options.length > 0 && options.every(o => !!o.image);

  const handleSelect = useCallback((index: number) => {
    if (selected !== null) return;
    const option = options[index];
    if (!option) return;

    setSelected(index);
    const result: GameResult = {
      answer: option.text || VARIANT_LABELS[index] || `Вариант ${index + 1}`,
      correct: option.correct,
      explanation: option.explanation,
    };
    setResults(prev => [...prev, result]);

    if (!isImageMode && task.feedback === 'instant') {
      setShowPopup(true);
    }
  }, [selected, options, task.feedback, isImageMode]);

  const handleProceed = useCallback(() => {
    if (isLastStep) {
      onComplete(results);
    } else {
      setCurrentStep(prev => prev + 1);
      setSelected(null);
    }
  }, [isLastStep, results, onComplete]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);
    if (isLastStep) {
      onComplete(results);
    } else {
      setCurrentStep(prev => prev + 1);
      setSelected(null);
    }
  }, [isLastStep, results, onComplete]);

  const getCardState = useCallback((index: number, option: TaskOption): 'default' | 'disabled' | 'flipped' | 'pressed' => {
    if (selected === null) return 'default';
    if (index === selected) return option.correct ? 'flipped' : 'disabled';
    return 'disabled';
  }, [selected]);

  if (!step) return null;

  const selectedOption = selected !== null ? options[selected] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        {step.prompt && (
          <p className={styles.prompt}>{step.prompt}</p>
        )}

        {isImageMode ? (
          <div className={styles.posterCards}>
            {options.map((option, index) => {
              const isSelected = selected === index;
              const isDimmed = selected !== null && !isSelected;
              const revealedState: 'flipped' | 'wrong' = option.correct ? 'flipped' : 'wrong';
              const revealedTitle = option.correct ? 'Верно!' : 'Не совсем...';
              const variantLabel = VARIANT_LABELS[index] || `Вариант ${index + 1}`;

              return (
                <div
                  key={index}
                  className={[
                    styles.flipCard,
                    isSelected ? styles.flipCardFlipped : '',
                    isDimmed ? styles.flipCardDimmed : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect(index)}
                >
                  <div className={styles.flipInner}>
                    <div className={`${styles.flipFace} ${styles.flipFront}`}>
                      <Card
                        variant={variantLabel}
                        title=""
                        description=""
                        image={option.image}
                        state="default"
                        size="l"
                      />
                    </div>
                    <div className={`${styles.flipFace} ${styles.flipBack}`}>
                      <Card
                        variant={variantLabel}
                        title={revealedTitle}
                        description={option.explanation}
                        image={option.image}
                        state={revealedState}
                        size="l"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.cards}>
            {options.map((option, index) => (
              <Card
                key={index}
                variant={VARIANT_LABELS[index] || `Вариант ${index + 1}`}
                title={option.text || ''}
                description=""
                image={option.image}
                hint={option.hint}
                size="l"
                state={getCardState(index, option)}
                onClick={() => handleSelect(index)}
              />
            ))}
          </div>
        )}

        {isImageMode && (
          <div className={styles.buttonSlot}>
            <Button
              label={isLastStep ? 'Результаты' : 'Дальше'}
              type="main"
              onClick={handleProceed}
              className={selected === null ? styles.buttonHidden : ''}
            />
          </div>
        )}

        {!isImageMode && showPopup && selectedOption && (
          <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
            <PopUp
              icon={selectedOption.correct ? 'done' : 'close'}
              iconColor={selectedOption.correct ? 'blue' : 'red'}
              title={selectedOption.correct ? 'Верно!' : 'Не совсем...'}
              description={selectedOption.explanation}
              buttonLabel={isLastStep ? 'Результаты' : 'Дальше'}
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
