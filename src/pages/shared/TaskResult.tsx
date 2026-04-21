import { useState } from 'react';
import { Background, Button, Icon } from '../../components/ui';
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
  const [tooltip, setTooltip] = useState<string | null>(null);

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
                        (tip) => setTooltip((prev) => (prev === tip ? null : tip)),
                        `tr-${index}`,
                        styles.termBtn,
                      )}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
          {tooltip && (
            <div
              className={styles.tooltipCard}
              onClick={(e) => {
                e.stopPropagation();
                setTooltip(null);
              }}
            >
              <p className={styles.tooltipText}>{tooltip}</p>
              <span className={styles.tooltipDismiss}>✕</span>
            </div>
          )}
          <div className={styles.buttonWrap}>
            <Button label="Далее" type="main" onClick={onContinue} />
          </div>
        </div>
      </div>
    </Background>
  );
}
