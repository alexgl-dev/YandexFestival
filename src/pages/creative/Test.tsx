import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Background, Button, Card, PopUp } from '../../components/ui';

import type { SectionData } from '../../types/game';
import styles from './Test.module.css';

type Phase = 'intro' | 'questions' | 'result';

export function Test() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const bingo = data.bingo;

  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [popupCell, setPopupCell] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleBack = () => navigate(`/${data.slug}`);

  if (!bingo) {
    return (
      <Background theme="orange" orientation="portrait" onBack={handleBack}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>Бинго</h2>
          <p className={styles.placeholder}>Бинго в разработке</p>
        </div>
      </Background>
    );
  }

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


  const getCellData = (cellIndex: number) => {
    if (cellIndex === 4) return null;
    const labelIndex = cellIndex < 4 ? cellIndex : cellIndex - 1;
    const question = bingo.questions[labelIndex];
    const label = bingo.gridLabels[labelIndex];
    const userAnswer = answers[labelIndex];
    const isMatch = userAnswer === question?.expertAnswer;
    return { label, question, isMatch };
  };

  // PHASE 1: INTRO
  if (phase === 'intro') {
    return (
      <Background theme="orange" orientation="portrait" onBack={handleBack}>
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

  // PHASE 2: QUESTIONS (1 per page)
  if (phase === 'questions') {
    return (
      <Background theme="orange" orientation="portrait" onBack={handleBack}>
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

  // PHASE 3: RESULT
  return (
    <Background theme="orange" orientation="portrait" onBack={handleBack}>
      <div className={styles.resultLayout}>
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
            onClick={() => navigate(`/${data.slug}`)}
          />
        </div>

        <div className={styles.gridSide}>
          <div className={styles.bingoGrid}>
            {Array.from({ length: 9 }).map((_, cellIndex) => {
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
              const { label, isMatch } = cellData;

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
                          : 'var(--color-orange)',
                      }}
                    >
                      <span className={styles.cellLabel}>{label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {popupCell !== null && (() => {
        const cellData = getCellData(popupCell);
        if (!cellData) return null;
        return (
          <div className={styles.overlay} onClick={() => setPopupCell(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <PopUp
                icon={cellData.isMatch ? 'done' : 'close'}
                iconColor={cellData.isMatch ? 'blue' : 'red'}
                title={cellData.label}
                description={
                  (cellData.question?.expertAnswer ? `Ответ эксперта: ${cellData.question.expertAnswer}\n\n` : '') +
                  (cellData.question?.expertComment ?? '')
                }
                buttonLabel="Закрыть"
                onButtonClick={() => setPopupCell(null)}
              />
            </div>
          </div>
        );
      })()}
    </Background>
  );
}
