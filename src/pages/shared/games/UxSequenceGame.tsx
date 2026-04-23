import { useState, useCallback, useRef, useEffect } from 'react';
import { Background, Button, Icon, InfoButton, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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

const MAX_ERRORS = 3;
const CHECK_DELAY = 2200;
const SUCCESS_DELAY = 1800;

type DragSource =
  | { kind: 'pool'; blockIdx: number }
  | { kind: 'slot'; slotIdx: number };

function encodeSource(src: DragSource): string {
  return src.kind === 'pool' ? `pool:${src.blockIdx}` : `slot:${src.slotIdx}`;
}

function decodeSource(raw: string): DragSource | null {
  const [kind, rawIdx] = raw.split(':');
  const idx = Number(rawIdx);
  if (!Number.isFinite(idx)) return null;
  if (kind === 'pool') return { kind: 'pool', blockIdx: idx };
  if (kind === 'slot') return { kind: 'slot', slotIdx: idx };
  return null;
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
  const [checked, setChecked] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | 'idle')[]>(
    () => Array(slotCount).fill('idle'),
  );
  const [errorCount, setErrorCount] = useState(0);
  const [hintSlot, setHintSlot] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [showMoralFailure, setShowMoralFailure] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState<DragSource | null>(null);
  const [dropTarget, setDropTarget] = useState<
    { kind: 'slot'; slotIdx: number } | { kind: 'pool' } | null
  >(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const hardReset = useCallback(() => {
    setAvailable(makeShuffled());
    setTrashed([]);
    setSlots(Array(slotCount).fill(null));
    setChecked(false);
    setSlotResults(Array(slotCount).fill('idle'));
    setHintSlot(null);
    setHintOpen(false);
    setSuccess(false);
    setErrorCount(0);
    setShowMoralFailure(false);
    setDragging(null);
    setDropTarget(null);
  }, [slotCount]);

  const allPlaced = slots.every((s) => s !== null);
  const interactionsLocked = checked || success;

  const trashBlock = useCallback(
    (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (interactionsLocked) return;
      setAvailable((a) => a.filter((i) => i !== idx));
      setTrashed((t) => [...t, idx]);
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

  // ── Drag handlers ────────────────────────────────────────────────────
  const startDragPool = (blockIdx: number) => (e: React.DragEvent) => {
    if (interactionsLocked) {
      e.preventDefault();
      return;
    }
    const src: DragSource = { kind: 'pool', blockIdx };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', encodeSource(src));
    setDragging(src);
  };

  const startDragSlot = (slotIdx: number) => (e: React.DragEvent) => {
    if (interactionsLocked || slots[slotIdx] === null) {
      e.preventDefault();
      return;
    }
    const src: DragSource = { kind: 'slot', slotIdx };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', encodeSource(src));
    setDragging(src);
  };

  const endDrag = () => {
    setDragging(null);
    setDropTarget(null);
  };

  const dropOnSlot = (targetSlot: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const src = decodeSource(raw) ?? dragging;
    setDropTarget(null);
    setDragging(null);
    if (!src || interactionsLocked) return;

    if (src.kind === 'pool') {
      const blockIdx = src.blockIdx;
      const prev = slots[targetSlot];
      setSlots((s) => {
        const n = [...s];
        n[targetSlot] = blockIdx;
        return n;
      });
      setAvailable((a) => {
        let next = a.filter((i) => i !== blockIdx);
        if (prev !== null) next = [...next, prev];
        return next;
      });
      if (hintSlot === targetSlot) {
        setHintSlot(null);
        setHintOpen(false);
      }
      return;
    }

    // src.kind === 'slot' — swap slot contents
    if (src.slotIdx === targetSlot) return;
    setSlots((s) => {
      const n = [...s];
      [n[targetSlot], n[src.slotIdx]] = [n[src.slotIdx], n[targetSlot]];
      return n;
    });
    if (hintSlot === targetSlot) {
      setHintSlot(null);
      setHintOpen(false);
    }
  };

  const dropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const src = decodeSource(raw) ?? dragging;
    setDropTarget(null);
    setDragging(null);
    if (!src || interactionsLocked) return;
    if (src.kind !== 'slot') return;

    const blockIdx = slots[src.slotIdx];
    if (blockIdx === null) return;

    setSlots((s) => {
      const n = [...s];
      n[src.slotIdx] = null;
      return n;
    });
    setAvailable((a) => [...a, blockIdx]);
  };

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
      // Возвращаем в пул только неверно поставленные блоки; верные оставляем на местах.
      const wrongBlocks = slots.filter(
        (bIdx, sIdx): bIdx is number => bIdx !== null && results[sIdx] === 'wrong',
      );
      setAvailable((a) => [...a, ...wrongBlocks]);
      setSlots((s) =>
        s.map((bIdx, sIdx) => (results[sIdx] === 'correct' ? bIdx : null)),
      );
      setSlotResults((prev) =>
        prev.map((_, sIdx) => (results[sIdx] === 'correct' ? 'correct' : 'idle')),
      );
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

  const hintText =
    hintSlot !== null
      ? blocks.find((b) => b.order === hintSlot + 1)?.hint ?? ''
      : '';

  const overlayClass =
    orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.page}>
        <div className={styles.columns}>
          <div className={styles.slotsCol}>
            <p className={styles.heading}>Путь пользователя</p>
            {slots.map((bIdx, sIdx) => {
              const block = bIdx !== null ? blocks[bIdx] : null;
              const result = slotResults[sIdx];
              const isHint = hintSlot === sIdx;
              const isDropHover =
                dropTarget?.kind === 'slot' && dropTarget.slotIdx === sIdx;
              const isDraggingThis =
                dragging?.kind === 'slot' && dragging.slotIdx === sIdx;
              return (
                <div
                  key={sIdx}
                  className={[
                    styles.slot,
                    block ? styles.slotFilled : styles.slotEmpty,
                    result === 'correct' ? styles.slotCorrect : '',
                    result === 'wrong' ? styles.slotWrong : '',
                    success ? styles.slotSuccess : '',
                    isHint ? styles.slotHint : '',
                    isDropHover ? styles.slotDropHover : '',
                    isDraggingThis ? styles.slotDragging : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={!interactionsLocked && block !== null}
                  onDragStart={block !== null ? startDragSlot(sIdx) : undefined}
                  onDragEnd={endDrag}
                  onDragOver={(e) => {
                    if (interactionsLocked) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (
                      dropTarget?.kind !== 'slot' ||
                      dropTarget.slotIdx !== sIdx
                    ) {
                      setDropTarget({ kind: 'slot', slotIdx: sIdx });
                    }
                  }}
                  onDragLeave={() => {
                    if (
                      dropTarget?.kind === 'slot' &&
                      dropTarget.slotIdx === sIdx
                    ) {
                      setDropTarget(null);
                    }
                  }}
                  onDrop={dropOnSlot(sIdx)}
                  style={success ? { animationDelay: `${sIdx * 120}ms` } : undefined}
                >
                  <span className={styles.slotNum}>{sIdx + 1}</span>
                  {block ? (
                    <span className={styles.slotText}>{block.text}</span>
                  ) : (
                    <>
                      <span className={styles.slotPlaceholder}>пустая ячейка</span>
                      <InfoButton
                        size="sm"
                        variant="ghost"
                        className={styles.slotInfoBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHintSlot(sIdx);
                          setHintOpen(true);
                        }}
                      />
                    </>
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

          <div
            className={`${styles.poolCol} ${dropTarget?.kind === 'pool' ? styles.poolColDropHover : ''}`}
            onDragOver={(e) => {
              if (interactionsLocked) return;
              if (dragging?.kind !== 'slot') return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dropTarget?.kind !== 'pool') setDropTarget({ kind: 'pool' });
            }}
            onDragLeave={() => {
              if (dropTarget?.kind === 'pool') setDropTarget(null);
            }}
            onDrop={dropOnPool}
          >
            <p className={styles.heading}>Шаги</p>
            {available.map((bIdx) => {
              const isDraggingThis =
                dragging?.kind === 'pool' && dragging.blockIdx === bIdx;
              return (
                <div
                  key={bIdx}
                  className={`${styles.blockWrapper} ${
                    isDraggingThis ? styles.blockDragging : ''
                  }`}
                >
                  <div className={styles.blockInner}>
                    <div
                      className={styles.block}
                      draggable={!interactionsLocked}
                      onDragStart={startDragPool(bIdx)}
                      onDragEnd={endDrag}
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

        <div className={styles.btnWrap}>
          {allPlaced && !checked && !success && (
            <Button label="Запуск" type="main" onClick={handleCheck} />
          )}
        </div>

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
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={`Подсказка · шаг ${hintSlot + 1}`}
              description={hintText}
              buttonLabel="Понятно"
              onButtonClick={() => setHintOpen(false)}
              compact
            />
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
    </Background>
  );
}
