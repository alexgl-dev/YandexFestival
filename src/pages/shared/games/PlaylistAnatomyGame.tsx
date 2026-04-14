import { useState, useRef, useLayoutEffect } from 'react';
import { Background, PopUp, Badge } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './PlaylistAnatomyGame.module.css';

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

const CARD_W = 480;
const CARD_H = 90;

const HOME_POSITIONS = [
  { x: 70,   y: 140, r: -6 },
  { x: 640,  y: 130, r: 3  },
  { x: 1320, y: 140, r: -4 },
  { x: 160,  y: 310, r: 5  },
  { x: 720,  y: 295, r: -7 },
  { x: 1280, y: 300, r: 4  },
  { x: 70,   y: 480, r: -3 },
  { x: 650,  y: 490, r: 6  },
  { x: 1350, y: 475, r: -5 },
];

const ZONE_ORDER = ['content', 'collaboration', 'context'] as const;

const ZONES = [
  { id: 'content',       x: 30,   y: 610, w: 580, h: 430 },
  { id: 'collaboration', x: 670,  y: 610, w: 580, h: 430 },
  { id: 'context',       x: 1310, y: 610, w: 580, h: 430 },
] as const;

interface DragState {
  idx: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  curX: number;
  curY: number;
}

function getZoneUnder(cx: number, cy: number): string | null {
  for (const z of ZONES) {
    if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
      return z.id;
    }
  }
  return null;
}

