import type { Task } from '../../../types/game';
import { GamePlaceholder } from '../GamePlaceholder';

interface GameResult {
  answer: string;
  correct: boolean;
  explanation: string;
}

interface GameProps {
  task: Task;
  onComplete: (results: GameResult[]) => void;
  onBack: () => void;
  theme?: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
}

/**
 * Механика `builder` — «Собери робота».
 * Данные: task.steps[0].builderFields[] — параметры с вариантами; resultImages[] — картинки-результаты.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function BuilderGame({ task, onComplete, theme = 'orange', orientation = 'portrait' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
