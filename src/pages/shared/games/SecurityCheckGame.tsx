import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, Icon, PopUp } from '../../../components/ui';
import type { EmailBlock, EmailContent, EmailField, Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
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
  | { kind: 'feedback'; correct: boolean; explanation: string }
  | null;

export function SecurityCheckGame({
  task,
  onComplete,
  onBack,
  theme = 'cobalt',
  orientation = 'landscape',
}: GameProps) {
  const { t } = useTranslation('sharedGames2');
  const step = task.steps[0];
  const items = step?.items ?? [];
  const labels = step?.labels ?? [];
  const correctSharedText = step?.resultCorrect ? t(step.resultCorrect) : t("Ты правильно оценил это письмо.");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(null);
  const [hintsVisible, setHintsVisible] = useState(false);

  useEffect(() => {
    setHintsVisible(false);
    setActiveNote(null);
  }, [currentIdx]);

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
        explanation: isCorrect ? correctSharedText : t(currentItem.explanation),
      };
      setResults((prev) => [...prev, result]);
      setActiveNote(null);
      setPopup({
        kind: 'feedback',
        correct: isCorrect,
        explanation: isCorrect ? correctSharedText : t(currentItem.explanation),
      });
    },
    [currentItem, labels, correctSharedText],
  );

  const handlePopupAction = useCallback(() => {
    if (!popup) return;
    // feedback dismiss → advance
    setPopup(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= items.length) {
      onComplete(results);
    } else {
      setCurrentIdx(nextIdx);
    }
  }, [popup, currentIdx, items.length, results, onComplete]);

  const isPortrait = orientation === 'portrait';

  if (!step || !currentItem || !email) return null;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />

      <div className={`${styles.wrapper} ${isPortrait ? styles.wrapperPortrait : ''}`}>
        <div className={styles.counter}>
          {t("Письмо {{current}} из {{total}}", { current: currentIdx + 1, total: items.length })}
        </div>

        <EmailCard
          email={email}
          activeNote={activeNote}
          onNoteClick={handleNoteClick}
          hintsVisible={hintsVisible}
          onToggleHints={() => setHintsVisible((v) => !v)}
          isPortrait={isPortrait}
        />

        <div className={`${styles.verdictRow} ${isPortrait ? styles.verdictRowPortrait : ''}`}>
          {labels.map((label) => {
            const isDanger = label.id === 'danger';
            return (
              <Button
                key={label.id}
                label={t(label.title)}
                type="secondary"
                onClick={() => handleVerdict(label.id)}
                className={`${isDanger ? styles.btnDanger : styles.btnSafe} ${isPortrait ? styles.verdictBtnPortrait : ''}`}
              />
            );
          })}
        </div>
      </div>

      {popup && popup.kind === 'feedback' && (
        <div className={styles.overlay}>
          <PopUp
            icon={popup.correct ? 'done' : 'close'}
            iconColor={popup.correct ? 'blue' : 'red'}
            title={popup.correct ? t("Верно!") : t("Ошибка")}
            description={popup.explanation}
            buttonLabel={currentIdx + 1 >= items.length ? t("Результаты") : t("Следующее письмо")}
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
  hintsVisible,
  onToggleHints,
  isPortrait,
}: {
  email: EmailContent;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
  hintsVisible: boolean;
  onToggleHints: () => void;
  isPortrait?: boolean;
}) {
  const { t } = useTranslation('sharedGames2');
  return (
    <div className={`${styles.emailCard} ${isPortrait ? styles.emailCardPortrait : ''}`}>
      <div className={styles.emailCardScroll}>
        <div className={styles.emailHeader}>
          <EmailRow
            label={t("От кого")}
            field={email.from}
            keyBase="from"
            activeNote={activeNote}
            onNoteClick={onNoteClick}
            hintsRevealed={hintsVisible}
            isPortrait={isPortrait}
          />
          <EmailRow
            label={t("Кому")}
            field={email.to}
            keyBase="to"
            activeNote={activeNote}
            onNoteClick={onNoteClick}
            hintsRevealed={hintsVisible}
            isPortrait={isPortrait}
          />
          <EmailRow
            label={t("Тема")}
            field={email.subject}
            keyBase="subject"
            activeNote={activeNote}
            onNoteClick={onNoteClick}
            hintsRevealed={hintsVisible}
            isPortrait={isPortrait}
          />
        </div>
        <div className={`${styles.emailBody} ${isPortrait ? styles.emailBodyPortrait : ''}`}>
          {email.body.map((block, idx) => (
            <EmailBodyBlock
              key={idx}
              block={block}
              keyBase={`body-${idx}`}
              activeNote={activeNote}
              onNoteClick={onNoteClick}
              hintsRevealed={hintsVisible}
            />
          ))}
        </div>
      </div>
      <div className={`${styles.hintFooter} ${isPortrait ? styles.hintFooterPortrait : ''}`}>
        <Button
          label={hintsVisible ? t("Скрыть подсказку") : t("Показать подсказку")}
          type="secondary"
          className={`${styles.hintButton} ${isPortrait ? styles.hintButtonPortrait : ''}`}
          onClick={onToggleHints}
        />
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
  hintsRevealed,
  isPortrait,
}: {
  label: string;
  field: EmailField;
  keyBase: string;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
  hintsRevealed: boolean;
  isPortrait?: boolean;
}) {
  const isActive = activeNote === keyBase;
  return (
    <div className={`${styles.emailRow} ${isPortrait ? styles.emailRowPortrait : ''}`}>
      <span className={styles.rowLabel}>{label}:</span>
      <NotableText
        text={field.value}
        note={field.note}
        suspicious={field.suspicious}
        keyId={keyBase}
        isActive={isActive}
        onClick={onNoteClick}
        hintsRevealed={hintsRevealed}
      />
    </div>
  );
}

