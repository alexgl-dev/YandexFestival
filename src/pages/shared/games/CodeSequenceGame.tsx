import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
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
  onTooltip: (text: string, anchor: HTMLElement) => void,
): ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const term = m[1];
    const tip = m[2];
    parts.push(
      <button
        key={key++}
        type="button"
        className={styles.termBtn}
        onClick={(e) => {
          e.stopPropagation();
          onTooltip(tip, e.currentTarget);
        }}
      >
        {term}
      </button>,
    );
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
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const dragSourceRef = useRef<number | null>(null);

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
        .map((idx) => (idx !== null ? blocks[idx].text || `Блок ${idx + 1}` : '?'))
        .join(' → '),
      explanation: allCorrect
        ? 'Правильная последовательность!'
        : 'Правильный порядок: ' +
          blocks
            .filter((b) => b.order !== null)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((b) => b.text || '')
            .join(' → '),
    };
  }, [slotResults, slots, blocks]);

  const overlayDimClass =
    orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

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
        {parseInteractive(briefingSource, (text, anchor) => {
          anchor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          setTooltip((prev) => (prev === text ? null : text));
        })}
      </p>
      {headingText && (
        <p className={styles.bubblePromptItalic}>{headingText}</p>
      )}
      {tooltip && (
        <div
          className={styles.tooltipCard}
          onClick={(e) => {
            e.stopPropagation();
            setTooltip(null);
          }}
        >
          <p className={styles.tooltipText}>{tooltip}</p>
          <span className={styles.tooltipDismiss}>✕</span>
        </div>
      )}
    </div>
  );

  return (
    <Background
      theme={theme}
      orientation={orientation}
      onBack={onBack}
      contentClassName={styles.scrollableBackgroundContent}
    >
      <div className={styles.codeSequenceShell}>
        <GameInstruction instruction={task.instruction} />
        {briefingSource ? (
          <button
            type="button"
            className={`${styles.floatingRobot} ${styles[`mood_${mood}`]}`}
            onClick={(e) => {
              e.stopPropagation();
              setTooltip(null);
              setBriefingOpen(true);
            }}
            aria-label="Открыть подсказку робота"
          >
            <img src={robotSrc} alt="Робот" className={styles.robotImg} />
          </button>
        ) : null}

        <div className={styles.page} onClick={() => setTooltip(null)}>
        {headingText && !briefingSource ? (
          <p className={styles.gameHeading}>{headingText}</p>
        ) : null}
        <div className={styles.playArea}>
        <div className={styles.poolRow}>
          <p className={styles.zoneLabel}>Кусочки кода</p>
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
                    }}
                    onDragEnd={() => {
                      dragSourceRef.current = null;
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
          <p className={styles.zoneLabel}>Правильный порядок</p>
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
                        {selected !== null ? 'Отпусти здесь' : 'Шаг ' + (sIdx + 1)}
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
          className={`${styles.overlay} ${overlayDimClass}`}
          onClick={() => {
            setBriefingOpen(false);
            setTooltip(null);
          }}
        >
          <div className={styles.briefingModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.briefingModalRow}>
              <div className={`${styles.robot} ${styles.robotMedium} ${styles[`mood_${mood}`]}`}>
                <img src={robotSrc} alt="Робот" className={styles.robotImg} />
              </div>
              {renderBubble('popup')}
            </div>
            <Button
              label="Закрыть"
              type="main"
              onClick={() => {
                setBriefingOpen(false);
                setTooltip(null);
              }}
            />
          </div>
        </div>
      )}

      {showPopup && checked && (
        <div className={`${styles.overlay} ${overlayDimClass}`}>
          <PopUp
            icon={getResult().correct ? 'done' : 'close'}
            iconColor={getResult().correct ? 'blue' : 'red'}
            title={getResult().correct ? 'Потрясающе!' : 'Ой, не получилось!'}
            description={getResult().correct
              ? 'Благодаря тебе робот спасён! И никто не останется голодным ;-)'
              : 'Сейчас не получилось, но ты совсем близко к правильной цепочке. Попробуй что-то поменять!'}
            buttonLabel={getResult().correct ? 'Далее' : 'Попробовать ещё раз'}
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
    </Background>
  );
}
