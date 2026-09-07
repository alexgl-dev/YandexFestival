import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background, Button, Card, PopUp } from '../../../components/ui';
import type { BingoTest } from '../../../types/game';
import styles from './BingoGame.module.css';

type Phase = 'intro' | 'questions' | 'result';

interface BingoGameProps {
  bingo: BingoTest;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function BingoGame({ bingo, onBack, theme = 'cobalt', orientation = 'portrait' }: BingoGameProps) {
  const { t } = useTranslation('sharedGames1');
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [popupCell, setPopupCell] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const isPortrait = orientation === 'portrait';
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
      <Background theme={theme} orientation={orientation} onBack={handleBack} backShowLabel={false}>
        <div className={`${styles.wrapper} ${isPortrait ? styles.wrapperPortrait : ''}`}>
          <div className={styles.card}>
            <p className={styles.introText}>{t(bingo.intro)}</p>
            <p className={styles.instructionText}>{t(bingo.instruction)}</p>
          </div>
          <Button label={t("Начать")} type="big_white" onClick={() => setPhase('questions')} />
        </div>
      </Background>
    );
  }

  // ── PHASE 2: Questions ────────────────────────────────────────────────────
  if (phase === 'questions') {
    return (
      <Background theme={theme} orientation={orientation} onBack={handleBack} backShowLabel={false}>
        <div className={`${styles.questionsLayout} ${isPortrait ? styles.questionsLayoutPortrait : ''}`}>
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

          <div className={`${styles.bottomRow} ${isPortrait ? styles.bottomRowPortrait : ''}`}>
            <div className={styles.bottomLeft}>
              <Button
                label={t("Назад")}
                type="secondary"
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

  // ── PHASE 3: Result ───────────────────────────────────────────────────────
  const popupData = popupCell !== null ? getCellData(popupCell) : null;

  return (
    <Background theme={theme} orientation={orientation} onBack={handleBack} backShowLabel={false}>
      <div className={`${styles.resultLayout} ${isPortrait ? styles.resultLayoutPortrait : ''}`}>
        {isPortrait && (
          <div className={`${styles.resultSide} ${styles.resultSidePortrait}`}>
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
              onClick={onBack}
            />
          </div>
        )}

        <div className={`${styles.gridSide} ${isPortrait ? styles.gridSidePortrait : ''}`}>
          <div className={`${styles.bingoGrid} ${isPortrait ? styles.bingoGridPortrait : ''}`}>
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              if (cellIndex === 4) {
                return (
                  <div
                    key={cellIndex}
                    className={`${styles.cellCenter} ${isPortrait ? styles.cellCenterPortrait : ''}`}
                  >
                    <span className={styles.cellCenterBadge}>{t("Эксперт")}</span>
                    <span className={styles.cellCenterName}>{t(bingo.expert.name)}</span>
                    <span className={styles.cellCenterRole}>{t(bingo.expert.role)}</span>
                  </div>
                );
              }

              const cellData = getCellData(cellIndex);
              if (!cellData) return null;
              const { question, isMatch } = cellData;

              return (
                <div
                  key={cellIndex}
                  className={`${styles.cellWrapper} ${isPortrait ? styles.cellWrapperPortrait : ''}`}
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
                      <span className={styles.cellLabel}>{question?.gridLabel ? t(question.gridLabel) : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isPortrait && (
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
              onClick={onBack}
            />
          </div>
        )}
      </div>

      {popupData && (
        <div className={styles.overlay} onClick={() => setPopupCell(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              icon={popupData.isMatch ? 'done' : 'close'}
              iconColor={popupData.isMatch ? 'blue' : 'red'}
              title={popupData.question?.gridLabel ? t(popupData.question.gridLabel) : ''}
              description={
                (popupData.question?.expertAnswer ? `${t(popupData.question.expertAnswer)}\n\n` : '') +
                (popupData.question?.expertComment ? t(popupData.question.expertComment) : '')
              }
              buttonLabel={t("Закрыть")}
              onButtonClick={() => setPopupCell(null)}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
