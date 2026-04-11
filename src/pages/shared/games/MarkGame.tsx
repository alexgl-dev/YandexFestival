import { useState, useCallback, useRef } from 'react';
import { Background, Button, ListItem, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { AppMockup, PROBLEM_ZONES, ZONES } from './AppMockup';
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

export function MarkGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const steps = task.steps;
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const targets = step?.targets ?? [];
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const isUxReview = step?.image?.includes('ux-review');

  const imageRef = useRef<HTMLDivElement>(null);

  // Zone-based state (for ux-review)
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [zoneResults, setZoneResults] = useState<Record<string, 'correct' | 'wrong'>>({});

  // Coordinate-based state (for other mark tasks)
  const [markers, setMarkers] = useState<MarkerPosition[]>([]);
  const [markerStatus, setMarkerStatus] = useState<('correct' | 'wrong')[]>([]);

  const [checked, setChecked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);


  const handleZoneClick = useCallback((zoneId: string) => {
    if (checked) return;
    setSelectedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  }, [checked]);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (checked || isUxReview) return;
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarkers((prev) => [...prev, { x, y }]);
  }, [checked, isUxReview]);

  const handleCheck = useCallback(() => {
    setChecked(true);

    if (isUxReview) {
      // Zone-based check
      const newZoneResults: Record<string, 'correct' | 'wrong'> = {};
      let correctCount = 0;

      for (const zoneId of selectedZones) {
        if (PROBLEM_ZONES.has(zoneId)) {
          newZoneResults[zoneId] = 'correct';
          correctCount++;
        } else {
          newZoneResults[zoneId] = 'wrong';
        }
      }
      setZoneResults(newZoneResults);

      const foundAll = [...PROBLEM_ZONES].every((z) => selectedZones.has(z));
      const noWrong = [...selectedZones].every((z) => PROBLEM_ZONES.has(z));

      const problemLabels = ZONES.filter((z) => PROBLEM_ZONES.has(z.id));

      const stepResult: GameResult = {
        answer: `Найдено ${correctCount} из ${PROBLEM_ZONES.size} проблем`,
        correct: foundAll && noWrong,
        explanation: foundAll && noWrong
          ? 'Все проблемы найдены верно!'
          : `Проблемные зоны: ${problemLabels.map((z) => z.label).join(', ')}`,
      };

      setResults((prev) => [...prev, stepResult]);
    } else {
      // Coordinate-based check
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
    }

    setShowPopup(true);
  }, [isUxReview, selectedZones, markers, targets]);

  const handlePopupAction = useCallback(() => {
    setShowPopup(false);
    if (isLastStep) {
      onComplete(results);
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setSelectedZones(new Set());
      setZoneResults({});
      setMarkers([]);
      setMarkerStatus([]);
      setChecked(false);
    }
  }, [isLastStep, currentStep, results, onComplete]);

  if (!step) return null;

  const lastResult = results[results.length - 1];
  const canCheck = isUxReview ? selectedZones.size > 0 : markers.length > 0;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>

        <div className={styles.content}>
          {isUxReview ? (
            <AppMockup
              selectedZones={selectedZones}
              zoneResults={checked ? zoneResults : undefined}
              onZoneClick={handleZoneClick}
            />
          ) : (
            <div className={styles.imageContainer} ref={imageRef} onClick={handleImageClick}>
              {step.image && (
                <img
                  src={step.image}
                  alt={step.prompt || 'Изображение задания'}
                  className={styles.image}
                />
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
          )}

          {step.hints && (
            <div className={styles.hintsPanel}>
              <h3 className={styles.hintsTitle}>Отзывы пользователей</h3>
              <div className={styles.hintsList}>
                {step.hints.split('\n').filter((l) => l.trim().startsWith('-')).map((line, i) => (
                  <ListItem
                    key={i}
                    title={line.trim().replace(/^-\s*/, '').replace(/^"/, '').replace(/"$/, '')}
                    state="default"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!checked && canCheck && (
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
