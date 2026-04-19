import { useState, useCallback, useMemo, useRef } from 'react';
import { Background, Button, PopUp } from '../../../components/ui';
import type { Task, TaskPair } from '../../../types/game';
import { CodeArchaeologyMockup } from './CodeArchaeologyMockups';
import { GameInstruction } from '../GameInstruction';
import styles from './MatchGame.module.css';

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

/** Renders description with [term]{tooltip: "..."} — terms become tappable buttons */
function parseDescriptionInteractive(
  text: string,
  onTooltip: (text: string) => void
): React.ReactNode[] {
  const regex = /\[([^\]]+)\]\{tooltip:\s*"([^"]*)"\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const term = match[1];
    const tooltip = match[2];
    parts.push(
      <button
        key={key++}
        className={styles.termBtn}
        onClick={(e) => { e.stopPropagation(); onTooltip(tooltip); }}
      >
        {term}
      </button>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
}

/** Shuffle array using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Split code into preserved tokens (words + punctuation + whitespace). */
function tokenizeCode(code: string): string[] {
  return code.match(/\s+|[A-Za-zА-Яа-я0-9_-]+|[^\s\w]/g) ?? [];
}

/** Deterministic string hash → seed for per-pair stable randomness. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * Pick ~30% of word tokens (length ≥ 2) to hide.
 * Uses a simple seeded LCG so the hidden pattern is stable across renders
 * (same code string → same hidden token indices).
 */
function computeHiddenTokenIndices(tokens: string[], seed: number): Set<number> {
  const hideable: number[] = [];
  tokens.forEach((tok, i) => {
    if (/^[A-Za-zА-Яа-я0-9_-]{2,}$/.test(tok)) hideable.push(i);
  });
  const count = Math.ceil(hideable.length * 0.3);
  const result = new Set<number>();
  let rng = Math.abs(seed) || 1;
  for (let i = 0; i < count && hideable.length > 0; i++) {
    rng = (rng * 9301 + 49297) % 233280;
    const idx = Math.floor((rng / 233280) * hideable.length);
    result.add(hideable[idx]);
    hideable.splice(idx, 1);
  }
  return result;
}

/** Доп. чёрные плашки для code-archaeology: слишком очевидные подсказки в коде. */
const ARCHAEOLOGY_EXTRA_HIDDEN: Record<number, ReadonlySet<string>> = {
  1: new Set([
    'Популярные',
    'товары',
    'Подешевле',
    'Подороже',
    'Высокий',
    'рейтинг',
    'dropdown',
    'title',
    'items',
    'display',
    'none',
    'block',
    'open',
    '4161FF',
    'fff',
  ]),
  3: new Set([
    'form',
    'input',
    'type',
    'text',
    'password',
    'placeholder',
    'invalid',
    'error',
    'script',
    'if',
    'length',
    'classList',
    'add',
    'button',
    'Войти',
    'class',
    'Вы',
    'ввели',
    'неверный',
    'пароль',
  ]),
  4: new Set([
    'Смартфон',
    'display',
    'grid',
    'grid-template-columns',
    '1fr',
    '12px',
    'gap',
  ]),
};

function archaeologyExtraHiddenIndices(tokens: string[], pairIndex: number): Set<number> {
  const words = ARCHAEOLOGY_EXTRA_HIDDEN[pairIndex];
  if (!words) return new Set();
  const out = new Set<number>();
  tokens.forEach((t, i) => {
    if (words.has(t)) out.add(i);
  });
  return out;
}

