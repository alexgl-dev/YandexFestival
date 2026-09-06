import { useTranslation } from 'react-i18next';
import { Background, Badge, Button } from '../../components/ui';
import type { Task } from '../../types/game';
import { GameInstruction } from './GameInstruction';
import styles from './GamePlaceholder.module.css';

interface ResultItem {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface GamePlaceholderProps {
  task: Task;
  onComplete: (results: ResultItem[]) => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function GamePlaceholder({ task, onComplete, theme = 'orange', orientation = 'portrait' }: GamePlaceholderProps) {
  const { t } = useTranslation('sharedOther');
  const handleSkip = () => {
    onComplete([
      { answer: t("Демо-ответ"), correct: true, explanation: t("Механика в разработке") },
    ]);
  };

  return (
    <Background theme={theme} orientation={orientation} backShowLabel={false}>
      <GameInstruction instruction={task.instruction} />
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t(task.title)}</h2>
          <Badge label={task.mechanic} type="outline" />
          <p className={styles.description}>
            {t("Механика «{{mechanic}}» — в разработке", { mechanic: task.mechanic })}
          </p>
          <Button label={t("Пропустить")} type="big_white" onClick={handleSkip} />
        </div>
      </div>
    </Background>
  );
}
