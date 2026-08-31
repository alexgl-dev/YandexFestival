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
 * Механика `count` — «Data Set».
 * Данные: task.steps[0].countItems[] (фото/разметка/actual/detected/aiTimeMs), sampleSize, countLabel.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function CountGame({ task, onComplete, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
