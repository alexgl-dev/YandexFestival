import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './TeamPickGame.module.css';

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

function optionKey(option: TaskOption, index: number): string {
  return option.name ?? option.text ?? `opt-${index}`;
}

/**
 * Механика `team-pick` — «Собери команду» (FirstFlow креативного директора).
 * Данные: steps[0].options[] (correct = нужный специалист), stageImages[] — кадры сцены.
 * Верный тап → кнопка «занята», кадр +1. Неверный → тряска. Все верные → onComplete.
 */
export function TeamPickGame({
  task,
  onComplete,
  onBack,
  theme = 'orange',
  orientation = 'portrait',
}: GameProps) {
  const { t } = useTranslation('sharedGames2');
  const step = task.steps[0];
  const options = useMemo(() => step?.options ?? [], [step]);
  const stageImages = useMemo(() => step?.stageImages ?? [], [step]);

  const correctKeys = useMemo(
    () =>
      new Set(
        options
          .map((opt, i) => ({ opt, key: optionKey(opt, i) }))
          .filter(({ opt }) => opt.correct)
          .map(({ key }) => key)
      ),
    [options]
  );

  const [placed, setPlaced] = useState<Set<string>>(() => new Set());
  const [shakingKey, setShakingKey] = useState<string | null>(null);

  const stageIndex = Math.min(placed.size, Math.max(stageImages.length - 1, 0));
  const stageSrc = stageImages[stageIndex] ?? stageImages[0];

  const handlePick = (option: TaskOption, index: number) => {
    const key = optionKey(option, index);
    if (placed.has(key) || shakingKey) return;

    if (correctKeys.has(key)) {
      const next = new Set(placed);
      next.add(key);
      setPlaced(next);

      if (next.size >= correctKeys.size) {
        window.setTimeout(() => {
          onComplete(
            [...correctKeys].map((answer) => ({
              answer,
              correct: true,
              explanation: '',
            }))
          );
        }, 500);
      }
      return;
    }

    setShakingKey(key);
    window.setTimeout(() => setShakingKey(null), 600);
  };

  if (!step || !stageSrc) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      {task.instruction?.trim() && (
        <GameInstruction instruction={task.instruction} initialOpen={false} />
      )}

      <div className={styles.root}>
        <div className={styles.stage}>
          <img src={stageSrc} alt="" className={styles.stageImage} />
        </div>

        <div className={styles.panel}>
          {options.map((option, index) => {
            const key = optionKey(option, index);
            const isPlaced = placed.has(key);
            const isShaking = shakingKey === key;
            const label = t(option.text ?? '');

            return (
              <Button
                key={key}
                label={label}
                type="main"
                pressed={isPlaced}
                className={`${styles.pickBtn} ${isPlaced ? styles.placed : ''} ${isShaking ? styles.shaking : ''}`}
                onClick={() => handlePick(option, index)}
              />
            );
          })}
        </div>
      </div>
    </Background>
  );
}
