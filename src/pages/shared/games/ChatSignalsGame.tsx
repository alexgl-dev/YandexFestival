import { useState, useCallback, useMemo } from 'react';
import { Background, Button } from '../../../components/ui';
import type { Task, ChatMessage } from '../../../types/game';
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

const roleAvatarClass: Record<ChatMessage['role'], string> = {
  pm: styles.avatarPm,
  dev: styles.avatarDev,
  design: styles.avatarDesign,
};

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function ChatSignalsGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const messages: ChatMessage[] = useMemo(() => step?.messages ?? [], [step]);
  const problemIds = useMemo(
    () => new Set(messages.filter((m) => m.isProblem).map((m) => m.id)),
    [messages],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const toggleSelect = useCallback(
    (id: string) => {
      if (checked) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [checked],
  );

  const handleCheck = useCallback(() => {
    setChecked(true);
    setShowResult(true);
  }, []);

  const buildResult = useCallback((): GameResult => {
    const correctHits = [...selected].filter((id) => problemIds.has(id));
    const foundAll = correctHits.length === problemIds.size;
    const noExtras = [...selected].every((id) => problemIds.has(id));
    const correct = foundAll && noExtras;
    return {
      correct,
      answer: `Найдено ${correctHits.length} из ${problemIds.size}`,
      explanation: correct
        ? 'Все три сигнала пойманы!'
        : 'Проблемные сигналы: ' +
          messages
            .filter((m) => m.isProblem)
            .map((m) => `«${m.text.slice(0, 50)}${m.text.length > 50 ? '…' : ''}»`)
            .join('; '),
    };
  }, [selected, problemIds, messages]);

  const handleFinish = useCallback(() => {
    setShowResult(false);
    onComplete([buildResult()]);
  }, [buildResult, onComplete]);

  const overlayDimClass =
    orientation === 'portrait' ? styles.overlayPortrait : styles.overlayLandscape;

  const getBubbleClass = (msg: ChatMessage): string => {
    const classes: string[] = [styles.bubble];
    const isSelected = selected.has(msg.id);
    if (!checked) {
      if (isSelected) classes.push(styles.bubbleSelected);
    } else {
      classes.push(styles.bubbleLocked);
      if (isSelected && msg.isProblem) classes.push(styles.bubbleCorrect);
      else if (isSelected && !msg.isProblem) classes.push(styles.bubbleWrong);
      else if (!isSelected && msg.isProblem) classes.push(styles.bubbleMissed);
    }
    return classes.join(' ');
  };

  const getBubbleMark = (msg: ChatMessage): { label: string; cls: string } | null => {
    if (!checked) return null;
    const isSelected = selected.has(msg.id);
    if (isSelected && msg.isProblem) return { label: '✓', cls: styles.markCorrect };
    if (isSelected && !msg.isProblem) return { label: '✕', cls: styles.markWrong };
    if (!isSelected && msg.isProblem) return { label: '!', cls: styles.markMissed };
    return null;
  };

  const problemMessages = messages.filter((m) => m.isProblem);
  const result = buildResult();

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.page}>
        <p className={styles.prompt}>{step?.prompt ?? 'Найди проблемные сообщения'}</p>

        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <div className={styles.chatAvatars}>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarPm}`}>А</div>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarDev}`}>М</div>
              <div className={`${styles.avatar} ${styles.avatarSmall} ${styles.avatarDesign}`}>
                Л
              </div>
            </div>
            <div className={styles.chatTitleBlock}>
              <p className={styles.chatTitle}>Карточка товара · команда</p>
              <p className={styles.chatSub}>Аня, Миша, Лена · сегодня</p>
            </div>
          </div>

          <div className={styles.chatBody}>
            {messages.map((msg) => {
              const mark = getBubbleMark(msg);
              return (
                <div key={msg.id} className={styles.messageRow}>
                  <div className={`${styles.avatar} ${roleAvatarClass[msg.role]}`}>
                    {initials(msg.author)}
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.messageMeta}>
                      <span className={styles.messageAuthor}>{msg.author}</span>
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                    <div
                      className={getBubbleClass(msg)}
                      onClick={() => toggleSelect(msg.id)}
                      role="button"
                    >
                      {msg.text}
                      {mark && <span className={`${styles.bubbleMark} ${mark.cls}`}>{mark.label}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          {!checked && selected.size > 0 && (
            <Button label="Проверить" type="main" onClick={handleCheck} />
          )}
        </div>
      </div>

      {showResult && (
        <div className={`${styles.overlay} ${overlayDimClass}`}>
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>
              {result.correct ? 'Все три сигнала пойманы!' : 'Вот что стояло за сообщениями'}
            </h2>
            <div className={styles.resultList}>
              {problemMessages.map((m) => (
                <div key={m.id} className={styles.resultItem}>
                  <p className={styles.resultItemQuote}>
                    {m.author}, {m.time} — «{m.text}»
                  </p>
                  <p className={styles.resultItemExplanation}>{m.explanation}</p>
                </div>
              ))}
            </div>
            <div className={styles.resultActions}>
              <Button label="Далее" type="main" onClick={handleFinish} />
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}
