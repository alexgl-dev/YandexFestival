import { useState, useCallback, useEffect, useRef } from 'react';
import { Background, Button, InfoButton } from '../../../components/ui';
import type { Task, TaskBlock } from '../../../types/game';
import styles from './LaunchSequenceGame.module.css';

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

// Orders (1-indexed) of blocks that can run in parallel
const PARALLEL_ORDERS = [4, 5];

// Slight rotation per block index for the scattered look
const ROTATIONS = [-2, 3, -4, 2, -1, 4, -3, 1];

const MAX_ATTEMPTS = 3;

// ── Tooltip parser ──────────────────────────────────────────────────────────
type Segment =
  | { type: 'text'; value: string }
  | { type: 'tip'; text: string; tip: string };

function parseTooltips(raw: string): Segment[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const segments: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: raw.slice(last, m.index) });
    segments.push({ type: 'tip', text: m[1], tip: m[2] });
    last = regex.lastIndex;
  }
  if (last < raw.length) segments.push({ type: 'text', value: raw.slice(last) });
  return segments;
}

function renderTooltips(
  raw: string,
  onTip: (tip: string) => void,
  className: string,
): React.ReactNode {
  return parseTooltips(raw).map((seg, i) =>
    seg.type === 'text' ? (
      <span key={i}>{seg.value}</span>
    ) : (
      <span
        key={i}
        className={className}
        onClick={(e) => { e.stopPropagation(); onTip(seg.tip); }}
      >
        {seg.text}
      </span>
    ),
  );
}
// ────────────────────────────────────────────────────────────────────────────

function isBlockCorrect(
  blockOrder: number,
  slotIdx: number,
  slots: (number | null)[],
  blocks: TaskBlock[],
): boolean {
  if (blockOrder === slotIdx + 1) return true;

  if (PARALLEL_ORDERS.includes(blockOrder)) {
    const parallelSlots = PARALLEL_ORDERS.map((o) => o - 1);
    if (parallelSlots.includes(slotIdx)) {
      const otherOrder = PARALLEL_ORDERS.find((o) => o !== blockOrder)!;
      const otherIdx = blocks.findIndex((b) => b.order === otherOrder);
      const otherSlot = slots.indexOf(otherIdx);
      if (parallelSlots.includes(otherSlot)) return true;
    }
  }
  return false;
}

function buildErrorMessage(blocks: TaskBlock[], slots: (number | null)[]): string {
  const orderToSlot: Record<number, number> = {};
  slots.forEach((bIdx, sIdx) => {
    if (bIdx !== null && blocks[bIdx].order !== null) {
      orderToSlot[blocks[bIdx].order!] = sIdx + 1;
    }
  });

  const dev = orderToSlot[4];
  const design = orderToSlot[3];
  const research = orderToSlot[1];
  const taskSet = orderToSlot[2];
  const release = orderToSlot[7];
  const testing = orderToSlot[6];

  if (dev && design && dev < design)
    return 'Команда написала код — но под что? Дизайн ещё не был готов. Пришлось переделывать всё с нуля. Потеряно 3 недели.';
  if (taskSet && research && taskSet < research)
    return 'Техзадание написано до исследования пользователей. Оказалось — не та проблема, не те люди. Вся работа в мусор.';
  if (release && testing && release < testing)
    return 'Продукт вышел без тестирования. Пользователи нашли 47 критических багов. Пришлось срочно откатывать релиз.';
  if (research && research > 2)
    return 'Исследование пользователей — это самый первый шаг. Без него непонятно, что вообще нужно делать.';

  return 'Этапы перепутаны. В реальном проекте такая ошибка стоит месяцы работы и миллионы рублей.';
}

