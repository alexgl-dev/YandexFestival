import { useCallback, useEffect, useRef, useState } from 'react';
import { Background } from '../../../components/ui';
import type { CatchObject, GlossaryTerm, Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './BacklogGame.module.css';

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

// Layout constants (all positions are in px within the fixed Background frame).
const FALL_DURATION = 7000; // ms — how long a card takes to fall from top to bottom
const CARD_HEIGHT = 440; // approx, used to offset spawn above top edge

const STICKER_IMAGES = [
  '/assets/games/backlog/sticker-1.png',
  '/assets/games/backlog/sticker-2.png',
  '/assets/games/backlog/sticker-3.png',
];

function StickerCard({ title, variantIndex }: {
  title: string;
  variantIndex: number;
}) {
  const isDark = variantIndex % 3 === 2;
  return (
    <div className={styles.stickerWrap}>
      <img
        src={STICKER_IMAGES[variantIndex % 3]}
        className={styles.stickerImg}
        alt=""
        draggable={false}
      />
      <div className={styles.stickerContent}>
        <p className={`${styles.stickerTitle} ${isDark ? styles.stickerTitleDark : ''}`}>{title}</p>
      </div>
    </div>
  );
}
const SWIPE_THRESHOLD_X = 180; // px horizontal drag to commit trash
const POPUP_AUTO_DISMISS = 5000; // ms

type CardPhase = 'falling' | 'trashing' | 'keeping';

interface ActiveCard {
  index: number;
  object: CatchObject;
  phase: CardPhase;
  startTime: number;
  dragX: number;
  dragStartX: number;
  pointerId: number | null;
}

interface Decision {
  index: number;
  title: string;
  emoji: string;
  userChoice: 'trash' | 'backlog';
  correctChoice: 'trash' | 'backlog';
  correct: boolean;
  comment: string;
}

type Popup =
  | { kind: 'comment'; correct: boolean; comment: string; glossary?: GlossaryTerm[] }
  | { kind: 'final'; correctCount: number; total: number }
  | null;

export function BacklogGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const objects = step?.objects ?? [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [card, setCard] = useState<ActiveCard | null>(null);
  const [cardY, setCardY] = useState(0);
  const [cardTranslateX, setCardTranslateX] = useState(0);
  const [popup, setPopup] = useState<Popup>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeGlossary, setActiveGlossary] = useState<GlossaryTerm | null>(null);

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const popupTimerRef = useRef<number | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────
  const fieldHeight = orientation === 'landscape' ? 1080 : 1920;
  const travelDistance = fieldHeight - 260; // top padding baseline

  const spawnCard = useCallback(
    (idx: number) => {
      if (idx >= objects.length) return;
      const obj = objects[idx];
      setCardY(-CARD_HEIGHT - 40);
      setCardTranslateX(0);
      const now = performance.now();
      startTimeRef.current = now;
      setCard({
        index: idx,
        object: obj,
        phase: 'falling',
        startTime: now,
        dragX: 0,
        dragStartX: 0,
        pointerId: null,
      });
    },
    [objects],
  );

  // ── card resolution (correct/wrong) ──────────────────────────────────
  const resolveCard = useCallback(
    (bucket: 'trash' | 'backlog') => {
      if (!card || card.phase !== 'falling') return;

      const isTrash = card.object.category === 'remove';
      const userSaidTrash = bucket === 'trash';
      const correct = userSaidTrash === isTrash;

      const comment = correct
        ? card.object.correctComment ?? card.object.description
        : card.object.wrongComment ?? card.object.description;

      const result: GameResult = {
        answer: card.object.title,
        correct,
        explanation: comment,
      };

      const decision: Decision = {
        index: card.index,
        title: card.object.title,
        emoji: card.object.emoji ?? '',
        userChoice: bucket,
        correctChoice: isTrash ? 'trash' : 'backlog',
        correct,
        comment: card.object.wrongComment ?? card.object.correctComment ?? card.object.description ?? '',
      };

      setResults((prev) => [...prev, result]);
      setDecisions((prev) => [...prev, decision]);
      if (correct) setCorrectCount((c) => c + 1);
      setCard((prev) => (prev ? { ...prev, phase: bucket === 'trash' ? 'trashing' : 'keeping' } : prev));
      setPopup({
        kind: 'comment',
        correct,
        comment,
        glossary: card.object.glossary,
      });
    },
    [card],
  );

  // ── falling animation loop ───────────────────────────────────────────
  useEffect(() => {
    if (!card || card.phase !== 'falling') return;
    if (popup) return; // pause while popup is shown

    let stopped = false;
    const tick = (now: number) => {
      if (stopped) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / FALL_DURATION, 1);
      const y = -CARD_HEIGHT - 40 + progress * (travelDistance + CARD_HEIGHT + 40);
      setCardY(y);
      if (progress >= 1) {
        // Reached the bottom — counts as "keep" (backlog)
        resolveCard('backlog');
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [card, popup, travelDistance, resolveCard]);

  // Re-anchor startTime when pausing/resuming so cards don't teleport after popup close.
  useEffect(() => {
    if (!card || popup) return;
    // When popup closes, we spawn a new card via handlePopupDismiss, so this effect
    // covers the initial entry only. No re-anchoring needed here.
  }, [card, popup]);

  // ── popup auto-dismiss ───────────────────────────────────────────────
  useEffect(() => {
    if (!popup || popup.kind !== 'comment') return;
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    popupTimerRef.current = window.setTimeout(() => {
      handlePopupDismiss();
    }, POPUP_AUTO_DISMISS);
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup]);

  const handlePopupDismiss = useCallback(() => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    if (!popup) return;

    if (popup.kind === 'final') {
      onComplete(results);
      return;
    }

    // Comment dismissed → advance to next card or show final
    setPopup(null);
    setCard(null);
    setActiveGlossary(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= objects.length) {
      // Show final screen
      setTimeout(() => {
        setPopup({ kind: 'final', correctCount, total: objects.length });
      }, 200);
    } else {
      setCurrentIdx(nextIdx);
      setTimeout(() => spawnCard(nextIdx), 220);
    }
  }, [popup, results, onComplete, currentIdx, objects.length, correctCount, spawnCard]);

  // ── spawn first card after mount ─────────────────────────────────────
  useEffect(() => {
    if (objects.length > 0 && !card && currentIdx === 0 && !popup) {
      const timer = setTimeout(() => spawnCard(0), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects.length]);

  // ── pointer handlers ─────────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!card || card.phase !== 'falling' || popup) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setCard((prev) =>
        prev
          ? {
              ...prev,
              dragStartX: e.clientX,
              dragX: 0,
              pointerId: e.pointerId,
            }
          : prev,
      );
    },
    [card, popup],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!card || card.pointerId !== e.pointerId) return;
      const dx = e.clientX - card.dragStartX;
      setCardTranslateX(dx);
    },
    [card],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!card || card.pointerId !== e.pointerId) return;
      const dx = cardTranslateX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD_X) {
        // Trash it
        resolveCard('trash');
      } else {
        // Snap back
        setCardTranslateX(0);
        setCard((prev) => (prev ? { ...prev, pointerId: null, dragStartX: 0, dragX: 0 } : prev));
      }
    },
    [card, cardTranslateX, resolveCard],
  );

  if (!step) return null;

  const progressText = `${Math.min(currentIdx + (popup && popup.kind === 'comment' ? 1 : 0), objects.length)}/${objects.length}`;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.field}>
        {/* Counter */}
        <div className={styles.counter}>
          <span className={styles.counterLabel}>Обработано</span>
          <span className={styles.counterValue}>{progressText}</span>
        </div>

        {/* Prompt / hint */}
        {step.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        {/* Falling card — centered strictly on X axis, animated on Y */}
        {card && (
          <div
            className={[
              styles.cardWrap,
              card.phase === 'trashing' ? styles.cardTrashing : '',
              card.phase === 'keeping' ? styles.cardKeeping : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              top: `${cardY}px`,
              transform: `translate(calc(-50% + ${cardTranslateX}px), 0) rotate(${cardTranslateX * 0.04}deg)`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <StickerCard
              title={card.object.title}
              variantIndex={card.index}
            />
          </div>
        )}

        {/* Basket icon at bottom */}
        <img
          src="/assets/games/backlog/basket.png"
          className={styles.basketIcon}
          alt="Корзина"
          draggable={false}
        />

        {/* Swipe hint under card */}
        {card && !popup && (
          <p className={styles.swipeHint}>Смахни в сторону лишнюю идею, а нужную пропусти вниз</p>
        )}
      </div>

      {/* Comment popup */}
      {popup && popup.kind === 'comment' && (
        <div className={styles.overlay} onClick={handlePopupDismiss}>
          <div className={styles.commentCard} onClick={(e) => e.stopPropagation()}>
            <div className={[styles.commentIcon, popup.correct ? styles.iconCorrect : styles.iconWrong].join(' ')}>
              {popup.correct ? '✓' : '✕'}
            </div>
            <h3 className={styles.commentTitle}>{popup.correct ? 'Верно!' : 'Не совсем...'}</h3>
            <p className={styles.commentText}>
              {renderCommentWithGlossary(popup.comment, popup.glossary, setActiveGlossary)}
            </p>
            <button className={styles.commentClose} onClick={handlePopupDismiss}>
              Дальше
            </button>
            {/* <p className={styles.commentHint}>или дождись автопродолжения…</p> */}
          </div>
        </div>
      )}

      {/* Glossary term modal (secondary) */}
      {activeGlossary && (
        <div className={styles.overlay} onClick={() => setActiveGlossary(null)}>
          <div className={styles.glossaryCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.glossaryWord}>{activeGlossary.word}</h3>
            <p className={styles.glossaryDef}>{activeGlossary.definition}</p>
            <button className={styles.commentClose} onClick={() => setActiveGlossary(null)}>
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Final screen */}
      {popup && popup.kind === 'final' && (
        <div className={styles.overlay}>
          <FinalCard
            correctCount={popup.correctCount}
            total={popup.total}
            decisions={decisions}
            onContinue={() => onComplete(results)}
          />
        </div>
      )}
    </Background>
  );
}

// ── Final screen (3 scenarios) ─────────────────────────────────────────
function FinalCard({
  correctCount,
  total,
  decisions,
  onContinue,
}: {
  correctCount: number;
  total: number;
  decisions: Decision[];
  onContinue: () => void;
}) {
  let title: string;
  let text: string;
  let iconCls: string;
  let iconGlyph: string;

  if (correctCount >= total) {
    title = 'Бэклог под защитой';
    text =
      'Все твои решения оказались верными! Команда может работать спокойно: в бэклоге только то, что действительно важно.\n\nТы думал как продакт: не «было бы круто», а «какую проблему это решает». Именно это отличает хорошего менеджера.';
    iconCls = 'iconCorrect';
    iconGlyph = '★';
  } else if (correctCount >= 6) {
    title = 'Бэклог почти чистый';
    text =
      'С некоторыми из твоих решений можно поспорить. Это нормально: граница между нужным и лишним редко бывает очевидной. Зато большую часть потенциальных фич тебе удалось классифицировать совершенно верно.';
    iconCls = 'iconCorrect';
    iconGlyph = '✓';
  } else {
    title = 'Бэклог в опасности';
    text =
      'Некоторые из твоих решений оказались не самыми дальновидными. И теперь в бэклоге есть спорные фичи.\n\nХорошая новость: именно за этим и нужен продакт-менеджер. Не чтобы принимать идеальные решения с первого раза, а чтобы задавать правильные вопросы и выбирать верный курс.';
    iconCls = 'iconWrong';
    iconGlyph = '!';
  }

  const wrongDecisions = decisions.filter((d) => !d.correct);
  const choiceLabel = (c: 'trash' | 'backlog') => (c === 'trash' ? 'в корзину' : 'оставить в бэклоге');

  return (
    <div className={styles.finalCard}>
      <div className={[styles.commentIcon, styles[iconCls]].join(' ')}>{iconGlyph}</div>
      <h2 className={styles.finalTitle}>{title}</h2>
      <p className={styles.finalScore}>
        Верных решений: <strong>{correctCount}</strong> из {total}
      </p>
      <p className={styles.finalText}>{text}</p>

      {wrongDecisions.length > 0 && (
        <div className={styles.mistakesList}>
          <h3 className={styles.mistakesHeading}>Спорные решения</h3>
          {wrongDecisions.map((d) => (
            <div key={d.index} className={styles.mistakeItem}>
              <p className={styles.mistakeTitle}>
                {d.emoji && <span className={styles.mistakeEmoji}>{d.emoji}</span>}
                {d.title}
              </p>
              <p className={styles.mistakeChoice}>
                <span className={styles.choiceUser}>
                  ты: <s>{choiceLabel(d.userChoice)}</s>
                </span>
                <span className={styles.choiceArrow}>→</span>
                <span className={styles.choiceCorrect}>верно: {choiceLabel(d.correctChoice)}</span>
              </p>
              <p className={styles.mistakeComment}>{d.comment}</p>
            </div>
          ))}
        </div>
      )}

      <button className={styles.commentClose} onClick={onContinue}>
        Далее
      </button>
    </div>
  );
}

// ── Inline glossary highlighter ────────────────────────────────────────
function renderCommentWithGlossary(
  text: string,
  glossary: GlossaryTerm[] | undefined,
  onTap: (term: GlossaryTerm) => void,
): React.ReactNode {
  if (!glossary || glossary.length === 0) return text;
  const escaped = glossary.map((g) => g.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const term = glossary.find((g) => g.word.toLowerCase() === part.toLowerCase());
    if (term) {
      return (
        <span
          key={i}
          className={styles.glossaryTermInline}
          onClick={(e) => {
            e.stopPropagation();
            onTap(term);
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
