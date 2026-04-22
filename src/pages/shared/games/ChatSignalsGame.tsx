import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Background, Button, IconButton, PopUp } from '../../../components/ui';
import type { Task, ChatMessage } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './ChatSignalsGame.module.css';

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

const TOTAL_SECONDS = 4 * 60;

const roleAvatarClass: Record<ChatMessage['role'], string> = {
  pm: styles.avatarPm,
  dev: styles.avatarDev,
  design: styles.avatarDesign,
  qa: styles.avatarQa,
};

const avatarLetters: Record<string, string> = {
  'Саша (PM)': 'С',
  'Игорь': 'И',
  'Марина': 'М',
  'Денис': 'Д',
};

function formatTime(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

interface Term { term: string; definition: string }

function parseTooltipTerms(tooltip?: string): Term[] {
  if (!tooltip) return [];
  return tooltip
    .split(/\n{2,}/)
    .map((para): Term | null => {
      const m = para.match(/^\s*([^—]+?)\s+—\s+(.+)\s*$/s);
      if (!m) return null;
      return { term: m[1].trim(), definition: m[2].trim() };
    })
    .filter((x): x is Term => x !== null);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderMessageText(
  text: string,
  terms: Term[],
  onTermClick: (t: Term) => void,
  wordClass: string,
): React.ReactNode {
  if (terms.length === 0) return text;
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
  // Match term + any trailing letters so inflected forms («багов», «релиза») highlight fully.
  const pattern = new RegExp(
    `(${sorted.map((t) => escapeRegex(t.term)).join('|')})(\\p{L}*)`,
    'giu',
  );
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const [full, base] = match;
    const start = match.index;
    if (start > pos) nodes.push(<span key={`t-${pos}`}>{text.slice(pos, start)}</span>);
    const matched = sorted.find((t) => t.term.toLowerCase() === base.toLowerCase());
    if (matched) {
      nodes.push(
        <span
          key={`w-${start}`}
          className={wordClass}
          onClick={(e) => { e.stopPropagation(); onTermClick(matched); }}
        >
          {full}
        </span>
      );
    } else {
      nodes.push(<span key={`u-${start}`}>{full}</span>);
    }
    pos = start + full.length;
  }
  if (pos < text.length) nodes.push(<span key="t-end">{text.slice(pos)}</span>);
  return nodes;
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ChatSignalsGame({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameProps) {
  const step = task.steps[0];
  const messages: ChatMessage[] = useMemo(() => step?.messages ?? [], [step]);
  const problemIds = useMemo(() => new Set(messages.filter((m) => m.isProblem).map((m) => m.id)), [messages]);
  const total = problemIds.size;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [flashWrong, setFlashWrong] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDone(true);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleTap = useCallback((msg: ChatMessage) => {
    if (done) return;
    if (msg.isProblem) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(msg.id)) {
          next.delete(msg.id);
          return next;
        }
        next.add(msg.id);
        setToast('Сигнал пойман 🎯');
        setTimeout(() => setToast(null), 1800);
        if (next.size === total) setTimeout(finish, 900);
        return next;
      });
    } else {
      setFlashWrong(msg.id);
      setTimeout(() => setFlashWrong(null), 400);
    }
  }, [done, total, finish]);

  const buildResult = useCallback((): GameResult => {
    const hits = [...selected].filter((id) => problemIds.has(id));
    const correct = hits.length === total && [...selected].every((id) => problemIds.has(id));
    return {
      correct,
      answer: `Найдено ${hits.length} из ${total}`,
      explanation: correct
        ? 'Все три сигнала пойманы!'
        : messages.filter((m) => m.isProblem).map((m) => `«${m.text.slice(0, 50)}…»`).join('; '),
    };
  }, [selected, problemIds, messages, total]);

  const foundCount = [...selected].filter((id) => problemIds.has(id)).length;

  const getResultTitle = () => {
    if (foundCount === 3) return 'Отлично! Ты читаешь между строк.';
    if (foundCount >= 1) return 'Тебе удалось кое-что заметить, но риски остались.';
    return 'К сожалению, ты не заметил проблемы вовремя.';
  };

  const getBubbleClass = (msg: ChatMessage): string => {
    const cls = [styles.bubble];
    if (done) {
      cls.push(styles.bubbleLocked);
      const sel = selected.has(msg.id);
      if (msg.isProblem && sel) cls.push(styles.bubbleCorrect);
      else if (msg.isProblem && !sel) cls.push(styles.bubbleMissed);
      else if (!msg.isProblem && sel) cls.push(styles.bubbleWrong);
    } else {
      if (selected.has(msg.id)) cls.push(styles.bubbleSignal);
      if (flashWrong === msg.id) cls.push(styles.bubbleFlash);
    }
    return cls.join(' ');
  };

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.page}>
        <div className={styles.gameHeader}>
          <IconButton type="back" variant={theme === 'orange' ? 'orange' : 'light'} size="md" onClick={onBack} />
          <div className={styles.headerPills}>
            <div className={styles.timerPill}>
              <span>⏱</span>
              <span className={`${styles.timerValue} ${secondsLeft <= 30 ? styles.timerUrgent : ''}`}>
                {formatTime(secondsLeft)}
              </span>
            </div>
            <div className={styles.counterPill}>
              <span>🚩</span>
              <span>Сигналов найдено: {foundCount}/{total}</span>
            </div>
          </div>
        </div>

        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <div className={styles.chatAvatars}>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarQa}`}>Д</div>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarPm}`}>С</div>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarDev}`}>И</div>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarDesign}`}>М</div>
            </div>
            <div className={styles.chatTitleBlock}>
              <p className={styles.chatTitle}>💬 Чат</p>
              <p className={styles.chatSub}>Денис, Саша, Игорь, Марина · сегодня</p>
            </div>
          </div>

          <div className={styles.chatBody}>
            {messages.map((msg) => {
              const isPm = msg.role === 'pm';
              const terms = parseTooltipTerms(msg.tooltip);
              return (
                <div key={msg.id} className={`${styles.messageRow} ${isPm ? styles.messageRowPm : ''}`}>
                  <div className={`${styles.avatar} ${roleAvatarClass[msg.role]}`}>
                    {avatarLetters[msg.author] ?? msg.author.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.messageBody}>
                    <div className={`${styles.messageMeta} ${isPm ? styles.messageMetaPm : ''}`}>
                      <span className={styles.messageAuthor}>{msg.author}</span>
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                    <div className={getBubbleClass(msg)} onClick={() => handleTap(msg)} role="button">
                      {renderMessageText(msg.text, !done ? terms : [], setActiveTerm, styles.termWord)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {activeTerm && (
        <div className={styles.overlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTerm.term}
              description={capitalizeFirst(activeTerm.definition)}
              buttonLabel="Понятно"
              onButtonClick={() => setActiveTerm(null)}
              compact
            />
          </div>
        </div>
      )}

      {done && (
        <div className={styles.overlay}>
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>{getResultTitle()}</h2>
            <div className={styles.resultList}>
              {messages.filter((m) => m.isProblem).map((m) => {
                const found = selected.has(m.id);
                return (
                  <div key={m.id} className={`${styles.signalCard} ${found ? styles.signalFound : styles.signalMissed}`}>
                    {!found && <span className={styles.missedBadge}>Пропущено</span>}
                    <p className={styles.signalQuote}>«{m.text}»</p>
                    {m.signalMeaning && (
                      <div className={styles.signalRow}>
                        <span className={styles.signalLabel}>Что имелось в виду:</span>
                        <span className={styles.signalText}>{m.signalMeaning}</span>
                      </div>
                    )}
                    {m.signalConsequence && (
                      <div className={styles.signalRow}>
                        <span className={styles.signalLabel}>Что случится:</span>
                        <span className={styles.signalText}>{m.signalConsequence}</span>
                      </div>
                    )}
                    {m.signalAction && (
                      <div className={styles.signalRow}>
                        <span className={styles.signalLabel}>Что делать PM:</span>
                        <span className={styles.signalText}>{m.signalAction}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className={styles.resultActions}>
              <Button label="Далее" type="main" onClick={() => onComplete([buildResult()])} />
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}
