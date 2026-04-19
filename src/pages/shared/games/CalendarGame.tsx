import { useCallback, useRef, useState } from 'react';
import { Background, Button, Icon, InfoButton, PopUp } from '../../../components/ui';
import type { Task, CalendarCardData } from '../../../types/game';
import { getWeekDays } from '../../../utils/calendarDays';
import { GameInstruction } from '../GameInstruction';
import { computeStartSlotFromClientY } from './calendarSlotMath';
import styles from './CalendarGame.module.css';

const SLOT_HEIGHT = 48;
const SLOT_COUNT  = 18;
const PADDING_V   = 40;

const DAYS = getWeekDays(3);

const formatDuration = (slots: number) => {
  const min = slots * 30;
  if (min < 60) return `${min} минут`;
  const h = min / 60;
  if (h === 1) return '1 час';
  if (h < 5) return `${h} часа`;
  return `${h} часов`;
};

const slotToTime = (slot: number) => {
  const m = 9 * 60 + slot * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

const colHeight = SLOT_COUNT * SLOT_HEIGHT + 2 * PADDING_V;

function getOccupied(
  day: string,
  placements: Record<string, { day: string; startSlot: number }>,
  cards: CalendarCardData[],
  excludeId = '',
): Set<number> {
  const set = new Set<number>();
  for (const c of cards) {
    if (c.isAnchor && c.anchorDay === day && c.anchorStartSlot != null) {
      for (let s = c.anchorStartSlot; s < c.anchorStartSlot + c.durationSlots; s++) set.add(s);
    }
  }
  for (const [id, p] of Object.entries(placements)) {
    if (id === excludeId || p.day !== day) continue;
    const c = cards.find(x => x.id === id);
    if (c) for (let s = p.startSlot; s < p.startSlot + c.durationSlots; s++) set.add(s);
  }
  return set;
}

function isCorrect(card: CalendarCardData, day: string, startSlot: number) {
  if (card.validDays && !card.validDays.includes(day)) return false;
  if (card.minStartSlot != null && startSlot < card.minStartSlot) return false;
  if (card.maxStartSlot != null && startSlot > card.maxStartSlot) return false;
  if (card.exactStartSlot != null && startSlot !== card.exactStartSlot) return false;
  return true;
}

interface Props {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
}

type Placement = { day: string; startSlot: number };

export function CalendarGame({ task, onComplete, onBack, theme = 'orange' }: Props) {
  const step = task.steps[0];
  const allCards: CalendarCardData[] = step?.calendarCards ?? [];
  const taskCards = allCards.filter(c => !c.isAnchor);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [hoverSlot, setHoverSlot] = useState<{ day: string; slot: number } | null>(null);
  const [conflict, setConflict] = useState<{ day: string; slot: number } | null>(null);
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  /** Выбор карточки тапом: затем тап по колонке дня ставит задачу (работает там, где нет HTML5 drag). */
  const [pickId, setPickId] = useState<string | null>(null);
  const suppressPoolClickRef = useRef(false);

  const allPlaced = taskCards.every(c => placements[c.id]);

  const hideDragImage = (e: React.DragEvent) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  };

  const getSlotFromEvent = (e: React.DragEvent<HTMLDivElement>, durationSlots: number) =>
    computeStartSlotFromClientY(e.clientY, e.currentTarget, PADDING_V, SLOT_HEIGHT, SLOT_COUNT, durationSlots);

  const commitPlacement = useCallback(
    (cardId: string, day: string, columnEl: HTMLDivElement, clientY: number) => {
      if (showResult) return;
      const card = taskCards.find((c) => c.id === cardId);
      if (!card) return;
      const slot = computeStartSlotFromClientY(
        clientY,
        columnEl,
        PADDING_V,
        SLOT_HEIGHT,
        SLOT_COUNT,
        card.durationSlots,
      );
      const occupied = getOccupied(day, placements, allCards, cardId);
      const hasConflict = Array.from({ length: card.durationSlots }, (_, i) => slot + i).some((s) =>
        occupied.has(s),
      );
      if (hasConflict) {
        setConflict({ day, slot });
        setTimeout(() => setConflict(null), 500);
      } else {
        setPlacements((prev) => ({ ...prev, [cardId]: { day, startSlot: slot } }));
        setPickId(null);
      }
      setDraggingId(null);
      setHoverSlot(null);
    },
    [showResult, taskCards, placements, allCards],
  );

  const handleDrop = (day: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingId || showResult) return;
    commitPlacement(draggingId, day, e.currentTarget, e.clientY);
  };

  const handleDayColumnClick = (day: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (showResult || !pickId) return;
    if ((e.target as HTMLElement).closest?.(`.${styles.placedCard}`)) return;
    commitPlacement(pickId, day, e.currentTarget, e.clientY);
  };

  const handlePlacedCardClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (results[cardId] === true) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const handleCheck = () => {
    const res: Record<string, boolean> = {};
    const nextPlacements: Record<string, Placement> = { ...placements };
    for (const card of taskCards) {
      const p = placements[card.id];
      const ok = p ? isCorrect(card, p.day, p.startSlot) : false;
      res[card.id] = ok;
      if (p && !ok) delete nextPlacements[card.id];
    }
    setPickId(null);
    setResults(res);
    setPlacements(nextPlacements);
    setShowResult(true);
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const allCorrect = correctCount === taskCards.length;

  if (!step) return null;

  return (
    <Background theme={theme} orientation="landscape" onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.gameRoot}>
        {step.prompt && <p className={styles.prompt}>{step.prompt}</p>}
        <div className={styles.layout}>

        {/* ══ LEFT: task pool ══ */}
        <div className={styles.pool}>
          <p className={styles.poolTitle}>Задачи</p>
          <div className={styles.poolList}>
            {taskCards.map(card => {
              const placed = !!placements[card.id];
              if (placed) return null;
              const ok = card.id in results ? results[card.id] : undefined;
              const isDragging = draggingId === card.id;
              return (
                <div
                  key={card.id}
                  draggable={!showResult}
                  className={`${styles.poolCard} ${isDragging ? styles.poolCardDragging : ''} ${pickId === card.id ? styles.poolCardPicked : ''} ${ok === true ? styles.poolCardCorrect : ''} ${ok === false ? styles.poolCardWrong : ''}`}
                  onDragStart={(e) => {
                    try {
                      e.dataTransfer.setData('text/plain', card.id);
                      e.dataTransfer.effectAllowed = 'move';
                    } catch {
                      /* Safari */
                    }
                    setPickId(null);
                    setDraggingId(card.id);
                    hideDragImage(e);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setHoverSlot(null);
                    suppressPoolClickRef.current = true;
                    window.setTimeout(() => {
                      suppressPoolClickRef.current = false;
                    }, 350);
                  }}
                  onClick={(e) => {
                    if (showResult) return;
                    if (suppressPoolClickRef.current) return;
                    if ((e.target as HTMLElement).closest('button')) return;
                    setPickId((prev) => (prev === card.id ? null : card.id));
                  }}
                >
                  <div className={styles.poolCardHeader}>
                    <p className={styles.poolCardTitle}>{card.title}</p>
                    <InfoButton
                      size="sm"
                      variant="dark"
                      onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                    />
                  </div>
                  <div className={styles.poolCardDurationRow}>
                    <Icon name="clock" color="blue" size="xs" />
                    <span className={styles.poolCardDurationText}>{formatDuration(card.durationSlots)}</span>
                  </div>
                  {ok === false && !placements[card.id] && (
                    <p className={styles.wrongNote}>{card.wrongExplanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT: calendar ══ */}
        <div className={styles.calendarArea}>
          <div className={styles.calendarScrollWrapper}>

            <div className={styles.calendarHeader}>
              <div className={styles.timeAxisHead} />
              {DAYS.map(d => (
                <div key={d.id} className={styles.dayHeader}>
                  <span className={styles.dayHeaderAbbr}>{d.abbr}</span>
                  <span className={styles.dayHeaderDate}>{d.date}</span>
                </div>
              ))}
            </div>

            <div className={styles.calendarBody}>

              <div className={styles.timeAxis} style={{ height: colHeight }}>
                {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
                  if (i % 2 !== 0) return null;
                  return (
                    <div key={i} className={styles.timeLabel} style={{ top: PADDING_V + i * SLOT_HEIGHT }}>
                      {slotToTime(i)}
                    </div>
                  );
                })}
              </div>

              {DAYS.map(day => {
                const activeDragId = draggingId ?? pickId ?? '';
                const occupied = getOccupied(day.id, placements, allCards, activeDragId);
                const draggingCard = draggingId ? taskCards.find((c) => c.id === draggingId) : null;

                let previewSlots: number[] = [];
                if (draggingCard && hoverSlot?.day === day.id) {
                  const startSlot = Math.min(hoverSlot.slot, SLOT_COUNT - draggingCard.durationSlots);
                  const hasConf = Array.from({ length: draggingCard.durationSlots }, (_, i) => startSlot + i).some(s => occupied.has(s));
                  if (!hasConf) previewSlots = Array.from({ length: draggingCard.durationSlots }, (_, i) => startSlot + i);
                }

                return (
                  <div
                    key={day.id}
                    className={`${styles.dayColumn} ${(draggingId || pickId) && !showResult ? styles.dayColumnTarget : ''}`}
                    style={{ height: colHeight }}
                    role="presentation"
                    onClick={(e) => handleDayColumnClick(day.id, e)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (!draggingId || showResult) return;
                      const card = taskCards.find((c) => c.id === draggingId);
                      if (!card) return;
                      setHoverSlot({ day: day.id, slot: getSlotFromEvent(e, card.durationSlots) });
                    }}
                    onDragLeave={() => setHoverSlot(null)}
                    onDrop={(e) => handleDrop(day.id, e)}
                  >
                    {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => (
                      <div
                        key={i}
                        className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf} ${conflict?.day === day.id && conflict.slot === i ? styles.slotConflict : ''}`}
                        style={{ top: PADDING_V + i * SLOT_HEIGHT, height: i < SLOT_COUNT ? SLOT_HEIGHT : 0 }}
                      />
                    ))}

                    {previewSlots.length > 0 && (
                      <div
                        className={styles.previewCard}
                        style={{ top: PADDING_V + previewSlots[0] * SLOT_HEIGHT + 2, height: previewSlots.length * SLOT_HEIGHT - 4 }}
                      >
                        {draggingCard?.title}
                      </div>
                    )}

                    {allCards.filter(c => c.isAnchor && c.anchorDay === day.id).map(card => (
                      <div
                        key={card.id}
                        className={styles.anchorCard}
                        style={{ top: PADDING_V + (card.anchorStartSlot ?? 0) * SLOT_HEIGHT + 2, height: card.durationSlots * SLOT_HEIGHT - 4 }}
                        onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                      >
                        <span className={styles.lockIcon}>🔒</span>
                        <span className={styles.cardTitle}>{card.title}</span>
                        <span className={styles.cardTime}>{slotToTime(card.anchorStartSlot ?? 0)}–{slotToTime((card.anchorStartSlot ?? 0) + card.durationSlots)}</span>
                      </div>
                    ))}

                    {taskCards.filter(c => placements[c.id]?.day === day.id).map(card => {
                      const p = placements[card.id];
                      const ok = card.id in results ? results[card.id] : undefined;
                      const lockedCorrect = ok === true;
                      return (
                        <div
                          key={card.id}
                          draggable={!showResult && !lockedCorrect}
                          className={`${styles.placedCard} ${ok === true ? styles.placedCorrect : ok === false ? styles.placedWrong : ''} ${draggingId === card.id ? styles.placedDragging : ''}`}
                          style={{ top: PADDING_V + p.startSlot * SLOT_HEIGHT + 2, height: card.durationSlots * SLOT_HEIGHT - 4 }}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            try {
                              e.dataTransfer.setData('text/plain', card.id);
                              e.dataTransfer.effectAllowed = 'move';
                            } catch {
                              /* Safari */
                            }
                            setDraggingId(card.id);
                            hideDragImage(e);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setHoverSlot(null);
                            suppressPoolClickRef.current = true;
                            window.setTimeout(() => {
                              suppressPoolClickRef.current = false;
                            }, 350);
                          }}
                          onClick={e => handlePlacedCardClick(card.id, e)}
                        >
                          <span className={styles.cardTitle}>{card.title}</span>
                          <div className={styles.placedCardMeta}>
                            <Icon name="clock" color="blue" size="xs" />
                            <span className={styles.placedCardDuration}>{formatDuration(card.durationSlots)}</span>
                          </div>
                          {!lockedCorrect && <span className={styles.removeHint}>✕</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>

          {!showResult && allPlaced && (
            <div className={styles.checkWrap}>
              <Button label="Проверить" type="main" onClick={handleCheck} />
            </div>
          )}
        </div>
        </div>
      </div>

      {tooltipCard && (
        <div className={styles.overlay} onClick={() => setTooltipCard(null)}>
          <div className={styles.tooltipCard} onClick={e => e.stopPropagation()}>
            <p className={styles.tooltipTitle}>{tooltipCard.title}</p>
            {!tooltipCard.isAnchor && (
              <div className={styles.tooltipDuration}>
                <Icon name="clock" color="blue" size="xs" />
                <span>{formatDuration(tooltipCard.durationSlots)}</span>
              </div>
            )}
            <p className={styles.tooltipText}>{tooltipCard.tooltip}</p>
            <button className={styles.tooltipClose} onClick={() => setTooltipCard(null)}>Понятно</button>
          </div>
        </div>
      )}

      {showResult && (
        <div className={styles.overlay}>
          <PopUp
            icon={allCorrect ? 'done' : 'close'}
            iconColor={allCorrect ? 'blue' : 'red'}
            title={allCorrect ? 'Неделя спланирована точно!' : `${correctCount} из ${taskCards.length} верно`}
            description={
              allCorrect
                ? 'Петя успел передать дела до отпуска, презентация готова к хуралу, стажёр получил инструктаж, а команда пообедала вместе.'
                : 'Неверные задачи вернулись в список слева. Там же написано, что не так. Верные остались в календаре — расставь остальное заново и снова нажми «Проверить».'
            }
            buttonLabel={allCorrect ? 'Результаты' : 'Посмотреть ошибки'}
            onButtonClick={() => {
              setShowResult(false);
              if (allCorrect) {
                onComplete([{ correct: true, answer: '', explanation: '' }]);
              }
            }}
          />
        </div>
      )}
    </Background>
  );
}
