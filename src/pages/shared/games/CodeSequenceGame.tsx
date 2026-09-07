import { useState, useEffect, useCallback, useMemo, useRef, type DragEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './CodeSequenceGame.module.css';

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

type RobotMood = 'neutral' | 'happy' | 'sad';

/** Minimal Python syntax highlighter */
function highlightPython(code: string): ReactNode[] {
  const regex =
    /(#[^\n]*)|("[^"]*"|'[^']*')|(@[\w.]+)|(\b(?:from|import|def|return|if|else|elif|for|while|in|and|or|not|True|False|None|class|try|except|pass|break|continue|as|with|lambda|global|nonlocal|__name__|__main__)\b)|(\b\d+(?:\.\d+)?\b)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(code)) !== null) {
    if (m.index > last) {
      out.push(<span key={key++}>{code.slice(last, m.index)}</span>);
    }
    let cls = '';
    if (m[1]) cls = styles.tokenComment;
    else if (m[2]) cls = styles.tokenString;
    else if (m[3]) cls = styles.tokenDecorator;
    else if (m[4]) cls = styles.tokenKeyword;
    else if (m[5]) cls = styles.tokenNumber;
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) {
    out.push(<span key={key++}>{code.slice(last)}</span>);
  }
  return out;
}

function parseInteractive(
  text: string,
  onTooltip: (term: string, tip: string) => void,
): ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}|\*\*([^*]+)\*\*/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) {
      const term = m[1];
      const tip = m[2];
      parts.push(
        <button
          key={key++}
          type="button"
          className={styles.termBtn}
          onClick={(e) => {
            e.stopPropagation();
            onTooltip(term, tip);
          }}
        >
          {term}
        </button>,
      );
    } else if (m[3] !== undefined) {
      parts.push(
        <strong key={key++} className={styles.bold}>
          {m[3]}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>);
  return parts.length ? parts : [<span key={0}>{text}</span>];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function CodeSequenceGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const { t } = useTranslation('sharedGames1');
  const step = task.steps[0];
  const blocks = step?.blocks ?? [];
  const briefingSource = (
    step?.briefing?.trim() ||
    task.instruction?.trim() ||
    step?.hints ||
    ''
  ).trim();
  const headingText = step?.prompt?.trim() ?? '';
  const validIndices = useMemo(
    () => blocks.map((b, i) => ({ b, i })).filter(({ b }) => b.order !== null).map(({ i }) => i),
    [blocks],
  );

  const [pool, setPool] = useState<(number | null)[]>(() => shuffle(validIndices));
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    Array(validIndices.length).fill(null),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [slotResults, setSlotResults] = useState<('correct' | 'wrong' | null)[]>(() =>
    Array(validIndices.length).fill(null),
  );
  const [showPopup, setShowPopup] = useState(false);
  const [mood, setMood] = useState<RobotMood>('neutral');
  const [tooltip, setTooltip] = useState<{ term: string; tip: string } | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const dragSourceRef = useRef<number | null>(null);
  const dragGhostRef = useRef<HTMLElement | null>(null);

  const clearDragGhost = useCallback(() => {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
  }, []);

  /**
   * Drag-preview в размере как на экране.
   * Background масштабирует сцену через CSS transform — браузер для setDragImage
   * берёт layout без transform родителя, поэтому превью «раздувается».
   * CSS zoom меняет layout-размер снимка (в отличие от transform: scale).
   */
  const setScaledDragImage = useCallback((e: DragEvent<HTMLElement>) => {
    clearDragGhost();
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    if (!el.offsetWidth || !rect.width) return;
    const scale = rect.width / el.offsetWidth;
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.removeAttribute('draggable');
    ghost.style.position = 'absolute';
    ghost.style.top = '0';
    ghost.style.left = '-10000px';
    ghost.style.width = `${el.offsetWidth}px`;
    ghost.style.margin = '0';
    ghost.style.transform = 'none';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '1';
    ghost.style.setProperty('zoom', String(scale));
    document.body.appendChild(ghost);
    dragGhostRef.current = ghost;
    // С zoom хотспот — в визуальных (уже уменьшенных) пикселях, как getBoundingClientRect.
    e.dataTransfer.setDragImage(
      ghost,
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  }, [clearDragGhost]);

  const allPlaced = slots.every((s) => s !== null);

  const selectBlock = useCallback(
    (idx: number) => {
      if (checked) return;
      setSelected((prev) => (prev === idx ? null : idx));
    },
    [checked],
  );

  const placeBlockInSlot = useCallback(
    (slotIdx: number, blockIdx: number) => {
      if (checked) return;
      const prevInSlot = slots[slotIdx];

      setSlots((s) => {
        const n = [...s];
        n[slotIdx] = blockIdx;
        return n;
      });

      setPool((p) => {
        const next = [...p];
        // clear the pool position that held the block (if it was in pool)
        const fromPoolIdx = next.indexOf(blockIdx);
        if (fromPoolIdx !== -1) next[fromPoolIdx] = null;
        // if slot had a previous block, return it to pool at first null (or its original spot if possible)
        if (prevInSlot !== null && prevInSlot !== blockIdx) {
          const emptyIdx = next.indexOf(null);
          if (emptyIdx !== -1) next[emptyIdx] = prevInSlot;
        }
        return next;
      });

      setSlotResults((sr) => {
        const n = [...sr];
        n[slotIdx] = null;
        return n;
      });
      setSelected(null);
    },
    [checked, slots],
  );

  const handleSlotClick = useCallback(
    (slotIdx: number) => {
      if (checked) return;
      if (selected !== null) {
        placeBlockInSlot(slotIdx, selected);
        return;
      }
      const inSlot = slots[slotIdx];
      if (inSlot !== null) {
        setSlots((s) => {
          const n = [...s];
          n[slotIdx] = null;
          return n;
        });
        setPool((p) => {
          const next = [...p];
          const emptyIdx = next.indexOf(null);
          if (emptyIdx !== -1) next[emptyIdx] = inSlot;
          return next;
        });
        setSlotResults((sr) => {
          const n = [...sr];
          n[slotIdx] = null;
          return n;
        });
      }
    },
    [checked, selected, slots, placeBlockInSlot],
  );

  const handleCheck = useCallback(() => {
    if (!allPlaced) return;
    const sr = slots.map((bIdx, sIdx) => {
      if (bIdx === null) return null;
      return blocks[bIdx].order === sIdx + 1 ? ('correct' as const) : ('wrong' as const);
    });
    setSlotResults(sr);
    setChecked(true);
    const allCorrect = sr.every((s) => s === 'correct');
    setMood(allCorrect ? 'happy' : 'sad');

    if (task.feedback === 'instant') {
      setTimeout(() => setShowPopup(true), 600);
    }
  }, [allPlaced, slots, blocks, task.feedback]);

  const lastAutoCheckSlotsKey = useRef('');
  useEffect(() => {
    if (!allPlaced || checked) {
      if (!allPlaced) lastAutoCheckSlotsKey.current = '';
      return;
    }
    const key = slots.join(',');
    if (lastAutoCheckSlotsKey.current === key) return;
    lastAutoCheckSlotsKey.current = key;
    handleCheck();
  }, [allPlaced, checked, slots, handleCheck]);

  /** После ошибки: убрать только неверные блоки в пул, верные остаются в шагах. */
  const retryAfterWrong = useCallback(() => {
    setShowPopup(false);
    const nextSlots = slots.map((bIdx, sIdx) =>
      bIdx !== null && slotResults[sIdx] === 'wrong' ? null : bIdx,
    );
    const wrongBlocks = slots
      .map((bIdx, sIdx) => (bIdx !== null && slotResults[sIdx] === 'wrong' ? bIdx : null))
      .filter((x): x is number => x !== null);

    setSlots(nextSlots);
    setPool((prevPool) => {
      const next = [...prevPool];
      let w = 0;
      for (let i = 0; i < next.length && w < wrongBlocks.length; i++) {
        if (next[i] === null) next[i] = wrongBlocks[w++];
      }
      return next;
    });
    setSlotResults(
      nextSlots.map((bIdx, sIdx) => {
        if (bIdx === null) return null;
        return blocks[bIdx].order === sIdx + 1 ? ('correct' as const) : null;
      }),
    );
    setChecked(false);
    setMood('neutral');
    setSelected(null);
  }, [slots, slotResults, blocks]);

  const getResult = useCallback((): GameResult => {
    const allCorrect = slotResults.every((s) => s === 'correct');
    return {
      correct: allCorrect,
      answer: slots
        .map((idx) => (idx !== null ? blocks[idx].text || t("Блок {{n}}", { n: idx + 1 }) : '?'))
        .join(' → '),
      explanation: allCorrect
        ? t("Правильная последовательность!")
        : t("Правильный порядок: {{sequence}}", {
            sequence: blocks
              .filter((b) => b.order !== null)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((b) => b.text || '')
              .join(' → '),
          }),
    };
  }, [slotResults, slots, blocks, t]);

  const isPortrait = orientation === 'portrait';
  const overlayDimClass = isPortrait ? styles.overlayPortrait : styles.overlayLandscape;

  const robotSrc =
    mood === 'happy'
      ? '/illustrations/robot-blue.png'
      : mood === 'sad'
        ? '/illustrations/robot-blue.png'
        : '/illustrations/robot-blue.png';

  const renderCodeBlock = (blockIdx: number, compact: boolean) => {
    const block = blocks[blockIdx];
    const code = block.code || '';
    return (
      <div className={`${styles.codeCard} ${compact ? styles.codeCardCompact : ''}`}>
        <div className={styles.codeLangLabel}>python</div>
        <pre className={styles.codePre}>
          <code>{highlightPython(code)}</code>
        </pre>
      </div>
    );
  };

  const renderBubble = (variant: 'briefing' | 'popup') => (
    <div className={`${styles.bubble} ${variant === 'popup' ? styles.bubblePopup : ''}`}>
      <div className={styles.bubbleTail} />
      <p className={styles.bubbleText}>
        {parseInteractive(briefingSource, (term, tip) => {
          setTooltip({ term, tip });
        })}
      </p>
      {headingText && (
        <p className={styles.bubblePromptItalic}>{headingText}</p>
      )}
    </div>
  );

  return (
    <Background
      theme={theme}
      orientation={orientation}
      onBack={onBack}
      contentClassName={
        isPortrait ? styles.portraitBackgroundContent : styles.scrollableBackgroundContent
      }
      backShowLabel={false}
    >
      <div
        className={[
          styles.codeSequenceShell,
          isPortrait ? styles.codeSequenceShellPortrait : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <GameInstruction instruction={task.instruction} />
        {briefingSource ? (
          <div
            className={[
              styles.floatingRobotWrap,
              isPortrait ? styles.floatingRobotWrapPortrait : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className={`${styles.floatingRobot} ${styles[`mood_${mood}`]}`}
              onClick={(e) => {
                e.stopPropagation();
                setTooltip(null);
                setBriefingOpen(true);
              }}
              aria-label={t("Открыть подсказку робота")}
            >
              <img src={robotSrc} alt={t("Робот")} className={styles.robotImg} />
            </button>
            <button
              type="button"
              className={styles.instructionBtn}
              onClick={(e) => {
                e.stopPropagation();
                setTooltip(null);
                setBriefingOpen(true);
              }}
            >
              {t("Инструкция")}
            </button>
          </div>
        ) : null}

        <div
          className={[styles.page, isPortrait ? styles.pagePortrait : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => setTooltip(null)}
        >
        {headingText && !briefingSource ? (
          <p className={styles.gameHeading}>{headingText}</p>
        ) : null}
        <div
          className={[styles.playArea, isPortrait ? styles.playAreaPortrait : '']
            .filter(Boolean)
            .join(' ')}
        >
        <div className={styles.poolRow}>
          <p className={styles.zoneLabel}>{t("Кусочки кода")}</p>
          <div className={styles.pool}>
            {pool.map((bIdx, pos) => {
              if (bIdx === null) return null;
              return (
                <div key={pos} className={styles.poolCell}>
                  <div
                    className={`${styles.poolItem} ${styles[`poolPos${pos % 3}`]} ${
                      selected === bIdx ? styles.poolItemSelected : ''
                    }`}
                    draggable={!checked}
                    onDragStart={(e) => {
                      dragSourceRef.current = bIdx;
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(bIdx));
                      setScaledDragImage(e);
                    }}
                    onDragEnd={() => {
                      dragSourceRef.current = null;
                      clearDragGhost();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectBlock(bIdx);
                    }}
                  >
                    {renderCodeBlock(bIdx, false)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.slotsRow}>
          <p className={styles.zoneLabel}>{t("Правильный порядок")}</p>
          <div className={styles.slots}>
            {slots.map((bIdx, sIdx) => {
              const result = slotResults[sIdx];
              const filled = bIdx !== null;
              const slotClass = [
                styles.slot,
                filled ? styles.slotFilled : '',
                result === 'correct' ? styles.slotCorrect : '',
                result === 'wrong' ? styles.slotWrong : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <div key={sIdx} className={styles.slotWrap}>
                  <div className={styles.slotIndex}>{sIdx + 1}</div>
                  <div
                    className={slotClass}
                    onDragOver={(e) => {
                      if (!checked) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const raw = e.dataTransfer.getData('text/plain');
                      const idx = Number(raw);
                      if (!Number.isNaN(idx)) placeBlockInSlot(sIdx, idx);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotClick(sIdx);
                    }}
                  >
                    {bIdx !== null ? (
                      renderCodeBlock(bIdx, false)
                    ) : (
                      <span className={styles.slotPlaceholder}>
                        {selected !== null ? t("Отпусти здесь") : t("Шаг {{n}}", { n: sIdx + 1 })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
      </div>

      {briefingOpen && (
        <div
          className={`${styles.overlay} ${overlayDimClass} ${styles.overlayBriefing}`}
          onClick={() => {
            setBriefingOpen(false);
            setTooltip(null);
          }}
        >
          <div
            className={[styles.briefingModal, isPortrait ? styles.briefingModalPortrait : '']
              .filter(Boolean)
              .join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={[
                styles.briefingModalRow,
                isPortrait ? styles.briefingModalRowPortrait : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div
                className={[
                  styles.robot,
                  styles.robotMedium,
                  isPortrait ? styles.robotMediumPortrait : '',
                  styles[`mood_${mood}`],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <img src={robotSrc} alt={t("Робот")} className={styles.robotImg} />
              </div>
              <div className={styles.briefingBubbleCol}>
                {renderBubble('popup')}
                <Button
                  label={t("Закрыть")}
                  type="secondary"
                  onClick={() => {
                    setBriefingOpen(false);
                    setTooltip(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showPopup && checked && (
        <div className={`${styles.overlay} ${overlayDimClass}`}>
          <PopUp
            icon={getResult().correct ? 'done' : 'close'}
            iconColor={getResult().correct ? 'blue' : 'red'}
            title={getResult().correct ? t("Потрясающе!") : t("Ой, не получилось!")}
            description={getResult().correct
              ? t("Благодаря тебе робот спасён! И никто не останется голодным ;-)")
              : t("Сейчас не получилось, но ты совсем близко к правильной цепочке. Попробуй что-то поменять!")}
            buttonLabel={getResult().correct ? t("Далее") : t("Попробовать ещё раз")}
            onButtonClick={() => {
              if (getResult().correct) {
                setShowPopup(false);
                onComplete([getResult()]);
              } else {
                retryAfterWrong();
              }
            }}
          />
        </div>
      )}

      {tooltip && (
        <div
          className={`${styles.overlay} ${overlayDimClass} ${styles.overlayTooltip}`}
          onClick={() => setTooltip(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={tooltip.term.charAt(0).toUpperCase() + tooltip.term.slice(1)}
              description={tooltip.tip}
              buttonLabel={t("Понятно")}
              onButtonClick={() => setTooltip(null)}
              compact
            />
          </div>
        </div>
      )}
    </Background>
  );
}
