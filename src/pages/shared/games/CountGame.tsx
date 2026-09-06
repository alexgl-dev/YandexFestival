import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, Icon } from '../../../components/ui';
import type { Task } from '../../../types/game';
import { GameInstruction } from '../GameInstruction';
import styles from './CountGame.module.css';

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

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const MAX_DIGITS = 3;

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

function pluralSeconds(n: number, t: (key: string) => string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return t("секунд");
  if (last === 1) return t("секунду");
  if (last >= 2 && last <= 4) return t("секунды");
  return t("секунд");
}

/**
 * Механика `count` — «Data Set».
 * Фото → ввод числа с экранной клавиатуры (таймер идёт) → «Проверить» →
 * экран сравнения (фото с разметкой нейросети, «ты» vs «нейросеть», правильный ответ, comment) → «Дальше».
 * `sampleSize` случайных фото из `countItems` без повторов; итог — onComplete со всеми раундами.
 */
export function CountGame({ task, onComplete, onBack, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  const { t } = useTranslation('sharedGames1');
  const step = task.steps[0];
  const pool = step?.countItems ?? [];
  const sampleSize = step?.sampleSize ?? pool.length;
  const countLabel = step?.countLabel ?? 'объекты';

  const [items] = useState(() => pickRandom(pool, sampleSize));
  const totalRounds = items.length;

  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<'input' | 'compare'>('input');
  const [answer, setAnswer] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [submittedSeconds, setSubmittedSeconds] = useState(0);
  const [results, setResults] = useState<GameResult[]>([]);
  const [instructionOpen, setInstructionOpen] = useState(!!task.instruction?.trim());

  const current = items[roundIndex];
  const isLastRound = roundIndex >= totalRounds - 1;

  // Таймер идёт, пока открыт ввод и инструкция закрыта; на экране сравнения останавливается.
  useEffect(() => {
    if (phase !== 'input' || instructionOpen) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase, instructionOpen, roundIndex]);

  const handleDigit = useCallback((digit: string) => {
    setAnswer((prev) => (prev.length >= MAX_DIGITS ? prev : prev + digit));
  }, []);

  const handleBackspace = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const handleCheck = useCallback(() => {
    if (!answer || !current) return;
    setSubmittedSeconds(elapsed);
    const correct = Number(answer) === current.actual;
    setResults((prev) => [...prev, { answer, correct, explanation: current.comment ?? '' }]);
    setPhase('compare');
  }, [answer, current, elapsed]);

  const handleNext = useCallback(() => {
    if (isLastRound) {
      onComplete(results);
      return;
    }
    setRoundIndex((i) => i + 1);
    setAnswer('');
    setElapsed(0);
    setSubmittedSeconds(0);
    setPhase('input');
  }, [isLastRound, onComplete, results]);

  if (!current) return null;

  const isCorrect = Number(answer) === current.actual;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} onOpenChange={setInstructionOpen} />

      <div className={styles.layout}>
        <div className={styles.metaRow}>
          <span className={styles.stepCounter}>{t("Фото {{n}} из {{total}}", { n: roundIndex + 1, total: totalRounds })}</span>
          {phase === 'input' && (
            <div className={styles.timerBox}>
              <span className={styles.timerLabel}>{t("Прошло")}</span>
              <div className={styles.timerCircle}>
                <span className={styles.timerNum}>
                  {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>

        {phase === 'input' ? (
          <div className={styles.mainRow}>
            <div className={styles.photoCard}>
              <p className={styles.prompt}>{t("Посчитай, сколько на фото объектов: {{label}}", { label: t(countLabel) })}</p>
              <img src={current.image} alt="" className={styles.photo} draggable={false} />
            </div>

            <div className={styles.inputCard}>
              <input
                className={styles.answerInput}
                type="text"
                inputMode="none"
                readOnly
                value={answer}
                placeholder="0"
              />
              <div className={styles.keypad}>
                {KEYPAD_ROWS.map((row, ri) => (
                  <div key={ri} className={styles.keypadRow}>
                    {row.map((digit) => (
                      <Button
                        key={digit}
                        label={digit}
                        type="secondary"
                        onClick={() => handleDigit(digit)}
                        className={styles.key}
                      />
                    ))}
                  </div>
                ))}
                <div className={styles.keypadRow}>
                  <span className={styles.keySpacer} />
                  <Button label="0" type="secondary" onClick={() => handleDigit('0')} className={styles.key} />
                  <Button label="⌫" type="secondary" onClick={handleBackspace} className={styles.key} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.mainRow}>
            <div className={styles.photoCard}>
              <img src={current.segmented} alt="" className={styles.photo} draggable={false} />
            </div>

            <div className={styles.compareCard}>
              <Icon name={isCorrect ? 'done' : 'close'} color={isCorrect ? 'blue' : 'red'} size="m" />
              <p className={styles.compareLine}>
                {t("Ты:")} <strong>{answer}</strong> {t("за")} <strong>{submittedSeconds}</strong> {pluralSeconds(submittedSeconds, t)}
              </p>
              <p className={styles.compareLine}>
                {t("Нейросеть:")} <strong>{current.detected}</strong> {t("за")} <strong>{current.aiTimeMs}</strong> {t("мс")}
              </p>
              <p className={styles.compareLine}>
                {t("Правильный ответ:")} <strong>{current.actual}</strong>
              </p>
              {current.comment && <p className={styles.comment}>{t(current.comment)}</p>}
            </div>
          </div>
        )}

        {phase === 'input' ? (
          <Button
            label={t("Проверить")}
            type="secondary"
            onClick={handleCheck}
            className={`${styles.actionButton} ${!answer ? styles.actionButtonDisabled : ''}`}
          />
        ) : (
          <Button
            label={isLastRound ? t("Результаты") : t("Дальше")}
            type="secondary"
            onClick={handleNext}
            className={styles.actionButton}
          />
        )}
      </div>
    </Background>
  );
}
