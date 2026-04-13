import { useNavigate, useOutletContext } from 'react-router';
import { Background, ListItem } from '../../components/ui';
import type { SectionData } from '../../types/game';
import styles from './TaskList.module.css';

export function TaskList() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  return (
    <Background theme="cobalt" orientation="landscape" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Задания</h2>

        <div className={styles.list}>
          {data.tasks.filter((task) => !task.hidden).map((task) => (
            <ListItem
              key={task.id}
              title={task.title}
              duration={`${task.duration} мин`}
              showPeople={task.mode === 'group'}
              state="default"
              onClick={() => navigate(`/${data.slug}/tasks/${task.id}`)}
            />
          ))}
        </div>
      </div>
    </Background>
  );
}
