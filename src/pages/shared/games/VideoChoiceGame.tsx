import { useCallback, useState } from 'react';
import { Background, Button, Player } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './VideoChoiceGame.module.css';

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

/**
 * Механика `video-choice` — «Тифлокомментарий».
 * Данные: task.steps[0].options[] — { text: жанр, name: название ролика, video: src }.
 * Экран выбора: кнопки-жанры → тап открывает полноэкранный ролик с тифлокомментарием.
 * По окончании ролика (или тапу по нему) — возврат к выбору. «Завершить» — под списком.
 */
export function VideoChoiceGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const options = step?.options ?? [];

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const closeVideo = useCallback(() => setPlayingIndex(null), []);

  const handleFinish = useCallback(() => {
    onComplete([{ answer: 'Просмотр', correct: true, explanation: '' }]);
  }, [onComplete]);

  const overlaySizeClass = orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;
  const playingOption = playingIndex !== null ? options[playingIndex] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <div className={styles.options}>
          {options.map((option, index) => (
            <div key={index} className={styles.optionItem}>
              <Button
                label={option.text || `Вариант ${index + 1}`}
                type="big"
                className={styles.optionButton}
                onClick={() => setPlayingIndex(index)}
              />
              {option.name && <p className={styles.optionName}>{option.name}</p>}
            </div>
          ))}
        </div>

        <div className={styles.finishWrap}>
          <Button label="Завершить" type="secondary" onClick={handleFinish} />
        </div>
      </div>

      {playingOption && (
        <div
          className={`${styles.overlay} ${overlaySizeClass}`}
          role="presentation"
          onClick={closeVideo}
        >
          <div className={styles.videoInner} onClick={(e) => e.stopPropagation()}>
            <Player
              title={playingOption.name || playingOption.text || ''}
              state="playing"
              orientation="horizontal"
              src={playingOption.video}
              showTitle={false}
              onPause={closeVideo}
              className={styles.player}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
