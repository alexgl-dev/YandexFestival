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

export function CategorizeGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  // categoryId -> item indices placed there. An item may appear in several (for universal icons).
  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const placedItemIndices = new Set<number>();
  for (const indices of Object.values(placements)) {
    for (const idx of indices) placedItemIndices.add(idx);
  }
  const allPlaced = items.length > 0 && items.every((_, i) => placedItemIndices.has(i));

  const placeItem = useCallback((itemIndex: number, categoryId: string) => {
    if (checked) return;
    setPlacements((prev) => {
      // Remove from all categories first (single-zone placement for simplicity)
      const next: Record<string, number[]> = {};
      for (const [cid, ids] of Object.entries(prev)) {
        next[cid] = ids.filter((i) => i !== itemIndex);
      }
      next[categoryId] = [...(next[categoryId] || []), itemIndex];
      return next;
    });
    setSelectedItem(null);
  }, [checked]);

  const removeItem = useCallback((itemIndex: number, categoryId: string) => {
    if (checked) return;
    setPlacements((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((i) => i !== itemIndex),
    }));
  }, [checked]);

  const handleItemClick = useCallback((itemIndex: number) => {
    if (checked) return;
    setSelectedItem((prev) => (prev === itemIndex ? null : itemIndex));
  }, [checked]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    if (checked || selectedItem === null) return;
    placeItem(selectedItem, categoryId);
  }, [checked, selectedItem, placeItem]);

  const handleDragStart = useCallback((itemIndex: number) => {
    setDraggedItem(itemIndex);
    setSelectedItem(null);
  }, []);

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
      placeItem(draggedItem, categoryId);
    }
    setDraggedItem(null);
    setDragOverCategory(null);
  }, [draggedItem, placeItem]);

  // itemIndex -> the category it was placed in (single-zone mode)
  const placementByItem: Record<number, string> = {};
  for (const [catId, indices] of Object.entries(placements)) {
    for (const idx of indices) placementByItem[idx] = catId;
  }

  // Correctness: item is correct when its placement category is in its belongs list.
  const isItemCorrect = useCallback((idx: number) => {
    const item = items[idx];
    const placedCat = placementByItem[idx];
    if (!placedCat) return false;
    return item.belongs?.includes(placedCat) ?? false;
  }, [items, placementByItem]);

  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    setChecked(true);

    const results: GameResult[] = items.map((item) => {
      const idx = items.indexOf(item);
      const placedCat = placementByItem[idx];
      const correct = item.belongs?.includes(placedCat) ?? false;
      const placedTitle = categories.find((c) => c.id === placedCat)?.title || '—';
      const label = `${item.emoji ?? ''} ${item.name ?? item.text ?? ''}`.trim();
      return {
        answer: correct
          ? `${label} → ${placedTitle}`
          : `${label} — ошибочно в «${placedTitle}»`,
        correct,
        explanation: item.explanation,
      };
    });

    // Delay to let the player see green/red highlights before moving to result screen
    setTimeout(() => onComplete(results), 1200);
  }, [allPlaced, items, categories, placementByItem, onComplete]);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        <p className={styles.instruction}>
          {step.prompt || 'Перетащи иконки в нужную зону'}
        </p>

        <div className={styles.columnsArea}>
          {categories.map((cat) => {
            const catPlacements = placements[cat.id] || [];
            const isDragOver = dragOverCategory === cat.id;
            const isTarget = selectedItem !== null;

            return (
              <div
                key={cat.id}
                className={`${styles.column} ${isDragOver ? styles.columnDragOver : ''} ${isTarget ? styles.columnTarget : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cat.id)}
              >
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{cat.title}</span>
                  <span className={styles.counterBadge}>{catPlacements.length}</span>
                </div>

                <div className={styles.columnBody}>
                  {catPlacements.map((itemIdx) => {
                    const item = items[itemIdx];
                    const statusClass = checked
                      ? isItemCorrect(itemIdx)
                        ? styles.chipCorrect
                        : styles.chipWrong
                      : '';

                    return (
                      <div
                        key={`${cat.id}-${itemIdx}`}
                        className={`${styles.chip} ${statusClass}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(itemIdx, cat.id);
                        }}
                        title={item.name}
                      >
                        {item.emoji && <span className={styles.chipEmoji}>{item.emoji}</span>}
                        {item.icon && <img src={item.icon} alt="" className={styles.chipIconImg} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.bottomStrip}>
          <div className={styles.iconGrid}>
            {items.map((item, idx) => {
              const isPlaced = placedItemIndices.has(idx);
              const isSelected = selectedItem === idx;
              const isDragging = draggedItem === idx;

              return (
                <div
                  key={idx}
                  className={`${styles.iconCard} ${isSelected ? styles.iconCardSelected : ''} ${isDragging ? styles.iconCardDragging : ''} ${isPlaced ? styles.iconCardPlaced : ''}`}
                  draggable={!checked && !isPlaced}
                  onClick={() => !isPlaced && handleItemClick(idx)}
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.iconCircle}>
                    {item.emoji && <span className={styles.iconEmoji}>{item.emoji}</span>}
                    {item.icon && <img src={item.icon} alt="" className={styles.iconImage} />}
                    {item.image && !item.icon && <img src={item.image} alt="" className={styles.iconImage} />}
                  </div>
                  <span className={styles.iconLabel}>{item.name || item.text || ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {!checked && (
          <div className={styles.footer}>
            {allPlaced ? (
              <Button label="Проверить" type="main" onClick={handleCheck} />
            ) : (
              <span className={styles.progressHint}>
                Размещено {placedItemIndices.size} / {items.length}
              </span>
            )}
          </div>
        )}
      </div>
    </Background>
  );
}
