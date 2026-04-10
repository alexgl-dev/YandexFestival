import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Background, Card, PopUp } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './Test.module.css';

export function Test() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();
  const questions = data.test;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>Тест</h2>
          <p className={styles.placeholder}>Тест в разработке</p>
        </div>
      </Background>
    );
  }

  const question = questions[currentIndex];

  const handleAnswer = (optionIndex: number) => {
    if (selectedIndex !== null) return;

    setSelectedIndex(optionIndex);
    const isCorrect = question.options[optionIndex].correct;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedIndex(null);
      } else {
        setFinished(true);
      }
    }, 800);
  };

  if (finished) {
    const allCorrect = correctCount === questions.length;
    return (
      <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
        <div className={styles.popupOverlay}>
          <PopUp
            icon={allCorrect ? 'done' : 'close'}
            iconColor={allCorrect ? 'blue' : 'red'}
            title={allCorrect ? 'Отлично!' : 'Результат'}
            description={`Правильных ответов: ${correctCount} из ${questions.length}`}
            buttonLabel="Вернуться в меню"
            onButtonClick={() => navigate(`/${data.slug}`)}
          />
        </div>
      </Background>
    );
  }

  return (
    <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>Тест</h2>
          <span className={styles.counter}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>



        <p className={styles.prompt}>{question.prompt}</p>

        <div className={styles.options}>
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            let state: 'default' | 'pressed' | 'disabled' = 'default';

            if (selectedIndex !== null) {
              if (index === selectedIndex) {
                state = 'pressed';
              } else {
                state = 'disabled';
              }
            }

            return (
              <Card
                key={index}
                variant={`Вариант ${letter}`}
                title={option.text || `Вариант ${letter}`}
                description=""
                size="m"
                state={state}
                onClick={() => handleAnswer(index)}
              />
            );
          })}
        </div>
      </div>
    </Background>
  );
}
