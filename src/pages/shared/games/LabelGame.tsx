import { useState, useCallback } from 'react';
import { Background, Button, Card, Icon, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './LabelGame.module.css';

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

type Popup = { kind: 'success' } | { kind: 'error' } | null;

export function LabelGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const items = step?.items ?? [];
  const labels = step?.labels ?? [];
  const image = step?.image;
  const isCardMode = !image && items.some((i) => !!i.content);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<Set<number>>(new Set());
  const [popup, setPopup] = useState<Popup>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = items.length > 0 && answeredCount === items.length;

  const handleHotspotClick = useCallback(
    (idx: number) => {
      if (popup) return;
      setActiveIdx((prev) => (prev === idx ? null : idx));
    },
    [popup],
  );

  const handlePickLabel = useCallback(
    (labelId: string) => {
      if (activeIdx === null) return;
      setAnswers((prev) => ({ ...prev, [activeIdx]: labelId }));
      setWrongIdx((prev) => {
        if (!prev.has(activeIdx)) return prev;
        const next = new Set(prev);
        next.delete(activeIdx);
        return next;
      });
      setActiveIdx(null);
    },
    [activeIdx],
  );

  const handleClosePicker = useCallback(() => setActiveIdx(null), []);

  const handleSubmit = useCallback(() => {
    if (!allAnswered) return;
    const wrong = new Set<number>();
    items.forEach((item, idx) => {
      if (answers[idx] !== item.correctLabel) wrong.add(idx);
    });
    if (wrong.size === 0) {
      setPopup({ kind: 'success' });
    } else {
      setWrongIdx(wrong);
      setPopup({ kind: 'error' });
    }
  }, [allAnswered, answers, items]);

  const handlePopupAction = useCallback(() => {
    if (!popup) return;
    if (popup.kind === 'success') {
      const results: GameResult[] = items.map((item, idx) => {
        const chosenId = answers[idx];
        const label = labels.find((l) => l.id === chosenId);
        return {
          answer: label?.title ?? '',
          correct: chosenId === item.correctLabel,
          explanation: item.explanation,
        };
      });
      onComplete(results);
      return;
    }
    setAnswers((prev) => {
      const next = { ...prev };
      wrongIdx.forEach((i) => delete next[i]);
      return next;
    });
    setPopup(null);
  }, [popup, items, answers, labels, onComplete, wrongIdx]);

  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />

      <div className={styles.wrapper}>
        {step?.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        {isCardMode ? (
          <div className={styles.cardGrid}>
            {items.map((item, idx) => {
              const chosenId = answers[idx];
              const label = labels.find((l) => l.id === chosenId);
              const isActive = activeIdx === idx;
              const isAnswered = !!chosenId;
              const isWrong = wrongIdx.has(idx);
              const state: 'default' | 'pressed' | 'flipped' | 'wrong' = isWrong
                ? 'wrong'
                : isActive
                  ? 'flipped'
                  : isAnswered
                    ? 'pressed'
                    : 'default';
              const variantLabel = isAnswered && label ? label.title.toUpperCase() : `ПИСЬМО 0${idx + 1}`;
              return (
                <Card
                  key={idx}
                  variant={variantLabel}
                  title={item.content?.description ?? item.title ?? ''}
                  description=""
                  size="l"
                  state={state}
                  onClick={() => handleHotspotClick(idx)}
                />
              );
            })}
          </div>
        ) : (
        <div className={styles.stageContainer}>
          <div className={styles.stage}>
          {image && (
            <img src={image} alt="" className={styles.stageImage} draggable={false} />
          )}

          {items.map((item, idx) => {
            const box = item.box;
            if (!box) return null;
            const chosenId = answers[idx];
            const label = labels.find((l) => l.id === chosenId);
            const isActive = activeIdx === idx;
            const isAnswered = !!chosenId;
            const isWrong = wrongIdx.has(idx);

            const cls = [
              styles.hotspot,
              !isAnswered && !isWrong && styles.hotspotIdle,
              isAnswered && !isWrong && styles.hotspotDone,
              isActive && styles.hotspotActive,
              isWrong && styles.hotspotWrong,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={idx}
                type="button"
                className={cls}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                onClick={() => handleHotspotClick(idx)}
              >
                <span className={styles.hotspotNumber}>{idx + 1}</span>
                {isAnswered && !isWrong && label && (
                  <span className={styles.hotspotBadge}>
                    <Icon name="done" color="white" size="s" />
                    {label.title}
                  </span>
                )}
                {isWrong && (
                  <span className={styles.hotspotBadgeError}>
                    <Icon name="close" color="white" size="s" />
                    Ошибка
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </div>
        )}

        <div className={styles.footer}>
          <div className={styles.counter}>
            Размечено: {answeredCount}/{items.length}
          </div>
          <Button
            label="Готово"
            type="main"
            onClick={handleSubmit}
            className={!allAnswered ? styles.finishDisabled : ''}
          />
        </div>
      </div>

      {activeIdx !== null && !popup && (
        <div className={styles.pickerOverlay} onClick={handleClosePicker}>
          <div className={styles.picker} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <div className={styles.pickerTitle}>
                Выбери тег{activeItem?.title ? ` для объекта №${(activeIdx ?? 0) + 1}` : ''}
              </div>
              <button
                type="button"
                className={styles.pickerClose}
                onClick={handleClosePicker}
                aria-label="Закрыть"
              >
                <Icon name="close" color="red" size="s" />
              </button>
            </div>
            <div className={styles.pickerOptions}>
              {labels.map((label) => {
                const isChosen = activeIdx !== null && answers[activeIdx] === label.id;
                return (
                  <Button
                    key={label.id}
                    label={label.title}
                    type={isChosen ? 'big' : 'main'}
                    pressed={isChosen}
                    onClick={() => handlePickLabel(label.id)}
                    className={styles.pickerBtn}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {popup && (popup.kind === 'success' || popup.kind === 'error') && (
        <div className={styles.overlay}>
          <PopUp
            icon={popup.kind === 'success' ? 'done' : 'close'}
            iconColor={popup.kind === 'success' ? 'blue' : 'red'}
            title={
              popup.kind === 'success'
                ? isCardMode
                  ? 'Всё верно!'
                  : 'Автопилот запущен'
                : isCardMode
                  ? 'Есть ошибки'
                  : 'Автопилот не может тронуться'
            }
            description={
              popup.kind === 'success'
                ? isCardMode
                  ? 'Ты правильно классифицировал все объекты.'
                  : 'Ты только что сделал дорогу немного безопаснее.'
                : isCardMode
                  ? 'Попробуй ещё раз — посмотри на красные карточки.'
                  : 'Он не понимает, что перед ним. Попробуй ещё раз — посмотри на красные объекты.'
            }
            buttonLabel={popup.kind === 'success' ? 'Результаты' : 'Попробовать ещё'}
            onButtonClick={handlePopupAction}
          />
        </div>
      )}
    </Background>
  );
}
