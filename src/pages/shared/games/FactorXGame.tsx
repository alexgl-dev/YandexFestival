import { useState, useEffect } from 'react';
import { Background, Button, PopUp } from '../../../components/ui';
import type { Task } from '../../../types/game';
import styles from './FactorXGame.module.css';

const TIMER_SECONDS = 20;
const ACCURACY_CORRECT_DELTA = 5;
const ACCURACY_WRONG_DELTA = 8;

interface Props {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

interface PopupInfo {
  factorName: string;
  correctVote: string;
  explanation: string;
  playerCorrect: boolean;
  timedOut: boolean;
}

export function FactorXGame({ task, onComplete, onBack, theme = 'cobalt' }: Props) {
  const steps = task.steps;
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [voted, setVoted] = useState(false);
  const [accuracy, setAccuracy] = useState(50);
  const [correctCount, setCorrectCount] = useState(0);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [results, setResults] = useState<Array<{ answer: string; correct: boolean; explanation: string }>>([]);
  const [done, setDone] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep >= totalSteps - 1;

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (voted || done || popup !== null) return;
    if (timeLeft <= 0) {
      // Timeout: pick randomly
      const options = step?.options ?? [];
      const randomInfluences = Math.random() < 0.5;
      const votedOption = options.find(o => o.text === (randomInfluences ? 'Влияет' : 'Не влияет'));
      const correctOption = options.find(o => o.correct);
      const isCorrect = votedOption?.correct ?? false;
      const explanation = correctOption?.explanation ?? '';

      setVoted(true);
      setAccuracy(prev =>
        isCorrect ? Math.min(100, prev + ACCURACY_CORRECT_DELTA) : Math.max(0, prev - ACCURACY_WRONG_DELTA),
      );
      if (isCorrect) setCorrectCount(c => c + 1);
      setResults(prev => [
        ...prev,
        { answer: randomInfluences ? 'Влияет' : 'Не влияет', correct: isCorrect, explanation },
      ]);
      setPopup({
        factorName: step?.prompt ?? '',
        correctVote: correctOption?.text ?? '',
        explanation,
        playerCorrect: isCorrect,
        timedOut: true,
      });
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, voted, done, popup, step]);

  // ── Vote ───────────────────────────────────────────────────────
  function handleVote(votedInfluences: boolean) {
    if (voted) return;
    const options = step?.options ?? [];
    const votedOption = options.find(o => o.text === (votedInfluences ? 'Влияет' : 'Не влияет'));
    const correctOption = options.find(o => o.correct);
    const isCorrect = votedOption?.correct ?? false;
    const explanation = correctOption?.explanation ?? '';

    setVoted(true);
    setAccuracy(prev =>
      isCorrect ? Math.min(100, prev + ACCURACY_CORRECT_DELTA) : Math.max(0, prev - ACCURACY_WRONG_DELTA),
    );
    if (isCorrect) setCorrectCount(c => c + 1);
    setResults(prev => [
      ...prev,
      { answer: votedInfluences ? 'Влияет' : 'Не влияет', correct: isCorrect, explanation },
    ]);
    setPopup({
      factorName: step?.prompt ?? '',
      correctVote: correctOption?.text ?? '',
      explanation,
      playerCorrect: isCorrect,
      timedOut: false,
    });
  }

  // ── Next ───────────────────────────────────────────────────────
  function handleNext() {
    setPopup(null);
    if (isLast) {
      setDone(true);
    } else {
      setCurrentStep(s => s + 1);
      setTimeLeft(TIMER_SECONDS);
      setVoted(false);
    }
  }

  // ── Final comment ──────────────────────────────────────────────
  function getFinalComment() {
    const rate = correctCount / totalSteps;
    if (rate >= 0.75) {
      return 'Тебе удалось правильно отобрать факторы! Ты понимаешь, что для обучения ИИ нужны объективные и значимые данные, а не случайные совпадения. Модель готова к работе!';
    }
    if (rate >= 0.5) {
      return 'Твоя модель получилась довольно точной. Тебе удаётся отличать релевантные факторы от шума, но есть и пространство для роста.';
    }
    return 'Твоей модели не хватает точности. Вероятно, она перегружена случайными признаками или, наоборот, упускает ключевые. Это частая проблема при сборе данных для ИИ.';
  }

  if (!step) return null;

  // Timer urgency: <5s → warning color
  const timerUrgent = timeLeft <= 5;

  return (
    <Background theme={theme} orientation="landscape" onBack={onBack}>
      <div className={styles.layout}>

        {/* ── Accuracy bar ── */}
        <div className={styles.accuracyRow}>
          <span className={styles.accuracyLabelLeft}>Неточная модель</span>
          <div className={styles.accuracyTrack}>
            <div className={styles.accuracyFill} style={{ width: `${accuracy}%` }} />
          </div>
          <span className={styles.accuracyLabelRight}>Точная модель</span>
        </div>

        {/* ── Meta row ── */}
        <div className={styles.metaRow}>
          <span className={styles.stepCounter}>Фактор {currentStep + 1} из {totalSteps}</span>
          <div className={styles.timerBox}>
            <span className={styles.timerLabel}>Осталось {timeLeft} сек</span>
            <div className={`${styles.timerCircle} ${timerUrgent ? styles.timerUrgent : ''}`}>
              <span className={styles.timerNum}>{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* ── Factor card ── */}
        <div className={styles.cardArea}>
          <div className={styles.factorCard}>
            <p className={styles.factorText}>{step.prompt}</p>
          </div>
        </div>

        {/* ── Vote buttons ── */}
        <div className={styles.buttonsRow}>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnYes}`}
            onClick={() => handleVote(true)}
            disabled={voted}
          >
            Влияет
          </button>
          <button
            className={`${styles.voteBtn} ${styles.voteBtnNo}`}
            onClick={() => handleVote(false)}
            disabled={voted}
          >
            Не влияет
          </button>
        </div>
      </div>

      {/* ── Explanation popup ── */}
      {popup && (
        <div className={styles.overlay}>
          <div className={styles.explanationCard}>
            {popup.timedOut && (
              <p className={styles.timeoutNote}>
                Время вышло — модель приняла решение сама. Так тоже бывает.
              </p>
            )}
            <p className={styles.factorNamePopup}>{popup.factorName}</p>
            <p className={`${styles.verdict} ${popup.playerCorrect ? styles.verdictCorrect : styles.verdictWrong}`}>
              {popup.correctVote}
            </p>
            <p className={styles.explanationText}>{popup.explanation}</p>
            <Button
              label={isLast ? 'Результаты' : 'Дальше'}
              type="main"
              onClick={handleNext}
            />
          </div>
        </div>
      )}

      {/* ── Final screen ── */}
      {done && (
        <div className={styles.overlay}>
          <PopUp
            icon={correctCount / totalSteps >= 0.75 ? 'done' : 'close'}
            iconColor={correctCount / totalSteps >= 0.75 ? 'blue' : 'red'}
            title="Обучение модели завершено!"
            description={getFinalComment()}
            buttonLabel="Результаты"
            onButtonClick={() => onComplete(results)}
          />
        </div>
      )}
    </Background>
  );
}
