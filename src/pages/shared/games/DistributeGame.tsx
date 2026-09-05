import { useEffect, useRef, useState } from 'react';
import { Background, PopUp } from '../../../components/ui';
import type { Task, TaskCategory, TaskItem } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Перемешивает элементы только внутри соседних «раундов» с одинаковым title, сохраняя порядок раундов. */
function shuffleWithinTitleGroups(items: TaskItem[]): TaskItem[] {
  const result: TaskItem[] = [];
  let i = 0;
  while (i < items.length) {
    let j = i + 1;
    while (j < items.length && items[j].title === items[i].title) j++;
    result.push(...shuffleArray(items.slice(i, j)));
    i = j;
  }
  return result;
}

/** Число колонок сетки папок: сохраняет привычную 2×2 для 4 специалистов (development/task-distribution). */
function getGridColumns(count: number): number {
  if (count <= 1) return Math.max(count, 1);
  if (count === 3) return 3;
  if (count === 4) return 2;
  return Math.ceil(Math.sqrt(count));
}

export function DistributeGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];

  // Перемешивание порядка карточек-заданий — только для заданий, где это задано по SOURCE.md
  // (agency: весь список; key-message: внутри каждого раунда слоганов). Остальные задания
  // (например development/task-distribution) сохраняют исходный порядок из data.ts без изменений.
  const [items] = useState<TaskItem[]>(() => {
    const base = step?.items ?? [];
    if (task.id === 'agency') return shuffleArray(base);
    if (task.id === 'key-message') return shuffleWithinTitleGroups(base);
    return base;
  });

  const correctText = step?.resultCorrect ?? 'Потрясающе!';
  const wrongText = step?.resultWrong ?? 'Ой! Это задача другого специалиста! Попробуй ещё раз, даже если наугад!';

  const gridCols = getGridColumns(categories.length);
  const gridRows = categories.length > 0 ? Math.ceil(categories.length / gridCols) : 1;
  const gridColGap = gridCols >= 3 ? 'var(--spacing-md)' : orientation === 'portrait' ? 'var(--spacing-lg)' : '80px';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []]))
  );
  const [activePopup, setActivePopup] = useState<TaskCategory | null>(null);
  const [dropFeedback, setDropFeedback] = useState<DropFeedback>(null);
  const dismissTimerRef = useRef<number | null>(null);

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
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
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

  useEffect(() => {
    if (dropFeedback?.correct === true) {
      dismissTimerRef.current = window.setTimeout(() => {
        handleFeedbackDismiss();
      }, 1000);
      return () => {
        if (dismissTimerRef.current !== null) {
          window.clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = null;
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropFeedback]);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction
        instruction={task.instruction ?? task.intro}
        initialOpen={task.instruction?.trim() ? undefined : false}
      />
      <div className={styles.layout} onClick={() => setActivePopup(null)}>

        {/* ══ TOP: folder grid (2×2 for 4 specialists, adapts for other counts) ══ */}
        <div
          className={styles.foldersGrid}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            columnGap: gridColGap,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {categories.map((cat) => {
            const catPlacements = placements[cat.id] ?? [];
            const isTarget = !!currentItem && !dropFeedback && !activePopup;
            const hasDescription = !!cat.description?.trim();

            return (
              <div key={cat.id} className={styles.specialistCell}>

                {/* Profile row */}
                <div className={`${styles.profileRow} ${gridCols >= 3 ? styles.profileRowCompact : ''}`}>
                  <div className={styles.avatarWrap}>
                    {cat.avatar
                      ? <img src={cat.avatar} alt={cat.title} className={styles.avatarImg} />
                      : <span className={styles.avatarFallback}>{cat.title.charAt(0)}</span>
                    }
                  </div>
                  {hasDescription ? (
                    <button
                      className={styles.specNameBtn}
                      onClick={(e) => { e.stopPropagation(); setActivePopup(activePopup?.id === cat.id ? null : cat); }}
                    >
                      <span className={styles.specName}>{cat.title}</span>
                      <span className={styles.infoMark}>?</span>
                    </button>
                  ) : (
                    <div className={styles.specNameStatic}>
                      <span className={styles.specName}>{cat.title}</span>
                    </div>
                  )}
                </div>

                {/* Folder card */}
                <div
                  className={`${styles.folderCard} ${isTarget ? styles.folderCardTarget : ''}`}
                  style={!cat.image && cat.color ? { background: cat.color } : undefined}
                  onClick={() => handleFolderClick(cat.id)}
                >
                  {cat.image && (
                    <img src={cat.image} alt="" className={styles.folderIcon} />
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
            {currentItem.title && <p className={styles.taskTitle}>{currentItem.title}</p>}
            <div className={styles.taskCard}>
              {(() => {
                const lines = (currentItem.text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
                if (lines.length > 1) {
                  return (
                    <div className={styles.taskLines}>
                      {lines.map((line, i) => (
                        <p key={i} className={styles.taskLine}>{line}</p>
                      ))}
                    </div>
                  );
                }
                return <p className={styles.taskText}>{lines[0] ?? currentItem.title ?? ''}</p>;
              })()}
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
            title={dropFeedback.correct ? 'Потрясающе!' : 'Не совсем...'}
            description={dropFeedback.correct ? undefined : wrongText}
            buttonLabel={dropFeedback.correct ? 'Дальше' : 'Попробуй ещё раз'}
            onButtonClick={handleFeedbackDismiss}
          />
        </div>
      )}
    </Background>
  );
}
