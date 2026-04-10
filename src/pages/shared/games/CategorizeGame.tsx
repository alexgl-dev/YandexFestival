import { useState, useCallback } from 'react';
import { Background, Button, PopUp } from '../../../components/ui';
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
}

export function CategorizeGame({ task, onComplete, onBack }: GameProps) {
  const steps = task.steps;
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  // Map: categoryId -> set of item indices placed there
  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [itemStatus, setItemStatus] = useState<Record<string, Record<number, 'correct' | 'wrong'>>>({});


  // An item is "fully placed" if it appears in at least one category
  const placedItemIndices = new Set<number>();
  for (const indices of Object.values(placements)) {
    for (const idx of indices) placedItemIndices.add(idx);
  }
  const allPlaced = items.length > 0 && items.every((_, i) => placedItemIndices.has(i));

  const resetForStep = useCallback((stepIndex: number) => {
    const nextStep = steps[stepIndex];
    const nextCategories = nextStep?.categories ?? [];
    setPlacements(Object.fromEntries(nextCategories.map((c) => [c.id, []])));
    setSelectedItem(null);
    setDraggedItem(null);
    setDragOverCategory(null);
    setChecked(false);
    setItemStatus({});
  }, [steps]);

  // Place an item in a category
  const placeItem = useCallback((itemIndex: number, categoryId: string) => {
    if (checked) return;
    setPlacements((prev) => {
      const current = prev[categoryId] || [];
      if (current.includes(itemIndex)) return prev; // already there
      return { ...prev, [categoryId]: [...current, itemIndex] };
    });
    setSelectedItem(null);
  }, [checked]);

  // Remove item from a category (tap placed item to return it)
  const removeItem = useCallback((itemIndex: number, categoryId: string) => {
    if (checked) return;
    setPlacements((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((i) => i !== itemIndex),
    }));
  }, [checked]);

  // Tap icon in strip: select it
  const handleItemClick = useCallback((itemIndex: number) => {
    if (checked) return;
    setSelectedItem((prev) => (prev === itemIndex ? null : itemIndex));
  }, [checked]);

  // Tap a column: place selected item
  const handleCategoryClick = useCallback((categoryId: string) => {
    if (checked || selectedItem === null) return;
    placeItem(selectedItem, categoryId);
  }, [checked, selectedItem, placeItem]);

  // Drag handlers
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

  // Check answers
  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    setChecked(true);
    const newItemStatus: Record<string, Record<number, 'correct' | 'wrong'>> = {};
    let allCorrect = true;

    for (const [catId, itemIndices] of Object.entries(placements)) {
      newItemStatus[catId] = {};
      for (const idx of itemIndices) {
        const item = items[idx];
        const isCorrect = item.belongs?.includes(catId) ?? false;
        newItemStatus[catId][idx] = isCorrect ? 'correct' : 'wrong';
        if (!isCorrect) allCorrect = false;
      }
    }

    // Check if items that belong to a category were actually placed there
    for (const item of items) {
      if (item.belongs) {
        for (const catId of item.belongs) {
          const idx = items.indexOf(item);
          if (!(placements[catId] || []).includes(idx)) {
            allCorrect = false;
          }
        }
      }
    }

    setItemStatus(newItemStatus);

    const stepResult: GameResult = {
      answer: Object.entries(placements)
        .map(([catId, indices]) => {
          const cat = categories.find((c) => c.id === catId);
          return `${cat?.title || catId}: ${indices.map((i) => items[i].text || '').join(', ')}`;
        })
        .join(' | '),
      correct: allCorrect,
      explanation: allCorrect
        ? 'Все элементы распределены верно!'
        : items.map((item) => `${item.text}: ${item.explanation}`).join('; '),
    };

    setResults((prev) => [...prev, stepResult]);
    setShowPopup(true);
  }, [allPlaced, placements, items, categories]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);

    if (isLastStep) {
      onComplete(results);
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      resetForStep(nextStep);
    }
  }, [isLastStep, currentStep, results, onComplete, resetForStep]);

  if (!step) return null;

  const lastResult = results[results.length - 1];

  return (
    <Background theme="orange" orientation="landscape" onBack={onBack}>
      <div className={styles.wrapper}>
        {/* Instruction + Two columns */}
        <p className={styles.instruction}>
          {step.prompt || 'Перетащи иконки в нужную зону (можно в несколько)'}
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
                  <div className={styles.columnHeaderLeft}>
                    <span className={styles.columnTitle}>{cat.title}</span>
                  </div>
                  <span className={styles.counterBadge}>{catPlacements.length}</span>
                </div>

                <div className={styles.columnBody}>
                  {catPlacements.map((itemIdx) => {
                    const item = items[itemIdx];
                    const status = itemStatus[cat.id]?.[itemIdx];
                    const statusClass = status === 'correct'
                      ? styles.chipCorrect
                      : status === 'wrong'
                        ? styles.chipWrong
                        : '';

                    return (
                      <div
                        key={`${cat.id}-${itemIdx}`}
                        className={`${styles.chip} ${statusClass}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(itemIdx, cat.id);
                        }}
                      >
                        {item.icon && <img src={item.icon} alt="" className={styles.chipIcon} />}
                        {item.image && !item.icon && <img src={item.image} alt="" className={styles.chipIcon} />}
                        <span className={styles.chipLabel}>{item.text || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom strip */}
        <div className={styles.bottomStrip}>
          <div className={styles.iconStrip}>
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
                    {item.icon && <img src={item.icon} alt="" className={styles.iconImage} />}
                    {item.image && !item.icon && <img src={item.image} alt="" className={styles.iconImage} />}
                    {!item.icon && !item.image && (
                      <span className={styles.iconEmoji}>{item.text?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <span className={styles.iconLabel}>{item.text || ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check button */}
        {!checked && allPlaced && (
          <div className={styles.footer}>
            <Button label="Проверить" type="main" onClick={handleCheck} />
          </div>
        )}

        {/* Popup overlay */}
        {showPopup && lastResult && (
          <div className={styles.overlay}>
            <PopUp
              icon={lastResult.correct ? 'done' : 'close'}
              iconColor={lastResult.correct ? 'blue' : 'red'}
              title={lastResult.correct ? 'Верно!' : 'Не совсем...'}
              description={lastResult.explanation}
              buttonLabel={isLastStep ? 'Результаты' : 'Дальше'}
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
