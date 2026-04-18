import { useState, useCallback, useMemo } from 'react';
import { Background, Button, Card, PopUp } from '../../../components/ui';
import type { Task, TaskOption } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './AnomalyDetectiveGame.module.css';

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

type Phase = 'find' | 'explain' | 'reveal';
type Popup =
  | { kind: 'peak' }
  | { kind: 'extra' }
  | { kind: 'decoy'; monthIndex: number }
  | { kind: 'wrong'; option: TaskOption }
  | { kind: 'wow'; option: TaskOption }
  | { kind: 'success'; option: TaskOption }
  | null;

// ── Tooltip parser ──────────────────────────────────────────────────────────
interface Segment {
  text: string;
  tooltip: string | null;
}

function parseTooltips(raw: string): Segment[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const segments: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) segments.push({ text: raw.slice(last, m.index), tooltip: null });
    segments.push({ text: m[1], tooltip: m[2] });
    last = m.index + m[0].length;
  }
  if (last < raw.length) segments.push({ text: raw.slice(last), tooltip: null });
  return segments;
}

function renderTooltips(
  raw: string,
  onTooltip: (t: string) => void,
  wordClass: string,
): React.ReactNode[] {
  return parseTooltips(raw).map((seg, i) =>
    seg.tooltip ? (
      <span key={i} className={wordClass} onClick={() => onTooltip(seg.tooltip!)}>
        {seg.text}
      </span>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'];
const PEAK_INDEX = 3;

const VIEWS = [4200, 3800, 4500, 47219, 4100, 3600];
const MENTIONS = [280, 340, 250, 180000, 42000, 6500];

const VIEWS_TICKS = [0, 10000, 20000, 30000, 40000, 50000];
const MENTIONS_TICKS = [0, 45000, 90000, 135000, 180000];

const VARIANT_LABELS = ['Вариант A', 'Вариант B', 'Вариант C'];

const VIEWS_TITLE = 'Просмотры фильма «Минута длиною в час» (2003), январь — июнь';
const MENTIONS_TITLE = 'Упоминания фильма «Секунда длиною в час» в социальных сетях, январь — июнь';

interface GraphCardProps {
  title: string;
  data: number[];
  ticks: number[];
  peakHighlighted?: boolean;
  peakPulsing?: boolean;
  onPeakTap?: () => void;
  onDecoyTap?: (monthIndex: number) => void;
  wrongPoints?: Set<number>;
  compact?: boolean;
}

function GraphCard({
  title,
  data,
  ticks,
  peakHighlighted,
  peakPulsing,
  onPeakTap,
  onDecoyTap,
  wrongPoints,
  compact,
}: GraphCardProps) {
  const WIDTH = 1540;
  const HEIGHT = compact ? 360 : 720;
  const PAD_TOP = compact ? 40 : 60;
  const PAD_BOTTOM = compact ? 70 : 90;
  const PAD_LEFT = 190;
  const PAD_RIGHT = 70;
  const gridW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const gridH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const maxTick = ticks[ticks.length - 1];
  const colStep = gridW / MONTHS.length;

  const xFor = (i: number) => PAD_LEFT + colStep * (i + 0.5);
  const yFor = (v: number) => PAD_TOP + gridH * (1 - v / maxTick);

  const linePath = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`)
    .join(' ');

  const peakX = xFor(PEAK_INDEX);
  const peakY = yFor(data[PEAK_INDEX]);

  return (
    <div className={`${styles.graphCard} ${compact ? styles.graphCardCompact : ''}`}>
      <p className={styles.graphTitle}>{title}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.graphSvg}>
        <defs>
          <filter id={`glow-${title.slice(0, 8)}`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ticks.map((t) => {
          const y = yFor(t);
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={y}
                y2={y}
                className={styles.gridLine}
              />
              <text
                x={PAD_LEFT - 30}
                y={y + 10}
                className={styles.tickLabel}
                textAnchor="end"
              >
                {t.toLocaleString('ru-RU').replace(',', ' ')}
              </text>
            </g>
          );
        })}

        {MONTHS.map((m, i) => (
          <text
            key={m}
            x={xFor(i)}
            y={HEIGHT - PAD_BOTTOM / 2 + 12}
            className={styles.monthLabel}
            textAnchor="middle"
          >
            {m}
          </text>
        ))}

        <path d={linePath} className={styles.linePath} />

        {data.map((v, i) => {
          if (i === PEAK_INDEX) return null;
          const isWrong = wrongPoints?.has(i);
          const showPulse = !!onDecoyTap && !isWrong;
          return (
            <g key={`dot-${i}`}>
              {showPulse && (
                <circle
                  cx={xFor(i)}
                  cy={yFor(v)}
                  r={compact ? 18 : 24}
                  className={styles.decoyPulse}
                  style={{ animationDelay: `${(i * 0.22).toFixed(2)}s` }}
                />
              )}
              <circle
                cx={xFor(i)}
                cy={yFor(v)}
                r={compact ? 10 : 14}
                className={isWrong ? styles.decoyDotWrong : styles.decoyDot}
                filter={isWrong ? `url(#glow-${title.slice(0, 8)})` : undefined}
              />
            </g>
          );
        })}

        {peakPulsing && (
          <circle
            cx={peakX}
            cy={peakY}
            r={compact ? 18 : 24}
            className={styles.peakPulse}
          />
        )}

        {peakHighlighted && (
          <circle
            cx={peakX}
            cy={peakY}
            r={compact ? 10 : 14}
            className={styles.peakDot}
            filter={`url(#glow-${title.slice(0, 8)})`}
          />
        )}

        {onDecoyTap &&
          data.map((v, i) => {
            if (i === PEAK_INDEX) return null;
            return (
              <circle
                key={`hit-${i}`}
                cx={xFor(i)}
                cy={yFor(v)}
                r={80}
                className={styles.peakHit}
                onClick={() => onDecoyTap(i)}
              />
            );
          })}

        {onPeakTap && (
          <circle
            cx={peakX}
            cy={peakY}
            r={110}
            className={styles.peakHit}
            onClick={onPeakTap}
          />
        )}
      </svg>
    </div>
  );
}

