import { useState, useCallback, useEffect, useRef } from 'react';
import { Background, Button, InfoButton, PopUp } from '../../../components/ui';
import type { Task, TaskBlock } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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

// Slots that have a right-side chevron (flow continues to the right / next row)
const SLOTS_WITH_ARROW_RIGHT = new Set([0, 1, 2, 3, 4, 5, 6]);
// Slots that have a left-side chevron (flow enters from previous row)
const SLOTS_WITH_ARROW_LEFT = new Set([3, 6]);

// Abstract hints for empty slots by slot index (0-based)
const SLOT_HINTS: string[] = [
  'Перед тем как что-то делать, нужно понять, для кого мы это делаем и зачем.',
  'Стало понятно, кто твой пользователь? Значит, пора описать, что именно нужно сделать.',
  'Задача поставлена. Пора нарисовать, как это будет выглядеть.',
  'Время оживить макет кодом.',
  'Пока разработчики дописывают, маркетинг готовит запуск.',
  'Код написан? Перед тем как показывать пользователю, нужно проверить, всё ли работает.',
  'Всё протестировано и исправлено. Вперёд!',
  'Продукт живёт. Теперь нужно послушать тех, кто им пользуется.',
];

// Fixed error messages by attempt number (1st, 2nd)
const ATTEMPT_HINTS: string[] = [
  'Не совсем. Попробуй зайти с другой стороны: подумай не о том, что удобнее делать, а о том, что невозможно сделать без предыдущего шага. Логика запуска — это цепочка зависимостей. Найди её.',
  'Упс. Кажется, некоторые этапы оказались не на своих местах. Не забывай тапать на карточки с этапами и пустые ячейки, чтобы разобраться.',
];

