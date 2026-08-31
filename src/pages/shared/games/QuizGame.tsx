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
 * Механика `quiz` — последовательные вопросы с текстовыми вариантами (ИИшные стихи).
 * Данные: task.steps[] — каждый шаг { prompt, options[]: { text, correct, explanation } }.
 * TODO(agent): заменить заглушку на реализацию.
 */
export function QuizGame({ task, onComplete, theme = 'cobalt', orientation = 'landscape' }: GameProps) {
  return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
}
