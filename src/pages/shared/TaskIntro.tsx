import { Background, Badge, Button, Icon } from '../../components/ui';
import type { Task } from '../../types/game';
import styles from './TaskIntro.module.css';

interface TaskIntroProps {
  task: Task;
  onStart: () => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskIntro({ task, onStart, onBack, theme = 'orange', orientation = 'portrait' }: TaskIntroProps) {
  const modeLabel = task.mode === 'group' ? 'Групповое' : 'Индивидуальное';
  const durationLabel = `${task.duration} мин`;

  return (
    <Background theme={theme} orientation={orientation} onBack={onBack}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>{task.title}</h2>

        <div className={styles.card}>
          <div className={styles.badges}>
            <Badge
              label={modeLabel}
              type="filled"
              icon={<Icon name="people" color="white" size="xs" />}
            />
            <Badge
              label={durationLabel}
              type="filled"
              icon={<Icon name="clock" color="white" size="xs" />}
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
