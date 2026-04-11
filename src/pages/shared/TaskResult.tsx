import { Background, Button, Icon } from '../../components/ui';
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

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.topContent}>
            <div className={styles.iconWrap}>
              <Icon
                name={correctCount === results.length ? 'done' : 'close'}
                color={correctCount === results.length ? 'blue' : 'red'}
                size="m"
              />
            </div>
            <div className={styles.textBlock}>
              <h2 className={styles.cardTitle}>Результаты</h2>
              <div className={styles.items}>
                {results.map((result, index) => (
                  <p key={index} className={styles.item}>
                    {result.correct ? '● ' : '● '}{result.answer}{result.explanation ? ` — ${result.explanation}` : ''}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.buttonWrap}>
            <Button label="Далее" type="main" onClick={onContinue} />
          </div>
        </div>
      </div>
    </Background>
  );
}
