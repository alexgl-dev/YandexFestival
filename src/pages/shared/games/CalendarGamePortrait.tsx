import { useState, useRef, useEffect } from 'react';
import { Background, Button, Icon, IconButton, InfoButton, PopUp } from '../../../components/ui';
import type { Task, CalendarCardData } from '../../../types/game';
import { getWeekDays } from '../../../utils/calendarDays';
import styles from './CalendarGamePortrait.module.css';

const SLOT_COUNT = 18;    // 9:00 → 18:00
const PADDING_V  = 48;    // space before 9:00 and after 18:00

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

const DAYS = getWeekDays(3);

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

export function CalendarGamePortrait({ task, onComplete, onBack, theme = 'orange' }: Props) {
  const step = task.steps[0];
  const allCards: CalendarCardData[] = step?.calendarCards ?? [];
  const taskCards = allCards.filter(c => !c.isAnchor);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [hoverSlot, setHoverSlot] = useState<{ day: string; slot: number } | null>(null);
  const [conflict, setConflict] = useState<{ day: string; slot: number } | null>(null);
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  // ── Proportional slot height ──
  const bodyRef = useRef<HTMLDivElement>(null);
  const [slotH, setSlotH] = useState(56);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      if (h > 0) setSlotH((h - PADDING_V * 2) / SLOT_COUNT);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const colH = SLOT_COUNT * slotH + PADDING_V * 2;
  const allPlaced = taskCards.every(c => placements[c.id]);

  const hideDragImage = (e: React.DragEvent) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    e.dataTransfer.setDragImage(canvas, 0, 0);
  };

  const getSlotFromDrag = (e: React.DragEvent<HTMLDivElement>, durationSlots: number) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const toLayout = el.offsetHeight / rect.height;
    const relY = (e.clientY - rect.top) * toLayout - PADDING_V;
    return Math.min(Math.max(0, Math.round(relY / slotH)), SLOT_COUNT - durationSlots);
  };

  const handleDrop = (day: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggingId || checked) return;
    const card = taskCards.find(c => c.id === draggingId);
    if (!card) return;
    const slot = getSlotFromDrag(e, card.durationSlots);
    const occupied = getOccupied(day, placements, allCards, draggingId);
    const hasConflict = Array.from({ length: card.durationSlots }, (_, i) => slot + i).some(s => occupied.has(s));
    if (hasConflict) {
      setConflict({ day, slot });
      setTimeout(() => setConflict(null), 500);
    } else {
      setPlacements(prev => ({ ...prev, [draggingId]: { day, startSlot: slot } }));
    }
    setDraggingId(null);
    setHoverSlot(null);
  };

  const handlePlacedCardClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (checked) return;
    setPlacements(prev => { const next = { ...prev }; delete next[cardId]; return next; });
  };

  const handleCheck = () => {
    const res: Record<string, boolean> = {};
    for (const card of taskCards) {
      const p = placements[card.id];
      res[card.id] = p ? isCorrect(card, p.day, p.startSlot) : false;
    }
    setResults(res);
    setChecked(true);
    setShowResult(true);
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const allCorrect = correctCount === taskCards.length;

  if (!step) return null;

  return (
    <Background theme={theme} orientation="portrait" showBackButton={false}>
      <div className={styles.wrapper}>
      <div className={styles.layout}>

        {/* ══ LEFT: fixed task pool ══ */}
        <div className={styles.pool}>
          <p className={styles.poolTitle}>Задачи</p>
          <div className={styles.poolList}>
            {taskCards.map(card => {
              const placed = !!placements[card.id];
              if (placed && !checked) return null;
              const ok = checked ? results[card.id] : undefined;
              const isDragging = draggingId === card.id;
              return (
                <div
                  key={card.id}
                  draggable={!checked}
                  className={`${styles.poolCard} ${isDragging ? styles.poolCardDragging : ''} ${checked && ok ? styles.poolCardCorrect : ''} ${checked && ok === false ? styles.poolCardWrong : ''}`}
                  onDragStart={e => { setDraggingId(card.id); hideDragImage(e); }}
                  onDragEnd={() => { setDraggingId(null); setHoverSlot(null); }}
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
                  {checked && ok === false && placements[card.id] && (
                    <p className={styles.wrongNote}>{card.wrongExplanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          {!checked && allPlaced && (
            <div className={styles.checkWrap}>
              <Button label="Проверить" type="main" onClick={handleCheck} />
            </div>
          )}
        </div>

        {/* ══ RIGHT: horizontally scrollable calendar ══ */}
        <div className={styles.calendarArea}>

          {/* Fixed time axis */}
          <div className={styles.timeAxisWrapper}>
            <div className={styles.dayHeaderSpacer} />
            <div className={styles.timeAxis} style={{ height: colH }}>
              {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
                if (i % 2 !== 0) return null;
                return (
                  <div key={i} className={styles.timeLabel} style={{ top: PADDING_V + i * slotH }}>
                    {slotToTime(i)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable day columns */}
          <div className={styles.daysScroll}>
            <div className={styles.calendarHeader}>
              {DAYS.map(d => (
                <div key={d.id} className={styles.dayHeader}>
                  <span className={styles.dayHeaderAbbr}>{d.abbr}</span>
                  <span className={styles.dayHeaderDate}>{d.date}</span>
                </div>
              ))}
            </div>

            {/* Body — ref for height measurement */}
            <div className={styles.calendarBody} ref={bodyRef}>
              {DAYS.map(day => {
                const occupied = getOccupied(day.id, placements, allCards, draggingId ?? '');
                const draggingCard = draggingId ? taskCards.find(c => c.id === draggingId) : null;

                let previewSlots: number[] = [];
                if (draggingCard && hoverSlot?.day === day.id) {
                  const startSlot = Math.min(hoverSlot.slot, SLOT_COUNT - draggingCard.durationSlots);
                  const hasConf = Array.from({ length: draggingCard.durationSlots }, (_, i) => startSlot + i).some(s => occupied.has(s));
                  if (!hasConf) previewSlots = Array.from({ length: draggingCard.durationSlots }, (_, i) => startSlot + i);
                }

                return (
                  <div
                    key={day.id}
                    className={`${styles.dayColumn} ${draggingId && !checked ? styles.dayColumnTarget : ''}`}
                    style={{ height: colH }}
                    onDragOver={e => {
                      e.preventDefault();
                      if (!draggingId || checked) return;
                      const card = taskCards.find(c => c.id === draggingId);
                      if (!card) return;
                      setHoverSlot({ day: day.id, slot: getSlotFromDrag(e, card.durationSlots) });
                    }}
                    onDragLeave={() => setHoverSlot(null)}
                    onDrop={e => handleDrop(day.id, e)}
                  >
                    {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => (
                      <div
                        key={i}
                        className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf} ${conflict?.day === day.id && conflict.slot === i ? styles.slotConflict : ''}`}
                        style={{ top: PADDING_V + i * slotH, height: i < SLOT_COUNT ? slotH : 0 }}
                      />
                    ))}

                    {previewSlots.length > 0 && (
                      <div
                        className={styles.previewCard}
                        style={{ top: PADDING_V + previewSlots[0] * slotH + 2, height: previewSlots.length * slotH - 4 }}
                      >
                        {draggingCard?.title}
                      </div>
                    )}

                    {allCards.filter(c => c.isAnchor && c.anchorDay === day.id).map(card => (
                      <div
                        key={card.id}
                        className={styles.anchorCard}
                        style={{ top: PADDING_V + (card.anchorStartSlot ?? 0) * slotH + 2, height: card.durationSlots * slotH - 4 }}
                        onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                      >
                        <span className={styles.cardTitle}>{card.title}</span>
                        <span className={styles.cardTime}>{slotToTime(card.anchorStartSlot ?? 0)}–{slotToTime((card.anchorStartSlot ?? 0) + card.durationSlots)}</span>
                      </div>
                    ))}

                    {taskCards.filter(c => placements[c.id]?.day === day.id).map(card => {
                      const p = placements[card.id];
                      const ok = checked ? results[card.id] : undefined;
                      return (
                        <div
                          key={card.id}
                          draggable={!checked}
                          className={`${styles.placedCard} ${ok === true ? styles.placedCorrect : ok === false ? styles.placedWrong : ''} ${draggingId === card.id ? styles.placedDragging : ''}`}
                          style={{ top: PADDING_V + p.startSlot * slotH + 2, height: card.durationSlots * slotH - 4 }}
                          onDragStart={e => { e.stopPropagation(); setDraggingId(card.id); hideDragImage(e); }}
                          onDragEnd={() => { setDraggingId(null); setHoverSlot(null); }}
                          onClick={e => handlePlacedCardClick(card.id, e)}
                        >
                          <span className={styles.cardTitle}>{card.title}</span>
                          <div className={styles.placedCardMeta}>
                            <Icon name="clock" color="blue" size="xs" />
                            <span className={styles.placedCardDuration}>{formatDuration(card.durationSlots)}</span>
                          </div>
                          {!checked && <span className={styles.removeHint}>✕</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
      </div>

      <div className={styles.backRow}>
        <IconButton type="back" variant="orange" size="md" onClick={onBack} />
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
            <button className={styles.tooltipClose} onClick={() => setTooltipCard(null)}>
              Понятно
            </button>
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
                : 'Некоторые задачи попали не туда. Посмотри на красные карточки — там написано, что пошло не так.'
            }
            buttonLabel={allCorrect ? 'Результаты' : 'Посмотреть ошибки'}
            onButtonClick={() => {
              setShowResult(false);
              if (allCorrect) onComplete([{ correct: true, answer: '', explanation: '' }]);
            }}
          />
        </div>
      )}
    </Background>
  );
}
