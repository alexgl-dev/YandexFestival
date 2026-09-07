import { useState, useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, PopUp, Badge, InfoButton } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import { InstructionRichText } from '../InstructionRichText';
import { pluralRu } from '../../../utils/plural';
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

const ZONE_ORDER = ['content', 'collaboration', 'context'] as const;

const LAYOUT = {
  landscape: {
    stageW: 1920,
    stageH: 1080,
    cardW: 480,
    cardH: 90,
    homes: [
      { x: 1260, y: 270, r: 1 },
      { x: 1260, y: 70, r: -1 },
      { x: 720, y: 470, r: 2 },
      { x: 720, y: 270, r: -2 },
      { x: 180, y: 70, r: -2 },
      { x: 1260, y: 470, r: -1 },
      { x: 180, y: 270, r: 2 },
      { x: 180, y: 470, r: -2 },
      { x: 720, y: 70, r: 1 },
    ],
    zones: [
      { id: 'content', x: 30, y: 660, w: 617, h: 380 },
      { id: 'collaboration', x: 647, y: 660, w: 617, h: 380 },
      { id: 'context', x: 1264, y: 660, w: 626, h: 380 },
    ],
  },
  portrait: {
    stageW: 1080,
    stageH: 1920,
    cardW: 460,
    cardH: 100,
    homes: [
      { x: 40, y: 180, r: -2 },
      { x: 580, y: 200, r: 1 },
      { x: 60, y: 380, r: 2 },
      { x: 560, y: 420, r: -1 },
      { x: 40, y: 600, r: -1 },
      { x: 580, y: 640, r: 2 },
      { x: 80, y: 820, r: 1 },
      { x: 540, y: 860, r: -2 },
      { x: 300, y: 1040, r: 1 },
    ],
    // Три зоны в ряд внизу
    zones: [
      { id: 'content', x: 30, y: 1280, w: 340, h: 580 },
      { id: 'collaboration', x: 370, y: 1280, w: 340, h: 580 },
      { id: 'context', x: 710, y: 1280, w: 340, h: 580 },
    ],
  },
} as const;

interface DragState {
  idx: number;
  offsetX: number;
  offsetY: number;
  pointerId: number;
  curX: number;
  curY: number;
}

