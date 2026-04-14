import { useState } from 'react';
import { Background, PopUp } from '../../../components/ui';
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

type DropFeedback = { correct: boolean } | null;

export function DistributeGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  const correctText = step?.resultCorrect ?? 'Потрясающе! Твоё чутьё в области профессий, связанных с разработкой, на высоте!';
  const wrongText = step?.resultWrong ?? 'Ой! Это задача другого специалиста! Попробуй ещё раз, даже если наугад!';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [activePopup, setActivePopup] = useState<TaskCategory | null>(null);
  const [dropFeedback, setDropFeedback] = useState<DropFeedback>(null);

  const currentItem = items[currentIdx] ?? null;
  const isDone = currentIdx >= items.length;

  const handleFolderClick = (categoryId: string) => {
    if (!currentItem || dropFeedback || activePopup) return;
    const isCorrect = (currentItem.belongs ?? []).includes(categoryId);

    if (isCorrect) {
      setPlacements((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] ?? []), currentIdx],
      }));
    }
    setDropFeedback({ correct: isCorrect });
  };

  const handleFeedbackDismiss = () => {
    const wasCorrect = dropFeedback?.correct === true;
    setDropFeedback(null);

    if (wasCorrect) {
      const next = currentIdx + 1;
      if (next >= items.length) {
        onComplete([{ correct: true, answer: '', explanation: correctText }]);
      } else {
        setCurrentIdx(next);
      }
    }
    // wrong: same task stays, player picks another folder
  };

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.layout} onClick={() => setActivePopup(null)}>

        {/* ══ TOP: 2×2 folder grid ══ */}
        <div className={styles.foldersGrid} onClick={(e) => e.stopPropagation()}>
          {categories.map((cat) => {
            const catPlacements = placements[cat.id] ?? [];
            const isTarget = !!currentItem && !dropFeedback && !activePopup;

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

                {/* Folder card */}
                <div
                  className={`${styles.folderCard} ${isTarget ? styles.folderCardTarget : ''}`}
                  onClick={() => handleFolderClick(cat.id)}
                >
                  {cat.image && (
                    <img src={cat.image} alt="" className={styles.folderIcon} />
                  )}

                  {catPlacements.length > 0 && (
                    <div className={styles.placedList}>
                      {catPlacements.map((itemIdx) => {
                        const item = items[itemIdx];
                        return (
                          <div key={itemIdx} className={`${styles.placedChip} ${styles.chipCorrect}`}>
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

        {/* ══ BOTTOM: current task card ══ */}
        {!isDone && currentItem && (
          <div className={styles.taskArea} onClick={(e) => e.stopPropagation()}>
            <p className={styles.taskCounter}>{currentIdx + 1} / {items.length}</p>
            <div className={styles.taskCard}>
              <p className={styles.taskText}>{currentItem.text ?? currentItem.title ?? ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* ══ Specialist info overlay ══ */}
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

      {/* ══ Per-drop feedback popup ══ */}
      {dropFeedback && (
        <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
          <PopUp
            icon={dropFeedback.correct ? 'done' : 'close'}
            iconColor={dropFeedback.correct ? 'blue' : 'red'}
            title={dropFeedback.correct ? 'Потрясающе!' : 'Ой!'}
            description={dropFeedback.correct ? correctText : wrongText}
            buttonLabel={dropFeedback.correct ? 'Дальше' : 'Попробуй ещё раз'}
            onButtonClick={handleFeedbackDismiss}
          />
        </div>
      )}
    </Background>
  );
}
