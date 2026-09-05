import { useMemo, useState } from 'react';
import { Background, Button, Card, PopUp } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './QuizGame.module.css';

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

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Phase = 'question' | 'summary';

/**
 * Механика `quiz` — последовательные вопросы с текстовыми вариантами (Card size="m").
 * Один вопрос на экран, варианты перемешиваются при переходе к шагу.
 * После выбора обе карточки раскрываются (верная — pressed, неверная — wrong) + PopUp с пояснением.
 * В конце — сводный PopUp «Ты угадал X из N» → onComplete.
 */
export function QuizGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const steps = task.steps;
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [phase, setPhase] = useState<Phase>('question');

  const step = steps[currentStep];

  const shuffledOptions = useMemo<TaskOption[]>(
    () => shuffle(step?.options ?? []),
    [currentStep, steps, step],
  );

  const isLastStep = currentStep >= totalSteps - 1;
  const selectedOption = selected !== null ? shuffledOptions[selected] : null;
  const correctCount = results.filter((r) => r.correct).length;

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
  };

  const handlePopupNext = () => {
    if (selected !== null && selectedOption) {
      const label = VARIANT_LABELS[selected] || `Вариант ${selected + 1}`;
      setResults((prev) => [
        ...prev,
        { answer: label, correct: selectedOption.correct, explanation: selectedOption.explanation },
      ]);
    }
    setSelected(null);
    if (isLastStep) {
      setPhase('summary');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    onComplete(results);
  };

  const overlayClass = `${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`;

  if (phase === 'summary') {
    return (
      <Background theme={theme} orientation={orientation} onBack={onBack}>
        <div className={overlayClass}>
          <PopUp
            icon="done"
            iconColor="blue"
            title="Готово!"
            description={`Ты угадал ${correctCount} из ${totalSteps}`}
            buttonLabel="Результаты"
            onButtonClick={handleFinish}
          />
        </div>
      </Background>
    );
  }

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={`${styles.wrapper} ${orientation === 'portrait' ? styles.wrapperPortrait : ''}`}>
        {step.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        <div className={`${styles.optionsRow} ${orientation === 'portrait' ? styles.optionsRowPortrait : ''}`}>
          {shuffledOptions.map((option, index) => {
            const state = selected === null ? 'default' : option.correct ? 'pressed' : 'wrong';
            const isDisabled = selected !== null;

            return (
              <div key={index} className={styles.optionColumn}>
                <Card
                  variant={VARIANT_LABELS[index] || `Вариант ${index + 1}`}
                  title={option.text || ''}
                  description=""
                  size="m"
                  state={state}
                  onClick={() => handleSelect(index)}
                />
                <Button
                  label="Это Алиса"
                  type="secondary"
                  onClick={() => handleSelect(index)}
                  className={isDisabled ? styles.answerButtonDisabled : ''}
                />
              </div>
            );
          })}
        </div>

        <p className={styles.counter}>
          {currentStep + 1} / {totalSteps}
        </p>
      </div>

      {selected !== null && selectedOption && (
        <div className={overlayClass}>
          <PopUp
            icon={selectedOption.correct ? 'done' : 'close'}
            iconColor={selectedOption.correct ? 'blue' : 'red'}
            title={selectedOption.correct ? 'Верно!' : 'Не совсем...'}
            description={selectedOption.explanation}
            buttonLabel="Дальше"
            onButtonClick={handlePopupNext}
          />
        </div>
      )}
    </Background>
  );
}
