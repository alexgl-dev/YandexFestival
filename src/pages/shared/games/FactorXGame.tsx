import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, Icon, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './FactorXGame.module.css';

const TIMER_SECONDS = 10;
const ACCURACY_CORRECT_DELTA = 5;
const ACCURACY_WRONG_DELTA = 8;

interface Props {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

type Vote = 'Влияет' | 'Не влияет';
type Status = 'correct' | 'wrong' | 'tie';

interface StepResult {
  factor: string;
  teamVote: Vote | null;
  correctVote: Vote;
  status: Status;
  explanation: string;
  tally: { yes: number; no: number };
}

interface PopupInfo {
  factorName: string;
  correctVote: Vote;
  teamVote: Vote | null;
  status: Status;
  explanation: string;
}

export function FactorXGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'portrait' }: Props) {
  const { t } = useTranslation('sharedGames2');
  const steps = task.steps;
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [tally, setTally] = useState<{ yes: number; no: number }>({ yes: 0, no: 0 });
  const [accuracy, setAccuracy] = useState(50);
  const [correctCount, setCorrectCount] = useState(0);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [done, setDone] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(!!task.instruction?.trim());

  const step = steps[currentStep];
  const isLast = currentStep >= totalSteps - 1;

  const finalizeStep = useCallback(() => {
    const options = step?.options ?? [];
    const correctOption = options.find((o) => o.correct);
    const correctVote = (correctOption?.text ?? 'Влияет') as Vote;
    const explanation = correctOption?.explanation ?? '';

    const teamVote: Vote | null =
      tally.yes > tally.no ? 'Влияет' : tally.no > tally.yes ? 'Не влияет' : null;
    const status: Status = teamVote === null ? 'tie' : teamVote === correctVote ? 'correct' : 'wrong';

    if (status === 'correct') {
      setAccuracy((prev) => Math.min(100, prev + ACCURACY_CORRECT_DELTA));
      setCorrectCount((c) => c + 1);
    } else if (status === 'wrong') {
      setAccuracy((prev) => Math.max(0, prev - ACCURACY_WRONG_DELTA));
    }

    setStepResults((prev) => [
      ...prev,
      {
        factor: step?.prompt ?? '',
        teamVote,
        correctVote,
        status,
        explanation,
        tally: { ...tally },
      },
    ]);

    setPopup({
      factorName: step?.prompt ?? '',
      correctVote,
      teamVote,
      status,
      explanation,
    });
  }, [step, tally]);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (instructionOpen || popup !== null || done) return;
    if (timeLeft <= 0) {
      finalizeStep();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, popup, done, instructionOpen, finalizeStep]);

  // ── Vote ───────────────────────────────────────────────────────
  function handleVote(votedInfluences: boolean) {
    if (popup !== null || timeLeft <= 0) return;
    setTally((prev) =>
      votedInfluences ? { ...prev, yes: prev.yes + 1 } : { ...prev, no: prev.no + 1 },
    );
  }

  // ── Next ───────────────────────────────────────────────────────
  function handleNext() {
    setPopup(null);
    if (isLast) {
      setDone(true);
    } else {
      setCurrentStep((s) => s + 1);
      setTimeLeft(TIMER_SECONDS);
      setTally({ yes: 0, no: 0 });
    }
  }

  // ── Final results ──────────────────────────────────────────────
  function handleFinish() {
    const summary = `Правильно: ${correctCount} из ${totalSteps}. Точность модели: ${accuracy}%.`;
    onComplete([{ answer: '', correct: true, explanation: summary }]);
  }

  function getFinalComment() {
    const rate = correctCount / totalSteps;
    if (rate >= 0.75) {
      return t("Команде удалось правильно отобрать факторы! Вы понимаете, что для обучения ИИ нужны объективные и значимые данные, а не случайные совпадения. Модель готова к работе!");
    }
    if (rate >= 0.5) {
      return t("Ваша модель получилась довольно точной. Команде удаётся отличать релевантные факторы от шума, но есть и пространство для роста.");
    }
    return t("Вашей модели не хватает точности. Вероятно, она перегружена случайными признаками или, наоборот, упускает ключевые. Это частая проблема при сборе данных для ИИ.");
  }

  if (!step) return null;

  const timerUrgent = timeLeft <= 5 && !instructionOpen;
  const totalVotes = tally.yes + tally.no;
  const isPortrait = orientation === 'portrait';
  const overlayClass = `${styles.overlay} ${isPortrait ? styles.overlayPortrait : styles.overlayLandscape}`;
  const resultsScreenClass = `${styles.resultsScreen} ${isPortrait ? styles.overlayPortrait : styles.overlayLandscape}`;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} onOpenChange={setInstructionOpen} />
      {!done && (
        <div className={`${styles.layout} ${isPortrait ? styles.layoutPortrait : ''}`}>
          {/* Accuracy bar */}
          <div className={`${styles.accuracyRow} ${isPortrait ? styles.accuracyRowPortrait : ''}`}>
            <span className={styles.accuracyLabelLeft}>{t("Неточная модель")}</span>
            <div className={styles.accuracyTrack}>
              <div className={styles.accuracyFill} style={{ width: `${accuracy}%` }} />
            </div>
            <span className={styles.accuracyLabelRight}>{t("Точная модель")}</span>
          </div>

          {/* Meta row */}
          <div className={`${styles.metaRow} ${isPortrait ? styles.metaRowPortrait : ''}`}>
            <span className={styles.stepCounter}>{t("Фактор {{n}} из {{total}}", { n: currentStep + 1, total: totalSteps })}</span>
            <div className={styles.timerBox}>
              <span className={styles.timerLabel}>{t("Осталось")}</span>
              <div className={`${styles.timerCircle} ${timerUrgent ? styles.timerUrgent : ''}`}>
                <span className={styles.timerNum}>{timeLeft}</span>
              </div>
            </div>
          </div>

          {/* Factor card */}
          <div className={styles.cardArea}>
            <div className={`${styles.factorCard} ${isPortrait ? styles.factorCardPortrait : ''}`}>
              <p className={`${styles.factorText} ${isPortrait ? styles.factorTextPortrait : ''}`}>{t(step.prompt ?? '')}</p>
            </div>
          </div>

          {/* Tally */}
          <div className={`${styles.tallyRow} ${isPortrait ? styles.tallyRowPortrait : ''}`}>
            <div className={styles.tallyChip}>
              <span className={styles.tallyLabel}>{t("Влияет")}</span>
              <span className={`${styles.tallyNum} ${styles.tallyNumYes}`}>{tally.yes}</span>
            </div>
            <span className={styles.tallyTotal}>
              {totalVotes > 0 ? t("Голосов: {{count}}", { count: totalVotes }) : t("Жми кнопки — голосуйте командой")}
            </span>
            <div className={styles.tallyChip}>
              <span className={styles.tallyLabel}>{t("Не влияет")}</span>
              <span className={`${styles.tallyNum} ${styles.tallyNumNo}`}>{tally.no}</span>
            </div>
          </div>

          {/* Vote buttons */}
          <div className={`${styles.buttonsRow} ${isPortrait ? styles.buttonsRowPortrait : ''}`}>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnYes}`}
              onClick={() => handleVote(true)}
              disabled={timeLeft <= 0 || popup !== null}
            >
              {t("Влияет")}
            </button>
            <button
              className={`${styles.voteBtn} ${styles.voteBtnNo}`}
              onClick={() => handleVote(false)}
              disabled={timeLeft <= 0 || popup !== null}
            >
              {t("Не влияет")}
            </button>
          </div>
        </div>
      )}

      {/* Per-step popup */}
      {popup && !done && (
        <div className={overlayClass}>
          <PopUp
            icon={popup.status === 'tie' ? undefined : popup.status === 'correct' ? 'done' : 'close'}
            iconColor={popup.status === 'correct' ? 'blue' : 'red'}
            title={
              popup.status === 'tie'
                ? t("Правильный ответ: {{vote}}", { vote: t(popup.correctVote) })
                : popup.status === 'correct'
                  ? t("Верно!")
                  : t("Не совсем...")
            }
            description={
              popup.status === 'tie'
                ? t("Голоса разделились — модель приняла решение сама.\n\n{{explanation}}", { explanation: t(popup.explanation) })
                : t(popup.explanation)
            }
            buttonLabel={isLast ? t("Результаты") : t("Дальше")}
            onButtonClick={handleNext}
          />
        </div>
      )}

      {/* Final results screen */}
      {done && (
        <div className={resultsScreenClass}>
          <div className={`${styles.resultsCard} ${isPortrait ? styles.resultsCardPortrait : ''}`}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>{t("Обучение модели завершено")}</h2>
              <p className={styles.resultsSummary}>
                {t("Правильно:")} <strong>{correctCount}</strong> {t("из")} {totalSteps} · {t("Точность модели:")} <strong>{accuracy}%</strong>
              </p>
              <div className={styles.accuracyTrack}>
                <div className={styles.accuracyFill} style={{ width: `${accuracy}%` }} />
              </div>
              <p className={styles.resultsComment}>{getFinalComment()}</p>
            </div>

            <ul className={styles.resultsList}>
              {stepResults.map((r, i) => (
                <li
                  key={i}
                  className={[
                    styles.resultsItem,
                    r.status === 'correct' ? styles.resultsItemCorrect : '',
                    r.status === 'wrong' ? styles.resultsItemWrong : '',
                    r.status === 'tie' ? styles.resultsItemTie : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className={styles.resultsItemIcon}>
                    {r.status === 'correct' && <Icon name="done" color="blue" size="s" />}
                    {r.status === 'wrong' && <Icon name="close" color="red" size="s" />}
                    {r.status === 'tie' && <span className={styles.resultsItemTieMark}>—</span>}
                  </span>
                  <div className={styles.resultsItemBody}>
                    <p className={styles.resultsItemFactor}>{t(r.factor)}</p>
                    <p className={styles.resultsItemMeta}>
                      <span className={styles.resultsItemMetaLabel}>{t("Команда:")}</span>{' '}
                      {r.teamVote === null ? (
                        <span className={styles.resultsItemNeutral}>{t("не определилась")}</span>
                      ) : (
                        <span
                          className={
                            r.teamVote === 'Влияет'
                              ? styles.resultsVoteYes
                              : styles.resultsVoteNo
                          }
                        >
                          {t(r.teamVote)}
                        </span>
                      )}
                      <span className={styles.resultsItemMetaSep}>·</span>
                      <span className={styles.resultsItemMetaLabel}>{t("Правильно:")}</span>{' '}
                      <span
                        className={
                          r.correctVote === 'Влияет'
                            ? styles.resultsVoteYes
                            : styles.resultsVoteNo
                        }
                      >
                        {t(r.correctVote)}
                      </span>
                    </p>
                    <p className={styles.resultsItemExplanation}>{t(r.explanation)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.resultsFooter}>
              <Button label={t("Дальше")} type="secondary" onClick={handleFinish} />
            </div>
          </div>
        </div>
      )}
    </Background>
  );
}
