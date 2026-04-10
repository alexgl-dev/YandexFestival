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
}

export function TaskResult({ results, onContinue }: TaskResultProps) {
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <Background theme="cobalt" orientation="landscape" showBackButton={false}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <Icon
              name={correctCount === results.length ? 'done' : 'close'}
              color={correctCount === results.length ? 'blue' : 'red'}
              size="s"
            />
          </div>
          <div className={styles.textBlock}>
            <h3 className={styles.cardTitle}>Результаты</h3>
            <div className={styles.items}>
              {results.map((result, index) => (
                <p key={index} className={styles.item}>
                  {result.correct ? '● ' : '● '}{result.answer}{result.explanation ? ` — ${result.explanation}` : ''}
                </p>
              ))}
            </div>
          </div>
        </div>
        <Button label="Далее" type="main" onClick={onContinue} />
      </div>
    </Background>
  );
}
