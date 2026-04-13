import type { Task } from '../../types/game';
import { ChooseGame } from './games/ChooseGame';
import { FindGame } from './games/FindGame';
import { AnomalyDetectiveGame } from './games/AnomalyDetectiveGame';
import { SequenceGame } from './games/SequenceGame';
import { CodeSequenceGame } from './games/CodeSequenceGame';
import { CategorizeGame } from './games/CategorizeGame';
import { PlaylistAnatomyGame } from './games/PlaylistAnatomyGame';
import { DistributeGame } from './games/DistributeGame';
import { MarkGame } from './games/MarkGame';
import { ChatSignalsGame } from './games/ChatSignalsGame';
import { CatchGame } from './games/CatchGame';
import { SwipeGame } from './games/SwipeGame';
import { LabelGame } from './games/LabelGame';
import { MatchGame } from './games/MatchGame';
import { BurnoutGame } from './games/BurnoutGame';
import { LaunchSequenceGame } from './games/LaunchSequenceGame';
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
      if (task.id === 'burnout') {
        return <BurnoutGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      }
      if (task.id === 'anomaly-detective') {
        return <AnomalyDetectiveGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      }
      return <FindGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'sequence': {
      const firstBlock = task.steps[0]?.blocks?.[0];
      const usesCode = !!firstBlock?.code;
      const usesIcon = !!firstBlock?.icon;
      if (usesCode)
        return <CodeSequenceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      if (usesIcon)
        return <LaunchSequenceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      return <SequenceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    }
    case 'categorize': {
      if (task.id === 'playlist-anatomy')
        return <PlaylistAnatomyGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      return <CategorizeGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    }
    case 'distribute':
      return <DistributeGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'mark': {
      const hasChat = !!task.steps[0]?.messages?.length;
      return hasChat ? (
        <ChatSignalsGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />
      ) : (
        <MarkGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />
      );
    }
    case 'catch': {
      const hasSwipe = !!task.steps[0]?.trash?.enabled;
      if (hasSwipe)
        return <SwipeGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      return <CatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    }
    case 'label':
      return <LabelGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'match':
      return <MatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    default:
      return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
  }
}
