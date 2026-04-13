import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Background, Button, ListItem, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './SequenceGame.module.css';

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

export function SequenceGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const blocks = step?.blocks ?? [];
  const orderedCount = blocks.filter((b) => b.order !== null).length;

  const validBlockIndices = blocks
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.order !== null)
    .map(({ i }) => i);

  const [available, setAvailable] = useState<number[]>(() =>
    [...validBlockIndices].sort(() => Math.random() - 0.5)
  );
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(orderedCount).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | null)[]>(() =>
    Array(orderedCount).fill(null)
  );

  // Animation state
  const blockWrapRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const slotWrapRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const flyIdRef = useRef(0);
  // collapsingBlocks: blocks currently animating out of the available list
  const [collapsingBlocks, setCollapsingBlocks] = useState<Set<number>>(new Set());

  const allPlaced = available.length === 0;

  const selectBlock = useCallback((idx: number) => {
    if (checked) return;
    setSelected((prev) => (prev === idx ? null : idx));
  }, [checked]);

  const placeInSlot = useCallback((slotIdx: number) => {
    if (checked) return;

    if (selected !== null) {
      const selectedBlockIdx = selected;
      const prevInSlot = slots[slotIdx];

      const blockEl = blockWrapRefs.current.get(selectedBlockIdx);
      const slotEl = slotWrapRefs.current.get(slotIdx);

      setSelected(null);

      if (blockEl && slotEl) {
        const fromRect = blockEl.getBoundingClientRect();
        const toRect = slotEl.getBoundingClientRect();

        const flyId = flyIdRef.current++;

        // Start collapsing the list item (height folds, content hidden via CSS)
        setCollapsingBlocks((h) => new Set([...h, selectedBlockIdx]));

        // Spawn flying clone
        setFlyingItems((items) => [
          ...items,
          {
            id: flyId,
            text: blocks[selectedBlockIdx].text || '',
            fromX: fromRect.left,
            fromY: fromRect.top,
            toX: toRect.left,
            toY: toRect.top,
            width: fromRect.width,
            height: fromRect.height,
          },
        ]);

        // Once the collapse animation is done, remove item from available list
        setTimeout(() => {
          setAvailable((a) => {
            let next = a.filter((i) => i !== selectedBlockIdx);
            if (prevInSlot !== null) next = [...next, prevInSlot];
            return next;
          });
          setCollapsingBlocks((h) => { const n = new Set(h); n.delete(selectedBlockIdx); return n; });
        }, COLLAPSE_DURATION);

        // Once flight is done, land in slot
        setTimeout(() => {
          setSlots((s) => { const n = [...s]; n[slotIdx] = selectedBlockIdx; return n; });
          setFlyingItems((items) => items.filter((item) => item.id !== flyId));
        }, FLY_DURATION);
      } else {
        // Fallback: instant placement without animation
        setSlots((s) => { const n = [...s]; n[slotIdx] = selectedBlockIdx; return n; });
        setAvailable((a) => {
          let next = a.filter((i) => i !== selectedBlockIdx);
          if (prevInSlot !== null) next = [...next, prevInSlot];
          return next;
        });
      }
    } else if (slots[slotIdx] !== null) {
      const blockIdx = slots[slotIdx]!;
      setSlots((s) => { const n = [...s]; n[slotIdx] = null; return n; });
      setAvailable((a) => [...a, blockIdx]);
    }
  }, [checked, selected, slots, blocks]);

  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    setChecked(true);

    const sr = slots.map((bIdx, sIdx) => {
      if (bIdx === null) return null;
      return blocks[bIdx].order === sIdx + 1 ? 'correct' as const : 'wrong' as const;
    });
    setSlotResults(sr);

    if (task.feedback === 'instant') setShowPopup(true);
  }, [allPlaced, slots, blocks, task.feedback]);

  const getResult = () => {
    const allCorrect = slotResults.every((s) => s === 'correct');
    return {
      correct: allCorrect,
      answer: slots.map((idx) => idx !== null ? (blocks[idx].text || '') : '?').join(' → '),
      explanation: allCorrect
        ? 'Правильная последовательность!'
        : 'Правильный порядок: ' + blocks.filter((b) => b.order !== null).sort((a, b) => a.order! - b.order!).map((b) => b.text || '').join(' → '),
    };
  };

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.page}>
        {task.instruction && (
          <p className={styles.prompt}>{task.instruction}</p>
        )}
        <div className={styles.columns}>
          <div className={styles.left}>
            <p className={styles.heading}>Доступные шаги</p>
            {available.map((bIdx) => {
              const collapsing = collapsingBlocks.has(bIdx);
              return (
                <div
                  key={bIdx}
                  ref={(el) => { if (el) blockWrapRefs.current.set(bIdx, el); else blockWrapRefs.current.delete(bIdx); }}
                  className={`${styles.blockWrapper} ${collapsing ? styles.blockWrapperCollapsing : ''}`}
                >
                  <div
                    className={styles.blockWrapperInner}
                    style={{ visibility: collapsing ? 'hidden' : 'visible' }}
                  >
                    <ListItem
                      title={blocks[bIdx].text || ''}
                      state={selected === bIdx ? 'pressed' : 'default'}
                      onClick={() => selectBlock(bIdx)}
                    />
                  </div>
                </div>
              );
            })}
            {available.length === 0 && !checked && (
              <p className={styles.empty}>Все размещены</p>
            )}
          </div>

          <div className={styles.right}>
            <p className={styles.heading}>Порядок</p>
            {slots.map((bIdx, sIdx) => (
              <div
                key={`slot-${sIdx}`}
                ref={(el) => { if (el) slotWrapRefs.current.set(sIdx, el); else slotWrapRefs.current.delete(sIdx); }}
              >
                <ListItem
                  title={bIdx !== null ? (blocks[bIdx].text || '') : `Шаг ${sIdx + 1}`}
                  state={checked && slotResults[sIdx] === 'correct' ? 'pressed' : 'default'}
                  onClick={() => placeInSlot(sIdx)}
                />
              </div>
            ))}
          </div>
        </div>

        {!checked && allPlaced && (
          <div className={styles.btnWrap}>
            <Button label="Проверить" type="main" onClick={handleCheck} />
          </div>
        )}
      </div>

      {showPopup && checked && (
        <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
          <PopUp
            icon={getResult().correct ? 'done' : 'close'}
            iconColor={getResult().correct ? 'blue' : 'red'}
            title={getResult().correct ? 'Верно!' : 'Не совсем...'}
            description={getResult().explanation}
            buttonLabel="Далее"
            onButtonClick={() => { setShowPopup(false); onComplete([getResult()]); }}
          />
        </div>
      )}

      {flyingItems.length > 0 && createPortal(
        <>
          {flyingItems.map((item) => (
            <FlyingBlock key={item.id} item={item} />
          ))}
        </>,
        document.body
      )}
    </Background>
  );
}
