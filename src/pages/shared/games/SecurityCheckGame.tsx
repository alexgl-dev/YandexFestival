import { useCallback, useState } from 'react';
import { Background, Button, Icon, PopUp } from '../../../components/ui';
import type { EmailBlock, EmailContent, EmailField, Task } from '../../../types/game';
import styles from './SecurityCheckGame.module.css';

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

type Popup =
  | { kind: 'instruction' }
  | { kind: 'feedback'; correct: boolean; explanation: string }
  | null;

export function SecurityCheckGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const step = task.steps[0];
  const items = step?.items ?? [];
  const labels = step?.labels ?? [];
  const correctSharedText = step?.resultCorrect ?? 'Ты правильно оценил это письмо.';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(task.instruction ? { kind: 'instruction' } : null);

  const currentItem = items[currentIdx];
  const email = currentItem?.email;

  const handleNoteClick = useCallback((key: string, note?: string) => {
    if (!note) return;
    setActiveNote((prev) => (prev === key ? null : key));
  }, []);

  const handleVerdict = useCallback(
    (labelId: string) => {
      if (!currentItem) return;
      const isCorrect = currentItem.correctLabel === labelId;
      const pickedLabel = labels.find((l) => l.id === labelId);
      const result: GameResult = {
        answer: pickedLabel?.title ?? labelId,
        correct: isCorrect,
        explanation: isCorrect ? correctSharedText : currentItem.explanation,
      };
      setResults((prev) => [...prev, result]);
      setActiveNote(null);
      setPopup({
        kind: 'feedback',
        correct: isCorrect,
        explanation: isCorrect ? correctSharedText : currentItem.explanation,
      });
    },
    [currentItem, labels, correctSharedText],
  );

  const handlePopupAction = useCallback(() => {
    if (!popup) return;
    if (popup.kind === 'instruction') {
      setPopup(null);
      return;
    }
    // feedback dismiss → advance
    setPopup(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= items.length) {
      onComplete(results);
    } else {
      setCurrentIdx(nextIdx);
    }
  }, [popup, currentIdx, items.length, results, onComplete]);

  if (!step || !currentItem || !email) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      {task.instruction && (
        <button
          type="button"
          className={styles.instructionToggle}
          onClick={() => setPopup({ kind: 'instruction' })}
          aria-label="Открыть инструкцию"
        >
          ?
        </button>
      )}

      <div className={styles.wrapper}>
        <div className={styles.counter}>
          Письмо {currentIdx + 1} из {items.length}
        </div>

        <EmailCard
          email={email}
          activeNote={activeNote}
          onNoteClick={handleNoteClick}
        />

        <div className={styles.verdictRow}>
          {labels.map((label) => {
            const isDanger = label.id === 'danger';
            return (
              <Button
                key={label.id}
                label={label.title}
                type="main"
                onClick={() => handleVerdict(label.id)}
                className={isDanger ? styles.btnDanger : styles.btnSafe}
              />
            );
          })}
        </div>
      </div>

      {popup && popup.kind === 'instruction' && task.instruction && (
        <div className={styles.overlay} onClick={() => setPopup(null)}>
          <div className={styles.instructionPanel} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.instructionTitle}>Чек-лист «На что обращать внимание»</h2>
            <div className={styles.instructionBody}>
              {task.instruction.split('\n').map((line, i) =>
                line.trim() ? (
                  <p key={i} className={styles.instructionLine}>
                    {line}
                  </p>
                ) : (
                  <div key={i} className={styles.instructionBreak} />
                ),
              )}
            </div>
            <Button label="Начать" type="main" onClick={handlePopupAction} />
          </div>
        </div>
      )}

      {popup && popup.kind === 'feedback' && (
        <div className={styles.overlay}>
          <PopUp
            icon={popup.correct ? 'done' : 'close'}
            iconColor={popup.correct ? 'blue' : 'red'}
            title={popup.correct ? 'Верно!' : 'Ошибка'}
            description={popup.explanation}
            buttonLabel={currentIdx + 1 >= items.length ? 'Результаты' : 'Следующее письмо'}
            onButtonClick={handlePopupAction}
          />
        </div>
      )}
    </Background>
  );
}

// ── Email render helpers ──────────────────────────────────────────────────

