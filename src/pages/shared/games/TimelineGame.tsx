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
 * Механика `timeline` — «История рекламы».
 * Данные: task.steps[0].blocks[] — { order: индекс эпохи, text: подпись периода, description: текст, image? }.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function TimelineGame({ task, onComplete, theme = 'orange', orientation = 'portrait' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
