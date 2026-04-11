import { useState, useCallback } from 'react';
import { Background, Card, PopUp } from '../../../components/ui';
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

    setResults((prev) => [...prev, result]);

    if (task.feedback === 'instant') {
      setShowPopup(true);
    }
  }, [selected, options, task.feedback]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);

    if (isLastStep) {
      // results already includes current pick from handleSelect
      onComplete(results);
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelected(null);
    }
  }, [isLastStep, selected, options, results, onComplete]);

  const getCardState = useCallback((index: number, option: TaskOption): 'default' | 'disabled' | 'flipped' | 'pressed' => {
    if (selected === null) return 'default';
    if (index === selected) {
      return option.correct ? 'flipped' : 'disabled';
    }
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

        {showPopup && selectedOption && (
          <div className={styles.overlay}>
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