function EmailCard({
  email,
  activeNote,
  onNoteClick,
}: {
  email: EmailContent;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
}) {
  return (
    <div className={styles.emailCard}>
      <div className={styles.emailHeader}>
        <EmailRow label="От кого" field={email.from} keyBase="from" activeNote={activeNote} onNoteClick={onNoteClick} />
        <EmailRow label="Кому" field={email.to} keyBase="to" activeNote={activeNote} onNoteClick={onNoteClick} />
        <EmailRow label="Тема" field={email.subject} keyBase="subject" activeNote={activeNote} onNoteClick={onNoteClick} />
      </div>
      <div className={styles.emailBody}>
        {email.body.map((block, idx) => (
          <EmailBodyBlock
            key={idx}
            block={block}
            keyBase={`body-${idx}`}
            activeNote={activeNote}
            onNoteClick={onNoteClick}
          />
        ))}
      </div>
    </div>
  );
}

function EmailRow({
  label,
  field,
  keyBase,
  activeNote,
  onNoteClick,
}: {
  label: string;
  field: EmailField;
  keyBase: string;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
}) {
  const isActive = activeNote === keyBase;
  return (
    <div className={styles.emailRow}>
      <span className={styles.rowLabel}>{label}:</span>
      <NotableText
        text={field.value}
        note={field.note}
        suspicious={field.suspicious}
        keyId={keyBase}
        isActive={isActive}
        onClick={onNoteClick}
      />
    </div>
  );
}

function EmailBodyBlock({
  block,
  keyBase,
  activeNote,
  onNoteClick,
}: {
  block: EmailBlock;
  keyBase: string;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
}) {
  const isActive = activeNote === keyBase;

  if (block.type === 'link') {
    return (
      <div className={styles.emailBlock}>
        <NotableText
          text={block.text}
          note={block.note}
          suspicious={block.suspicious}
          keyId={keyBase}
          isActive={isActive}
          onClick={onNoteClick}
          className={`${styles.link} ${block.suspicious ? styles.linkSuspicious : styles.linkSafe}`}
        />
      </div>
    );
  }

  if (block.type === 'attachment') {
    return (
      <div className={styles.emailBlock}>
        <button
          type="button"
          className={[
            styles.attachment,
            block.suspicious ? styles.attachmentSuspicious : '',
            isActive ? styles.notableActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            onNoteClick(keyBase, block.note);
          }}
        >
          <span className={styles.attachmentIcon}>
            <Icon name="done" color={block.suspicious ? 'red' : 'blue'} size="s" />
          </span>
          <span className={styles.attachmentName}>{block.text}</span>
          {block.note && <span className={styles.noteMark}>?</span>}
          {isActive && block.note && (
            <span className={styles.noteTooltip} onClick={(e) => e.stopPropagation()}>
              {block.note}
            </span>
          )}
        </button>
      </div>
    );
  }

  // type === 'text'
  return (
    <div className={styles.emailBlock}>
      <NotableText
        text={block.text}
        note={block.note}
        suspicious={block.suspicious}
        keyId={keyBase}
        isActive={isActive}
        onClick={onNoteClick}
        className={styles.paragraph}
      />
    </div>
  );
}

function NotableText({
  text,
  note,
  suspicious,
  keyId,
  isActive,
  onClick,
  className,
}: {
  text: string;
  note?: string;
  suspicious?: boolean;
  keyId: string;
  isActive: boolean;
  onClick: (key: string, note?: string) => void;
  className?: string;
}) {
  const hasNote = !!note;
  const cls = [
    className ?? styles.valueText,
    hasNote ? styles.notable : '',
    suspicious ? styles.notableSuspicious : '',
    hasNote && !suspicious ? styles.notableInfo : '',
    isActive ? styles.notableActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!hasNote) {
    return <span className={cls}>{renderMultiline(text)}</span>;
  }

  return (
    <span
      className={cls}
      onClick={(e) => {
        e.stopPropagation();
        onClick(keyId, note);
      }}
    >
      {renderMultiline(text)}
      <span className={styles.noteMark}>?</span>
      {isActive && (
        <span className={styles.noteTooltip} onClick={(e) => e.stopPropagation()}>
          {note}
        </span>
      )}
    </span>
  );
}

function renderMultiline(text: string) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}
