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
 * Механика `audio-match` — «Альтернативный текст».
 * Данные: task.steps[0].pairs[] — left { type: 'audio', label, value?: src аудио, description: текст альт-описания },
 * right { type: 'image', image }.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function AudioMatchGame({ task, onComplete, theme = 'orange', orientation = 'portrait' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
