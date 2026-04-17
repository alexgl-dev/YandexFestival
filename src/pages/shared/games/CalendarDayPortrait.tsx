import { useState, useRef, useEffect } from 'react';
import { Background, Icon, IconButton } from '../../../components/ui';
import type { CalendarCardData } from '../../../types/game';
import { getWeekDays, type CalendarDay } from '../../../utils/calendarDays';
import styles from './CalendarDayPortrait.module.css';

const PADDING_V = 48;

const formatDuration = (slots: number) => {
  const min = slots * 30;
  if (min < 60) return `${min} мин`;
  const h = min / 60;
  if (h === 1) return '1 час';
  if (h < 5) return `${h} часа`;
  return `${h} часов`;
};

const slotToTime = (slot: number, startHour: number) => {
  const m = startHour * 60 + slot * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

interface Props {
  day?: CalendarDay;
  cards: CalendarCardData[];
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  startHour?: number;
  slotCount?: number;
}

export function CalendarDayPortrait({
  day = getWeekDays(1)[0],
  cards,
  onBack,
  theme = 'orange',
  startHour = 9,
  slotCount = 18,
}: Props) {
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const [slotH, setSlotH] = useState(56);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight;
      if (h > 0) setSlotH((h - PADDING_V * 2) / slotCount);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [slotCount]);

  const dayCards = cards.filter(c => c.anchorDay === day.id && c.anchorStartSlot != null);

  return (
    <Background theme={theme} orientation="portrait" showBackButton={false}>
      <div className={styles.wrapper}>

        <div className={styles.backRow}>
          <IconButton type="back" variant="light" size="lg" onClick={onBack} />
        </div>

        <div className={styles.calendarArea}>

          {/* Row 1: header row — time axis stub + day header in the same flex row */}
          <div className={styles.calendarHeader}>
            <div className={styles.timeAxisStub} />
            <div className={styles.dayHeader}>
              <span className={styles.dayHeaderAbbr}>{day.abbr}</span>
              <span className={styles.dayHeaderDate}>{day.date}</span>
            </div>
          </div>

          {/* Row 2: body row — time labels + slots share the same flex row and height */}
          <div className={styles.calendarBody} ref={bodyRef}>
            <div className={styles.timeAxisBody}>
              {Array.from({ length: slotCount + 1 }, (_, i) => {
                if (i % 2 !== 0) return null;
                return (
                  <div key={i} className={styles.timeLabel} style={{ top: PADDING_V + i * slotH }}>
                    {slotToTime(i, startHour)}
                  </div>
                );
              })}
            </div>

            <div className={styles.dayColumnBody}>
              {Array.from({ length: slotCount + 1 }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf}`}
                  style={{ top: PADDING_V + i * slotH, height: i < slotCount ? slotH : 0 }}
                />
              ))}

              {dayCards.map(card => (
                <div
                  key={card.id}
                  className={styles.eventCard}
                  style={{
                    top: PADDING_V + (card.anchorStartSlot ?? 0) * slotH + 2,
                    height: card.durationSlots * slotH - 4,
                  }}
                  onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                >
                  <span className={styles.cardTitle}>{card.title}</span>
                  <div className={styles.cardMeta}>
                    <Icon name="clock" color="blue" size="xs" />
                    <span className={styles.cardDuration}>{formatDuration(card.durationSlots)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {tooltipCard && (
        <div className={styles.overlay} onClick={() => setTooltipCard(null)}>
          <div className={styles.tooltipCard} onClick={e => e.stopPropagation()}>
            <p className={styles.tooltipTitle}>{tooltipCard.title}</p>
            <div className={styles.tooltipDuration}>
              <Icon name="clock" color="blue" size="xs" />
              <span>{formatDuration(tooltipCard.durationSlots)}</span>
            </div>
            <p className={styles.tooltipText}>{tooltipCard.tooltip}</p>
            <button className={styles.tooltipClose} onClick={() => setTooltipCard(null)}>Понятно</button>
          </div>
        </div>
      )}
    </Background>
  );
}
