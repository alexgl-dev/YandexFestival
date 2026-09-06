import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Background, Button, Card, IconButton, PopUp } from '../../components/ui';

import type { SectionData } from '../../types/game';
import styles from './Test.module.css';

type Phase = 'intro' | 'questions' | 'result';

export function Test() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const bingo = data.bingo;
  const { t } = useTranslation('creative');

  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [popupCell, setPopupCell] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleBack = () => navigate(`/${data.slug}`);

  if (!bingo) {
    return (
      <Background theme="orange" orientation="portrait" onBack={handleBack} backShowLabel={false}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>{t("Бинго")}</h2>
          <p className={styles.placeholder}>{t("Бинго в разработке")}</p>
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


  const handleQuestionBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      setPhase('intro');
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
      <Background theme="orange" orientation="portrait" onBack={handleBack} backShowLabel={false}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <p className={styles.introText}>{t(bingo.intro)}</p>
            <p className={styles.instructionText}>{t(bingo.instruction)}</p>
          </div>
          <Button label={t("Начать")} type="big_white" onClick={() => setPhase('questions')} />
        </div>
      </Background>
    );
  }

  // PHASE 2: QUESTIONS (1 per page)
  if (phase === 'questions') {
    return (
      <Background theme="orange" orientation="portrait" onBack={handleBack} backShowLabel={false}>
        <div className={styles.questionsLayout}>
          <p className={styles.questionPrompt}>{t(currentQuestion.prompt)}</p>

          <div className={styles.optionsGrid}>
            {currentQuestion.options.map((option) => {

              return (
                <Card
                  key={option}
                  variant=""
                  title={t(option)}
                  description=""
                  size="m"
                  state={currentAnswer === option ? 'pressed' : 'default'}
                  onClick={() => handleSelect(option)}
                />
              );
            })}
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.bottomLeft}>
              <IconButton type="back" size="md" onClick={handleQuestionBack} />
              <span className={styles.pageCounter}>
                {questionIndex + 1} / {totalQuestions}
              </span>
            </div>
            {currentAnswer && (
              <Button
                label={isLastQuestion && allAnswered ? t("Посмотреть результат") : t("Далее")}
                type="secondary"
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
    <Background theme="orange" orientation="portrait" onBack={handleBack} backShowLabel={false}>
      <div className={styles.resultLayout}>
        <div className={styles.resultSide}>
          <Card
            variant=""
            title={t("Бинго!")}
            description={t(bingo.resultText)}
            size="m"
            state="default"
            className={`${styles.resultCard} ${styles.resultCardMain}`}
          />
          <Button
            label={t("В главное меню")}
            type="secondary"
            onClick={() => navigate(`/${data.slug}`)}
          />
        </div>

        <div className={styles.gridSide}>
          <div className={styles.bingoGrid}>
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              if (cellIndex === 4) {
                return (
                  <div key={cellIndex} className={styles.cellCenter}>
                    <span className={styles.cellCenterBadge}>{t("Эксперт")}</span>
                    <span className={styles.cellCenterName}>{t(bingo.expert.name)}</span>
                    <span className={styles.cellCenterRole}>{t(bingo.expert.role)}</span>
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
                      <span className={styles.cellLabel}>{t(label)}</span>
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
                title={t(cellData.label)}
                description={
                  (cellData.question?.expertAnswer ? `${t(cellData.question.expertAnswer)}\n\n` : '') +
                  (cellData.question?.expertComment ? t(cellData.question.expertComment) : '')
                }
                buttonLabel={t("Закрыть")}
                onButtonClick={() => setPopupCell(null)}
              />
            </div>
          </div>
        );
      })()}
    </Background>
  );
}
