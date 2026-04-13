import { useState, useEffect, useRef, useCallback } from 'react';
import { Background, PopUp } from '../../../components/ui';
import type { Task, CatchObject } from '../../../types/game';
import styles from './SwipeGame.module.css';

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

const CARD_HEIGHT = 340;
const CARD_WIDTH = 640;
const FALL_SPEED = 0.25; // px/ms
const SPAWN_INTERVAL = 2400; // ms
const SWIPE_THRESHOLD = 130; // px

let cardIdSeq = 0;

interface SwipeCard {
  id: number;
  object: CatchObject;
  index: number;
  y: number;
  baseX: number;
  state: 'falling' | 'dragging' | 'exiting' | 'gone';
  dragX: number;
  dragStartX: number;
  pointerId: number | null;
  processed: boolean;
}

export function SwipeGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'portrait',
}: GameProps) {
  const step = task.steps[0];
  const objects: CatchObject[] = step?.objects ?? [];

  const [cards, setCards] = useState<SwipeCard[]>([]);
  const [purityCount, setPurityCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const cardsRef = useRef(new Map<number, SwipeCard>());
  const cardElsRef = useRef(new Map<number, HTMLDivElement | null>());
  const spawnIdxRef = useRef(0);
  const resultsRef = useRef<GameResult[]>([]);
  const rafRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const spawnedAllRef = useRef(false);

  // — Result helpers ——————————————————————————————————————————
  const finishGame = useCallback(() => {
    setShowResult(true);
  }, []);

  const processCard = useCallback((card: SwipeCard, direction: 'left' | 'right' | 'miss') => {
    if (card.processed) return;
    card.processed = true;

    const isTrash = card.object.category === 'trash';
    // left = trash, right = keep
    const correct =
      direction === 'left' ? isTrash :
      direction === 'right' ? !isTrash :
      false; // miss = wrong

    resultsRef.current.push({
      answer: card.object.title,
      correct,
      explanation: card.object.description,
    });

    if (correct) {
      setPurityCount(p => p + 1);
    } else {
      setWrongCount(w => w + 1);
    }
  }, []);

  // — Check game-end ——————————————————————————————————————————
  useEffect(() => {
    if (spawnedAllRef.current && cards.length === 0 && !showResult && resultsRef.current.length > 0) {
      const t = setTimeout(finishGame, 400);
      return () => clearTimeout(t);
    }
  }, [cards.length, showResult, finishGame]);

  // — RAF game loop ——————————————————————————————————————————
  const tick = useCallback((time: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const dt = Math.min(time - lastTimeRef.current, 50);
    lastTimeRef.current = time;

    const toRemove: number[] = [];

    cardsRef.current.forEach((card) => {
      if (card.state !== 'falling') return;
      card.y += FALL_SPEED * dt;

      const el = cardElsRef.current.get(card.id);
      if (el) el.style.top = `${card.y}px`;

      const screenH = orientation === 'landscape' ? 1080 : 1920;
      if (card.y > screenH) {
        card.state = 'gone';
        toRemove.push(card.id);
        processCard(card, 'miss');
      }
    });

    if (toRemove.length > 0) {
      toRemove.forEach(id => cardsRef.current.delete(id));
      setCards(prev => prev.filter(c => !toRemove.includes(c.id)));
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [processCard, orientation]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // — Spawn cards ——————————————————————————————————————————
  useEffect(() => {
    if (!step || objects.length === 0) return;

    const spawn = () => {
      const idx = spawnIdxRef.current;
      if (idx >= objects.length) {
        spawnedAllRef.current = true;
        return;
      }
      spawnIdxRef.current += 1;

      const id = ++cardIdSeq;
      const screenW = orientation === 'landscape' ? 1920 : 1080;
      const baseX = (screenW - CARD_WIDTH) / 2;

      const card: SwipeCard = {
        id,
        object: objects[idx],
        index: idx,
        y: -CARD_HEIGHT - 20,
        baseX,
        state: 'falling',
        dragX: 0,
        dragStartX: 0,
        pointerId: null,
        processed: false,
      };

      cardsRef.current.set(id, card);
      setCards(prev => [...prev, card]);
    };

    spawn(); // first card immediately

    const interval = setInterval(() => {
      if (spawnIdxRef.current >= objects.length) {
        clearInterval(interval);
        spawnedAllRef.current = true;
        return;
      }
      spawn();
    }, SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [step, objects, orientation]);

  // — Pointer handlers ——————————————————————————————————————————
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, id: number) => {
    const card = cardsRef.current.get(id);
    if (!card || card.state !== 'falling') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    card.state = 'dragging';
    card.pointerId = e.pointerId;
    card.dragStartX = e.clientX;
    card.dragX = 0;
    const el = cardElsRef.current.get(id);
    if (el) el.style.transition = '';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>, id: number) => {
    const card = cardsRef.current.get(id);
    if (!card || card.state !== 'dragging' || card.pointerId !== e.pointerId) return;
    card.dragX = e.clientX - card.dragStartX;
    const rotate = card.dragX * 0.035;
    const el = cardElsRef.current.get(id);
    if (el) {
      el.style.transform = `translateX(${card.dragX}px) rotate(${rotate}deg)`;
      if (Math.abs(card.dragX) > 65) {
        el.setAttribute('data-swiping', card.dragX > 0 ? 'right' : 'left');
      } else {
        el.removeAttribute('data-swiping');
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>, id: number) => {
    const card = cardsRef.current.get(id);
    if (!card || card.state !== 'dragging' || card.pointerId !== e.pointerId) return;

    if (Math.abs(card.dragX) >= SWIPE_THRESHOLD) {
      const dir: 'left' | 'right' = card.dragX > 0 ? 'right' : 'left';
      card.state = 'exiting';
      processCard(card, dir);

      const el = cardElsRef.current.get(id);
      if (el) {
        const isTrash = card.object.category === 'trash';
        const correct = dir === 'left' ? isTrash : !isTrash;
        el.removeAttribute('data-swiping');
        el.setAttribute('data-result', correct ? 'correct' : 'wrong');
        const exitX = dir === 'right' ? 1700 : -1700;
        const exitR = dir === 'right' ? 20 : -20;
        el.style.transition = 'transform 0.42s ease-in, opacity 0.35s ease';
        el.style.transform = `translateX(${exitX}px) rotate(${exitR}deg)`;
        el.style.opacity = '0';
      }

      setTimeout(() => {
        card.state = 'gone';
        cardsRef.current.delete(id);
        cardElsRef.current.delete(id);
        setCards(prev => prev.filter(c => c.id !== id));
      }, 450);

    } else {
      // Snap back, resume falling
      card.state = 'falling';
      card.pointerId = null;
      card.dragX = 0;
      const el = cardElsRef.current.get(id);
      if (el) {
        el.removeAttribute('data-swiping');
        el.style.transition = 'transform 0.22s ease';
        el.style.transform = 'translateX(0) rotate(0deg)';
        setTimeout(() => { if (el) el.style.transition = ''; }, 230);
      }
    }
  }, [processCard]);

  if (!step) return null;

  const totalCards = objects.length;
  const purityPercent = totalCards > 0 ? Math.round((purityCount / totalCards) * 100) : 0;
  const succeeded = purityCount >= Math.ceil(totalCards * 0.6);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>

        {/* Purity meter */}
        <div className={styles.purityBar}>
          <div className={styles.purityTop}>
            <p className={styles.purityLabel}>Чистота данных</p>
            <span className={styles.purityCount}>{purityCount} / {totalCards}</span>
          </div>
          <div className={styles.purityTrack}>
            <div className={styles.purityFill} style={{ width: `${purityPercent}%` }} />
          </div>
        </div>

        {/* Prompt */}
        {step.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        {/* Swipe hints */}
        <div className={`${styles.hintLeft} ${styles.hintTrash}`}>
          <span className={styles.hintArrow}>←</span>
          <span className={styles.hintText}>Мусор</span>
        </div>
        <div className={`${styles.hintRight} ${styles.hintOk}`}>
          <span className={styles.hintText}>Норм</span>
          <span className={styles.hintArrow}>→</span>
        </div>

        {/* Falling profile cards */}
        {cards.map(card => (
          <div
            key={card.id}
            ref={el => {
              if (el) cardElsRef.current.set(card.id, el);
              else cardElsRef.current.delete(card.id);
            }}
            className={styles.card}
            style={{ left: `${card.baseX}px`, top: `${card.y}px` }}
            onPointerDown={e => handlePointerDown(e, card.id)}
            onPointerMove={e => handlePointerMove(e, card.id)}
            onPointerUp={e => handlePointerUp(e, card.id)}
            onPointerCancel={e => handlePointerUp(e, card.id)}
          >
            <ProfileCardContent object={card.object} num={card.index + 1} />
          </div>
        ))}

        {/* Result overlay */}
        {showResult && (
          <div className={styles.overlay}>
            <PopUp
              icon={succeeded ? 'done' : 'close'}
              iconColor={succeeded ? 'blue' : 'red'}
              title={succeeded ? 'База данных очищена!' : 'Слишком много мусора осталось!'}
              description={
                `Правильных решений: ${purityCount} из ${totalCards}` +
                (wrongCount > 0 ? ` · Ошибок: ${wrongCount}` : '')
              }
              buttonLabel="Результаты"
              onButtonClick={() => onComplete(resultsRef.current)}
            />
          </div>
        )}
      </div>
    </Background>
  );
}

// ——— Profile card visual ———————————————————————————————————————

function ProfileCardContent({ object, num }: { object: CatchObject; num: number }) {
  const f = object.fields;
  const numStr = String(num).padStart(2, '0');

  return (
    <>
      <div className={styles.cardHeader}>
        <span className={styles.cardVariant}>ЗАПИСЬ БД</span>
        <span className={styles.cardNum}>#{numStr}</span>
      </div>

      <div className={styles.cardAvatarRow}>
        <div className={styles.cardAvatar}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="17" r="10" fill="#C0C0C0" />
            <path d="M4 48c0-12.15 9.85-22 22-22s22 9.85 22 22" stroke="#C0C0C0" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        <p className={styles.cardName}>{f?.name ?? object.title}</p>
      </div>

      <div className={styles.cardDivider} />

      <div className={styles.cardFields}>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Возраст</span>
          <span className={styles.fieldValue}>{f?.age ?? '—'}</span>
        </div>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Email</span>
          <span className={styles.fieldValue}>{f?.email ?? '—'}</span>
        </div>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Город</span>
          <span className={styles.fieldValue}>{f?.city ?? '—'}</span>
        </div>
      </div>

      {/* Swipe result badges */}
      <div className={styles.badgeCorrect}>✓</div>
      <div className={styles.badgeWrong}>✕</div>
    </>
  );
}