export function PlaylistAnatomyGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(ZONE_ORDER.map((id) => [id, []]))
  );
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<{ text: string; zoneId: string } | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragging = useRef<DragState | null>(null);

  // Set initial positions via DOM to avoid React re-render overwriting them during drag
  useLayoutEffect(() => {
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const home = HOME_POSITIONS[idx];
      el.style.left = `${home.x}px`;
      el.style.top = `${home.y}px`;
      el.style.transform = `rotate(${home.r}deg)`;
    });
  }, []);

  function getGameCoords(clientX: number, clientY: number) {
    const rect = wrapperRef.current!.getBoundingClientRect();
    const scale = rect.width / 1920;
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  }

  function returnCardHome(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    const home = HOME_POSITIONS[idx];
    el.style.transition = 'left 0.35s ease, top 0.35s ease, transform 0.35s ease';
    el.style.left = `${home.x}px`;
    el.style.top = `${home.y}px`;
    el.style.transform = `rotate(${home.r}deg)`;
    el.style.zIndex = '';
    setTimeout(() => {
      if (el) el.style.transition = '';
    }, 380);
  }

  function handleCardPointerDown(e: React.PointerEvent, idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    // Skip if already placed (opacity is 0)
    if (el.style.opacity === '0') return;
    // Only one finger/pointer at a time
    if (dragging.current !== null) return;

    e.preventDefault();
    e.stopPropagation();

    const home = HOME_POSITIONS[idx];
    const { x, y } = getGameCoords(e.clientX, e.clientY);
    const offsetX = x - home.x;
    const offsetY = y - home.y;

    wrapperRef.current!.setPointerCapture(e.pointerId);

    el.style.zIndex = '50';
    el.style.transition = 'none';
    el.style.transform = 'rotate(0deg) scale(1.05)';

    dragging.current = { idx, offsetX, offsetY, pointerId: e.pointerId, curX: x - offsetX, curY: y - offsetY };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    if (e.pointerId !== dragging.current.pointerId) return;

    const { x, y } = getGameCoords(e.clientX, e.clientY);
    const newX = x - dragging.current.offsetX;
    const newY = y - dragging.current.offsetY;

    const el = cardRefs.current[dragging.current.idx];
    if (el) {
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    }

    dragging.current.curX = newX;
    dragging.current.curY = newY;

    const centerX = newX + CARD_W / 2;
    const centerY = newY + CARD_H / 2;
    setDragOverZone(getZoneUnder(centerX, centerY));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging.current) return;
    if (e.pointerId !== dragging.current.pointerId) return;

    const { idx, curX, curY } = dragging.current;
    dragging.current = null;

    try {
      wrapperRef.current!.releasePointerCapture(e.pointerId);
    } catch (_) {
      // ignore
    }

    setDragOverZone(null);

    const centerX = curX + CARD_W / 2;
    const centerY = curY + CARD_H / 2;
    const zoneId = getZoneUnder(centerX, centerY);
    const el = cardRefs.current[idx];

    if (zoneId) {
      const item = items[idx];
      const correct = item?.belongs?.includes(zoneId) ?? false;

      if (correct) {
        if (el) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.transition = 'opacity 0.3s ease';
        }
        setPlacements((prev) => {
          const next = { ...prev, [zoneId]: [...(prev[zoneId] || []), idx] };
          // Check if all placed
          const totalPlaced = Object.values(next).reduce((sum, arr) => sum + arr.length, 0);
          if (totalPlaced === items.length) {
            setTimeout(() => setAllCorrect(true), 600);
          }
          return next;
        });
        setExplanation({ text: item?.explanation ?? '', zoneId });
      } else {
        // Wrong zone: shake animation
        if (el) {
          el.classList.add(styles.cardShake);
          setTimeout(() => {
            if (el) el.classList.remove(styles.cardShake);
          }, 800);
        }
        returnCardHome(idx);
      }
    } else {
      returnCardHome(idx);
    }
  }

  function handleComplete() {
    const results: GameResult[] = [{
      answer: ZONE_ORDER
        .map((zoneId) => {
          const cat = categories.find((c) => c.id === zoneId);
          const indices = placements[zoneId] || [];
          return `${cat?.title || zoneId}: ${indices.map((i) => items[i]?.text || '').join(', ')}`;
        })
        .join(' | '),
      correct: true,
      explanation: 'Все карточки разложены верно!',
    }];
    onComplete(results);
  }

  // Total placed count
  const totalPlaced = Object.values(placements).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Progress counter */}
        <div className={styles.progressCounter}>
          Разложено: {totalPlaced}/{items.length}
        </div>

        {/* Cards cloud */}
        {items.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className={styles.card}
            onPointerDown={(e) => handleCardPointerDown(e, idx)}
          >
            <span className={styles.cardLabel}>Факт</span>
            <span className={styles.cardText}>{item.text}</span>
          </div>
        ))}

        {/* Category zones */}
        {ZONE_ORDER.map((zoneId) => {
          const zone = ZONES.find((z) => z.id === zoneId)!;
          const cat = categories.find((c) => c.id === zoneId);
          const chips = placements[zoneId] || [];
          const isDragOver = dragOverZone === zoneId;

          return (
            <div
              key={zoneId}
              className={`${styles.zone} ${isDragOver ? styles.zoneDragOver : ''}`}
              style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
            >
              <div className={styles.zoneHeader}>
                <span className={styles.zoneVariant}>Зона</span>
                <div className={styles.zoneTextBlock}>
                  <span className={styles.zoneTitle}>{cat?.title ?? zoneId}</span>
                  {cat?.description && (
                    <span className={styles.zoneDesc}>{cat.description}</span>
                  )}
                </div>
              </div>
              <div className={styles.zoneBody}>
                {chips.map((itemIdx) => (
                  <Badge
                    key={itemIdx}
                    type="filled"
                    label={items[itemIdx]?.text ?? ''}
                    className={styles.zoneChip}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Explanation toast */}
        {explanation && (
          <div className={styles.overlay}>
            <PopUp
              icon="done"
              iconColor="blue"
              title="Верно!"
              description={explanation.text}
              buttonLabel="Продолжить"
              onButtonClick={() => setExplanation(null)}
            />
          </div>
        )}

        {/* Completion overlay */}
        {allCorrect && (
          <div className={styles.overlay}>
            <PopUp
              icon="done"
              iconColor="blue"
              title="Все карточки разложены!"
              description={task.moral ?? ''}
              buttonLabel="Завершить"
              onButtonClick={handleComplete}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