export function LaunchSequenceGame({
  task,
  onComplete,
  onBack,
  theme = 'orange',
  orientation = 'portrait',
}: GameProps) {
  const step = task.steps[0];
  const blocks = step?.blocks ?? [];
  const validIndices = blocks
    .map((b, i) => (b.order !== null ? i : -1))
    .filter((i) => i >= 0);
  const slotCount = validIndices.length;

  const [pool, setPool] = useState<number[]>(() =>
    [...validIndices].sort(() => Math.random() - 0.5),
  );
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array(slotCount).fill(null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [descriptionFor, setDescriptionFor] = useState<number | null>(null);
  const [wordTooltip, setWordTooltip] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | null)[]>(() =>
    Array(slotCount).fill(null),
  );
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [litSlots, setLitSlots] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showFailed, setShowFailed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const placedCount = slots.filter((s) => s !== null).length;
  const allPlaced = placedCount === slotCount;

  // Parallel pair active: both slots 3 & 4 (0-indexed) hold blocks with parallel orders
  const parallelActive = (() => {
    const s3 = slots[3];
    const s4 = slots[4];
    if (s3 === null || s4 === null) return false;
    const o3 = blocks[s3]?.order;
    const o4 = blocks[s4]?.order;
    return (
      o3 !== null &&
      o4 !== null &&
      PARALLEL_ORDERS.includes(o3!) &&
      PARALLEL_ORDERS.includes(o4!)
    );
  })();

  const handlePoolTap = useCallback(
    (bIdx: number) => {
      if (descriptionFor !== null || checked || animating) return;
      setSelected((prev) => (prev === bIdx ? null : bIdx));
    },
    [descriptionFor, checked, animating],
  );

  const handleInfoTap = useCallback(
    (bIdx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (animating) return;
      setDescriptionFor(bIdx);
    },
    [animating],
  );

  const handleSlotTap = useCallback(
    (sIdx: number) => {
      if (checked || descriptionFor !== null || animating) return;

      if (selected !== null) {
        const prev = slots[sIdx];
        setSlots((s) => {
          const n = [...s];
          n[sIdx] = selected;
          return n;
        });
        setPool((p) => {
          const next = p.filter((i) => i !== selected);
          return prev !== null ? [...next, prev] : next;
        });
        setSelected(null);
      } else if (slots[sIdx] !== null) {
        const bIdx = slots[sIdx]!;
        setSlots((s) => {
          const n = [...s];
          n[sIdx] = null;
          return n;
        });
        setPool((p) => [...p, bIdx]);
      }
    },
    [checked, descriptionFor, animating, selected, slots],
  );

  const runAnimation = useCallback(
    (_currentSlots: (number | null)[]) => {
      setAnimating(true);
      const sequence: number[][] = [];
      for (let i = 0; i < slotCount; i++) {
        if (i === 3) {
          sequence.push([3, 4]);
          i = 4;
        } else {
          sequence.push([i]);
        }
      }

      let delay = 150;
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (const group of sequence) {
        const t = setTimeout(() => {
          setLitSlots((prev) => new Set([...prev, ...group]));
        }, delay);
        timers.push(t);
        delay += 420;
      }
      const doneT = setTimeout(() => setShowComplete(true), delay + 300);
      timers.push(doneT);
      timersRef.current = timers;
    },
    [slotCount],
  );

  // Full board reset (called after any wrong answer)
  const doReset = useCallback(
    (resetAttempts: boolean) => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setShowError(false);
      setShowFailed(false);
      setChecked(false);
      setSlotResults(Array(slotCount).fill(null));
      setErrorMsg('');
      setSlots(Array(slotCount).fill(null));
      setPool([...validIndices].sort(() => Math.random() - 0.5));
      setSelected(null);
      setLitSlots(new Set());
      setAnimating(false);
      setShowComplete(false);
      if (resetAttempts) setAttemptCount(0);
    },
    [slotCount, validIndices],
  );

  const handleCheck = useCallback(() => {
    if (!allPlaced || checked || animating) return;
    setChecked(true);

    const results = slots.map((bIdx, sIdx) => {
      if (bIdx === null) return null;
      const order = blocks[bIdx].order;
      if (order === null) return null;
      return isBlockCorrect(order, sIdx, slots, blocks) ? ('correct' as const) : ('wrong' as const);
    });
    setSlotResults(results);

    const allCorrect = results.every((r) => r === 'correct');
    if (allCorrect) {
      const t = setTimeout(() => runAnimation(slots), 350);
      timersRef.current.push(t);
    } else {
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);

      if (newCount >= MAX_ATTEMPTS) {
        // After 3 failures show the failure moral popup
        const t = setTimeout(() => setShowFailed(true), 700);
        timersRef.current.push(t);
      } else {
        setErrorMsg(buildErrorMessage(blocks, slots));
        const t = setTimeout(() => setShowError(true), 700);
        timersRef.current.push(t);
      }
    }
  }, [allPlaced, checked, animating, slots, blocks, runAnimation, attemptCount]);

  const handleComplete = useCallback(() => {
    onComplete([
      {
        correct: true,
        answer: slots
          .map((bIdx) => (bIdx !== null ? blocks[bIdx].text || '' : ''))
          .join(' → '),
        explanation: 'Верная последовательность! Продукт запущен за 4 месяца.',
      },
    ]);
  }, [slots, blocks, onComplete]);

  const overlayClass =
    orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;

  // Render a single slot
  const renderSlot = (sIdx: number) => {
    const bIdx = slots[sIdx];
    const block = bIdx !== null ? blocks[bIdx] : null;
    const result = slotResults[sIdx];
    const isLit = litSlots.has(sIdx);

    return (
      <div key={sIdx} className={styles.slotWrapper}>
        <div
          className={[
            styles.slot,
            block ? styles.slotFilled : styles.slotEmpty,
            result === 'correct' ? styles.slotCorrect : '',
            result === 'wrong' ? styles.slotWrong : '',
            isLit ? styles.slotLit : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => handleSlotTap(sIdx)}
        >
          {block ? (
            <>
              <img src="/assets/games/003/launch/card-shape.svg" alt="" className={styles.slotBg} draggable={false} />
              <p className={styles.slotTitle}>{block.text}</p>
            </>
          ) : (
            <>
              <img src="/assets/games/003/launch/slot-shape.svg" alt="" className={styles.slotBg} draggable={false} />
              <span className={styles.slotNumber}>{sIdx + 1}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  const prompt = step?.prompt ?? '';

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        {/* Top row: placed counter + attempt counter */}
        <div className={styles.topRow}>
          <p className={styles.counter}>
            Размещено: <span className={styles.counterNum}>{placedCount}</span> из {slotCount}
          </p>
          <p className={styles.attemptCounter}>
            Ошибки: <span className={styles.counterNum}>{attemptCount}</span>/{MAX_ATTEMPTS}
          </p>
        </div>

        {/* Prompt with inline tooltips */}
        {prompt && (
          <p className={styles.prompt}>
            {renderTooltips(prompt, setWordTooltip, styles.tooltipWord)}
          </p>
        )}

        {/* Pool */}
        <div className={styles.pool}>
          {validIndices.slice(0, 6).map((bIdx) => {
            const inPool = pool.includes(bIdx);
            if (!inPool) return <div key={bIdx} className={styles.poolCardGhost} />;
            const block = blocks[bIdx];
            const rot = ROTATIONS[bIdx % ROTATIONS.length];
            const isSel = selected === bIdx;
            return (
              <div key={bIdx} className={[styles.poolCardOuter, isSel ? styles.poolCardSelected : ''].filter(Boolean).join(' ')} style={{ transform: `rotate(${rot}deg)` }}>
                <div className={styles.poolCard} onClick={() => handlePoolTap(bIdx)}>
                  <img src="/assets/games/003/launch/card-shape.svg" alt="" className={styles.poolCardBg} draggable={false} />
                  <p className={styles.poolTitle}>{block.text}</p>
                </div>
                <InfoButton size="sm" variant="dark" className={styles.infoBtn} onClick={(e) => handleInfoTap(bIdx, e)} />
              </div>
            );
          })}
          <div className={styles.gridLastRow}>
            {validIndices.slice(6).map((bIdx) => {
              const inPool = pool.includes(bIdx);
              if (!inPool) return <div key={bIdx} className={styles.poolCardGhost} />;
              const block = blocks[bIdx];
              const rot = ROTATIONS[bIdx % ROTATIONS.length];
              const isSel = selected === bIdx;
              return (
                <div key={bIdx} className={[styles.poolCardOuter, isSel ? styles.poolCardSelected : ''].filter(Boolean).join(' ')} style={{ transform: `rotate(${rot}deg)` }}>
                  <div className={styles.poolCard} onClick={() => handlePoolTap(bIdx)}>
                    <img src="/assets/games/003/launch/card-shape.svg" alt="" className={styles.poolCardBg} draggable={false} />
                    <p className={styles.poolTitle}>{block.text}</p>
                  </div>
                  <InfoButton size="sm" variant="dark" className={styles.infoBtn} onClick={(e) => handleInfoTap(bIdx, e)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timelineSection}>
          <p className={styles.timelineHeading}>Таймлайн проекта</p>

          <div className={styles.slotsGrid}>
            {renderSlot(0)}
            {renderSlot(1)}
            {renderSlot(2)}

            <div
              className={[
                styles.parallelZone,
                parallelActive ? styles.parallelZoneActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {parallelActive && (
                <span className={styles.parallelLabel}>параллельно</span>
              )}
              <div className={styles.parallelSlots}>
                {renderSlot(3)}
                {renderSlot(4)}
              </div>
            </div>

            {renderSlot(5)}
            <div className={styles.gridLastRow}>
              {renderSlot(6)}
              {renderSlot(7)}
            </div>
          </div>

          <p className={styles.durationHint}>
            {animating || showComplete
              ? 'Продукт запускается за 4 месяца!'
              : allPlaced
                ? 'Готово — нажми «Проверить»'
                : 'Выбирай карточку, затем ячейку в таймлайне'}
          </p>
        </div>

        {allPlaced && !checked && !animating && (
          <div className={styles.btnWrap}>
            <Button label="Проверить" type="main" onClick={handleCheck} />
          </div>
        )}
      </div>

      {/* Description popup */}
      {descriptionFor !== null && (
        <div
          className={`${styles.overlay} ${overlayClass}`}
          onClick={() => { setDescriptionFor(null); setWordTooltip(null); }}
        >
          <div className={styles.descCard} onClick={(e) => e.stopPropagation()}>
            {blocks[descriptionFor]?.icon && (
              <img
                src={blocks[descriptionFor].icon}
                alt=""
                className={styles.descIcon}
                draggable={false}
              />
            )}
            <h3 className={styles.descTitle}>{blocks[descriptionFor]?.text}</h3>
            <p className={styles.descBody}>
              {renderTooltips(
                blocks[descriptionFor]?.description ?? '',
                setWordTooltip,
                styles.tooltipWord,
              )}
            </p>

            {/* Inline word tooltip */}
            {wordTooltip && (
              <div className={styles.wordTooltipBox}>
                <p className={styles.wordTooltipText}>{wordTooltip}</p>
                <button className={styles.wordTooltipClose} onClick={() => setWordTooltip(null)}>✕</button>
              </div>
            )}

            <button
              className={styles.descBtn}
              onClick={() => { setDescriptionFor(null); setWordTooltip(null); }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Word tooltip from prompt (outside description popup) */}
      {wordTooltip && descriptionFor === null && (
        <div
          className={`${styles.overlay} ${overlayClass}`}
          onClick={() => setWordTooltip(null)}
        >
          <div className={styles.wordTooltipCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.wordTooltipCardText}>{wordTooltip}</p>
            <button className={styles.descBtn} onClick={() => setWordTooltip(null)}>
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Error popup */}
      {showError && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>!</div>
            <h3 className={styles.errorTitle}>Не совсем...</h3>
            <p className={styles.errorBody}>{errorMsg}</p>
            <p className={styles.errorAttempts}>
              Осталось попыток: {MAX_ATTEMPTS - attemptCount}
            </p>
            <button className={styles.retryBtn} onClick={() => doReset(false)}>
              Попробовать снова
            </button>
          </div>
        </div>
      )}

      {/* Failure popup (after MAX_ATTEMPTS wrong answers) */}
      {showFailed && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <div className={styles.failedCard}>
            <div className={styles.failedIcon}>✕</div>
            <h2 className={styles.failedTitle}>Правильный запуск экономит время и деньги, но ошибки случаются — для этого и стоит учиться.</h2>
            <p className={styles.failedBody}>
              Если бы тебе пришлось запускать видеоблог, из каких этапов состоял бы твой запуск?
            </p>
            <button className={styles.retryBtn} onClick={() => doReset(true)}>
              Попробовать ещё раз
            </button>
          </div>
        </div>
      )}

      {/* Completion popup */}
      {showComplete && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <div className={styles.completeCard}>
            <div className={styles.completeCheck}>✓</div>
            <h2 className={styles.completeTitle}>Продукт запущен за 4 месяца!</h2>
            <p className={styles.completeStat}>
              Проджект-менеджер не пишет код и не рисует дизайн. Он выстраивает порядок, в котором работает вся команда. Правильная последовательность экономит месяцы работы и миллионы рублей.
            </p>
            <p className={styles.completeQuestion}>
              Если бы тебе пришлось запускать видеоблог, из каких этапов состоял бы твой запуск?
            </p>
            <button className={styles.completeBtn} onClick={handleComplete}>
              Далее
            </button>
          </div>
        </div>
      )}
    </Background>
  );
}