export function PlaylistAnatomyGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'portrait',
}: GameProps) {
  const { t } = useTranslation('sharedGames2');
  const step = task.steps[0];
  const categories = step?.categories ?? [];
  const items = step?.items ?? [];

  const layout = LAYOUT[orientation];
  const homes = layout.homes;
  const zones = layout.zones;
  const cardW = layout.cardW;

  const [placements, setPlacements] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(ZONE_ORDER.map((id) => [id, []])),
  );
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<{ text: string; zoneId: string } | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const [infoZone, setInfoZone] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragging = useRef<DragState | null>(null);

  const getZoneUnder = (cx: number, cy: number): string | null => {
    for (const z of zones) {
      if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
        return z.id;
      }
    }
    return null;
  };

  // Set initial positions via DOM to avoid React re-render overwriting them during drag
  useLayoutEffect(() => {
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const home = homes[idx] ?? homes[0];
      el.style.left = `${home.x}px`;
      el.style.top = `${home.y}px`;
      el.style.transform = `rotate(${home.r}deg)`;
      el.style.width = `${cardW}px`;
    });
  }, [homes, cardW]);

  function getGameCoords(clientX: number, clientY: number) {
    const rect = wrapperRef.current!.getBoundingClientRect();
    const scale = rect.width / layout.stageW;
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  }

  function returnCardHome(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    const home = homes[idx] ?? homes[0];
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
    if (el.style.opacity === '0') return;
    if (dragging.current !== null) return;

    e.preventDefault();
    e.stopPropagation();

    const home = homes[idx] ?? homes[0];
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

    const centerX = newX + cardW / 2;
    const centerY = newY + layout.cardH / 2;
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

    const centerX = curX + cardW / 2;
    const centerY = curY + layout.cardH / 2;
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
          const totalPlaced = Object.values(next).reduce((sum, arr) => sum + arr.length, 0);
          if (totalPlaced === items.length) {
            setTimeout(() => setAllCorrect(true), 600);
          }
          return next;
        });
        setExplanation({ text: item?.explanation ? t(item.explanation) : '', zoneId });
      } else {
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
    const results: GameResult[] = [
      {
        answer: ZONE_ORDER.map((zoneId) => {
          const cat = categories.find((c) => c.id === zoneId);
          const indices = placements[zoneId] || [];
          return `${cat?.title ? t(cat.title) : zoneId}: ${indices.map((i) => (items[i]?.text ? t(items[i].text) : '')).join(', ')}`;
        }).join(' | '),
        correct: true,
        explanation: t('Все карточки разложены верно!'),
      },
    ];
    onComplete(results);
  }

  const isPortrait = orientation === 'portrait';

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div
        ref={wrapperRef}
        className={`${styles.wrapper} ${isPortrait ? styles.wrapperPortrait : ''}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Cards cloud */}
        {items.map((item, idx) => (
          <div
            key={idx}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className={`${styles.card} ${isPortrait ? styles.cardPortrait : ''}`}
            onPointerDown={(e) => handleCardPointerDown(e, idx)}
          >
            <span className={styles.cardLabel}>{t('Факт')}</span>
            <span className={styles.cardText}>{t(item.text ?? '')}</span>
          </div>
        ))}

        {/* Category zones */}
        {ZONE_ORDER.map((zoneId, zoneIndex) => {
          const zone = zones.find((z) => z.id === zoneId)!;
          const cat = categories.find((c) => c.id === zoneId);
          const chips = placements[zoneId] || [];
          const isDragOver = dragOverZone === zoneId;
          const posClass =
            zoneIndex === 0
              ? styles.zoneFirst
              : zoneIndex === ZONE_ORDER.length - 1
                ? styles.zoneLast
                : styles.zoneMiddle;

          return (
            <div
              key={zoneId}
              className={`${styles.zone} ${posClass} ${isPortrait ? styles.zonePortrait : ''} ${isDragOver ? styles.zoneDragOver : ''}`}
              style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
            >
              <div className={`${styles.zoneHeader} ${isPortrait ? styles.zoneHeaderPortrait : ''}`}>
                {cat?.image && (
                  <img
                    src={cat.image}
                    alt=""
                    className={`${styles.zoneIcon} ${isPortrait ? styles.zoneIconPortrait : ''}`}
                  />
                )}
                <div className={styles.zoneTextBlock}>
                  <div className={styles.zoneTitleRow}>
                    <span className={`${styles.zoneTitle} ${isPortrait ? styles.zoneTitlePortrait : ''}`}>
                      {cat?.title ? t(cat.title) : zoneId}
                    </span>
                    {cat?.tooltip && (
                      <InfoButton
                        size="sm"
                        variant="dark"
                        className={styles.zoneInfoBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoZone(zoneId);
                        }}
                      />
                    )}
                  </div>
                  {cat?.description && !isPortrait && (
                    <span className={styles.zoneDesc}>{t(cat.description)}</span>
                  )}
                </div>
              </div>
              <div className={`${styles.zoneBody} ${isPortrait ? styles.zoneBodyPortrait : ''}`}>
                {isPortrait ? (
                  <div className={styles.zoneCount}>
                    <span className={styles.zoneCountNum}>{chips.length}</span>
                    <span className={styles.zoneCountLabel}>
                      {pluralRu(chips.length, [t('факт'), t('факта'), t('фактов')])}
                    </span>
                  </div>
                ) : (
                  chips.map((itemIdx) => (
                    <Badge
                      key={itemIdx}
                      type="filled"
                      label={items[itemIdx]?.text ? t(items[itemIdx].text) : ''}
                      className={styles.zoneChip}
                    />
                  ))
                )}
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
              title={t('Верно!')}
              description={<InstructionRichText text={explanation.text} />}
              buttonLabel={t('Продолжить')}
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
              title={t('Все карточки разложены!')}
              description={t('Отлично! Переходим дальше.')}
              buttonLabel={t('Завершить')}
              onButtonClick={handleComplete}
            />
          </div>
        )}

        {/* Zone info popup */}
        {infoZone &&
          (() => {
            const cat = categories.find((c) => c.id === infoZone);
            if (!cat?.tooltip) return null;
            return (
              <div className={styles.overlay} onClick={() => setInfoZone(null)}>
                <div onClick={(e) => e.stopPropagation()}>
                  <PopUp
                    title={t(cat.title)}
                    description={t(cat.tooltip)}
                    buttonLabel={t('Понятно')}
                    onButtonClick={() => setInfoZone(null)}
                    compact
                  />
                </div>
              </div>
            );
          })()}
      </div>
    </Background>
  );
}