function EmailBodyBlock({
  block,
  keyBase,
  activeNote,
  onNoteClick,
  hintsRevealed,
}: {
  block: EmailBlock;
  keyBase: string;
  activeNote: string | null;
  onNoteClick: (key: string, note?: string) => void;
  hintsRevealed: boolean;
}) {
  const { t } = useTranslation('sharedGames2');
  const isActive = activeNote === keyBase;

  if (block.type === 'link') {
    const linkClass = hintsRevealed
      ? `${styles.link} ${block.suspicious ? styles.linkSuspicious : styles.linkSafe}`
      : `${styles.link} ${styles.linkNeutral}`;
    return (
      <div className={styles.emailBlock}>
        <NotableText
          text={block.text}
          note={block.note}
          suspicious={block.suspicious}
          keyId={keyBase}
          isActive={isActive}
          onClick={onNoteClick}
          className={linkClass}
          hintsRevealed={hintsRevealed}
        />
      </div>
    );
  }

  if (block.type === 'attachment') {
    const showRisk = hintsRevealed && block.suspicious;
    return (
      <div className={styles.emailBlock}>
        <button
          type="button"
          className={[
            styles.attachment,
            showRisk ? styles.attachmentSuspicious : '',
            isActive ? styles.notableActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            if (!hintsRevealed || !block.note) return;
            onNoteClick(keyBase, block.note);
          }}
        >
          <span className={styles.attachmentIcon}>
            <Icon
              name="done"
              color={hintsRevealed ? (block.suspicious ? 'red' : 'blue') : 'blue'}
              size="s"
            />
          </span>
          <span className={styles.attachmentName}>{t(block.text)}</span>
          {block.note && (
            <span
              className={styles.noteMark}
              style={{ visibility: hintsRevealed ? 'visible' : 'hidden' }}
              aria-hidden={!hintsRevealed}
            >
              ?
            </span>
          )}
          {isActive && block.note && hintsRevealed && (
            <span className={styles.noteTooltip} onClick={(e) => e.stopPropagation()}>
              {t(block.note)}
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
        hintsRevealed={hintsRevealed}
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
  hintsRevealed,
}: {
  text: string;
  note?: string;
  suspicious?: boolean;
  keyId: string;
  isActive: boolean;
  onClick: (key: string, note?: string) => void;
  className?: string;
  hintsRevealed: boolean;
}) {
  const { t } = useTranslation('sharedGames2');
  const hasNote = !!note;
  const showHighlights = hintsRevealed && hasNote;

  if (!hasNote) {
    const cls = className ?? styles.valueText;
    return <span className={cls}>{renderMultiline(t(text))}</span>;
  }

  const cls = [
    className ?? styles.valueText,
    styles.notableHitArea,
    showHighlights ? styles.notable : '',
    showHighlights && suspicious ? styles.notableSuspicious : '',
    showHighlights && !suspicious ? styles.notableInfo : '',
    showHighlights && isActive ? styles.notableActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={cls}
      onClick={
        showHighlights
          ? (e) => {
              e.stopPropagation();
              onClick(keyId, note);
            }
          : undefined
      }
    >
      {renderMultiline(t(text))}
      <span
        className={styles.noteMark}
        style={{ visibility: showHighlights ? 'visible' : 'hidden' }}
        aria-hidden={!showHighlights}
      >
        ?
      </span>
      {isActive && showHighlights && (
        <span className={styles.noteTooltip} onClick={(e) => e.stopPropagation()}>
          {t(note ?? '')}
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
