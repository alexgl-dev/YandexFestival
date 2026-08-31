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
 * Механика `compare` — «Глазами другого».
 * Данные: task.steps[0].image — базовая картинка; options[] — { text: название состояния, filterId, explanation: описание }.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function CompareGame({ task, onComplete, theme = 'orange', orientation = 'portrait' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
