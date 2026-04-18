import { useState, useCallback, useRef, useEffect } from 'react';
import { Background, PopUp } from '../../../components/ui';
import type { Task, CatchObject } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './CatchGame.module.css';

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

type BugState = 'falling' | 'caught' | 'missed';

interface ActiveBug {
  object: CatchObject;
  index: number;
  x: number; // left position in px
  state: BugState;
  startTime: number;
}

const FALL_DURATION = 4000; // ms
const CATCHER_WIDTH = 150;
const BUG_SIZE = 100;
const CATCH_ZONE_Y_THRESHOLD = 200; // distance from bottom where catch is checked
const CATCH_X_TOLERANCE = 90; // how close horizontally the catcher must be

export function CatchGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const objects = step?.objects ?? [];
  const catcherConfig = step?.catcher;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBug, setActiveBug] = useState<ActiveBug | null>(null);
  const [catcherX, setCatcherX] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [lastCaughtObject, setLastCaughtObject] = useState<CatchObject | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [flash, setFlash] = useState<'catch' | 'miss' | null>(null);
  const [gameAreaWidth, setGameAreaWidth] = useState(1920);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const bugCheckIntervalRef = useRef<number>(0);

  // Initialize catcher position to center
  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setGameAreaWidth(rect.width);
      setCatcherX(rect.width / 2);
    }
  }, []);

  // Spawn next bug
  const spawnBug = useCallback((index: number) => {
    if (index >= objects.length) return;

    const obj = objects[index];
    const maxX = gameAreaWidth - BUG_SIZE;
    const randomX = Math.random() * maxX;

    setActiveBug({
      object: obj,
      index,
      x: randomX,
      state: 'falling',
      startTime: Date.now(),
    });
  }, [objects, gameAreaWidth]);

  // Start the first bug
  useEffect(() => {
    if (objects.length > 0 && currentIndex === 0 && !activeBug) {
      // Small delay so layout settles
      const timer = setTimeout(() => spawnBug(0), 500);
      return () => clearTimeout(timer);
    }
  }, [objects.length, currentIndex, activeBug, spawnBug]);

  // Check if bug reached catcher zone
  useEffect(() => {
    if (!activeBug || activeBug.state !== 'falling') return;

    const checkCollision = () => {
      const elapsed = Date.now() - activeBug.startTime;
      const progress = elapsed / FALL_DURATION; // 0 to 1

      if (progress >= 1) {
        // Bug reached the bottom - missed
        handleMiss(activeBug);
        return;
      }

      // Check if bug is in catch zone (last portion of fall)
      if (progress >= 0.75) {
        const bugCenterX = activeBug.x + BUG_SIZE / 2;
        const catcherCenterX = catcherX;
        const xDistance = Math.abs(bugCenterX - catcherCenterX);

        if (xDistance < CATCH_X_TOLERANCE) {
          handleCatch(activeBug);
          return;
        }
      }

      bugCheckIntervalRef.current = requestAnimationFrame(checkCollision);
    };

    bugCheckIntervalRef.current = requestAnimationFrame(checkCollision);

    return () => {
      if (bugCheckIntervalRef.current) {
        cancelAnimationFrame(bugCheckIntervalRef.current);
      }
    };
  }, [activeBug, catcherX]);

  const handleCatch = useCallback((bug: ActiveBug) => {
    if (bugCheckIntervalRef.current) {
      cancelAnimationFrame(bugCheckIntervalRef.current);
    }

    setActiveBug((prev) => prev ? { ...prev, state: 'caught' } : null);
    setCaughtCount((prev) => prev + 1);
    setLastCaughtObject(bug.object);
    setFlash('catch');

    const result: GameResult = {
      answer: bug.object.title,
      correct: true,
      explanation: bug.object.description,
    };
    setResults((prev) => [...prev, result]);

    // Show popup after brief animation
    setTimeout(() => {
      setShowPopup(true);
      setFlash(null);
    }, 300);
  }, []);

  const handleMiss = useCallback((bug: ActiveBug) => {
    if (bugCheckIntervalRef.current) {
      cancelAnimationFrame(bugCheckIntervalRef.current);
    }

    setActiveBug((prev) => prev ? { ...prev, state: 'missed' } : null);
    setFlash('miss');

    const result: GameResult = {
      answer: bug.object.title,
      correct: false,
      explanation: bug.object.description,
    };
    setResults((prev) => [...prev, result]);

    // Move to next bug after brief delay
    setTimeout(() => {
      setFlash(null);
      const nextIndex = bug.index + 1;
      if (nextIndex >= objects.length) {
        onComplete([...results, result]);
      } else {
        setCurrentIndex(nextIndex);
        setActiveBug(null);
        spawnBug(nextIndex);
      }
    }, 800);
  }, [objects.length, results, onComplete, spawnBug]);

  const handlePopupDismiss = useCallback(() => {
    setShowPopup(false);
    setLastCaughtObject(null);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= objects.length) {
      onComplete(results);
    } else {
      setCurrentIndex(nextIndex);
      setActiveBug(null);
      spawnBug(nextIndex);
    }
  }, [currentIndex, objects.length, results, onComplete, spawnBug]);

  // Pointer handling for catcher movement
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (showPopup) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setCatcherX(Math.max(CATCHER_WIDTH / 2, Math.min(x, rect.width - CATCHER_WIDTH / 2)));
  }, [showPopup]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (showPopup) return;
    if (e.buttons === 0 && e.pointerType === 'mouse') return; // only track when pressed for mouse
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    setCatcherX(Math.max(CATCHER_WIDTH / 2, Math.min(x, rect.width - CATCHER_WIDTH / 2)));
  }, [showPopup]);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Prompt */}
        {step.prompt && (
          <p className={styles.prompt}>{step.prompt}</p>
        )}

        {/* Score */}
        <div className={styles.score}>
          <span className={styles.scoreLabel}>
            {catcherConfig?.label ?? 'Поймано'}:
          </span>
          <span className={styles.scoreValue}>
            {caughtCount} / {objects.length}
          </span>
        </div>

        {/* Falling bug */}
        {activeBug && activeBug.state === 'falling' && (
          <div
            className={`${styles.bug} ${styles.falling}`}
            style={{
              left: `${activeBug.x}px`,
              '--fall-duration': `${FALL_DURATION}ms`,
            } as React.CSSProperties}
          >
            <img
              className={styles.bugIcon}
              src={activeBug.object.icon}
              alt={activeBug.object.title}
              draggable={false}
            />
          </div>
        )}

        {/* Caught bug (fading out) */}
        {activeBug && activeBug.state === 'caught' && (
          <div
            className={`${styles.bug} ${styles.caught}`}
            style={{
              left: `${activeBug.x}px`,
              top: `calc(100% - ${CATCH_ZONE_Y_THRESHOLD}px)`,
            }}
          >
            <img
              className={styles.bugIcon}
              src={activeBug.object.icon}
              alt={activeBug.object.title}
              draggable={false}
            />
          </div>
        )}

        {/* Catcher */}
        <div
          className={styles.catcher}
          style={{ left: `${catcherX}px` }}
        >
          <div className={styles.catcherHandle} />
          <div className={styles.catcherBody}>
            <span className={styles.catcherLabel}>
              {catcherConfig?.label ?? 'Сачок'}
            </span>
          </div>
        </div>

        {/* Flash indicators */}
        {flash === 'catch' && <div className={styles.catchFlash} />}
        {flash === 'miss' && <div className={styles.missFlash} />}

        {/* PopUp on catch */}
        {showPopup && lastCaughtObject && (
          <div className={styles.overlay}>
            <PopUp
              icon="done"
              iconColor="blue"
              title={lastCaughtObject.title}
              description={lastCaughtObject.description}
              buttonLabel={
                currentIndex + 1 >= objects.length ? 'Результаты' : 'Дальше'
              }
              onButtonClick={handlePopupDismiss}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
