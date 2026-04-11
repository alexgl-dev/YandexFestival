import type { Task } from '../../types/game';
import { ChooseGame } from './games/ChooseGame';
import { FindGame } from './games/FindGame';
import { SequenceGame } from './games/SequenceGame';
import { CategorizeGame } from './games/CategorizeGame';
import { MarkGame } from './games/MarkGame';
import { CatchGame } from './games/CatchGame';
import { LabelGame } from './games/LabelGame';
import { MatchGame } from './games/MatchGame';
import { GamePlaceholder } from './GamePlaceholder';

interface GameRouterProps {
  task: Task;
  onComplete: (results: Array<{ answer: string; correct: boolean; explanation: string }>) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

export function GameRouter({ task, onComplete, onBack, theme = 'orange', orientation = 'portrait' }: GameRouterProps) {
  switch (task.mechanic) {
    case 'choose':
      return <ChooseGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'find':
      return <FindGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'sequence':
      return <SequenceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'categorize':
      return <CategorizeGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'mark':
      return <MarkGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'catch':
      return <CatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'label':
      return <LabelGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'match':
      return <MatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    default:
      return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
  }
}
