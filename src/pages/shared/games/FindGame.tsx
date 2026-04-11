import { useState, useCallback } from 'react';
import { Background, Card, PopUp } from '../../../components/ui';
import { ShopMockup, MessengerMockup, MusicMockup } from './FindBugMockups';
import type { Task, TaskOption } from '../../../types/game';
import styles from './FindGame.module.css';

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

export function FindGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<Set<number>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);

  const steps = task.steps;
  const step = steps[currentStep];
  const options = step?.options ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  const handleSelect = useCallback((index: number) => {
    if (disabledOptions.has(index)) return;
    if (selected !== null) return;

    const option = options[index];
    if (!option) return;

    setSelected(index);

    if (task.feedback === 'instant') {
      setShowPopup(true);
    }

    if (option.correct) {
      const result: GameResult = {
        answer: option.text || VARIANT_LABELS[index] || `Вариант ${index + 1}`,
        correct: true,
        explanation: option.explanation,
      };
      setResults((prev) => [...prev, result]);
    }
  }, [selected, disabledOptions, options, task.feedback]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);

    const option = selected !== null ? options[selected] : null;
    if (!option) return;

    if (option.correct) {
      // Advance to next step or complete
      if (isLastStep) {
        onComplete(results);
      } else {
        setCurrentStep((prev) => prev + 1);
        setSelected(null);
        setDisabledOptions(new Set());
      }
    } else {
      // Wrong answer: disable this option, let user try again
      setDisabledOptions((prev) => {
        const next = new Set(prev);
        next.add(selected!);
        return next;
      });
      setSelected(null);
    }
  }, [selected, options, isLastStep, results, onComplete]);

  const getCardState = useCallback((index: number, option: TaskOption): 'default' | 'disabled' | 'pressed' => {
    if (disabledOptions.has(index)) return 'disabled';
    if (selected === index && option.correct) return 'pressed';
    if (selected === index && !option.correct) return 'disabled';
    return 'default';
  }, [selected, disabledOptions]);

  if (!step) return null;

  const selectedOption = selected !== null ? options[selected] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        {step.prompt && (
          <p className={styles.prompt}>{step.prompt}</p>
        )}


        <div className={styles.content}>
          <div className={styles.imageColumn}>
            {step.image?.includes('find-bug/screen1') ? (
              <ShopMockup />
            ) : step.image?.includes('find-bug/screen2') ? (
              <MessengerMockup />
            ) : step.image?.includes('find-bug/screen3') ? (
              <MusicMockup />
            ) : step.image ? (
              <img
                src={step.image}
                alt={step.prompt || 'Изображение задания'}
                className={styles.image}
              />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>

          <div className={styles.optionsColumn}>
            {options.map((option, index) => (
              <Card
                key={index}
                variant={VARIANT_LABELS[index] || `Вариант ${index + 1}`}
                title={option.text || ''}
                description=""
                hint={option.hint}
                size="m"
                state={getCardState(index, option)}
                onClick={() => handleSelect(index)}
              />
            ))}
          </div>
        </div>

        {showPopup && selectedOption && (
          <div className={styles.overlay}>
            <PopUp
              icon={selectedOption.correct ? 'done' : 'close'}
              iconColor={selectedOption.correct ? 'blue' : 'red'}
              title={selectedOption.correct ? 'Верно!' : 'Не совсем...'}
              description={selectedOption.correct ? selectedOption.explanation : (selectedOption.hint || selectedOption.explanation)}
              buttonLabel={selectedOption.correct && isLastStep ? 'Результаты' : selectedOption.correct ? 'Дальше' : 'Попробовать ещё'}
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
