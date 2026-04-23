import { useMemo, useState, useCallback } from 'react';
import { Background, Button, InfoButton, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './CategorizeGame.module.css';

interface GameResult {
  answer: string;
  correct: boolean;
  explanation: string;
  group?: string;
}

interface GameProps {
  task: Task;
  onComplete: (results: GameResult[]) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

type Popup =
  | { kind: 'category'; tooltip: string; title: string }
  | { kind: 'info'; title: string; description: string }
  | null;

const ROTATIONS = [-2.5, 1.8, -1.2, 2.2, -1.8, 0.8, -2.2, 1.5, -0.8, 2.8, -1.5, 0.6, -2, 1.2, -0.5];

export function CategorizeGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  /** Порядок отображения карточек в пуле: случайный, фиксируется на первый маунт. */
  const shuffledOrder = useMemo(() => {
    const arr = items.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [items]);

  const isOnCompleteMode = task.feedback === 'onComplete';

  // itemIndex → categoryId
  // - instant: сохраняем только правильные размещения (как раньше)
  // - onComplete: сохраняем любые размещения; проверка в конце
  const [placements, setPlacements] = useState<Record<number, string>>({});
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(null);

  const placedCount = Object.keys(placements).length;
  const allPlaced = items.length > 0 && placedCount === items.length;

  const tryPlace = useCallback((itemIndex: number, categoryId: string) => {
    const item = items[itemIndex];
    if (!item) return;

    // instant mode: keep only correct placements
    if (!isOnCompleteMode) {
      if (placements[itemIndex] !== undefined) return; // already placed correctly
      if (item.belongs?.includes(categoryId)) {
        setPlacements((prev) => ({ ...prev, [itemIndex]: categoryId }));
      } else {
        // no per-item popup in this game mode
      }
      setSelectedItem(null);
      return;
    }

    // onComplete mode: allow any placement and re-placement
    setPlacements((prev) => ({ ...prev, [itemIndex]: categoryId }));
    setSelectedItem(null);
  }, [items, isOnCompleteMode, placements]);

  const handleItemClick = useCallback((itemIndex: number) => {
    if (popup) return;
    if (!isOnCompleteMode && placements[itemIndex] !== undefined) return;
    if (isOnCompleteMode && placements[itemIndex] !== undefined) {
      // toggle: remove from placement back to tray
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[itemIndex];
        return next;
      });
      return;
    }
    setSelectedItem((prev) => (prev === itemIndex ? null : itemIndex));
  }, [popup, placements, isOnCompleteMode]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    if (popup) return;
    if (selectedItem !== null) {
      tryPlace(selectedItem, categoryId);
    }
  }, [popup, selectedItem, tryPlace]);

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

  const placedByCategory = useMemo(() => {
    const map: Record<string, number[]> = {};
    categories.forEach((c) => { map[c.id] = []; });
    for (const [idxStr, catId] of Object.entries(placements)) {
      const idx = Number(idxStr);
      if (!Number.isFinite(idx)) continue;
      if (!map[catId]) map[catId] = [];
      map[catId].push(idx);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => a - b));
    return map;
  }, [placements, categories]);

  const buildResults = useCallback((): GameResult[] => {
    return items.map((item, idx) => {
      const label = item.text || item.name || '';
      const placedCatId = placements[idx];
      const placedCatTitle = categories.find((c) => c.id === placedCatId)?.title ?? '';
      const correct = !!placedCatId && (item.belongs?.includes(placedCatId) ?? false);
      return {
        answer: label,
        correct,
        explanation: correct
          ? 'Абсолютно верно.'
          : placedCatId
            ? `Иконка «${label}» ошибочно помещена в «${placedCatTitle}». ${item.wrongHint ?? ''}`.trim()
            : 'Иконка не распределена.',
        group: placedCatTitle,
      };
    });
  }, [items, placements, categories]);

  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    onComplete(buildResults());
  }, [allPlaced, onComplete, buildResults]);

  const handlePopupDismiss = useCallback(() => {
    setPopup(null);
  }, []);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        {step.prompt && <p className={styles.instruction}>{step.prompt}</p>}

        {/* Drop zones */}
        <div className={styles.columnsArea}>
          {categories.map((cat) => {
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
                {cat.image && (
                  <img src={cat.image} alt={cat.title} className={styles.categoryImage} />
                )}
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{cat.title}</span>
                  {cat.tooltip && (
                    <InfoButton
                      size="sm"
                      variant="ghost"
                      className={styles.columnInfo}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (popup) return;
                        if (!cat.tooltip) return;
                        setPopup({ kind: 'category', title: cat.title, tooltip: cat.tooltip });
                      }}
                    />
                  )}
                </div>

                {isOnCompleteMode && (
                  <div className={styles.placedStrip}>
                    {(placedByCategory[cat.id] ?? []).map((idx) => {
                      const it = items[idx];
                      const label = it?.name || it?.text || '';
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={styles.placedChip}
                          onClick={(e) => {
                            e.stopPropagation();
                            // remove back to tray
                            setPlacements((prev) => {
                              const next = { ...prev };
                              delete next[idx];
                              return next;
                            });
                          }}
                        >
                          {it?.image ? (
                            <img src={it.image} alt={label} className={styles.placedChipIcon} draggable={false} />
                          ) : (
                            <span className={styles.placedChipText}>{label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card tray */}
        <div className={styles.tray}>
          {shuffledOrder.map((idx) => {
            const item = items[idx];
            if (!item) return null;
            const isPlaced = placements[idx] !== undefined;
            if (isPlaced) return null;
            const isSelected = selectedItem === idx;
            const isDragging = draggedItem === idx;

            const label = item.name || item.text || '';
            const rot = ROTATIONS[idx % ROTATIONS.length];
            return (
              <div
                key={idx}
                className={[
                  styles.card,
                  isSelected ? styles.cardSelected : '',
                  isDragging ? styles.cardDragging : '',
                ].filter(Boolean).join(' ')}
                style={{ ['--rot' as string]: `${rot}deg` }}
                draggable
                onClick={() => handleItemClick(idx)}
                onDragStart={() => handleDragStart(idx)}
                onDragEnd={handleDragEnd}
              >
                <InfoButton
                  size="sm"
                  variant="dark"
                  className={styles.cardInfo}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (popup) return;
                    setPopup({ kind: 'info', title: label, description: item.explanation });
                  }}
                />
                {item.image ? (
                  <img src={item.image} alt={label} className={styles.cardIcon} draggable={false} />
                ) : item.emoji ? (
                  <span className={styles.cardEmoji}>{item.emoji}</span>
                ) : null}
                <span className={styles.cardText}>{label}</span>
              </div>
            );
          })}
        </div>

        {isOnCompleteMode && allPlaced && (
          <div className={styles.checkWrap}>
            <Button label="Проверить" type="main" onClick={handleCheck} />
          </div>
        )}
      </div>

      {/* Popup overlay */}
      {popup && (
        <div className={styles.overlay}>
          {popup.kind === 'category' && (
            <PopUp
              title={popup.title}
              description={popup.tooltip}
              buttonLabel="Понятно"
              onButtonClick={handlePopupDismiss}
            />
          )}
          {popup.kind === 'info' && (
            <PopUp
              title={popup.title}
              description={popup.description}
              buttonLabel="Понятно"
              onButtonClick={handlePopupDismiss}
            />
          )}
        </div>
      )}
    </Background>
  );
}
