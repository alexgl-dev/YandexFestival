import { useState } from 'react';
import { Background, Button, Icon, IconButton, InfoButton, PopUp } from '../../../components/ui';
import type { CalendarCardData, GlossaryTerm } from '../../../types/game';
import { getWeekDays, type CalendarDay } from '../../../utils/calendarDays';
import { parseGlossarySegments } from '../parseGlossarySegments';
import styles from './CalendarDayPortrait.module.css';

const formatDuration = (slots: number, durationMin?: number) => {
  const min = durationMin ?? slots * 30;
  if (min < 60) return `${min} минут`;
  const h = min / 60;
  if (h === 1) return '1 час';
  if (h < 5) return `${h} часа`;
  return `${h} часов`;
};

const slotToTime = (slot: number, startHour: number) => {
  const m = startHour * 60 + slot * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

function getCardLayoutPct(card: CalendarCardData, slotPct: number) {
  const startSlot = card.anchorStartSlot ?? 0;
  const offsetMin = Math.min(29, Math.max(0, card.anchorStartMinuteOffset ?? 0));
  const startFrac = startSlot + offsetMin / 30;
  const durationMin = card.durationMin ?? card.durationSlots * 30;
  const heightFrac = durationMin / 30;
  return {
    topPct: startFrac * slotPct,
    heightPct: heightFrac * slotPct,
  };
}

function renderCardTitle(title: string, peregClass: string) {
  const idx = title.indexOf('Переговорка');
  if (idx === -1) return title;
  const before = title.slice(0, idx).replace(/[.\s]+$/, '');
  const after = title.slice(idx);
  return (
    <>
      {before}
      <span className={peregClass}>{after}</span>
    </>
  );
}

interface Props {
  day?: CalendarDay;
  cards: CalendarCardData[];
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  startHour?: number;
  slotCount?: number;
  topText?: string;
  bottomText?: string;
  bottomTextItalic?: string;
}

export function CalendarDayPortrait({
  day = getWeekDays(1)[0],
  cards,
  onBack,
  theme = 'orange',
  startHour = 9,
  slotCount = 18,
  topText,
  bottomText,
  bottomTextItalic,
}: Props) {
  const [tooltipCard, setTooltipCard] = useState<CalendarCardData | null>(null);
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(Boolean(topText || bottomText || bottomTextItalic));

  const dayCards = cards.filter(c => c.anchorDay === day.id && c.anchorStartSlot != null);

  const slotPct = 100 / slotCount;

  return (
    <Background theme={theme} orientation="portrait" showBackButton={false}>
      <div className={styles.wrapper}>

        <div className={styles.leftColumn}>
          <IconButton type="back" variant="light" size="lg" onClick={onBack} />
          {(topText || bottomText || bottomTextItalic) && (
            <InfoButton size="lg" variant="dark" onClick={() => setShowIntro(true)} />
          )}
        </div>

        <div className={styles.calendarArea}>

          {/* Row 1: day header spans full width, centered */}
          <div className={styles.calendarHeader}>
            <div className={styles.dayHeader}>
              <span className={styles.dayHeaderAbbr}>{day.abbr}</span>
              <span className={styles.dayHeaderDate}>{day.date}</span>
            </div>
          </div>

          {/* Row 2: body row — time labels + slots share the same flex row and height */}
          <div className={styles.calendarBody}>
            <div className={styles.timeAxisBody}>
              {Array.from({ length: slotCount + 1 }, (_, i) => {
                if (i % 2 !== 0) return null;
                return (
                  <div key={i} className={styles.timeLabel} style={{ top: `${i * slotPct}%` }}>
                    {slotToTime(i, startHour)}
                  </div>
                );
              })}
            </div>

            <div className={styles.dayColumnBody}>
              {Array.from({ length: slotCount + 1 }, (_, i) => {
                const isLast = i === slotCount;
                return (
                  <div
                    key={i}
                    className={`${styles.slot} ${i % 2 === 0 ? styles.slotHour : styles.slotHalf} ${isLast ? styles.slotLast : ''}`}
                    style={isLast ? undefined : { top: `${i * slotPct}%` }}
                  />
                );
              })}

              {dayCards.map(card => {
                const layout = getCardLayoutPct(card, slotPct);
                return (
                <div
                  key={card.id}
                  className={`${styles.eventCard} ${
                    card.durationSlots === 1 && (card.durationMin == null || card.durationMin <= 30)
                      ? styles.eventCardCompact
                      : ''
                  }`}
                  style={{
                    top: `calc(${layout.topPct}% + 2px)`,
                    height: `calc(${layout.heightPct}% - 4px)`,
                  }}
                  onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                >
                  <span
                    className={`${styles.cardTitle} ${
                      layout.heightPct <= slotPct * 2 + 1e-6 ? styles.cardTitleClamped : ''
                    }`}
                  >
                    {renderCardTitle(card.title, styles.cardPeregovorka)}
                  </span>
                  <div className={styles.cardMeta}>
                    <Icon name="clock" color="blue" size="xs" />
                    <span className={styles.cardDuration}>{formatDuration(card.durationSlots, card.durationMin)}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {showIntro && (
        <div className={styles.overlay}>
          <PopUp
            description={
              <>
                {topText && <p className={styles.popupParagraph}>{topText}</p>}
                {bottomText && <p className={styles.popupParagraph}>{bottomText}</p>}
                {bottomTextItalic && <p className={`${styles.popupParagraph} ${styles.popupParagraphItalic}`}>{bottomTextItalic}</p>}
              </>
            }
            buttonLabel="Понятно"
            onButtonClick={() => setShowIntro(false)}
          />
        </div>
      )}

      {tooltipCard && (
        <div className={styles.overlay} onClick={() => setTooltipCard(null)}>
          <div onClick={e => e.stopPropagation()}>
            <PopUp
              title={tooltipCard.title}
              description={
                <>
                  <div className={styles.tooltipDuration}>
                    <Icon name="clock" color="blue" size="xs" />
                    <span>{formatDuration(tooltipCard.durationSlots, tooltipCard.durationMin)}</span>
                  </div>
                  <span>
                    {parseGlossarySegments(tooltipCard.tooltip, tooltipCard.glossary ?? []).map((seg, i) =>
                      seg.tooltip ? (
                        <span
                          key={i}
                          className={styles.glossaryWord}
                          onClick={() => setActiveTerm(seg.tooltip!)}
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )}
                  </span>
                </>
              }
              buttonLabel="Понятно"
              onButtonClick={() => setTooltipCard(null)}
            />
          </div>
        </div>
      )}

      {activeTerm && (
        <div className={styles.overlay} onClick={() => setActiveTerm(null)}>
          <div className={styles.glossaryCard} onClick={e => e.stopPropagation()}>
            <p className={styles.glossaryTitle}>
              {activeTerm.word.charAt(0).toUpperCase() + activeTerm.word.slice(1)}
            </p>
            <p className={styles.glossaryDefinition}>{activeTerm.definition}</p>
            <Button label="Понятно" type="main" onClick={() => setActiveTerm(null)} />
          </div>
        </div>
      )}
    </Background>
  );
}
