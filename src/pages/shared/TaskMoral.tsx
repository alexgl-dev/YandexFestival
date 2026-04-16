import { useNavigate } from 'react-router';
import { Background, PopUp } from '../../components/ui';
import type { Task } from '../../types/game';
import styles from './TaskMoral.module.css';

interface TaskMoralProps {
  task: Task;
  onNext: () => void;
  isLast: boolean;
  sectionSlug: string;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

function parseMoral(text: string): { main: string; question: string | null } {
  const newlineIdx = text.indexOf('\n');
  if (newlineIdx !== -1) {
    return {
      main: text.slice(0, newlineIdx).trim(),
      question: text.slice(newlineIdx).trim().replace(/^\n+/, ''),
    };
  }

  // Split before last sentence ending with ?
  const match = text.match(/^(.*[.!])\s+([^.!]+\?)$/s);
  if (match) {
    return { main: match[1].trim(), question: match[2].trim() };
  }

  return { main: text, question: null };
}

export function TaskMoral({ task, onNext, isLast, sectionSlug, theme = 'orange', orientation = 'portrait' }: TaskMoralProps) {
  const navigate = useNavigate();
  const { main, question } = parseMoral(task.moral);

  const description = (
    <>
      <p className={styles.moralText}>{main}</p>
      {question && <p className={`${styles.moralText} ${styles.moralQuestion}`}>{question}</p>}
    </>
  );

  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <PopUp
        icon="done"
        iconColor="blue"
        title="Отлично!"
        description={description}
        buttonLabel={isLast ? 'В меню' : 'Следующее задание'}
        onButtonClick={onNext}
        secondaryButtonLabel="Меню заданий"
        onSecondaryButtonClick={() => navigate(`/${sectionSlug}/tasks`)}
      />
    </Background>
  );
}
