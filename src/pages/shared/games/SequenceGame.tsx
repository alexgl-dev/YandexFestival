import { useState, useCallback } from 'react';
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
}

export function SequenceGame({ task, onComplete, onBack }: GameProps) {
  const step = task.steps[0];
  const blocks = step?.blocks ?? [];
  const orderedCount = blocks.filter((b) => b.order !== null).length;

  // Only show blocks that have an order (filter out trash blocks)
  const validBlockIndices = blocks.map((b, i) => ({ b, i })).filter(({ b }) => b.order !== null).map(({ i }) => i);

  const [available, setAvailable] = useState<number[]>(() =>
    [...validBlockIndices].sort(() => Math.random() - 0.5)
  );
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(orderedCount).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | null)[]>(() => Array(orderedCount).fill(null));

  const allPlaced = available.length === 0;

  const selectBlock = useCallback((idx: number) => {
    if (checked) return;
    setSelected((prev) => (prev === idx ? null : idx));
  }, [checked]);

  const placeInSlot = useCallback((slotIdx: number) => {
    if (checked) return;
    if (selected !== null) {
      const prev = slots[slotIdx];
      setSlots((s) => { const n = [...s]; n[slotIdx] = selected; return n; });
      setAvailable((a) => {
        let next = a.filter((i) => i !== selected);
        if (prev !== null) next = [...next, prev];
        return next;
      });
      setSelected(null);
    } else if (slots[slotIdx] !== null) {
      const blockIdx = slots[slotIdx]!;
      setSlots((s) => { const n = [...s]; n[slotIdx] = null; return n; });
      setAvailable((a) => [...a, blockIdx]);
    }
  }, [checked, selected, slots]);

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
    <Background theme="cobalt" orientation="landscape" onBack={onBack}>
      <div className={styles.page}>
       <div className={styles.columns}>
        <div className={styles.left}>
          <p className={styles.heading}>Доступные шаги</p>
          {available.map((bIdx) => (
            <ListItem
              key={bIdx}
              title={blocks[bIdx].text || ''}
              state={selected === bIdx ? 'pressed' : 'default'}
              onClick={() => selectBlock(bIdx)}
            />
          ))}
          {available.length === 0 && !checked && (
            <p className={styles.empty}>Все размещены</p>
          )}
        </div>

        <div className={styles.right}>
          <p className={styles.heading}>Порядок</p>
          {slots.map((bIdx, sIdx) => (
            <ListItem
              key={`slot-${sIdx}`}
              title={bIdx !== null ? (blocks[bIdx].text || '') : `Шаг ${sIdx + 1}`}
              state={checked && slotResults[sIdx] === 'correct' ? 'pressed' : 'default'}
              onClick={() => placeInSlot(sIdx)}
            />
          ))}
        </div>
       </div>
      </div>

      {!checked && allPlaced && (
        <div className={styles.btnWrap}>
          <Button label="Проверить" type="main" onClick={handleCheck} />
        </div>
      )}

      {showPopup && checked && (
        <div className={styles.overlay}>
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
    </Background>
  );
}
