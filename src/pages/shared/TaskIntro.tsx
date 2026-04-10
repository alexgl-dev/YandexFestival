import { Background, Badge, Button, Icon } from '../../components/ui';
import type { Task } from '../../types/game';
import styles from './TaskIntro.module.css';

interface TaskIntroProps {
  task: Task;
  onStart: () => void;
  onBack: () => void;
}

export function TaskIntro({ task, onStart, onBack }: TaskIntroProps) {
  const modeLabel = task.mode === 'group' ? 'Групповое' : 'Индивидуальное';
  const durationLabel = `${task.duration} мин`;

  return (
    <Background theme="cobalt" orientation="landscape" onBack={onBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{task.title}</h2>

        <div className={styles.card}>
          <div className={styles.badges}>
            <Badge
              label={modeLabel}
              type="outline"
              icon={<Icon name="people" color="blue" size="xs" />}
            />
            <Badge
              label={durationLabel}
              type="outline"
              icon={<Icon name="clock" color="blue" size="xs" />}
            />
          </div>

          {task.subtitle && (
            <p className={styles.subtitle}>{task.subtitle}</p>
          )}

          <p className={styles.intro}>{task.intro}</p>
        </div>

        <Button label="Начать" type="main" onClick={onStart} />
      </div>
    </Background>
  );
}
