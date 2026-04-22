import { useCallback, useEffect, useRef, useState } from 'react';
import { Background, PopUp } from '../../../components/ui';
import type { CatchObject, Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './DatasetSanitizerGame.module.css';

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

// ── Game constants ──────────────────────────────────────────────
const GAME_DURATION_MS = 180_000; // 3 minutes
const SPAWN_INTERVAL_MS = 3800;
const FALL_SPEED = 0.16; // px/ms → ~6.8s across ~1080px
const SWIPE_THRESHOLD = 160;
const CARD_WIDTH = 460;
const CARD_HEIGHT = 300;
const TOAST_DURATION_MS = 2800;

const WRONG_SWIPE_TEXT = 'Осторожно! Эта запись в порядке. Попробуй найти другую, с логической ошибкой.';
const MISSED_TRASH_TEXT = 'Будь осторожнее! В базу попали некорректные данные.';

// ── State types ─────────────────────────────────────────────────
interface ActiveCard {
  id: number;
  obj: CatchObject;
  x: number;
  y: number;
  dragX: number;
  dragStartX: number;
  pointerId: number | null;
  phase: 'falling' | 'dragging' | 'exiting' | 'gone';
  processed: boolean;
}

interface Toast {
  id: number;
  kind: 'correctTrash' | 'wrongSwipe' | 'missedTrash';
  text: string;
  x: number;
  y: number;
}

let nextCardId = 0;
let nextToastId = 0;

// ── Fisher–Yates shuffle ────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function DatasetSanitizerGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const fieldWidth = orientation === 'landscape' ? 1920 : 1080;
  const fieldHeight = orientation === 'landscape' ? 1080 : 1920;

  // Shuffle pool once per mount
  const poolRef = useRef<CatchObject[]>(shuffle(step?.objects ?? []));
  const poolIdxRef = useRef(0);

  const [cards, setCards] = useState<ActiveCard[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const hasInstruction = !!task.instruction?.trim();
  const [playStarted, setPlayStarted] = useState(!hasInstruction);

  const cardsRef = useRef(new Map<number, ActiveCard>());
  const cardElsRef = useRef(new Map<number, HTMLDivElement | null>());
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number | null>(null);
  const gameStartRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const resultsRef = useRef<GameResult[]>([]);

  // Purity ratio 0..1 (50% when nothing resolved yet)
  const totalResolved = correctCount + wrongCount;
  const purity = totalResolved === 0 ? 0.5 : correctCount / totalResolved;

  // ── toast helpers ──────────────────────────────────────────────
  const addToast = useCallback((kind: Toast['kind'], text: string, x: number, y: number) => {
    const id = ++nextToastId;
    // Clamp coordinates so tooltips don't overflow the field
    const clampedX = Math.min(fieldWidth - 520, Math.max(20, x));
    const clampedY = Math.max(160, y);
    const toast: Toast = { id, kind, text, x: clampedX, y: clampedY };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, [fieldWidth]);

  // ── spawn a new card ───────────────────────────────────────────
  const spawnNext = useCallback(() => {
    const pool = poolRef.current;
    const idx = poolIdxRef.current;
    if (idx >= pool.length) return;
    poolIdxRef.current++;

    const obj = pool[idx];
    // Pick X with horizontal padding, avoid overlap with existing cards if possible
    const padding = 100;
    const minX = padding;
    const maxX = fieldWidth - padding - CARD_WIDTH;
    let x = minX + Math.random() * Math.max(0, maxX - minX);

    // Try up to 4 times to not overlap nearest existing falling card horizontally
    const existing = Array.from(cardsRef.current.values()).filter((c) => c.phase === 'falling');
    for (let attempt = 0; attempt < 4; attempt++) {
      const overlapping = existing.some((c) => Math.abs(c.x - x) < CARD_WIDTH * 0.6 && c.y < 200);
      if (!overlapping) break;
      x = minX + Math.random() * Math.max(0, maxX - minX);
    }

    const id = ++nextCardId;
    const card: ActiveCard = {
      id,
      obj,
      x,
      y: -CARD_HEIGHT - 40,
      dragX: 0,
      dragStartX: 0,
      pointerId: null,
      phase: 'falling',
      processed: false,
    };
    cardsRef.current.set(id, card);
    setCards((prev) => [...prev, card]);
  }, [fieldWidth]);

  // ── resolve: card was trashed (swipe) or fell through (bottom) ─
  const resolveCard = useCallback(
    (card: ActiveCard, decision: 'swiped' | 'fell') => {
      if (card.processed) return;
      card.processed = true;

      const isTrash = card.obj.category === 'trash';
      const userSaidTrash = decision === 'swiped';
      const correct = userSaidTrash === isTrash;

      resultsRef.current.push({
        answer: card.obj.title,
        correct,
        explanation: card.obj.description || '',
      });

      if (correct) {
        setCorrectCount((c) => c + 1);
        if (isTrash) {
          // Swiped a real trash → show the type tooltip
          addToast('correctTrash', card.obj.description || 'Мусорная запись удалена.', card.x, card.y);
        }
        // (silent) Clean card fell through — no toast, positive silent
      } else {
        setWrongCount((c) => c + 1);
        if (decision === 'swiped') {
          // Swiped a clean card
          addToast('wrongSwipe', WRONG_SWIPE_TEXT, card.x, card.y);
        } else {
          // Missed a trash card (let it fall to the DB)
          addToast('missedTrash', MISSED_TRASH_TEXT, card.x, fieldHeight - 260);
        }
      }
    },
    [addToast, fieldHeight],
  );

  // ── RAF loop: timer + spawn + fall (после «Начать» в инструкции) ─
  useEffect(() => {
    if (!playStarted) return;

    gameStartRef.current = performance.now();
    lastSpawnRef.current = performance.now() - SPAWN_INTERVAL_MS; // spawn first immediately
    lastTickRef.current = null;

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const dt = Math.min(now - lastTickRef.current, 50);
      lastTickRef.current = now;

      const elapsed = now - gameStartRef.current;
      setElapsedMs(elapsed);

      // Spawn
      if (elapsed < GAME_DURATION_MS && now - lastSpawnRef.current >= SPAWN_INTERVAL_MS) {
        lastSpawnRef.current = now;
        spawnNext();
      }

      // Move falling cards
      const removed: number[] = [];
      cardsRef.current.forEach((c) => {
        if (c.phase !== 'falling') return;
        c.y += FALL_SPEED * dt;
        const el = cardElsRef.current.get(c.id);
        if (el) el.style.top = `${c.y}px`;
        if (c.y > fieldHeight) {
          c.phase = 'gone';
          removed.push(c.id);
          resolveCard(c, 'fell');
        }
      });

      if (removed.length > 0) {
        removed.forEach((id) => {
          cardsRef.current.delete(id);
          cardElsRef.current.delete(id);
        });
        setCards((prev) => prev.filter((c) => !removed.includes(c.id)));
      }

      // End conditions: timer up OR pool exhausted AND no active cards
      const poolExhausted = poolIdxRef.current >= poolRef.current.length;
      const noActive = cardsRef.current.size === 0;
      if (elapsed >= GAME_DURATION_MS || (poolExhausted && noActive)) {
        cancelAnimationFrame(rafRef.current);
        setFinished(true);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // spawnNext / resolveCard / fieldHeight — замыкание на момент старта игры
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playStarted]);

  // ── pointer (drag) handlers ────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: number) => {
      const card = cardsRef.current.get(id);
      if (!card || card.phase !== 'falling') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      card.phase = 'dragging';
      card.pointerId = e.pointerId;
      card.dragStartX = e.clientX;
      card.dragX = 0;
      const el = cardElsRef.current.get(id);
      if (el) el.style.transition = '';
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: number) => {
      const card = cardsRef.current.get(id);
      if (!card || card.phase !== 'dragging' || card.pointerId !== e.pointerId) return;
      card.dragX = e.clientX - card.dragStartX;
      const rotate = card.dragX * 0.04;
      const el = cardElsRef.current.get(id);
      if (el) {
        el.style.transform = `translateX(${card.dragX}px) rotate(${rotate}deg)`;
        if (Math.abs(card.dragX) > 80) {
          el.setAttribute('data-swiping', 'true');
        } else {
          el.removeAttribute('data-swiping');
        }
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: number) => {
      const card = cardsRef.current.get(id);
      if (!card || card.phase !== 'dragging' || card.pointerId !== e.pointerId) return;

      if (Math.abs(card.dragX) >= SWIPE_THRESHOLD) {
        // Commit swipe → trash action
        card.phase = 'exiting';
        resolveCard(card, 'swiped');

        const el = cardElsRef.current.get(id);
        if (el) {
          const exitX = card.dragX > 0 ? fieldWidth + 200 : -600 - CARD_WIDTH;
          const exitR = card.dragX > 0 ? 25 : -25;
          el.style.transition = 'transform 0.42s ease-in, opacity 0.35s ease';
          el.style.transform = `translateX(${exitX}px) rotate(${exitR}deg)`;
          el.style.opacity = '0';
        }

        setTimeout(() => {
          card.phase = 'gone';
          cardsRef.current.delete(id);
          cardElsRef.current.delete(id);
          setCards((prev) => prev.filter((c) => c.id !== id));
        }, 450);
      } else {
        // Snap back & resume falling
        card.phase = 'falling';
        card.pointerId = null;
        card.dragX = 0;
        const el = cardElsRef.current.get(id);
        if (el) {
          el.removeAttribute('data-swiping');
          el.style.transition = 'transform 0.22s ease';
          el.style.transform = 'translateX(0) rotate(0deg)';
          setTimeout(() => {
            if (el) el.style.transition = '';
          }, 230);
        }
      }
    },
    [resolveCard, fieldWidth],
  );

  // ── Derived display values ─────────────────────────────────────
  if (!step) return null;

  const timeLeftMs = Math.max(0, GAME_DURATION_MS - elapsedMs);
  const mins = Math.floor(timeLeftMs / 60000);
  const secs = Math.floor((timeLeftMs % 60000) / 1000);
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  const purityPercent = Math.round(purity * 100);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction
        instruction={task.instruction}
        onClose={() => setPlayStarted(true)}
      />
      <div className={styles.field}>
        {/* ── Purity meter (top, spans between back button and ?) ── */}
        <div className={styles.meterWrap}>
          <div className={styles.meterZones}>
            <div className={styles.zoneRed} />
            <div className={styles.zoneYellow} />
            <div className={styles.zoneGreen} />
          </div>
          <div
            className={styles.meterMop}
            style={{ left: `${purityPercent}%` }}
            aria-label={`Чистота данных: ${purityPercent}%`}
          >
            <span role="img" aria-hidden>🧹</span>
          </div>
        </div>

        {/* ── Timer (centered below the meter) ── */}
        <div className={styles.timer}>
          <span className={styles.timerLabel}>Осталось</span>
          <span className={styles.timerValue}>{timeStr}</span>
        </div>

        {/* ── Falling cards ── */}
        {cards.map((card) => (
          <div
            key={card.id}
            ref={(el) => {
              if (el) cardElsRef.current.set(card.id, el);
              else cardElsRef.current.delete(card.id);
            }}
            className={styles.card}
            style={{ left: card.x, top: card.y, width: CARD_WIDTH }}
            onPointerDown={(e) => handlePointerDown(e, card.id)}
            onPointerMove={(e) => handlePointerMove(e, card.id)}
            onPointerUp={(e) => handlePointerUp(e, card.id)}
            onPointerCancel={(e) => handlePointerUp(e, card.id)}
          >
            <ProfileCardBody obj={card.obj} />
          </div>
        ))}

        {/* ── Toasts (tooltips) ── */}
        {toasts.map((t) => (
          <div
            key={t.id}
            className={styles.toast}
            style={{ left: t.x, top: t.y }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* ── Final screen ── */}
      {finished && (
        <FinalOverlay
          purity={purity}
          correctCount={correctCount}
          wrongCount={wrongCount}
          onContinue={() => onComplete(resultsRef.current)}
        />
      )}
    </Background>
  );
}

// ── Profile card body ──────────────────────────────────────────
function ProfileCardBody({ obj }: { obj: CatchObject }) {
  const f = obj.fields;
  return (
    <>
      <div className={styles.cardHeader}>
        <span className={styles.cardHeaderLabel}>Запись в базе</span>
      </div>
      <div className={styles.cardName}>{f?.name ?? obj.title}</div>
      <div className={styles.cardRows}>
        <div className={styles.cardRow}>
          <span className={styles.cardRowLabel}>Возраст</span>
          <span className={styles.cardRowValue}>{f?.age ?? '—'}</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardRowLabel}>Email</span>
          <span className={styles.cardRowValue}>{f?.email ?? '—'}</span>
        </div>
        <div className={styles.cardRow}>
          <span className={styles.cardRowLabel}>Город</span>
          <span className={styles.cardRowValue}>{f?.city ?? '—'}</span>
        </div>
      </div>
    </>
  );
}

// ── Final screen ───────────────────────────────────────────────
function FinalOverlay({
  purity,
  correctCount,
  wrongCount,
  onContinue,
}: {
  purity: number;
  correctCount: number;
  wrongCount: number;
  onContinue: () => void;
}) {
  let title: string;
  let text: string;
  let iconName: 'done' | 'close';

  if (purity >= 0.98) {
    title = 'Датасет проверен!';
    text =
      'Тебе удалось поймать весь мусор и не тронуть ни одной корректной записи. База данных готова к анализу.';
    iconName = 'done';
  } else if (purity >= 0.7) {
    title = 'Датасет проверен!';
    text =
      'Тебе удалось поймать большую часть мусора. Но кое-что просочилось, и это повлияет на точность анализа.';
    iconName = 'done';
  } else if (purity > 0.2) {
    title = 'Датасет проверен!';
    text =
      'Тебе удалось отловить часть мусора! Но, так как кое-что было пропущено, базу рановато допускать к анализу.';
    iconName = 'close';
  } else {
    title = 'Датасет проверен!';
    text =
      'В базу попало слишком много мусора. С такими данными анализ даст ложные результаты. Но есть и хорошая новость: ты потренировался сортировать данные и в следующий раз делать это будет гораздо проще!';
    iconName = 'close';
  }

  const scoreLine = `Верных решений: ${correctCount} · Ошибок: ${wrongCount}`;

  return (
    <div className={styles.overlay}>
      <PopUp
        icon={iconName}
        iconColor={iconName === 'done' ? 'blue' : 'red'}
        title={title}
        description={`${text}\n\n${scoreLine}`}
        buttonLabel="Результаты"
        onButtonClick={onContinue}
      />
    </div>
  );
}