// Correct-sequence explanation shown after 3 failures
const CORRECT_STEPS: { title: string; body: string }[] = [
  {
    title: 'Шаг 1. Исследование пользователей',
    body: 'Всё начинается с вопроса «Для кого?». Прежде чем придумывать продукт, нужно понять, кто им будет пользоваться и какую проблему он решает. Команда, которая пропускает этот шаг, рискует сделать продукт, который никому не нужен.',
  },
  {
    title: 'Шаг 2. Постановка задачи',
    body: 'Теперь, когда понятно «Для кого?», нужно ответить на вопрос «Что именно делаем?». Здесь фиксируются цели, требования и критерии успеха. Без этого шага разработчики, дизайнеры и маркетологи будут двигаться в разные стороны.',
  },
  {
    title: 'Шаг 3. Дизайн и прототип',
    body: 'Задача описана — пора нарисовать, как это будет выглядеть. Дизайнеры делают черновые макеты, команда их обсуждает и правит. Гораздо дешевле переделать картинку, чем переписывать готовый код.',
  },
  {
    title: 'Шаг 4. Разработка',
    body: 'Макет утверждён — разработчики начинают писать код. Это самый долгий этап. Именно поэтому важно, чтобы к его началу все решения уже были приняты: переделки на этом этапе стоят дорого.',
  },
  {
    title: 'Шаг 5. Подготовка маркетинговой кампании',
    body: 'Отдел маркетинга готовит материалы, продумывает стратегию запуска. К моменту релиза всё должно быть готово одновременно: и продукт, и его продвижение.',
  },
  {
    title: 'Шаг 6. Тестирование',
    body: 'Код написан, но выпускать продукт ещё рано. Тестировщики проверяют каждую функцию, ищут баги и неудобства. Лучше найти проблему сейчас, чем получить гневные отзывы от пользователей после релиза.',
  },
  {
    title: 'Шаг 7. Релиз',
    body: 'Всё проверено, всё готово. Продукт выходит к пользователям. Команда в этот момент не расслабляется — следит за тем, чтобы при запуске ничего не сломалось.',
  },
  {
    title: 'Шаг 8. Сбор обратной связи',
    body: 'Релиз — это не финал, а начало следующего цикла. Пользователи начинают писать отзывы, аналитики смотрят на цифры, команда собирает всё это и планирует следующую версию приложения. Хороший продукт никогда не бывает «окончательно готов».',
  },
];

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
  const [displayOrder] = useState<number[]>(() =>
    [...validIndices].sort(() => Math.random() - 0.5),
  );
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array(slotCount).fill(null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [descriptionFor, setDescriptionFor] = useState<number | null>(null);
  const [slotHintFor, setSlotHintFor] = useState<number | null>(null);
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
      } else {
        // Empty slot, no card selected — show an abstract hint for this stage
        setSlotHintFor(sIdx);
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
      setSlotHintFor(null);
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
        setErrorMsg(ATTEMPT_HINTS[newCount - 1] ?? ATTEMPT_HINTS[ATTEMPT_HINTS.length - 1]);
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
      <div
        key={sIdx}
        className={[
          styles.slotWrapper,
          SLOTS_WITH_ARROW_RIGHT.has(sIdx) ? styles.slotWrapperArrow : '',
          SLOTS_WITH_ARROW_LEFT.has(sIdx) ? styles.slotWrapperArrowLeft : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
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
      <GameInstruction instruction={task.instruction} />
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
          {displayOrder.slice(0, 6).map((bIdx) => {
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
            {displayOrder.slice(6).map((bIdx) => {
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
              {/* {parallelActive && (
                <span className={styles.parallelLabel}>параллельно</span>
              )} */}
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
                : ''}
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
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={blocks[descriptionFor]?.text ?? ''}
              description={
                <>
                  {renderTooltips(
                    blocks[descriptionFor]?.description ?? '',
                    setWordTooltip,
                    styles.tooltipWord,
                  )}
                  {wordTooltip && (
                    <div className={styles.wordTooltipBox}>
                      <p className={styles.wordTooltipText}>{wordTooltip}</p>
                      <button
                        className={styles.wordTooltipClose}
                        onClick={() => setWordTooltip(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              }
              buttonLabel="Понятно"
              onButtonClick={() => { setDescriptionFor(null); setWordTooltip(null); }}
            />
          </div>
        </div>
      )}

      {/* Slot hint popup (tapped an empty slot without a selected card) */}
      {slotHintFor !== null && (
        <div
          className={`${styles.overlay} ${overlayClass}`}
          onClick={() => setSlotHintFor(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={`Шаг ${slotHintFor + 1}`}
              description={SLOT_HINTS[slotHintFor]}
              buttonLabel="Понятно"
              onButtonClick={() => setSlotHintFor(null)}
            />
          </div>
        </div>
      )}

      {/* Word tooltip from prompt (outside description popup) */}
      {wordTooltip && descriptionFor === null && (
        <div
          className={`${styles.overlay} ${overlayClass}`}
          onClick={() => setWordTooltip(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              description={wordTooltip}
              buttonLabel="Понятно"
              onButtonClick={() => setWordTooltip(null)}
            />
          </div>
        </div>
      )}

      {/* Error popup */}
      {showError && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <PopUp
            icon="close"
            iconColor="red"
            title="Не совсем..."
            description={
              <>
                <span>{errorMsg}</span>
                {'\n\n'}
                <span>Осталось попыток: {MAX_ATTEMPTS - attemptCount}</span>
              </>
            }
            buttonLabel="Попробовать снова"
            onButtonClick={() => doReset(false)}
          />
        </div>
      )}

      {/* Failure popup (after MAX_ATTEMPTS wrong answers) */}
      {showFailed && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <PopUp
            icon="close"
            iconColor="red"
            title="А вот как стоило расставить этапы, по мнению реальных проджект-менеджеров."
            description={
              <>
                <div className={styles.correctStepsList}>
                  {CORRECT_STEPS.map((s) => (
                    <div key={s.title} className={styles.correctStepItem}>
                      <p className={styles.correctStepTitle}>{s.title}</p>
                      <p className={styles.correctStepBody}>{s.body}</p>
                    </div>
                  ))}
                </div>
                <p className={styles.failedMoral}>
                  Правильный запуск экономит время и деньги, но ошибки случаются — для этого и стоит учиться.
                </p>
                <p className={styles.failedBody}>
                  А если бы тебе пришлось запускать видеоблог, из каких этапов состоял бы твой запуск?
                </p>
              </>
            }
            buttonLabel="Попробовать ещё раз"
            onButtonClick={() => doReset(true)}
          />
        </div>
      )}

      {/* Completion popup */}
      {showComplete && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <PopUp
            icon="done"
            iconColor="blue"
            title="Поздравляем!"
            description="Тебе удалось правильно расставить все этапы. Продукт запущен за 4 месяца."
            buttonLabel="Далее"
            onButtonClick={handleComplete}
          />
        </div>
      )}
    </Background>
  );
}
