import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Background } from '../../../components/ui';
import type { Task, TaskPair } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './AudioMatchGame.module.css';

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

const DRAG_THRESHOLD = 12;
const HINT_INTERVAL_MS = 550;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Механика `audio-match` — «Альтернативный текст».
 * Данные: task.steps[0].pairs[] — left { type: 'audio', label, value?: src аудио, description: альт-текст },
 * right { type: 'image', image }.
 * Тап по кнопке — играет аудио (файл или speechSynthesis). Перетягивание кнопки на картинку
 * (pointer events + тап-фоллбэк: тап по кнопке, потом тап по картинке) — попытка сопоставить пару.
 */
export function AudioMatchGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const pairs: TaskPair[] = useMemo(() => step?.pairs ?? [], [step]);

  const imageOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);
  const buttonOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);

  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<GameResult[]>([]);
  const [selectedButton, setSelectedButton] = useState<number | null>(null);
  const [wrongButton, setWrongButton] = useState<number | null>(null);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverImageIndex, setHoverImageIndex] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioEndHandlerRef = useRef<(() => void) | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragMovedRef = useRef(false);
  const completedRef = useRef(false);

  const stopHintCycle = useCallback(() => {
    if (hintTimerRef.current) {
      clearInterval(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setHintIndex(null);
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      if (audioEndHandlerRef.current) {
        audioRef.current.removeEventListener('ended', audioEndHandlerRef.current);
        audioEndHandlerRef.current = null;
      }
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => () => {
    stopPlayback();
    stopHintCycle();
  }, [stopPlayback, stopHintCycle]);

  const startHintCycle = useCallback((currentMatched: Set<number>) => {
    stopHintCycle();
    const remaining = imageOrder.filter((i) => !currentMatched.has(i));
    if (remaining.length === 0) return;
    let cursor = 0;
    hintTimerRef.current = setInterval(() => {
      setHintIndex(remaining[cursor % remaining.length]);
      cursor += 1;
    }, HINT_INTERVAL_MS);
  }, [imageOrder, stopHintCycle]);

  const playPair = useCallback((pairIndex: number) => {
    stopPlayback();
    stopHintCycle();
    const pair = pairs[pairIndex];
    if (!pair) return;

    const onEnd = () => startHintCycle(matched);

    if (pair.left.value) {
      const audio = new Audio(pair.left.value);
      audioRef.current = audio;
      audioEndHandlerRef.current = onEnd;
      audio.addEventListener('ended', onEnd, { once: true });
      audio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(pair.left.description || '');
      utter.lang = 'ru-RU';
      utter.onend = onEnd;
      window.speechSynthesis.speak(utter);
    }
  }, [pairs, matched, stopPlayback, stopHintCycle, startHintCycle]);

  const selectButton = useCallback((pairIndex: number) => {
    if (matched.has(pairIndex)) return;
    setSelectedButton(pairIndex);
    playPair(pairIndex);
  }, [matched, playPair]);

  const attemptMatch = useCallback((buttonPairIndex: number, imagePairIndex: number) => {
    if (matched.has(buttonPairIndex) || matched.has(imagePairIndex)) return;
    const pair = pairs[buttonPairIndex];
    if (!pair) return;

    if (buttonPairIndex === imagePairIndex) {
      stopPlayback();
      stopHintCycle();
      const result: GameResult = {
        answer: `${pair.left.label || ''} → картинка`,
        correct: true,
        explanation: pair.explanation || '',
      };
      setResults((prev) => [...prev, result]);
      setMatched((prev) => {
        const next = new Set(prev);
        next.add(buttonPairIndex);
        return next;
      });
      setSelectedButton(null);
    } else {
      setWrongButton(buttonPairIndex);
      setTimeout(() => {
        setWrongButton(null);
        setSelectedButton(null);
      }, 500);
    }
  }, [matched, pairs, stopPlayback, stopHintCycle]);

  // Auto-complete once every pair is matched.
  useEffect(() => {
    if (completedRef.current) return;
    if (pairs.length > 0 && matched.size === pairs.length) {
      completedRef.current = true;
      stopPlayback();
      stopHintCycle();
      const timer = setTimeout(() => onComplete(results), 500);
      return () => clearTimeout(timer);
    }
  }, [matched, results, pairs.length, onComplete, stopPlayback, stopHintCycle]);

  const handleImageTap = useCallback((imagePairIndex: number) => {
    if (matched.has(imagePairIndex) || selectedButton === null) return;
    attemptMatch(selectedButton, imagePairIndex);
  }, [matched, selectedButton, attemptMatch]);

  // ── Pointer-based drag with tap fallback ──
  const handleButtonPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>, pairIndex: number) => {
    if (matched.has(pairIndex)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragMovedRef.current = false;
    setDraggingIndex(pairIndex);
    selectButton(pairIndex);
  }, [matched, selectButton]);

  const handleButtonPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (!dragMovedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragMovedRef.current = true;
    }
    if (dragMovedRef.current) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const target = el?.closest('[data-image-index]') as HTMLElement | null;
      const idx = target ? Number(target.dataset.imageIndex) : NaN;
      setHoverImageIndex(Number.isFinite(idx) ? idx : null);
    }
  }, []);

  const handleButtonPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>, pairIndex: number) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    const moved = dragMovedRef.current;
    const targetImage = hoverImageIndex;
    dragStartRef.current = null;
    dragMovedRef.current = false;
    setDraggingIndex(null);
    setHoverImageIndex(null);

    if (moved && targetImage !== null) {
      attemptMatch(pairIndex, targetImage);
    }
  }, [hoverImageIndex, attemptMatch]);

  const handleButtonPointerCancel = useCallback(() => {
    pointerIdRef.current = null;
    dragStartRef.current = null;
    dragMovedRef.current = false;
    setDraggingIndex(null);
    setHoverImageIndex(null);
  }, []);

  if (!step) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        {step.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        <div className={styles.imagesRow}>
          {imageOrder.map((pairIndex) => {
            const pair = pairs[pairIndex];
            if (!pair || matched.has(pairIndex)) return null;
            const isHint = hintIndex === pairIndex;
            const isDragOver = hoverImageIndex === pairIndex;
            return (
              <div
                key={pairIndex}
                data-image-index={pairIndex}
                className={[
                  styles.imageCard,
                  isHint ? styles.imageHint : '',
                  isDragOver ? styles.imageDragOver : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleImageTap(pairIndex)}
              >
                <img src={pair.right.image} alt="" className={styles.image} draggable={false} />
              </div>
            );
          })}
        </div>

        <div className={styles.buttonsColumn}>
          {buttonOrder.map((pairIndex) => {
            const pair = pairs[pairIndex];
            if (!pair || matched.has(pairIndex)) return null;
            const isSelected = selectedButton === pairIndex;
            const isWrong = wrongButton === pairIndex;
            const isDragging = draggingIndex === pairIndex;
            return (
              <div
                key={pairIndex}
                className={[
                  styles.audioButton,
                  isSelected ? styles.audioButtonSelected : '',
                  isWrong ? styles.audioButtonWrong : '',
                  isDragging ? styles.audioButtonDragging : '',
                ].filter(Boolean).join(' ')}
                onPointerDown={(e) => handleButtonPointerDown(e, pairIndex)}
                onPointerMove={handleButtonPointerMove}
                onPointerUp={(e) => handleButtonPointerUp(e, pairIndex)}
                onPointerCancel={handleButtonPointerCancel}
              >
                {pair.left.label}
              </div>
            );
          })}
        </div>
      </div>
    </Background>
  );
}
