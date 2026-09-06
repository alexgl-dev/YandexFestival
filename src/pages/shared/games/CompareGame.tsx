import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Background, Button } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './CompareGame.module.css';

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

const HINT_DELAY_MS = 10000;
const HINT_INTERVAL_MS = 900;

/**
 * Механика `compare` — «Глазами другого».
 * Данные: task.steps[0].image — базовая картинка; options[] — { text, filterId, explanation }.
 * Тап по кнопке применяет визуальный фильтр к картинке (повторный тап на активную — снимает).
 * Через 10с бездействия после выбора — не просмотренные кнопки по очереди подсвечиваются (хинт).
 * После просмотра всех пяти — автозавершение.
 */
export function CompareGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const options = useMemo(() => step?.options ?? [], [step]);
  const baseImage = step?.image;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const hintDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const rawFilterId = useId().replace(/:/g, '');
  const svgFilterId = `cvd-filter-${rawFilterId}`;

  const stopHint = useCallback(() => {
    if (hintDelayRef.current) {
      clearTimeout(hintDelayRef.current);
      hintDelayRef.current = null;
    }
    if (hintIntervalRef.current) {
      clearInterval(hintIntervalRef.current);
      hintIntervalRef.current = null;
    }
    setHintIndex(null);
  }, []);

  useEffect(() => () => stopHint(), [stopHint]);

  // Restart the 10s-then-cycle hint timer whenever the selection changes.
  useEffect(() => {
    stopHint();
    if (activeIndex === null) return;

    hintDelayRef.current = setTimeout(() => {
      const remaining = options
        .map((_, i) => i)
        .filter((i) => !viewed.has(i) && i !== activeIndex);
      if (remaining.length === 0) return;
      let cursor = 0;
      hintIntervalRef.current = setInterval(() => {
        setHintIndex(remaining[cursor % remaining.length]);
        cursor += 1;
      }, HINT_INTERVAL_MS);
    }, HINT_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Auto-complete once every filter has been viewed at least once.
  useEffect(() => {
    if (completedRef.current) return;
    if (options.length > 0 && viewed.size === options.length) {
      completedRef.current = true;
      stopHint();
      const timer = setTimeout(() => {
        onComplete(options.map((o) => ({ answer: o.text || '', correct: true, explanation: o.explanation })));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [viewed, options, onComplete, stopHint]);

  const handleSelect = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
    setViewed((prev) => new Set(prev).add(index));
  }, []);

  if (!step) return null;

  const activeOption = activeIndex !== null ? options[activeIndex] : null;
  const filterId = activeOption?.filterId;

  let imageStyle: CSSProperties | undefined;
  if (filterId === 'myopia') {
    imageStyle = { filter: 'blur(6px)' };
  } else if (filterId === 'cataract') {
    imageStyle = { filter: 'blur(2px) contrast(0.7) brightness(1.25) saturate(0.6)' };
  } else if (filterId === 'colorblind') {
    imageStyle = { filter: `url(#${svgFilterId})` };
  }

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <div className={styles.imageContainer}>
          {baseImage && <img src={baseImage} alt="" className={styles.image} style={imageStyle} />}

          {filterId === 'cataract' && <div className={styles.hazeOverlay} />}
          {filterId === 'glaucoma' && <div className={styles.glaucomaOverlay} />}
          {filterId === 'macular' && <div className={styles.macularOverlay} />}

          {filterId === 'colorblind' && (
            <svg width="0" height="0" className={styles.svgDefs} aria-hidden="true" focusable="false">
              <defs>
                <filter id={svgFilterId} colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values="0.625 0.375 0     0 0
                            0.7   0.3   0     0 0
                            0     0.3   0.7   0 0
                            0     0     0     1 0"
                  />
                </filter>
              </defs>
            </svg>
          )}
        </div>

        {activeOption && <p className={styles.explanation}>{activeOption.explanation}</p>}

        <div className={styles.buttonsRow}>
          {options.map((option, index) => (
            <Button
              key={index}
              label={option.text || `Вариант ${index + 1}`}
              type="secondary"
              pressed={activeIndex === index}
              className={hintIndex === index ? styles.hintPulse : undefined}
              onClick={() => handleSelect(index)}
            />
          ))}
        </div>
      </div>
    </Background>
  );
}
