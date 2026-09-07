import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, Card, Icon, IconButton, PopUp } from '../../../components/ui';
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
  orientation = 'portrait',
}: GameProps) {
  const { t } = useTranslation('sharedGames2');
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

  const isPortrait = orientation === 'portrait';

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />

      <div className={`${styles.wrapper} ${isPortrait ? styles.wrapperPortrait : ''}`}>
        <div className={`${styles.main} ${isPortrait ? styles.mainPortrait : ''}`}>
          {step?.prompt && (
            <p className={`${styles.prompt} ${isPortrait ? styles.promptPortrait : ''}`}>{t(step.prompt)}</p>
          )}

          {isCardMode ? (
            <div className={`${styles.cardGrid} ${isPortrait ? styles.cardGridPortrait : ''}`}>
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
                const variantLabel = isAnswered && label ? t(label.title).toUpperCase() : t("ПИСЬМО 0{{num}}", { num: idx + 1 });
                return (
                  <Card
                    key={idx}
                    variant={variantLabel}
                    title={item.content?.description ? t(item.content.description) : item.title ? t(item.title) : ''}
                    description=""
                    size="l"
                    state={state}
                    onClick={() => handleHotspotClick(idx)}
                  />
                );
              })}
            </div>
          ) : (
            <div className={`${styles.stageContainer} ${isPortrait ? styles.stageContainerPortrait : ''}`}>
              <div className={`${styles.stage} ${isPortrait ? styles.stagePortrait : ''}`}>
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
                    isPortrait && styles.hotspotPortrait,
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
                          <Icon name="done" color="white" size="xs" className={styles.hotspotBadgeIcon} />
                          {t(label.title)}
                        </span>
                      )}
                      {isWrong && (
                        <span className={styles.hotspotBadgeError}>
                          <Icon name="close" color="white" size="xs" className={styles.hotspotBadgeIcon} />
                          {t("Ошибка")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={`${styles.footer} ${isPortrait ? styles.footerPortrait : ''}`}>
          <div className={styles.counter}>
            {t("Размечено: {{answeredCount}}/{{total}}", { answeredCount, total: items.length })}
          </div>
          <Button
            label={t("Готово")}
            type="secondary"
            onClick={handleSubmit}
            className={`${isPortrait ? styles.finishPortrait : ''} ${!allAnswered ? styles.finishDisabled : ''}`}
          />
        </div>
      </div>

      {activeIdx !== null && !popup && (
        <div className={styles.pickerOverlay} onClick={handleClosePicker}>
          <div
            className={`${styles.picker} ${isPortrait ? styles.pickerPortrait : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.pickerHeader}>
              <div className={styles.pickerTitle}>
                {activeItem?.title
                  ? t("Выбери тег для объекта №{{num}}", { num: (activeIdx ?? 0) + 1 })
                  : t("Выбери тег")}
              </div>
              <IconButton type="close" onClick={handleClosePicker} />
            </div>
            {activeItem?.boxTip && (
              <div className={styles.pickerBoxTip}>{t(activeItem.boxTip)}</div>
            )}
            <div className={`${styles.pickerOptions} ${isPortrait ? styles.pickerOptionsPortrait : ''}`}>
              {pickerLabels.map((label) => {
                const isChosen = activeIdx !== null && answers[activeIdx] === label.id;
                return (
                  <Button
                    key={label.id}
                    label={t(label.title)}
                    type="main"
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
                  ? t("Автопилот запущен.")
                  : t("Ты только что сделал дорогу немного безопаснее.")
                : isCardMode
                  ? t("Данные не точны.")
                  : t("Выполнять движение рискованно.")
            }
            description={
              popup.kind === 'success'
                ? isCardMode
                  ? t("Ты правильно классифицировал все объекты.")
                  : t("Ты только что сделал дорогу немного безопаснее.")
                : isCardMode
                  ? t("Тапни на карточки с ошибкой, чтобы увидеть подсказку и попробовать ещё раз.")
                  : t("Он не понимает, что перед ним. Нажми на объекты с ошибкой, чтобы увидеть подсказку.")
            }
            buttonLabel={popup.kind === 'success' ? t("Результаты") : t("Понятно")}
            onButtonClick={handlePopupAction}
          />
        </div>
      )}

      {hintFor !== null && items[hintFor] && (
        <div className={styles.overlay} onClick={handleHintClose}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              description={parseInstructionMarkup(
                t(items[hintFor].explanation),
                handleTermClick,
                `lg-hint-${hintFor}`,
                styles.termBtn,
              )}
              buttonLabel={t("Перевыбрать тег")}
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
              buttonLabel={t("Понятно")}
              onButtonClick={() => setActiveTerm(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
