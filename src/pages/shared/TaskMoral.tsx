import { Background, PopUp } from '../../components/ui';
import type { Task } from '../../types/game';

interface TaskMoralProps {
  task: Task;
  onNext: () => void;
  isLast: boolean;
  sectionSlug: string;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function TaskMoral({ task, onNext, isLast, theme = 'orange', orientation = 'portrait' }: TaskMoralProps) {
  return (
    <Background theme={theme} orientation={orientation} showBackButton={false}>
      <PopUp
        icon="done"
        iconColor="blue"
        title="Отлично!"
        description={task.moral}
        buttonLabel={isLast ? 'В меню' : 'Следующее задание'}
        onButtonClick={onNext}
      />
    </Background>
  );
}
