import { useState, useCallback } from 'react';
import { Background, Button } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './CategorizeGame.module.css';

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

type Popup =
  | { kind: 'correct'; explanation: string }
  | { kind: 'wrong'; hint: string }
  | { kind: 'category'; tooltip: string; title: string }
  | null;

export function CategorizeGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  // itemIndex → categoryId (only correct placements persist)
  const [correctPlacements, setCorrectPlacements] = useState<Record<number, string>>({});
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(null);
  const [wordTooltip, setWordTooltip] = useState<string | null>(null);

  const correctCount = Object.keys(correctPlacements).length;
  const allPlaced = items.length > 0 && correctCount === items.length;

  const tryPlace = useCallback((itemIndex: number, categoryId: string) => {
    if (correctPlacements[itemIndex] !== undefined) return; // already placed
    const item = items[itemIndex];
    if (!item) return;

    if (item.belongs?.includes(categoryId)) {
      setCorrectPlacements((prev) => ({ ...prev, [itemIndex]: categoryId }));
      setPopup({ kind: 'correct', explanation: item.explanation });
    } else {
      setPopup({ kind: 'wrong', hint: item.wrongHint || 'Попробуй другую группу.' });
    }
    setSelectedItem(null);
  }, [correctPlacements, items]);

  const handleItemClick = useCallback((itemIndex: number) => {
    if (popup) return;
    if (correctPlacements[itemIndex] !== undefined) return;
    setSelectedItem((prev) => (prev === itemIndex ? null : itemIndex));
  }, [popup, correctPlacements]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    if (popup) return;
    if (selectedItem !== null) {
      tryPlace(selectedItem, categoryId);
    }
  }, [popup, selectedItem, tryPlace]);

  const handleCategoryInfoClick = useCallback((e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat?.tooltip) return;
    setPopup({ kind: 'category', tooltip: cat.tooltip, title: cat.title });
  }, [categories]);

  const handleDragStart = useCallback((itemIndex: number) => {
    if (popup) return;
    setDraggedItem(itemIndex);
    setSelectedItem(null);
  }, [popup]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverCategory(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOverCategory(categoryId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverCategory(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedItem !== null) {
      tryPlace(draggedItem, categoryId);
    }
    setDraggedItem(null);
    setDragOverCategory(null);
  }, [draggedItem, tryPlace]);

  const handlePopupDismiss = useCallback(() => {
    setWordTooltip(null);
    setPopup(null);
    if (allPlaced) {
      const results: GameResult[] = items.map((item) => ({
        answer: item.text || item.name || '',
        correct: true,
        explanation: item.explanation,
      }));
      onComplete(results);
    }
  }, [allPlaced, items, onComplete]);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.instruction}>{step.prompt || 'Перетащи карточки в нужную зону'}</p>
          <span className={styles.counter}>Разложено: {correctCount}/{items.length}</span>
        </div>

        {/* Drop zones */}
        <div className={styles.columnsArea}>
          {categories.map((cat) => {
            const placedIndices = Object.entries(correctPlacements)
              .filter(([, cid]) => cid === cat.id)
              .map(([idx]) => Number(idx));
            const isDragOver = dragOverCategory === cat.id;
            const isTarget = selectedItem !== null;

            return (
              <div
                key={cat.id}
                className={[
                  styles.column,
                  isDragOver ? styles.columnDragOver : '',
                  isTarget ? styles.columnTarget : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleCategoryClick(cat.id)}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cat.id)}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitles}>
                    <span className={styles.columnTitle}>{cat.title}</span>
                    <span className={styles.columnDesc}>{cat.description}</span>
                  </div>
                  {cat.tooltip && (
                    <button
                      type="button"
                      className={styles.categoryInfoBtn}
                      onClick={(e) => handleCategoryInfoClick(e, cat.id)}
                      aria-label={`О группе ${cat.title}`}
                    >
                      ?
                    </button>
                  )}
                </div>

                <div className={styles.columnBody}>
                  {placedIndices.map((itemIdx) => {
                    const item = items[itemIdx];
                    return (
                      <div key={itemIdx} className={styles.chip}>
                        <span className={styles.chipText}>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Card tray */}
        <div className={styles.tray}>
          {items.map((item, idx) => {
            const isPlaced = correctPlacements[idx] !== undefined;
            const isSelected = selectedItem === idx;
            const isDragging = draggedItem === idx;

            return (
              <div
                key={idx}
                className={[
                  styles.card,
                  isSelected ? styles.cardSelected : '',
                  isDragging ? styles.cardDragging : '',
                  isPlaced ? styles.cardPlaced : '',
                ].filter(Boolean).join(' ')}
                draggable={!isPlaced}
                onClick={() => !isPlaced && handleItemClick(idx)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
              >
                <span className={styles.cardText}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup overlay */}
      {popup && (
        <div className={styles.overlay}>
          <div className={[
            styles.popup,
            popup.kind === 'correct' ? styles.popupCorrect : '',
            popup.kind === 'wrong' ? styles.popupWrong : '',
          ].filter(Boolean).join(' ')}>

            {popup.kind === 'correct' && (
              <>
                <p className={styles.popupTitle}>Верно!</p>
                <p className={styles.popupBody}>
                  {renderTooltips(popup.explanation, setWordTooltip, styles.tooltipWord)}
                </p>
                {wordTooltip && (
                  <div className={styles.wordTooltipBox}>
                    <p className={styles.wordTooltipText}>{wordTooltip}</p>
                    <button type="button" className={styles.wordTooltipClose} onClick={() => setWordTooltip(null)}>✕</button>
                  </div>
                )}
                <Button
                  label={allPlaced ? 'Результаты' : 'Продолжить'}
                  type="main"
                  onClick={handlePopupDismiss}
                />
              </>
            )}

            {popup.kind === 'wrong' && (
              <>
                <p className={styles.popupTitle}>Не совсем</p>
                <p className={styles.popupBody}>{popup.hint}</p>
                <Button label="Попробовать ещё" type="main" onClick={handlePopupDismiss} />
              </>
            )}

            {popup.kind === 'category' && (
              <>
                <p className={styles.popupTitle}>{popup.title}</p>
                <p className={styles.popupBody}>{popup.tooltip}</p>
                <Button label="Понятно" type="main" onClick={handlePopupDismiss} />
              </>
            )}
          </div>
        </div>
      )}
    </Background>
  );
}
