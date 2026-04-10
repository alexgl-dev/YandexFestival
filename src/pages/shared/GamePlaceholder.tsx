import { Background, Badge, Button } from '../../components/ui';
import type { Task } from '../../types/game';
import styles from './GamePlaceholder.module.css';

interface ResultItem {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface GamePlaceholderProps {
  task: Task;
  onComplete: (results: ResultItem[]) => void;
}

export function GamePlaceholder({ task, onComplete }: GamePlaceholderProps) {
  const handleSkip = () => {
    onComplete([
      { answer: 'Демо-ответ', correct: true, explanation: 'Механика в разработке' },
    ]);
  };

  return (
    <Background theme="cobalt" orientation="landscape">
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>{task.title}</h2>
          <Badge label={task.mechanic} type="outline" />
          <p className={styles.description}>
            Механика «{task.mechanic}» — в разработке
          </p>
          <Button label="Пропустить" type="main" onClick={handleSkip} />
        </div>
      </div>
    </Background>
  );
}
