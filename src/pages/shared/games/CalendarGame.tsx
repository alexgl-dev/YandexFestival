import { useState } from 'react';
import { Background, Button, PopUp } from '../../../components/ui';
import type { Task, CalendarCardData } from '../../../types/game';
import styles from './CalendarGame.module.css';

// ─── Constants ────────────────────────────────────────────────
const SLOT_HEIGHT = 48;   // px per 30-min slot
const SLOT_COUNT  = 18;   // 9:00 → 18:00
const DAYS = [
  { id: 'mon', label: 'Пн 14 марта' },
  { id: 'tue', label: 'Вт 15 марта' },
  { id: 'wed', label: 'Ср 16 марта' },
] as const;

const slotToTime = (slot: number) => {
  const m = 9 * 60 + slot * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// ─── Helpers ──────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [hoverSlot, setHoverSlot] = useState<{ day: string; slot: number } | null>(null);
  const [conflict, setConflict] = useState<{ day: string; slot: number } | null>(null);
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const allPlaced = taskCards.every(c => placements[c.id]);

  // ── Column click: place selected card ──
  const handleColumnClick = (day: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedId || checked) return;
    const card = taskCards.find(c => c.id === selectedId);
    if (!card) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const slot = Math.min(
      Math.max(0, Math.floor((e.clientY - rect.top) / SLOT_HEIGHT)),
      SLOT_COUNT - card.durationSlots,
    );

    const occupied = getOccupied(day, placements, allCards, selectedId);
    const hasConflict = Array.from({ length: card.durationSlots }, (_, i) => slot + i).some(s => occupied.has(s));

    if (hasConflict) {
      setConflict({ day, slot });
      setTimeout(() => setConflict(null), 500);
      return;
    }

    setPlacements(prev => ({ ...prev, [selectedId]: { day, startSlot: slot } }));
    setSelectedId(null);
    setHoverSlot(null);
  };

  // ── Return placed card to pool ──
  const handlePlacedCardClick = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (checked) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    setSelectedId(null);
  };

  // ── Check ──
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
    <Background theme={theme} orientation="landscape" onBack={onBack}>
      <div className={styles.layout}>

        {/* ══ LEFT: task pool ══ */}
        <div className={styles.pool}>
          <p className={styles.poolTitle}>Задачи</p>
          <div className={styles.poolList}>
            {taskCards.map(card => {
              const placed = !!placements[card.id];
              if (placed && !checked) return null;
              const selected = selectedId === card.id;
              const ok = checked ? results[card.id] : undefined;
              return (
                <div
                  key={card.id}
                  className={`${styles.poolCard} ${selected ? styles.poolCardSelected : ''} ${checked && ok ? styles.poolCardCorrect : ''} ${checked && ok === false ? styles.poolCardWrong : ''}`}
                  onClick={() => !checked && setSelectedId(selected ? null : card.id)}
                >
                  <div className={styles.poolCardHeader}>
                    <span className={styles.poolCardDuration}>{slotToTime(0)}–{slotToTime(0)}</span>
                    <button
                      className={styles.infoBtn}
                      onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                    >?</button>
                  </div>
                  <p className={styles.poolCardTitle}>{card.title}</p>
                  <span className={styles.durationBadge}>{card.durationSlots * 30} мин</span>
                  {checked && ok === false && placements[card.id] && (
                    <p className={styles.wrongNote}>{card.wrongExplanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT: calendar ══ */}
        <div className={styles.calendarArea}>

          {/* Day headers */}
          <div className={styles.calendarHeader}>
            <div className={styles.timeAxisHead} />
            {DAYS.map(d => (
              <div key={d.id} className={styles.dayHeader}>{d.label}</div>
            ))}
          </div>

          {/* Calendar body */}
          <div className={styles.calendarBody}>

            {/* Time axis */}
            <div className={styles.timeAxis}>
              {Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
                if (i % 2 !== 0) return null;
                return (
                  <div key={i} className={styles.timeLabel} style={{ top: i * SLOT_HEIGHT }}>
                    {slotToTime(i)}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {DAYS.map(day => {
              const occupied = getOccupied(day.id, placements, allCards, selectedId ?? '');
              const selectedCard = selectedId ? taskCards.find(c => c.id === selectedId) : null;

              // Preview slots
              let previewSlots: number[] = [];
              if (selectedCard && hoverSlot?.day === day.id) {
                const startSlot = Math.min(hoverSlot.slot, SLOT_COUNT - selectedCard.durationSlots);
                const hasConf = Array.from({ length: selectedCard.durationSlots }, (_, i) => startSlot + i)
                  .some(s => occupied.has(s));
                if (!hasConf) {
                  previewSlots = Array.from({ length: selectedCard.durationSlots }, (_, i) => startSlot + i);
                }
              }

              return (
                <div
                  key={day.id}
                  className={`${styles.dayColumn} ${selectedId && !checked ? styles.dayColumnTarget : ''}`}
                  onClick={e => handleColumnClick(day.id, e)}
                  onMouseMove={e => {
                    if (!selectedId || checked) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const slot = Math.floor((e.clientY - rect.top) / SLOT_HEIGHT);
                    setHoverSlot({ day: day.id, slot });
                  }}
                  onMouseLeave={() => setHoverSlot(null)}
                >
                  {/* Slot grid lines */}
                  {Array.from({ length: SLOT_COUNT }, (_, i) => (
                    <div
                      key={i}
                      className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf} ${conflict?.day === day.id && conflict.slot === i ? styles.slotConflict : ''}`}
                      style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Preview ghost */}
                  {previewSlots.length > 0 && (
                    <div
                      className={styles.previewCard}
                      style={{
                        top: previewSlots[0] * SLOT_HEIGHT + 2,
                        height: previewSlots.length * SLOT_HEIGHT - 4,
                      }}
                    >
                      {selectedCard?.title}
                    </div>
                  )}

                  {/* Anchor cards */}
                  {allCards.filter(c => c.isAnchor && c.anchorDay === day.id).map(card => (
                    <div
                      key={card.id}
                      className={styles.anchorCard}
                      style={{
                        top: (card.anchorStartSlot ?? 0) * SLOT_HEIGHT + 2,
                        height: card.durationSlots * SLOT_HEIGHT - 4,
                      }}
                      onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                    >
                      <span className={styles.lockIcon}>🔒</span>
                      <span className={styles.cardTitle}>{card.title}</span>
                      <span className={styles.cardTime}>
                        {slotToTime(card.anchorStartSlot ?? 0)}–{slotToTime((card.anchorStartSlot ?? 0) + card.durationSlots)}
                      </span>
                    </div>
                  ))}

                  {/* Placed task cards */}
                  {taskCards
                    .filter(c => placements[c.id]?.day === day.id)
                    .map(card => {
                      const p = placements[card.id];
                      const ok = checked ? results[card.id] : undefined;
                      return (
                        <div
                          key={card.id}
                          className={`${styles.placedCard} ${ok === true ? styles.placedCorrect : ok === false ? styles.placedWrong : ''}`}
                          style={{
                            top: p.startSlot * SLOT_HEIGHT + 2,
                            height: card.durationSlots * SLOT_HEIGHT - 4,
                          }}
                          onClick={e => handlePlacedCardClick(card.id, e)}
                        >
                          <button
                            className={styles.infoBtn}
                            style={{ position: 'absolute', top: 4, right: 4 }}
                            onClick={e2 => { e2.stopPropagation(); setTooltipCard(card); }}
                          >?</button>
                          <span className={styles.cardTitle}>{card.title}</span>
                          <span className={styles.cardTime}>
                            {slotToTime(p.startSlot)}–{slotToTime(p.startSlot + card.durationSlots)}
                          </span>
                          {!checked && <span className={styles.removeHint}>✕</span>}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>

          {/* Check button */}
          {!checked && allPlaced && (
            <div className={styles.checkWrap}>
              <Button label="Проверить" type="main" onClick={handleCheck} />
            </div>
          )}
        </div>
      </div>

      {/* ── Tooltip overlay ── */}
      {tooltipCard && (
        <div className={styles.overlay} onClick={() => setTooltipCard(null)}>
          <div className={styles.tooltipCard} onClick={e => e.stopPropagation()}>
            <p className={styles.tooltipTitle}>{tooltipCard.title}</p>
            <p className={styles.tooltipText}>{tooltipCard.tooltip}</p>
            <button className={styles.tooltipClose} onClick={() => setTooltipCard(null)}>Понятно</button>
          </div>
        </div>
      )}

      {/* ── Result popup ── */}
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
