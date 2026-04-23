import { useState } from 'react';
import { Background, Icon, IconButton, InfoButton, PopUp } from '../../../components/ui';
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

interface CardLayout {
  topPct: number;
  heightPct: number;
  widthPct: number;
  leftPct: number;
}

function computeDayLayouts(cards: CalendarCardData[], slotPct: number): Map<string, CardLayout> {
  // Compute start/end in minutes
  const events = cards.map((card) => {
    const startSlot = card.anchorStartSlot ?? 0;
    const offsetMin = Math.min(29, Math.max(0, card.anchorStartMinuteOffset ?? 0));
    const startMin = startSlot * 30 + offsetMin;
    const durationMin = card.durationMin ?? card.durationSlots * 30;
    return { card, startMin, endMin: startMin + durationMin, startSlot, offsetMin, durationMin };
  });
  events.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  // Build clusters: consecutive events whose tracks stay busy form a cluster
  type Cluster = { events: typeof events; tracks: number[] /* endMin per track */ };
  const clusters: Cluster[] = [];
  let current: Cluster | null = null;
  for (const e of events) {
    const anyActive = current && current.tracks.some((t) => t > e.startMin);
    if (!current || !anyActive) {
      current = { events: [], tracks: [] };
      clusters.push(current);
    }
    current.events.push(e);
    // Try to reuse a free track
    let assigned = -1;
    for (let i = 0; i < current.tracks.length; i++) {
      if (current.tracks[i] <= e.startMin) {
        current.tracks[i] = e.endMin;
        assigned = i;
        break;
      }
    }
    if (assigned === -1) {
      current.tracks.push(e.endMin);
      assigned = current.tracks.length - 1;
    }
    (e as typeof e & { trackIdx: number }).trackIdx = assigned;
  }

  const out = new Map<string, CardLayout>();
  for (const cluster of clusters) {
    const cols = cluster.tracks.length;
    const widthPct = 100 / cols;
    for (const e of cluster.events) {
      const trackIdx = (e as typeof e & { trackIdx: number }).trackIdx;
      const startFrac = e.startSlot + e.offsetMin / 30;
      const heightFrac = e.durationMin / 30;
      out.set(e.card.id, {
        topPct: startFrac * slotPct,
        heightPct: heightFrac * slotPct,
        widthPct,
        leftPct: trackIdx * widthPct,
      });
    }
  }
  return out;
}

function renderCardTitle(title: string, peregClass: string) {
  const idx = title.indexOf('\n Переговорка');
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
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [showUtcInfo, setShowUtcInfo] = useState<boolean>(false);

  const dayCards = cards.filter(c => c.anchorDay === day.id && c.anchorStartSlot != null);

  const slotPct = 100 / slotCount;
  const dayLayouts = computeDayLayouts(dayCards, slotPct);

  return (
    <Background theme={theme} orientation="portrait" showBackButton={false}>
      <div className={styles.root}>
        <div className={styles.wrapper}>

          <div className={styles.leftColumn}>
            <IconButton type="back" variant="light" size="lg" onClick={onBack} />
          </div>

          <div className={styles.rightColumn}>
            {topText && <p className={styles.introText}>{topText}</p>}

            <div className={styles.scrollArea}>
            <div className={styles.calendarArea}>

          {/* Row 1: day header spans full width, centered */}
          <div className={styles.calendarHeader}>
            <div className={styles.utcLabel}>
              <span>UTC+3</span>
              <InfoButton size="sm" variant="ghost" onClick={() => setShowUtcInfo(true)} />
            </div>
            <div className={styles.dayHeader}>
              <span className={styles.dayHeaderAbbr}>{day.abbr}</span>
              <span className={styles.dayHeaderDate}>{day.date}</span>
            </div>
          </div>

          {/* Row 2: body row — time labels + slots share the same flex row and height */}
          <div
            className={styles.calendarBody}
            style={{ ['--slot-count' as string]: slotCount }}
          >
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
                const layout = dayLayouts.get(card.id)!;
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
                    left: `calc(${layout.leftPct}% + 2px)`,
                    width: `calc(${layout.widthPct}% - 4px)`,
                  }}
                  onClick={e => { e.stopPropagation(); setTooltipCard(card); }}
                >
                  <span
                    className={`${styles.cardTitle} ${
                      (card.durationMin ?? card.durationSlots * 30) < 30
                        ? styles.cardTitleOneLine
                        : layout.heightPct <= slotPct * 2 + 1e-6
                          ? styles.cardTitleClamped
                          : ''
                    }`}
                  >
                    {renderCardTitle(card.title, styles.cardPeregovorka)}
                  </span>
                  <div className={styles.cardMeta}>
                    <Icon name="clock" color="blue" size="xs" />
                    <span className={styles.cardDuration}>{card.durationLabel ?? formatDuration(card.durationSlots, card.durationMin)}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

            </div>

            {(bottomText || bottomTextItalic) && (
              <div className={styles.outroText}>
                {bottomText && <p className={styles.outroParagraph}>{bottomText}</p>}
                {bottomTextItalic && (
                  <p className={`${styles.outroParagraph} ${styles.outroItalic}`}>{bottomTextItalic}</p>
                )}
              </div>
            )}

            </div>
          </div>
        </div>
      </div>

      {showUtcInfo && (
        <div className={styles.overlay} onClick={() => setShowUtcInfo(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              description="Сотрудники Яндекса работают в разных часовых поясах и точках мира"
              buttonLabel="Понятно"
              onButtonClick={() => setShowUtcInfo(false)}
              compact
            />
          </div>
        </div>
      )}

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
                    <span>{tooltipCard.durationLabel ?? formatDuration(tooltipCard.durationSlots, tooltipCard.durationMin)}</span>
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
        <div className={styles.termOverlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTerm.word.charAt(0).toUpperCase() + activeTerm.word.slice(1)}
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
