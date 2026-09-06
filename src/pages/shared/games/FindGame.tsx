import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Card, PopUp } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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

const VARIANT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function FindGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const { t } = useTranslation('sharedGames2');
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<Set<number>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  // tracks number of wrong attempts per step to switch from general hint to specific explanation
  const [wrongCountPerStep, setWrongCountPerStep] = useState<number[]>(() =>
    new Array(task.steps.length).fill(0)
  );

  const steps = task.steps;
  const step = steps[currentStep];
  const options = step?.options ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  const variantLabel = (index: number) =>
    VARIANT_LETTERS[index] ? t("Вариант {{letter}}", { letter: VARIANT_LETTERS[index] }) : t("Вариант {{n}}", { n: index + 1 });

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
        answer: option.text ? t(option.text) : variantLabel(index),
        correct: true,
        explanation: t(option.explanation),
      };
      setResults((prev) => [...prev, result]);
    }
  }, [selected, disabledOptions, options, task.feedback, t]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);

    const option = selected !== null ? options[selected] : null;
    if (!option) return;

    if (option.correct) {
      if (isLastStep) {
        onComplete(results);
      } else {
        setCurrentStep((prev) => prev + 1);
        setSelected(null);
        setDisabledOptions(new Set());
      }
    } else {
      // increment wrong count for this step
      setWrongCountPerStep((prev) => {
        const next = [...prev];
        next[currentStep] = (next[currentStep] ?? 0) + 1;
        return next;
      });
      setDisabledOptions((prev) => {
        const next = new Set(prev);
        next.add(selected!);
        return next;
      });
      setSelected(null);
    }
  }, [selected, options, isLastStep, results, onComplete, currentStep]);

  const getCardState = useCallback((index: number, option: TaskOption): 'default' | 'disabled' | 'pressed' => {
    if (disabledOptions.has(index)) return 'disabled';
    if (selected === index && option.correct) return 'pressed';
    if (selected === index && !option.correct) return 'disabled';
    return 'default';
  }, [selected, disabledOptions]);

  const getPopupDescription = useCallback((option: TaskOption): string => {
    if (option.correct) return t(option.explanation);
    // first wrong attempt: show hint (prefer per-option hint, fallback to step-level);
    // subsequent wrong attempts: show specific explanation of the clicked option
    const wrongCount = wrongCountPerStep[currentStep] ?? 0;
    if (wrongCount === 0) {
      return t(option.hint ?? step?.hints ?? option.explanation);
    }
    return t(option.explanation);
  }, [wrongCountPerStep, currentStep, step, t]);

  if (!step) return null;

  const selectedOption = selected !== null ? options[selected] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        {step.prompt && (() => {
          const lines = step.prompt.split('\n');
          const [appName, ...rest] = lines;
          return (
            <div className={styles.promptBlock}>
              {appName && <p className={styles.promptAppName}>{t(appName)}</p>}
              {rest.length > 0 && <p className={styles.prompt}>{t(rest.join('\n'))}</p>}
            </div>
          );
        })()}

        <div className={styles.content}>
          <div className={styles.imageColumn}>
            {step.image ? (
              <img
                src={step.image}
                alt={step.prompt ? t(step.prompt) : t("Изображение Задачи на день")}
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
                variant={variantLabel(index)}
                title={option.text ? t(option.text) : ''}
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
          <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
            <PopUp
              icon={selectedOption.correct ? 'done' : 'close'}
              iconColor={selectedOption.correct ? 'blue' : 'red'}
              title={selectedOption.correct ? t("Верно!") : t("Не совсем...")}
              description={getPopupDescription(selectedOption)}
              buttonLabel={
                selectedOption.correct
                  ? (isLastStep ? t("Результаты") : t("Дальше"))
                  : t("Попробуй ещё раз")
              }
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
