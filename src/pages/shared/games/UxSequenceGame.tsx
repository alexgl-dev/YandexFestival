import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Background, Button, Icon } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './UxSequenceGame.module.css';

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

type FlyingItem = {
  id: number;
  text: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  height: number;
};

const FLY_DURATION = 420;
const COLLAPSE_DURATION = 300;
const MAX_ERRORS = 3;
const CHECK_DELAY = 900;
const SUCCESS_DELAY = 1800;

function FlyingBlock({ item }: { item: FlyingItem }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMoved(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const dx = item.toX - item.fromX;
  const dy = item.toY - item.fromY;

  return (
    <div
      className={styles.flyingBlock}
      style={{
        left: item.fromX,
        top: item.fromY,
        width: item.width,
        height: item.height,
        transform: moved
          ? `translate(${dx}px, ${dy}px) scale(1)`
          : 'translate(0, 0) scale(1.04)',
        transition: moved
          ? `transform ${FLY_DURATION}ms cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow ${FLY_DURATION}ms ease`
          : 'none',
        boxShadow: moved
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 16px 40px rgba(0,0,0,0.35)',
      }}
    >
      <span className={styles.flyingBlockText}>{item.text}</span>
    </div>
  );
}

export function UxSequenceGame({
  task,
  onComplete,
  onBack,
  theme = 'orange',
  orientation = 'portrait',
}: GameProps) {
  const step = task.steps[0];
  const blocks = step?.blocks ?? [];
  const slotCount = blocks.filter((b) => b.order !== null).length;
  const allIndices = blocks.map((_, i) => i);

  const makeShuffled = () => [...allIndices].sort(() => Math.random() - 0.5);

  const [available, setAvailable] = useState<number[]>(makeShuffled);
  const [trashed, setTrashed] = useState<number[]>([]);
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array(slotCount).fill(null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | 'idle')[]>(
    () => Array(slotCount).fill('idle'),
  );
  const [errorCount, setErrorCount] = useState(0);
  const [hintSlot, setHintSlot] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [showMoralFailure, setShowMoralFailure] = useState(false);
  const [success, setSuccess] = useState(false);

  const blockRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const flyIdRef = useRef(0);
  const [collapsing, setCollapsing] = useState<Set<number>>(new Set());

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const hardReset = useCallback(() => {
    setAvailable(makeShuffled());
    setTrashed([]);
    setSlots(Array(slotCount).fill(null));
    setSelected(null);
    setChecked(false);
    setSlotResults(Array(slotCount).fill('idle'));
    setHintSlot(null);
    setHintOpen(false);
    setSuccess(false);
    setErrorCount(0);
    setShowMoralFailure(false);
  }, [slotCount]);

  const allPlaced = slots.every((s) => s !== null);
  const interactionsLocked = checked || success;

  const selectBlock = useCallback(
    (idx: number) => {
      if (interactionsLocked) return;
      setSelected((prev) => (prev === idx ? null : idx));
    },
    [interactionsLocked],
  );

  const trashBlock = useCallback(
    (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (interactionsLocked) return;
      setAvailable((a) => a.filter((i) => i !== idx));
      setTrashed((t) => [...t, idx]);
      setSelected((s) => (s === idx ? null : s));
    },
    [interactionsLocked],
  );

  const restoreBlock = useCallback(
    (idx: number) => {
      if (interactionsLocked) return;
      setTrashed((t) => t.filter((i) => i !== idx));
      setAvailable((a) => [...a, idx]);
    },
    [interactionsLocked],
  );

  const placeInSlot = useCallback(
    (slotIdx: number) => {
      if (interactionsLocked) return;

      if (selected !== null) {
        const blockIdx = selected;
        const prevInSlot = slots[slotIdx];
        const blockEl = blockRefs.current.get(blockIdx);
        const slotEl = slotRefs.current.get(slotIdx);

        setSelected(null);

        if (hintSlot === slotIdx) {
          setHintSlot(null);
          setHintOpen(false);
        }

        if (blockEl && slotEl) {
          const fromRect = blockEl.getBoundingClientRect();
          const toRect = slotEl.getBoundingClientRect();
          const flyId = flyIdRef.current++;

          setCollapsing((h) => new Set([...h, blockIdx]));
          setFlyingItems((items) => [
            ...items,
            {
              id: flyId,
              text: blocks[blockIdx].text || '',
              fromX: fromRect.left,
              fromY: fromRect.top,
              toX: toRect.left,
              toY: toRect.top,
              width: fromRect.width,
              height: fromRect.height,
            },
          ]);

          const t1 = setTimeout(() => {
            setAvailable((a) => {
              let next = a.filter((i) => i !== blockIdx);
              if (prevInSlot !== null) next = [...next, prevInSlot];
              return next;
            });
            setCollapsing((h) => {
              const n = new Set(h);
              n.delete(blockIdx);
              return n;
            });
          }, COLLAPSE_DURATION);

          const t2 = setTimeout(() => {
            setSlots((s) => {
              const n = [...s];
              n[slotIdx] = blockIdx;
              return n;
            });
            setFlyingItems((items) => items.filter((item) => item.id !== flyId));
          }, FLY_DURATION);

          timersRef.current.push(t1, t2);
        } else {
          setSlots((s) => {
            const n = [...s];
            n[slotIdx] = blockIdx;
            return n;
          });
          setAvailable((a) => {
            let next = a.filter((i) => i !== blockIdx);
            if (prevInSlot !== null) next = [...next, prevInSlot];
            return next;
          });
        }
      } else if (slots[slotIdx] !== null) {
        const blockIdx = slots[slotIdx]!;
        setSlots((s) => {
          const n = [...s];
          n[slotIdx] = null;
          return n;
        });
        setAvailable((a) => [...a, blockIdx]);
      }
    },
    [interactionsLocked, selected, slots, hintSlot, blocks],
  );

  const handleCheck = useCallback(() => {
    if (!allPlaced || checked) return;
    setChecked(true);

    const results = slots.map((bIdx, sIdx) => {
      if (bIdx === null) return 'idle' as const;
      return blocks[bIdx].order === sIdx + 1
        ? ('correct' as const)
        : ('wrong' as const);
    });
    setSlotResults(results);

    const allCorrect = results.every((r) => r === 'correct');

    if (allCorrect) {
      setSuccess(true);
      const t = setTimeout(() => {
        onComplete([
          {
            correct: true,
            answer: slots
              .map((bIdx) => (bIdx !== null ? blocks[bIdx].text || '' : ''))
              .join(' → '),
            explanation: 'Верная последовательность заказа!',
          },
        ]);
      }, SUCCESS_DELAY);
      timersRef.current.push(t);
      return;
    }

    const newErrorCount = errorCount + 1;
    const firstWrong = results.findIndex((r) => r === 'wrong');

    const t = setTimeout(() => {
      setAvailable((a) => {
        const placed = slots.filter((s): s is number => s !== null);
        return [...a, ...placed];
      });
      setSlots(Array(slotCount).fill(null));
      setSlotResults(Array(slotCount).fill('idle'));
      setChecked(false);
      setErrorCount(newErrorCount);

      if (newErrorCount >= MAX_ERRORS) {
        setShowMoralFailure(true);
      } else {
        setHintSlot(firstWrong);
      }
    }, CHECK_DELAY);
    timersRef.current.push(t);
  }, [allPlaced, checked, slots, blocks, errorCount, slotCount, onComplete]);

  const handleSlotTap = (sIdx: number) => {
    const isHint = hintSlot === sIdx;
    if (isHint && selected === null && slots[sIdx] === null) {
      setHintOpen(true);
      return;
    }
    placeInSlot(sIdx);
  };

  const hintText =
    hintSlot !== null
      ? blocks.find((b) => b.order === hintSlot + 1)?.text ?? ''
      : '';

  const overlayClass =
    orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.page}>
        <div className={styles.topRow}>
          <p className={styles.title}>{task.title}</p>
          <div className={styles.errors}>
            <span className={styles.errorsLabel}>Ошибки</span>
            <div className={styles.errorsDots}>
              {Array.from({ length: MAX_ERRORS }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.errorDot} ${
                    i < errorCount ? styles.errorDotActive : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.slotsCol}>
            <p className={styles.heading}>Путь пользователя</p>
            {slots.map((bIdx, sIdx) => {
              const block = bIdx !== null ? blocks[bIdx] : null;
              const result = slotResults[sIdx];
              const isHint = hintSlot === sIdx;
              return (
                <div
                  key={sIdx}
                  ref={(el) => {
                    if (el) slotRefs.current.set(sIdx, el);
                    else slotRefs.current.delete(sIdx);
                  }}
                  className={[
                    styles.slot,
                    block ? styles.slotFilled : styles.slotEmpty,
                    result === 'correct' ? styles.slotCorrect : '',
                    result === 'wrong' ? styles.slotWrong : '',
                    success ? styles.slotSuccess : '',
                    isHint ? styles.slotHint : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSlotTap(sIdx)}
                  style={success ? { animationDelay: `${sIdx * 120}ms` } : undefined}
                >
                  <span className={styles.slotNum}>{sIdx + 1}</span>
                  {block ? (
                    <span className={styles.slotText}>{block.text}</span>
                  ) : isHint ? (
                    <span className={styles.slotHintLabel}>Подсказка</span>
                  ) : (
                    <span className={styles.slotPlaceholder}>пустая ячейка</span>
                  )}
                  {block && result === 'correct' && (
                    <span className={styles.slotStatusIcon}>
                      <Icon name="done" color="blue" size="s" />
                    </span>
                  )}
                  {block && result === 'wrong' && (
                    <span className={styles.slotStatusIcon}>
                      <Icon name="close" color="red" size="s" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.poolCol}>
            <p className={styles.heading}>Шаги</p>
            {available.map((bIdx) => {
              const isCollapsing = collapsing.has(bIdx);
              const isSel = selected === bIdx;
              return (
                <div
                  key={bIdx}
                  ref={(el) => {
                    if (el) blockRefs.current.set(bIdx, el);
                    else blockRefs.current.delete(bIdx);
                  }}
                  className={`${styles.blockWrapper} ${
                    isCollapsing ? styles.blockWrapperCollapsing : ''
                  }`}
                >
                  <div
                    className={styles.blockInner}
                    style={{ visibility: isCollapsing ? 'hidden' : 'visible' }}
                  >
                    <div
                      className={`${styles.block} ${isSel ? styles.blockSelected : ''}`}
                      onClick={() => selectBlock(bIdx)}
                    >
                      <span className={styles.blockText}>{blocks[bIdx].text}</span>
                      <button
                        type="button"
                        className={styles.blockClose}
                        onClick={(e) => trashBlock(bIdx, e)}
                        aria-label="Удалить"
                      >
                        <Icon name="close" color="red" size="s" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {trashed.length > 0 && (
              <>
                <p className={styles.trashHeading}>Удалённые шаги</p>
                {trashed.map((bIdx) => (
                  <div
                    key={bIdx}
                    className={styles.trashedBlock}
                    onClick={() => restoreBlock(bIdx)}
                  >
                    <span className={styles.trashedText}>{blocks[bIdx].text}</span>
                    <span className={styles.restoreLabel}>Вернуть ↺</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {allPlaced && !checked && !success && (
          <div className={styles.btnWrap}>
            <Button label="Запуск" type="main" onClick={handleCheck} />
          </div>
        )}

        {success && (
          <div className={styles.pizzaRoll}>
            <span className={styles.pizzaEmoji}>🍕</span>
          </div>
        )}
      </div>

      {/* Hint popup */}
      {hintOpen && hintSlot !== null && (
        <div
          className={`${styles.overlay} ${overlayClass}`}
          onClick={() => setHintOpen(false)}
        >
          <div className={styles.hintCard} onClick={(e) => e.stopPropagation()}>
            <p className={styles.hintTopLabel}>Подсказка · шаг {hintSlot + 1}</p>
            <p className={styles.hintText}>{hintText}</p>
            <Button label="Понятно" type="main" onClick={() => setHintOpen(false)} />
          </div>
        </div>
      )}

      {/* Failure popup after MAX_ERRORS */}
      {showMoralFailure && (
        <div className={`${styles.overlay} ${overlayClass}`}>
          <div className={styles.moralCard}>
            <h3 className={styles.moralTitle}>Давай ещё раз</h3>
            <p className={styles.moralText}>
              {task.moralFailure || task.moral}
            </p>
            <Button
              label="Попробовать ещё раз"
              type="main"
              onClick={hardReset}
            />
          </div>
        </div>
      )}

      {flyingItems.length > 0 &&
        createPortal(
          <>
            {flyingItems.map((item) => (
              <FlyingBlock key={item.id} item={item} />
            ))}
          </>,
          document.body,
        )}
    </Background>
  );
}