export function MatchGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const pairs: TaskPair[] = step?.pairs ?? [];
  const isLanguagesIntro = task.id === 'languages-intro';

  const shuffledRightIndices = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs]);

  /** Pre-compute tokens + hidden indices for every pair that has hidden code.
   *  Memoized by the pairs reference so randomness stays stable per mount. */
  const codeMasks = useMemo(() => {
    return pairs.map((pair, pairIndex) => {
      const code = pair.right.code;
      if (!code || !pair.right.hidden) return null;
      const tokens = tokenizeCode(code);
      const hidden = computeHiddenTokenIndices(tokens, hashString(code));
      if (task.id === 'code-archaeology') {
        archaeologyExtraHiddenIndices(tokens, pairIndex).forEach((i) => hidden.add(i));
      }
      return { tokens, hidden };
    });
  }, [pairs, task.id]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [wrongLeft, setWrongLeft] = useState<number | null>(null);
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [revealedChunks, setRevealedChunks] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<GameResult[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  // Speech bubble + tooltip state
  const [speechBubbleIndex, setSpeechBubbleIndex] = useState<number | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const isProcessing = useRef(false);

  const handleLeftTap = useCallback((index: number) => {
    if (matchedPairs.has(index) || isProcessing.current) return;
    setSelectedLeft((prev) => (prev === index ? null : index));
  }, [matchedPairs]);

  const handleRightTap = useCallback((pairIndex: number) => {
    if (matchedPairs.has(pairIndex) || selectedLeft === null || isProcessing.current) return;

    isProcessing.current = true;
    const isCorrect = selectedLeft === pairIndex;
    const pair = pairs[selectedLeft];

    const result: GameResult = {
      answer: `${pair?.left.label || pair?.left.description || 'Left'} → ${pairs[pairIndex]?.right.label || 'Right'}`,
      correct: isCorrect,
      explanation: pair?.explanation || '',
    };

    if (isCorrect) {
      setMatchedPairs((prev) => new Set([...prev, pairIndex]));
      setSelectedLeft(null);

      const updatedResults = [...results, result];
      setResults(updatedResults);

      if (updatedResults.filter((r) => r.correct).length === pairs.length) {
        setTimeout(() => {
          if (task.feedback === 'instant' && task.id !== 'languages-intro') {
            setShowPopup(true);
          } else {
            onComplete(updatedResults);
          }
        }, 600);
      }
      isProcessing.current = false;
    } else {
      setWrongLeft(selectedLeft);
      setWrongRight(pairIndex);
      setResults((prev) => [...prev, result]);
      setTimeout(() => {
        setWrongLeft(null);
        setWrongRight(null);
        setSelectedLeft(null);
        isProcessing.current = false;
      }, 600);
    }
  }, [matchedPairs, selectedLeft, pairs, results, task.feedback, task.id, onComplete]);

  const getLeftCardClass = (index: number): string => {
    const cls = [styles.card];
    if (matchedPairs.has(index)) cls.push(styles.cardCorrect, styles.cardMatched);
    else if (wrongLeft === index) cls.push(styles.cardWrong);
    else if (selectedLeft === index) cls.push(styles.cardSelected);
    return cls.join(' ');
  };

  const getRightCardClass = (pairIndex: number): string => {
    const cls = [styles.card];
    if (matchedPairs.has(pairIndex)) cls.push(styles.cardCorrect, styles.cardMatched);
    else if (wrongRight === pairIndex) cls.push(styles.cardWrong);
    return cls.join(' ');
  };

  const renderLeftCard = (pair: TaskPair, index: number) => {
    const { left } = pair;

    // CHARACTER type — compact: avatar + label + speech button
    if (left.type === 'character') {
      return (
        <div key={index} className={getLeftCardClass(index)} onClick={() => handleLeftTap(index)}>
          <div className={styles.charCardContent}>
            {left.avatar && (
              <img src={left.avatar} alt="" className={styles.compactAvatar} />
            )}
            <div className={styles.charCardInfo}>
              {left.label && <p className={styles.charCardLabel}>{left.label}</p>}
              {left.description && (
                <div
                  className={styles.speechHintWrap}
                  role="presentation"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    label="Описание"
                    type="secondary"
                    className={styles.speechHintBtn}
                    onClick={() => setSpeechBubbleIndex(index)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // MOCKUP type — rendered React component (no inner padding / no card chrome)
    if (left.type === 'mockup' && left.mockupId) {
      return (
        <div
          key={index}
          className={`${getLeftCardClass(index)} ${styles.mockupCard}`}
          onClick={() => handleLeftTap(index)}
        >
          <CodeArchaeologyMockup id={left.mockupId} />
        </div>
      );
    }

    // CODE / IMAGE type — may be hidden
    const isHidden = left.hidden === true && !revealedHints.has(index);
    const hintLabel = (left as Record<string, unknown>).hintLabel as string | undefined;
    const cardClass = isHidden
      ? `${getLeftCardClass(index)} ${styles.cardHidden}`
      : getLeftCardClass(index);

    return (
      <div key={index} className={cardClass} onClick={() => !isHidden && handleLeftTap(index)}>
        {isHidden ? (
          <div className={styles.hiddenPlaceholder}>
            <button
              className={styles.revealBtn}
              onClick={(e) => { e.stopPropagation(); setRevealedHints((p) => new Set([...p, index])); }}
            >
              {hintLabel || 'Подсказка'}
            </button>
          </div>
        ) : (
          <>
            {left.image && <img src={left.image} alt={left.label || ''} className={styles.cardImage} />}
            {left.label && <p className={styles.cardLabel}>{left.label}</p>}
          </>
        )}
      </div>
    );
  };

  const revealChunk = useCallback((key: string) => {
    setRevealedChunks((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const revealAllChunks = useCallback((pairIndex: number) => {
    const mask = codeMasks[pairIndex];
    if (!mask) return;
    setRevealedChunks((prev) => {
      const next = new Set(prev);
      mask.hidden.forEach((tokenIdx) => {
        next.add(`${pairIndex}-${tokenIdx}`);
      });
      return next;
    });
  }, [codeMasks]);

  const renderRightCard = (pairIndex: number) => {
    const pair = pairs[pairIndex];
    if (!pair) return null;
    const { right } = pair;
    const mask = codeMasks[pairIndex];
    const hasHiddenLeft = mask
      ? [...mask.hidden].some((i) => !revealedChunks.has(`${pairIndex}-${i}`))
      : false;
    const cardClassName = mask
      ? `${getRightCardClass(pairIndex)} ${styles.cardCode}`
      : getRightCardClass(pairIndex);

    return (
      <div
        key={pairIndex}
        className={cardClassName}
        onClick={() => handleRightTap(pairIndex)}
      >
        {mask && hasHiddenLeft && (
          <button
            type="button"
            className={styles.hintBtn}
            onClick={(e) => {
              e.stopPropagation();
              revealAllChunks(pairIndex);
            }}
          >
            Подсказка
          </button>
        )}

        {right.code && mask ? (
          <pre className={styles.codeBlock}>
            <code>
              {mask.tokens.map((token, i) => {
                const key = `${pairIndex}-${i}`;
                const isChunkHidden = mask.hidden.has(i) && !revealedChunks.has(key);
                if (isChunkHidden) {
                  return (
                    <button
                      key={i}
                      type="button"
                      className={styles.hiddenChunk}
                      aria-label="Показать скрытый фрагмент"
                      onClick={(e) => {
                        e.stopPropagation();
                        revealChunk(key);
                      }}
                    >
                      {token}
                    </button>
                  );
                }
                return <span key={i}>{token}</span>;
              })}
            </code>
          </pre>
        ) : (
          <>
            {right.code && (
              <pre className={styles.codeBlock}><code>{right.code}</code></pre>
            )}
            {!right.code && right.image && (
              <img src={right.image} alt={right.label || ''} className={styles.cardImage} />
            )}
          </>
        )}
        {right.label && !isLanguagesIntro && <p className={styles.cardLabel}>{right.label}</p>}
      </div>
    );
  };

  const allCorrect = results.filter((r) => r.correct).length === pairs.length;
  const overlayDimClass = orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

  // Speech bubble pair
  const bubblePair = speechBubbleIndex !== null ? pairs[speechBubbleIndex] : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <GameInstruction instruction={task.instruction} />
      <div className={`${styles.wrapper} ${isLanguagesIntro ? styles.languagesIntro : ''}`}>
        {step?.prompt && <p className={styles.prompt}>{step.prompt}</p>}

        <div className={styles.columns}>
          <div className={`${styles.column} ${styles.columnLeft} ui-scrollbar`}>
            {pairs.map((pair, index) => renderLeftCard(pair, index))}
          </div>
          <div className={`${styles.column} ${styles.columnRight} ui-scrollbar`}>
            {shuffledRightIndices.map((pairIndex) => renderRightCard(pairIndex))}
          </div>
        </div>
      </div>

      {/* ── Speech bubble overlay ── */}
      {bubblePair && (
        <div
          className={`${styles.overlay} ${overlayDimClass}`}
          onClick={() => { setSpeechBubbleIndex(null); setActiveTooltip(null); }}
        >
          <div
            className={`${styles.bubbleCard} ${isLanguagesIntro ? styles.bubbleCardLanguagesIntro : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.bubbleHeader}>
              {bubblePair.left.avatar && (
                <div className={styles.bubbleAvatar}>
                  <img src={bubblePair.left.avatar} alt="" className={styles.bubbleAvatarImg} />
                </div>
              )}
              {bubblePair.left.label && (
                <span className={styles.bubbleTitle}>{bubblePair.left.label}</span>
              )}
            </div>

            <p className={styles.bubbleText}>
              {parseDescriptionInteractive(
                bubblePair.left.description || '',
                (text) => setActiveTooltip(activeTooltip === text ? null : text)
              )}
            </p>

            {/* Tooltip inside the bubble */}
            {activeTooltip && (
              <div className={styles.tooltipCard} onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}>
                <p className={styles.tooltipText}>{activeTooltip}</p>
                <span className={styles.tooltipDismiss}>✕</span>
              </div>
            )}

            <button
              className={styles.bubbleCloseBtn}
              onClick={() => { setSpeechBubbleIndex(null); setActiveTooltip(null); }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ── Result popup ── */}
      {showPopup && (
        <div className={`${styles.overlay} ${overlayDimClass}`}>
          <PopUp
            icon={allCorrect ? 'done' : 'close'}
            iconColor={allCorrect ? 'blue' : 'red'}
            title={allCorrect ? 'Отлично!' : 'Результаты'}
            description={
              allCorrect
                ? (step?.resultCorrect ?? 'Все пары найдены верно!')
                : `Верных совпадений: ${results.filter((r) => r.correct).length} из ${pairs.length}`
            }
            buttonLabel="Далее"
            onButtonClick={() => { setShowPopup(false); onComplete(results); }}
          />
        </div>
      )}
    </Background>
  );
}
