import { useState } from 'react';
import { Background, Button, Card } from '../../../components/ui';
import type { BingoTest } from '../../../types/game';
import styles from './BingoGame.module.css';

type Phase = 'intro' | 'questions' | 'result';

interface BingoGameProps {
  bingo: BingoTest;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
}

export function BingoGame({ bingo, onBack, theme = 'cobalt' }: BingoGameProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [questionIndex, setQuestionIndex] = useState(0);

  const totalQuestions = bingo.questions.length;
  const currentQuestion = bingo.questions[questionIndex];
  const currentAnswer = answers[questionIndex];
  const allAnswered = Object.keys(answers).length === totalQuestions;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleNext = () => {
    if (isLastQuestion && allAnswered) {
      setPhase('result');
    } else {
      setQuestionIndex((i) => Math.min(i + 1, totalQuestions - 1));
    }
  };

  const toggleFlip = (cellIndex: number) => {
    setFlipped((prev) => ({ ...prev, [cellIndex]: !prev[cellIndex] }));
  };

  // cellIndex 0-3 → question 0-3, cellIndex 4 = center, cellIndex 5-8 → question 4-7
  const getCellData = (cellIndex: number) => {
    if (cellIndex === 4) return null;
    const qIndex = cellIndex < 4 ? cellIndex : cellIndex - 1;
    const question = bingo.questions[qIndex];
    const userAnswer = answers[qIndex];
    const isMatch = userAnswer === question?.expertAnswer;
    return { question, isMatch, qIndex };
  };

  const handleBack = onBack;

  // ── PHASE 1: Intro ────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <Background theme={theme} orientation="landscape" onBack={handleBack}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>Бинго</h2>
          <div className={styles.card}>
            <p className={styles.introText}>{bingo.intro}</p>
            <p className={styles.instructionText}>{bingo.instruction}</p>
          </div>
          <Button label="Начать" type="main" onClick={() => setPhase('questions')} />
        </div>
      </Background>
    );
  }

  // ── PHASE 2: Questions ────────────────────────────────────────────────────
  if (phase === 'questions') {
    return (
      <Background theme={theme} orientation="landscape" onBack={handleBack}>
        <div className={styles.questionsLayout}>
          <p className={styles.questionPrompt}>{currentQuestion.prompt}</p>

          <div className={styles.optionsGrid}>
            {currentQuestion.options.map((option) => {
              return (
                <Card
                  key={option}
                  variant=""
                  title={option}
                  description=""
                  size="m"
                  state={currentAnswer === option ? 'pressed' : 'default'}
                  onClick={() => handleSelect(option)}
                />
              );
            })}
          </div>

          <div className={styles.bottomRow}>
            <h2 className={styles.title}>Бинго</h2>
            <span className={styles.pageCounter}>
              {questionIndex + 1} / {totalQuestions}
            </span>
            {currentAnswer && (
              <Button
                label={isLastQuestion && allAnswered ? 'Посмотреть результат' : 'Далее'}
                type="main"
                onClick={handleNext}
              />
            )}
          </div>
        </div>
      </Background>
    );
  }

  // ── PHASE 3: Result ───────────────────────────────────────────────────────
  // Find the last flipped cell to show its text in the right panel
  const lastFlippedCell = Object.entries(flipped)
    .filter(([, v]) => v)
    .map(([k]) => Number(k))
    .at(-1);

  const flippedCellData =
    lastFlippedCell !== undefined ? getCellData(lastFlippedCell) : null;

  return (
    <Background theme={theme} orientation="landscape" onBack={handleBack}>
      <div className={styles.resultLayout}>

        {/* Left — bingo grid */}
        <div className={styles.gridSide}>
          <div className={styles.bingoGrid}>
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              // Center cell = expert
              if (cellIndex === 4) {
                return (
                  <div key={cellIndex} className={styles.cellCenter}>
                    <span className={styles.cellCenterBadge}>Эксперт</span>
                    <span className={styles.cellCenterName}>{bingo.expert.name}</span>
                    <span className={styles.cellCenterRole}>{bingo.expert.role}</span>
                  </div>
                );
              }

              const cellData = getCellData(cellIndex);
              if (!cellData) return null;
              const { question, isMatch } = cellData;
              const isFlipped = flipped[cellIndex] ?? false;

              return (
                <div
                  key={cellIndex}
                  className={styles.cellWrapper}
                  onClick={() => toggleFlip(cellIndex)}
                >
                  <div className={`${styles.cellInner} ${isFlipped ? styles.cellFlipped : ''}`}>
                    <div
                      className={styles.cellFront}
                      style={{
                        backgroundColor: isMatch
                          ? 'var(--color-blue)'
                          : 'var(--color-red)',
                      }}
                    >
                      <span className={styles.cellLabel}>{question?.gridLabel}</span>
                    </div>
                    <div className={styles.cellBack}>
                      <span className={styles.cellBackText}>
                        {question?.expertAnswer}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — result text / flipped card expert answer */}
        <div className={styles.resultSide}>
          {flippedCellData ? (
            <Card
              variant={flippedCellData.isMatch ? 'Совпадение!' : 'Не совпало'}
              title={flippedCellData.question?.gridLabel ?? ''}
              description={flippedCellData.question?.expertComment ?? flippedCellData.question?.expertAnswer ?? ''}
              size="m"
              state="default"
              className={styles.resultCard}
            />
          ) : (
            <Card
              variant="Результат"
              title="Бинго!"
              description={bingo.resultText}
              size="m"
              state="default"
              className={styles.resultCard}
            />
          )}
          <Button
            label="В главное меню"
            type="main"
            onClick={onBack}
          />
        </div>

      </div>
    </Background>
  );
}
