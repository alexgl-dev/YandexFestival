import { useState, useCallback, useMemo } from 'react';
import { Background, Button, Card, Icon, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import { parseInstructionMarkup } from '../instructionMarkup';
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
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);
  const [hintFor, setHintFor] = useState<number | null>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = items.length > 0 && answeredCount === items.length;

  const handleHotspotClick = useCallback(
    (idx: number) => {
      if (popup) return;
      // Wrong hotspot → show hint first; on close the picker opens
      if (wrongIdx.has(idx)) {
        setHintFor(idx);
        return;
      }
      setActiveIdx((prev) => (prev === idx ? null : idx));
    },
    [popup, wrongIdx],
  );

  const handleHintClose = useCallback(() => {
    const idx = hintFor;
    setHintFor(null);
    if (idx !== null) setActiveIdx(idx);
  }, [hintFor]);

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
    setActiveTerm(null);
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
    // Error: keep wrong answers visible so user can tap red hotspots for hints
    setPopup(null);
  }, [popup, items, answers, labels, onComplete]);

  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  const pickerLabels = useMemo(() => {
    if (!activeItem?.options?.length) return labels;
    return activeItem.options
      .map((id) => labels.find((l) => l.id === id))
      .filter((l): l is NonNullable<typeof l> => !!l);
  }, [activeItem, labels]);

  const handleTermClick = useCallback((term: string, definition: string) => {
    setActiveTerm({ term, definition });
  }, []);

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
            {activeItem?.boxTip && (
              <div className={styles.pickerBoxTip}>{activeItem.boxTip}</div>
            )}
            <div className={styles.pickerOptions}>
              {pickerLabels.map((label) => {
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
                  ? 'Автопилот запущен.'
                  : 'Ты только что сделал дорогу немного безопаснее.'
                : isCardMode
                  ? 'Данные не точны.'
                  : 'Выполнять движение рискованно.'
            }
            description={
              popup.kind === 'success'
                ? isCardMode
                  ? 'Ты правильно классифицировал все объекты.'
                  : 'Ты только что сделал дорогу немного безопаснее.'
                : isCardMode
                  ? 'Тапни на карточки с ошибкой, чтобы увидеть подсказку и попробовать ещё раз.'
                  : 'Он не понимает, что перед ним. Нажми на объекты с ошибкой, чтобы увидеть подсказку.'
            }
            buttonLabel={popup.kind === 'success' ? 'Результаты' : 'Понятно'}
            onButtonClick={handlePopupAction}
          />
        </div>
      )}

      {hintFor !== null && items[hintFor] && (
        <div className={styles.overlay} onClick={handleHintClose}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              description={parseInstructionMarkup(
                items[hintFor].explanation,
                handleTermClick,
                `lg-hint-${hintFor}`,
                styles.termBtn,
              )}
              buttonLabel="Перевыбрать тег"
              onButtonClick={handleHintClose}
            />
          </div>
        </div>
      )}

      {activeTerm && (
        <div className={styles.termOverlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTerm.term.charAt(0).toUpperCase() + activeTerm.term.slice(1)}
              description={activeTerm.definition}
              buttonLabel="Понятно"
              onButtonClick={() => setActiveTerm(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
