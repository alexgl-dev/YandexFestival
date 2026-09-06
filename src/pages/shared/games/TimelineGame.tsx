import { useCallback, useMemo, useRef, useState } from 'react';
import { Background, Button } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './TimelineGame.module.css';

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
 * Механика `timeline` — «История рекламы».
 * Данные: task.steps[0].blocks[] — { order: индекс эпохи (0..N-1), text: подпись периода, description: текст карточки, image? }.
 * Вертикальная шкала с перетаскиваемым ползунком (pointer events) + тап по делению + кнопки «Назад»/«Вперёд».
 * Индекс 0 — самая ранняя эпоха (верх шкалы), последний индекс — настоящее время (низ шкалы).
 */
export function TimelineGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];

  const blocks = useMemo(
    () =>
      (step?.blocks ?? [])
        .filter((b) => b.order !== null)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [step],
  );

  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const lastIndex = blocks.length - 1;
  const current = blocks[index];

  const updateFromClientY = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track || lastIndex <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setIndex(Math.round(ratio * lastIndex));
  }, [lastIndex]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromClientY(e.clientY);
  }, [updateFromClientY]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromClientY(e.clientY);
  }, [isDragging, updateFromClientY]);

  const stopDragging = useCallback(() => setIsDragging(false), []);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setIndex((i) => Math.min(lastIndex, i + 1)), [lastIndex]);

  const handleFinish = useCallback(() => {
    onComplete([
      {
        answer: current?.text ?? '',
        correct: true,
        explanation: 'Исследование истории рекламы завершено.',
      },
    ]);
  }, [current, onComplete]);

  if (!current) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.layout}>
        <div className={styles.trackCol}>
          <div
            ref={trackRef}
            className={styles.track}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div className={styles.trackLine} />
            {blocks.map((block, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.tick} ${i === index ? styles.tickActive : ''}`}
                style={{ top: lastIndex > 0 ? `${(i / lastIndex) * 100}%` : '0%' }}
                onClick={() => setIndex(i)}
                aria-label={block.text}
              />
            ))}
            <div
              className={styles.thumb}
              style={{ top: lastIndex > 0 ? `${(index / lastIndex) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className={styles.cardCol}>
          <p className={styles.counter}>{index + 1} / {blocks.length}</p>

          <div className={styles.card}>
            <span className={styles.badge}>{current.text}</span>
            <div className={`${styles.description} ui-scrollbar`}>
              <p className={styles.descriptionText}>{current.description}</p>
            </div>
          </div>

          <div className={styles.navRow}>
            <Button label="Назад" type="secondary" onClick={goPrev} className={index === 0 ? styles.navDisabled : ''} />
            <Button label="Вперёд" type="secondary" onClick={goNext} className={index === lastIndex ? styles.navDisabled : ''} />
          </div>

          <Button label="Завершить исследование" type="secondary" onClick={handleFinish} />
        </div>
      </div>
    </Background>
  );
}
