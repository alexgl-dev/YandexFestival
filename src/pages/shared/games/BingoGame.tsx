import { useState } from 'react';
import { Background, Button, Card, PopUp } from '../../../components/ui';
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
  const [popupCell, setPopupCell] = useState<number | null>(null);
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
          <Button
            label="Назад"
            type="secondary"
            className={styles.backBtn}
            onClick={handleBack}
          />
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
            <Button
              label="Назад"
              type="secondary"
              className={styles.backBtn}
              onClick={() => {
                if (questionIndex > 0) {
                  setQuestionIndex((i) => i - 1);
                } else {
                  setPhase('intro');
                }
              }}
            />
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
  const popupData = popupCell !== null ? getCellData(popupCell) : null;

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

              return (
                <div
                  key={cellIndex}
                  className={styles.cellWrapper}
                  onClick={() => setPopupCell(cellIndex)}
                >
                  <div className={styles.cellInner}>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — main Bingo! intro */}
        <div className={styles.resultSide}>
          <Card
            variant=""
            title="Бинго!"
            description={bingo.resultText}
            size="m"
            state="default"
            className={`${styles.resultCard} ${styles.resultCardMain}`}
          />
          <Button
            label="В главное меню"
            type="main"
            onClick={onBack}
          />
        </div>

      </div>

      {popupData && (
        <div className={styles.overlay} onClick={() => setPopupCell(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              icon={popupData.isMatch ? 'done' : 'close'}
              iconColor={popupData.isMatch ? 'blue' : 'red'}
              title={popupData.question?.gridLabel ?? ''}
              description={
                (popupData.question?.expertAnswer ? `Ответ эксперта: ${popupData.question.expertAnswer}\n\n` : '') +
                (popupData.question?.expertComment ?? '')
              }
              buttonLabel="Закрыть"
              onButtonClick={() => setPopupCell(null)}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
