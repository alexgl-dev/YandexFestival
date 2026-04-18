import { useState, useCallback } from 'react';
import { Background, InfoButton, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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

type Popup =
  | { kind: 'correct'; explanation: string }
  | { kind: 'wrong'; hint: string }
  | { kind: 'category'; tooltip: string; title: string }
  | { kind: 'info'; title: string; description: string }
  | null;

const ROTATIONS = [-2.5, 1.8, -1.2, 2.2, -1.8, 0.8, -2.2, 1.5, -0.8, 2.8, -1.5, 0.6, -2, 1.2, -0.5];

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
  const [exitingItems, setExitingItems] = useState<Set<number>>(new Set());
  const [removedItems, setRemovedItems] = useState<Set<number>>(new Set());

  const correctCount = Object.keys(correctPlacements).length;
  const allPlaced = items.length > 0 && correctCount === items.length;

  const tryPlace = useCallback((itemIndex: number, categoryId: string) => {
    if (correctPlacements[itemIndex] !== undefined) return; // already placed
    const item = items[itemIndex];
    if (!item) return;

    if (item.belongs?.includes(categoryId)) {
      setExitingItems((prev) => new Set(prev).add(itemIndex));
      setTimeout(() => {
        setExitingItems((prev) => { const s = new Set(prev); s.delete(itemIndex); return s; });
        setRemovedItems((prev) => new Set(prev).add(itemIndex));
      }, 320);
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
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <p className={styles.instruction}>{step.prompt || 'Перетащи карточки в нужную зону'}</p>

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
                <span className={styles.columnTitle}>{cat.title}</span>
              </div>
            );
          })}
        </div>

        {/* Card tray */}
        <div className={styles.tray}>
          {items.map((item, idx) => {
            if (removedItems.has(idx)) return null;
            const isPlaced = correctPlacements[idx] !== undefined;
            const isExiting = exitingItems.has(idx);
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
                  isPlaced && !isExiting ? styles.cardPlaced : '',
                  isExiting ? styles.cardExiting : '',
                ].filter(Boolean).join(' ')}
                style={{ ['--rot' as string]: `${rot}deg` }}
                draggable={!isPlaced}
                onClick={() => !isPlaced && handleItemClick(idx)}
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
      </div>

      {/* Popup overlay */}
      {popup && (
        <div className={styles.overlay}>
          {popup.kind === 'correct' && (
            <PopUp
              icon="done"
              iconColor="blue"
              title="Верно!"
              description={popup.explanation}
              buttonLabel={allPlaced ? 'Результаты' : 'Продолжить'}
              onButtonClick={handlePopupDismiss}
            />
          )}
          {popup.kind === 'wrong' && (
            <PopUp
              icon="close"
              iconColor="red"
              title="Не совсем"
              description={popup.hint}
              buttonLabel="Попробовать ещё"
              onButtonClick={handlePopupDismiss}
            />
          )}
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
