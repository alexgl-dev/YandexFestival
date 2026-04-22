import { useState } from 'react';
import { Background, Button, Icon, PopUp } from '../../components/ui';
import { parseInstructionMarkup } from './instructionMarkup';
import styles from './TaskResult.module.css';

interface ResultItem {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface TaskResultProps {
  results: ResultItem[];
  onContinue: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskResult({ results, onContinue, theme = 'orange', orientation = 'portrait' }: TaskResultProps) {
  const correctCount = results.filter((r) => r.correct).length;
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <Icon
                name={correctCount === results.length ? 'done' : 'close'}
                color={correctCount === results.length ? 'blue' : 'red'}
                size="m"
              />
            </div>
            <h2 className={styles.cardTitle}>Результаты</h2>
          </div>
          <div className={styles.items}>
            {results.map((result, index) => (
              <div
                key={index}
                className={[
                  styles.item,
                  result.correct ? styles.itemCorrect : styles.itemWrong,
                ].join(' ')}
              >
                <span className={styles.itemIcon}>{result.correct ? '✔' : '✕'}</span>
                <span className={styles.itemText}>
                  <span className={styles.itemAnswer}>{result.answer}</span>
                  {result.explanation ? (
                    <span className={styles.itemExplanation}>
                      {' — '}
                      {parseInstructionMarkup(
                        result.explanation,
                        (term, definition) => setActiveTerm({ term, definition }),
                        `tr-${index}`,
                        styles.termBtn,
                      )}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.buttonWrap}>
            <Button label="Далее" type="main" onClick={onContinue} />
          </div>
        </div>
      </div>

      {activeTerm && (
        <div className={styles.termOverlay} onClick={() => setActiveTerm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              title={activeTerm.term.charAt(0).toUpperCase() + activeTerm.term.slice(1)}
              description={activeTerm.definition}
              buttonLabel="Понятно"
              onButtonClick={() => setActiveTerm(null)}
            />
          </div>
        </div>
      )}
    </Background>
  );
}