export function AnomalyDetectiveGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const options = useMemo<TaskOption[]>(() => {
    const withOptions = task.steps.find((s) => s.options && s.options.length > 0);
    return withOptions?.options ?? [];
  }, [task.steps]);

  const [phase, setPhase] = useState<Phase>('find');
  const [showMentions, setShowMentions] = useState(false);
  const [requestedExtra, setRequestedExtra] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<Set<number>>(new Set());
  const [wrongPoints, setWrongPoints] = useState<Set<number>>(new Set());
  const [popup, setPopup] = useState<Popup>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [wordTooltip, setWordTooltip] = useState<string | null>(null);

  const handlePeakTap = useCallback(() => {
    setPopup({ kind: 'peak' });
  }, []);

  const handleDecoyTap = useCallback((monthIndex: number) => {
    setWrongPoints((prev) => {
      if (prev.has(monthIndex)) return prev;
      const next = new Set(prev);
      next.add(monthIndex);
      return next;
    });
    setPopup({ kind: 'decoy', monthIndex });
  }, []);

  const handleRequestExtra = useCallback(() => {
    setPopup({ kind: 'extra' });
  }, []);

  const handleOptionClick = useCallback(
    (index: number) => {
      if (disabledOptions.has(index)) return;
      if (popup) return;
      const option = options[index];
      if (!option) return;

      if (!option.correct) {
        setPopup({ kind: 'wrong', option });
        return;
      }

      if (!requestedExtra) {
        setPopup({ kind: 'wow', option });
      } else {
        setPopup({ kind: 'success', option });
      }
    },
    [options, disabledOptions, popup, requestedExtra],
  );

  const handlePopupAction = useCallback(() => {
    if (!popup) return;

    if (popup.kind === 'peak') {
      setPopup(null);
      setPhase('explain');
      return;
    }

    if (popup.kind === 'extra') {
      setRequestedExtra(true);
      setShowMentions(true);
      setPhase('reveal');
      setPopup(null);
      return;
    }

    if (popup.kind === 'decoy') {
      setPopup(null);
      return;
    }

    if (popup.kind === 'wrong') {
      setDisabledOptions((prev) => {
        const next = new Set(prev);
        const idx = options.findIndex((o) => o === popup.option);
        if (idx >= 0) next.add(idx);
        return next;
      });
      setPopup(null);
      return;
    }

    if (popup.kind === 'wow') {
      setWordTooltip(null);
      setShowMentions(true);
      setRequestedExtra(true);
      setPhase('reveal');
      setPopup({ kind: 'success', option: popup.option });
      return;
    }

    if (popup.kind === 'success') {
      const result: GameResult = {
        answer: popup.option.text || 'Верный вариант',
        correct: true,
        explanation: popup.option.explanation,
      };
      const next = [...results, result];
      setResults(next);
      setPopup(null);
      onComplete(next);
    }
  }, [popup, options, results, onComplete]);

  const promptText =
    phase === 'find'
      ? 'Алгоритм обнаружил аномалию. Найди её на графике.'
      : phase === 'explain'
      ? 'Как ты объяснишь этот скачок просмотров?'
      : 'Сопоставь графики — и всё встанет на свои места.';

  const getCardState = (index: number, option: TaskOption): 'default' | 'disabled' | 'pressed' => {
    if (disabledOptions.has(index)) return 'disabled';
    if (popup?.kind === 'success' && popup.option === option) return 'pressed';
    if (popup?.kind === 'wow' && popup.option === option) return 'pressed';
    return 'default';
  };

  const WOW_DESCRIPTION =
    'Проверим её с помощью дополнительных данных. Хороший аналитик всегда [верифицирует]{tooltip: "Верифицировать — проверять гипотезу с помощью дополнительных данных или фактов, чтобы подтвердить или опровергнуть её."} [гипотезу]{tooltip: "Гипотеза — предположение, которое ещё не доказано, но кажется правдоподобным и требует проверки."}.';

  const popupProps = (() => {
    if (!popup) return null;
    if (popup.kind === 'peak') {
      return {
        icon: 'done' as const,
        iconColor: 'blue' as const,
        title: '14 апреля',
        description:
          '47 219 просмотров за сутки. Это в 11 раз больше нормы, обычный показатель для этого фильма — около 4000 просмотров в день.\n\nКак это можно объяснить?',
        buttonLabel: 'Выбрать объяснение',
      };
    }
    if (popup.kind === 'extra') {
      return {
        icon: 'done' as const,
        iconColor: 'blue' as const,
        title: 'Хорошее чутьё!',
        description:
          'Аналитик никогда не делает выводы на основе одного источника. Загружаю дополнительные данные...',
        buttonLabel: 'Смотреть',
      };
    }
    if (popup.kind === 'decoy') {
      return {
        icon: 'close' as const,
        iconColor: 'red' as const,
        title: 'Не совсем',
        description:
          'Здесь всё в пределах нормы. Поищи там, где данные ведут себя неожиданно.',
        buttonLabel: 'Попробовать ещё',
      };
    }
    if (popup.kind === 'wrong') {
      return {
        icon: 'close' as const,
        iconColor: 'red' as const,
        title: 'Не совсем...',
        description: popup.option.explanation,
        buttonLabel: 'Попробовать ещё',
      };
    }
    if (popup.kind === 'wow') {
      return null; // rendered inline below
    }
    return {
      icon: 'done' as const,
      iconColor: 'blue' as const,
      title: 'Верно!',
      description: popup.option.explanation,
      buttonLabel: 'Результаты',
    };
  })();

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <p className={styles.prompt}>{promptText}</p>

        <div className={styles.stage}>
          <div className={`${styles.graphs} ${showMentions ? styles.graphsStacked : ''}`}>
            <GraphCard
              title={VIEWS_TITLE}
              data={VIEWS}
              ticks={VIEWS_TICKS}
              peakHighlighted
              peakPulsing={phase === 'find'}
              onPeakTap={phase === 'find' ? handlePeakTap : undefined}
              onDecoyTap={phase === 'find' ? handleDecoyTap : undefined}
              wrongPoints={wrongPoints}
              compact={showMentions}
            />
            {showMentions && (
              <>
                <GraphCard
                  title={MENTIONS_TITLE}
                  data={MENTIONS}
                  ticks={MENTIONS_TICKS}
                  peakHighlighted
                  compact
                />
                <p className={styles.graphHint}>
                  Сравни оба графика. Когда именно начался рост? Как долго он длился? Это поможет понять причину.
                </p>
              </>
            )}
          </div>

          {phase !== 'find' && (
            <div className={styles.options}>
              {options.map((option, i) => (
                <Card
                  key={i}
                  variant={VARIANT_LABELS[i] || `Вариант ${i + 1}`}
                  title={option.text || ''}
                  description=""
                  size="m"
                  state={getCardState(i, option)}
                  onClick={() => handleOptionClick(i)}
                />
              ))}
            </div>
          )}
        </div>

        {!requestedExtra && phase !== 'find' && (
          <div className={styles.actions}>
            <Button
              label="🔍 Запросить дополнительные данные"
              type="secondary"
              onClick={handleRequestExtra}
            />
          </div>
        )}
      </div>

      {popup && popupProps && (
        <div className={styles.overlay}>
          <PopUp
            icon={popupProps.icon}
            iconColor={popupProps.iconColor}
            title={popupProps.title}
            description={popupProps.description}
            buttonLabel={popupProps.buttonLabel}
            onButtonClick={handlePopupAction}
          />
        </div>
      )}

      {popup?.kind === 'wow' && (
        <div className={styles.overlay} onClick={() => { if (!wordTooltip) {} }}>
          <div className={styles.wowPopup}>
            <div className={styles.wowHeader}>
              <span className={styles.wowTitle}>Интересная версия</span>
            </div>
            <p className={styles.wowDescription}>
              {renderTooltips(WOW_DESCRIPTION, setWordTooltip, styles.tooltipWord)}
            </p>
            {wordTooltip && (
              <div className={styles.wordTooltipBox}>
                <p className={styles.wordTooltipText}>{wordTooltip}</p>
                <button
                  type="button"
                  className={styles.wordTooltipClose}
                  onClick={() => setWordTooltip(null)}
                >
                  ✕
                </button>
              </div>
            )}
            <Button
              label="Сверить графики"
              type="main"
              onClick={handlePopupAction}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
