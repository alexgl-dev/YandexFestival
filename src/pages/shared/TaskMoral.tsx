import { Background, PopUp } from '../../components/ui';
import type { Task } from '../../types/game';

interface TaskMoralProps {
  task: Task;
  onNext: () => void;
  isLast: boolean;
  sectionSlug: string;
}

export function TaskMoral({ task, onNext, isLast }: TaskMoralProps) {
  return (
    <Background theme="orange" orientation="landscape" showBackButton={false}>
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
