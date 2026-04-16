import { useState } from 'react';
import { Background } from '../../../components/ui';
import type { CalendarCardData } from '../../../types/game';
import styles from './CalendarViewGame.module.css';

const SLOT_HEIGHT = 48;
const PADDING_V = 40;

interface Props {
  title: string;
  days: { id: string; abbr: string; date: string }[];
  cards: CalendarCardData[];
  theme?: 'cobalt' | 'orange';
  startHour?: number;
  slotCount?: number;
  onBack: () => void;
}

export function CalendarViewGame({ days, cards, theme = 'cobalt', startHour = 9, slotCount = 18, onBack }: Props) {
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);
  const [glossaryTerm, setGlossaryTerm] = useState<{ word: string; definition: string } | null>(null);

  const colHeight = slotCount * SLOT_HEIGHT + 2 * PADDING_V;

  const slotToTime = (slot: number) => {
    const m = startHour * 60 + slot * 30;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  };

  return (
    <Background theme={theme} orientation="landscape" onBack={onBack}>
      <div className={styles.layout}>

        <div className={styles.calendarHeader}>
          <div className={styles.timeAxisHead} />
          {days.map(d => (
            <div key={d.id} className={styles.dayHeader}>
              <span className={styles.dayHeaderAbbr}>{d.abbr}</span>
              <span className={styles.dayHeaderDate}>{d.date}</span>
            </div>
          ))}
        </div>

        <div className={styles.calendarBody}>
          <div className={styles.timeAxis} style={{ height: colHeight }}>
            {Array.from({ length: slotCount + 1 }, (_, i) => {
              if (i % 2 !== 0) return null;
              return (
                <div key={i} className={styles.timeLabel} style={{ top: PADDING_V + i * SLOT_HEIGHT }}>
                  {slotToTime(i)}
                </div>
              );
            })}
          </div>

          {days.map(day => (
            <div key={day.id} className={styles.dayColumn} style={{ height: colHeight }}>
              {Array.from({ length: slotCount + 1 }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf}`}
                  style={{ top: PADDING_V + i * SLOT_HEIGHT, height: i < slotCount ? SLOT_HEIGHT : 0 }}
                />
              ))}

              {cards
                .filter(c => c.anchorDay === day.id && c.anchorStartSlot != null)
                .map(card => (
                  <div
                    key={card.id}
                    className={styles.eventCard}
                    style={{
                      top: PADDING_V + (card.anchorStartSlot ?? 0) * SLOT_HEIGHT + 2,
                      height: card.durationSlots * SLOT_HEIGHT - 4,
                    }}
                    onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                  >
                    <span className={styles.cardTitle}>{card.title}</span>
                    <span className={styles.cardTime}>
                      {slotToTime(card.anchorStartSlot ?? 0)}–{slotToTime((card.anchorStartSlot ?? 0) + card.durationSlots)}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {tooltipCard && (
        <div className={styles.overlay} onClick={() => { setTooltipCard(null); setGlossaryTerm(null); }}>
          <div className={styles.tooltipCard} onClick={e => e.stopPropagation()}>
            <p className={styles.tooltipTitle}>{tooltipCard.title}</p>
            <p className={styles.tooltipText}>{tooltipCard.tooltip}</p>

            {tooltipCard.glossary && tooltipCard.glossary.length > 0 && (
              <div className={styles.glossaryRow}>
                {tooltipCard.glossary.map(term => (
                  <button
                    key={term.word}
                    className={styles.glossaryChip}
                    onClick={() => setGlossaryTerm(glossaryTerm?.word === term.word ? null : term)}
                  >
                    {term.word}
                  </button>
                ))}
              </div>
            )}

            {glossaryTerm && (
              <div className={styles.glossaryPopup}>
                <p className={styles.glossaryWord}>{glossaryTerm.word}</p>
                <p className={styles.glossaryDef}>{glossaryTerm.definition}</p>
              </div>
            )}

            <button className={styles.tooltipClose} onClick={() => { setTooltipCard(null); setGlossaryTerm(null); }}>
              Понятно
            </button>
          </div>
        </div>
      )}
    </Background>
  );
}
