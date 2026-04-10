import type { Task } from '../../types/game';
import { ChooseGame } from './games/ChooseGame';
import { FindGame } from './games/FindGame';
import { SequenceGame } from './games/SequenceGame';
import { CategorizeGame } from './games/CategorizeGame';
import { MarkGame } from './games/MarkGame';
import { GamePlaceholder } from './GamePlaceholder';

interface GameRouterProps {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;
}

export function GameRouter({ task, onComplete, onBack }: GameRouterProps) {
  switch (task.mechanic) {
    case 'choose':
      return <ChooseGame task={task} onComplete={onComplete} onBack={onBack} />;
    case 'find':
      return <FindGame task={task} onComplete={onComplete} onBack={onBack} />;
    case 'sequence':
      return <SequenceGame task={task} onComplete={onComplete} onBack={onBack} />;
    case 'categorize':
      return <CategorizeGame task={task} onComplete={onComplete} onBack={onBack} />;
    case 'mark':
      return <MarkGame task={task} onComplete={onComplete} onBack={onBack} />;
    default:
      return <GamePlaceholder task={task} onComplete={onComplete} />;
  }
}
