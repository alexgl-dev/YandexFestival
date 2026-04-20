import { useState, useCallback, useRef } from 'react';
import { Background, Button, Icon, InfoButton, ListItem, PopUp } from '../../../components/ui';
import type { Task, UxReview } from '../../../types/game';
import { AppMockup } from './AppMockup';
import { GameInstruction } from '../GameInstruction';
import styles from './MarkGame.module.css';

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

interface MarkerPosition {
  x: number;
  y: number;
}

// ─── UX-review game ──────────────────────────────────────────────────────────

function UxReviewGame({
  reviews,
  instruction,
  onComplete,
  theme,
  orientation,
  onBack,
}: {
  reviews: UxReview[];
  instruction?: string;
  onComplete: (results: GameResult[]) => void;
  theme: 'cobalt' | 'orange';
  orientation: 'landscape' | 'portrait';
  onBack: () => void;
}) {
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewToZone, setReviewToZone] = useState<Map<string, string>>(new Map());
  const [zoneOrder, setZoneOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  const problemZones = new Set(reviews.filter((r) => r.isProblem).map((r) => r.zone));
  const problemReviewIds = reviews.filter((r) => r.isProblem).map((r) => r.id);

  const selectedZones = new Set<string>([...reviewToZone.values()]);

  const handleZoneClick = useCallback((zoneId: string) => {
    if (checked) return;
    if (!activeReviewId) return;
    setReviewToZone((prev) => {
      const next = new Map(prev);
      next.set(activeReviewId, zoneId);
      return next;
    });
    setZoneOrder((prev) => (prev.includes(zoneId) ? prev : [...prev, zoneId]));
    setActiveReviewId(null);
  }, [checked, activeReviewId]);

  const handleReviewClick = useCallback((reviewId: string) => {
    if (checked) return;
    setActiveReviewId((prev) => (prev === reviewId ? null : reviewId));
  }, [checked]);

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

  const reviewStatus = (r: UxReview): 'correct' | 'wrong' | 'missed' | 'ok' => {
    const assigned = reviewToZone.get(r.id);
    if (r.isProblem) return assigned === r.zone ? 'correct' : 'missed';
    return assigned ? 'wrong' : 'ok';
  };

  const handleComplete = useCallback(() => {
    const correctCount = reviews.filter((r) => r.isProblem && reviewToZone.get(r.id) === r.zone).length;
    const wrongCount = reviews.filter((r) => !r.isProblem && reviewToZone.get(r.id)).length;
    const foundAll = correctCount === problemReviewIds.length && wrongCount === 0;
    onComplete([{
      answer: `Найдено ${correctCount} из ${problemZones.size} проблем`,
      correct: foundAll,
      explanation: foundAll
        ? 'Все проблемные зоны определены верно!'
        : `Найдено ${correctCount} из ${problemZones.size} проблем`,
    }]);
  }, [reviews, reviewToZone, problemReviewIds.length, problemZones.size, onComplete]);

  // After check: each zone gets correct/wrong
  const zoneResults: Record<string, 'correct' | 'wrong'> = checked
    ? Object.fromEntries(
        [...selectedZones].map((z) => [z, problemZones.has(z) ? 'correct' : 'wrong'])
      )
    : {};

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.uxWrapper}>

        {/* Mockup */}
        <AppMockup
          selectedZones={selectedZones}
          selectedOrder={zoneOrder}
          zoneResults={checked ? zoneResults : undefined}
          onZoneClick={handleZoneClick}
        />

        {/* Reviews */}
        <div className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>Отзывы пользователей</h2>
          <div className={styles.reviewsList}>
            {reviews.map((r) => {
              const s = checked ? reviewStatus(r) : undefined;
              const isGood = s === 'correct' || s === 'ok';
              const isActive = !checked && activeReviewId === r.id;
              const isAssigned = !checked && reviewToZone.has(r.id);
              return (
                <div key={r.id} className={styles.reviewWrap}>
                  <div
                    className={[
                      styles.reviewItemRow,
                      isActive ? styles.rowSelected : '',
                      isAssigned ? styles.rowAssigned : '',
                      s ? styles.reviewItemRowChecked : '',
                      s ? (isGood ? styles.rowGood : styles.rowBad) : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleReviewClick(r.id)}
                  >
                    <div className={styles.listItemWrap}>
                      <ListItem title={`«${r.text}»`} state="default" />
                    </div>
                    {s && (
                      <div className={styles.statusGroup}>
                        <span className={styles.statusIcon}>
                          {isGood ? (
                            <Icon name="done" color="blue" size="s" />
                          ) : (
                            <Icon name="close" color="red" size="s" />
                          )}
                        </span>
                        <InfoButton
                          size="sm"
                          variant="dark"
                          onClick={(e) => { e.stopPropagation(); setExpandedReviewId(r.id); }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.uxFooter}>
          <div className={styles.footerRow}>
            {!checked ? (
              <Button
                label="Отправить в работу"
                type="main"
                onClick={handleCheck}
              />
            ) : (
              <Button label="Далее" type="main" onClick={handleComplete} />
            )}
          </div>
        </div>
      </div>

      {/* Explanation popup */}
      {expandedReviewId && (() => {
        const r = reviews.find((x) => x.id === expandedReviewId);
        if (!r) return null;
        const s = reviewStatus(r);
        const isGood = s === 'correct' || s === 'ok';
        return (
          <div
            className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}
            onClick={() => setExpandedReviewId(null)}
          >
            <div className={styles.expCard} onClick={(e) => e.stopPropagation()}>
              <span className={styles.expCardIcon}>
                {isGood ? (
                  <Icon name="done" color="blue" size="m" />
                ) : (
                  <Icon name="close" color="red" size="m" />
                )}
              </span>
              <p className={styles.expCardQuote}>«{r.text}»</p>
              <p className={styles.expCardText}>{r.explanation}</p>
              <Button label="Понятно" type="main" onClick={() => setExpandedReviewId(null)} />
            </div>
          </div>
        );
      })()}
      <GameInstruction instruction={instruction} />
    </Background>
  );
}

// ─── Main MarkGame ────────────────────────────────────────────────────────────

export function MarkGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const steps = task.steps;
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const targets = step?.targets ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;

  const imageRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MarkerPosition[]>([]);
  const [markerStatus, setMarkerStatus] = useState<('correct' | 'wrong')[]>([]);
  const [checked, setChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);

  if (step?.reviews) {
    return (
      <UxReviewGame
        reviews={step.reviews}
        instruction={task.instruction}
        onComplete={onComplete}
        theme={theme}
        orientation={orientation}
        onBack={onBack}
      />
    );
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (checked) return;
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarkers((prev) => [...prev, { x, y }]);
  };

  const handleCheck = () => {
    setChecked(true);
    const newStatus = markers.map((marker) => {
      const hit = targets.some((target) => {
        const dx = marker.x - target.area.x;
        const dy = marker.y - target.area.y;
        return Math.sqrt(dx * dx + dy * dy) <= target.area.radius;
      });
      return hit ? 'correct' as const : 'wrong' as const;
    });
    setMarkerStatus(newStatus);

    const hitTargets = targets.filter((target) =>
      markers.some((marker) => {
        const dx = marker.x - target.area.x;
        const dy = marker.y - target.area.y;
        return Math.sqrt(dx * dx + dy * dy) <= target.area.radius;
      })
    );

    const stepResult: GameResult = {
      answer: `Найдено ${hitTargets.length} из ${targets.length}`,
      correct: hitTargets.length === targets.length,
      explanation: targets.map((t) => t.explanation).join('; '),
    };
    setResults((prev) => [...prev, stepResult]);
    setShowPopup(true);
  };

  const handlePopupAction = () => {
    setShowPopup(false);
    if (isLastStep) {
      onComplete(results);
    } else {
      setCurrentStep((s) => s + 1);
      setMarkers([]);
      setMarkerStatus([]);
      setChecked(false);
    }
  };

  if (!step) return null;
  const lastResult = results[results.length - 1];

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.imageContainer} ref={imageRef} onClick={handleImageClick}>
            {step.image && (
              <img src={step.image} alt={step.prompt || 'Изображение Задачи на день'} className={styles.image} />
            )}
            {markers.map((marker, i) => {
              const statusClass = markerStatus[i] === 'correct'
                ? styles.markerCorrect
                : markerStatus[i] === 'wrong'
                  ? styles.markerWrong
                  : '';
              return (
                <div
                  key={i}
                  className={`${styles.marker} ${statusClass}`}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                />
              );
            })}
          </div>
        </div>

        {!checked && markers.length > 0 && (
          <div className={styles.footer}>
            <Button label="Проверить" type="main" onClick={handleCheck} />
          </div>
        )}

        {showPopup && lastResult && (
          <div className={`${styles.overlay} ${orientation === 'landscape' ? styles.overlayLandscape : styles.overlayPortrait}`}>
            <PopUp
              icon={lastResult.correct ? 'done' : 'close'}
              iconColor={lastResult.correct ? 'blue' : 'red'}
              title={lastResult.correct ? 'Верно!' : 'Не совсем...'}
              description={lastResult.explanation}
              buttonLabel={isLastStep ? 'Результаты' : 'Дальше'}
              onButtonClick={handlePopupAction}
            />
          </div>
        )}
      </div>
    </Background>
  );
}
