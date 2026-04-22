import { useNavigate, useOutletContext } from 'react-router';
import { Background, ListItem } from '../../components/ui';
import type { SectionData } from '../../types/game';
import { minutesLabel } from '../../utils/plural';
import styles from './TaskList.module.css';

export function TaskList() {
  const navigate = useNavigate();
  const data = useOutletContext<SectionData>();

  return (
    <Background theme="orange" orientation="portrait" onBack={() => navigate(`/${data.slug}`)}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Задачи на день</h2>

        <div className={styles.list}>
          {data.tasks.map((task) => (
            <ListItem
              key={task.id}
              title={task.title}
              duration={minutesLabel(task.duration)}
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
