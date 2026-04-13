import { useState, useCallback } from 'react';
import { Background, Button, ListItem, PopUp } from '../../../components/ui';
import type { Task, TaskCategory } from '../../../types/game';
import styles from './DistributeGame.module.css';

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

export function DistributeGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [activePopup, setActivePopup] = useState<TaskCategory | null>(null);
  const [checked, setChecked] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [itemStatus, setItemStatus] = useState<Record<string, Record<number, 'correct' | 'wrong'>>>({});

  const placedItemIndices = new Set<number>();
  for (const indices of Object.values(placements)) {
    for (const idx of indices) placedItemIndices.add(idx);
  }
  const allPlaced = items.length > 0 && items.every((_, i) => placedItemIndices.has(i));

  const handleTaskClick = useCallback((idx: number) => {
    if (checked) return;
    setSelectedItem((prev) => (prev === idx ? null : idx));
    setActivePopup(null);
  }, [checked]);

  const handleFolderClick = useCallback((categoryId: string) => {
    if (checked || selectedItem === null) return;
    setPlacements((prev) => {
      const next: Record<string, number[]> = {};
      for (const [catId, indices] of Object.entries(prev)) {
        next[catId] = indices.filter((i) => i !== selectedItem);
      }
      next[categoryId] = [...(next[categoryId] ?? []), selectedItem];
      return next;
    });
    setSelectedItem(null);
  }, [checked, selectedItem]);

  const handleRemoveFromFolder = useCallback((categoryId: string, itemIdx: number) => {
    if (checked) return;
    setPlacements((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).filter((i) => i !== itemIdx),
    }));
  }, [checked]);

  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    setChecked(true);

    const newItemStatus: Record<string, Record<number, 'correct' | 'wrong'>> = {};
    for (const [catId, itemIndices] of Object.entries(placements)) {
      newItemStatus[catId] = {};
      for (const idx of itemIndices) {
        const item = items[idx];
        const isCorrect = (item.belongs ?? []).includes(catId);
        newItemStatus[catId][idx] = isCorrect ? 'correct' : 'wrong';
      }
    }

    setItemStatus(newItemStatus);
    setShowResultPopup(true);
  }, [allPlaced, placements, items]);

  const currentResult: GameResult | null = checked ? (() => {
    let allCorrect = true;
    for (const [catId, itemIndices] of Object.entries(placements)) {
      for (const idx of itemIndices) {
        if (!(items[idx].belongs ?? []).includes(catId)) { allCorrect = false; break; }
      }
    }
    return {
      correct: allCorrect,
      answer: '',
      explanation: allCorrect
        ? 'Все задачи распределены верно!'
        : items
            .map((item) => {
              for (const [catId, idxs] of Object.entries(placements)) {
                if (idxs.includes(items.indexOf(item)) && !(item.belongs ?? []).includes(catId)) {
                  return item.explanation;
                }
              }
              return null;
            })
            .filter(Boolean)
            .join(' '),
    };
  })() : null;

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      {/* Dismiss specialist popup on backdrop click */}
      <div className={styles.layout} onClick={() => setActivePopup(null)}>

        {/* ══ LEFT: task list ══ */}
        <div className={styles.taskPanel} onClick={(e) => e.stopPropagation()}>
          <p className={styles.panelTitle}>Задачи</p>
          <div className={styles.taskList}>
            {items.map((item, idx) => {
              const isPlaced = placedItemIndices.has(idx);
              const isSelected = selectedItem === idx;
              return (
                <div key={idx} className={`${styles.taskRow} ${isPlaced ? styles.taskRowPlaced : ''}`}>
                  <ListItem
                    title={item.title ?? item.text ?? ''}
                    state={isSelected ? 'pressed' : 'default'}
                    onClick={() => handleTaskClick(idx)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT: 2×2 specialist grid ══ */}
        <div className={styles.grid} onClick={(e) => e.stopPropagation()}>
          {categories.map((cat) => {
            const catPlacements = placements[cat.id] ?? [];
            const isTarget = selectedItem !== null && !checked;

            return (
              <div key={cat.id} className={styles.specialistCell}>

                {/* Profile row */}
                <div className={styles.profileRow}>
                  <div className={styles.avatarWrap}>
                    {cat.avatar
                      ? <img src={cat.avatar} alt={cat.title} className={styles.avatarImg} />
                      : <span className={styles.avatarFallback}>{cat.title.charAt(0)}</span>
                    }
                  </div>
                  <button
                    className={styles.specNameBtn}
                    onClick={(e) => { e.stopPropagation(); setActivePopup(activePopup?.id === cat.id ? null : cat); }}
                  >
                    <span className={styles.specName}>{cat.title}</span>
                    <span className={styles.infoMark}>?</span>
                  </button>
                </div>

                {/* Folder card — click to receive task */}
                <div
                  className={`${styles.folderCard} ${isTarget ? styles.folderCardTarget : ''}`}
                  onClick={() => handleFolderClick(cat.id)}
                >
                  {/* Folder image — always full-size background */}
                  {cat.image && (
                    <img src={cat.image} alt="" className={styles.folderIcon} />
                  )}

                  {/* Placed tasks overlay */}
                  {catPlacements.length > 0 && (
                    <div className={styles.placedList}>
                      {catPlacements.map((itemIdx) => {
                        const item = items[itemIdx];
                        const status = itemStatus[cat.id]?.[itemIdx];
                        return (
                          <div
                            key={itemIdx}
                            className={`${styles.placedChip} ${status === 'correct' ? styles.chipCorrect : status === 'wrong' ? styles.chipWrong : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleRemoveFromFolder(cat.id, itemIdx); }}
                          >
                            {item.title ?? item.text ?? ''}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {catPlacements.length > 0 && (
                    <div className={styles.counter}>{catPlacements.length}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!checked && allPlaced && (
        <div className={styles.btnWrap}>
          <Button label="Проверить" type="main" onClick={handleCheck} />
        </div>
      )}

      {/* ══ Specialist description overlay ══ */}
      {activePopup && (
        <div
          className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}
          onClick={() => setActivePopup(null)}
        >
          <div className={styles.specPopupCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.specPopupHeader}>
              {activePopup.avatar && (
                <div className={styles.specPopupAvatar}>
                  <img src={activePopup.avatar} alt={activePopup.title} className={styles.avatarImg} />
                </div>
              )}
              <span className={styles.specPopupTitle}>{activePopup.title}</span>
            </div>
            <p className={styles.specPopupText}>{activePopup.description}</p>
            <button className={styles.specPopupClose} onClick={() => setActivePopup(null)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ══ Result overlay ══ */}
      {showResultPopup && currentResult && (
        <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
          <PopUp
            icon={currentResult.correct ? 'done' : 'close'}
            iconColor={currentResult.correct ? 'blue' : 'red'}
            title={currentResult.correct ? 'Верно!' : 'Не совсем...'}
            description={currentResult.explanation}
            buttonLabel="Результаты"
            onButtonClick={() => { setShowResultPopup(false); onComplete([currentResult]); }}
          />
        </div>
      )}
    </Background>
  );
}
