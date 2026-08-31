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
import { BacklogGame } from './games/BacklogGame';
import { DatasetSanitizerGame } from './games/DatasetSanitizerGame';
import { LabelGame } from './games/LabelGame';
import { SecurityCheckGame } from './games/SecurityCheckGame';
import { MatchGame } from './games/MatchGame';
import { BurnoutGame } from './games/BurnoutGame';
import { LaunchSequenceGame } from './games/LaunchSequenceGame';
import { UxSequenceGame } from './games/UxSequenceGame';
import { CalendarGame } from './games/CalendarGame';
import { CalendarGamePortrait } from './games/CalendarGamePortrait';
import { FactorXGame } from './games/FactorXGame';
import { QuizGame } from './games/QuizGame';
import { VideoChoiceGame } from './games/VideoChoiceGame';
import { AudioMatchGame } from './games/AudioMatchGame';
import { CompareGame } from './games/CompareGame';
import { TimelineGame } from './games/TimelineGame';
import { BuilderGame } from './games/BuilderGame';
import { CountGame } from './games/CountGame';
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
      if (task.id === 'factor-x')
        return <FactorXGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
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
      if (task.id === 'pizza-order')
        return <UxSequenceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
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
      if (task.id === 'backlog') {
        return <BacklogGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      }
      if (task.id === 'dataset-sanitizers') {
        return <DatasetSanitizerGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      }
      const hasSwipe = !!task.steps[0]?.trash?.enabled;
      if (hasSwipe)
        return <SwipeGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      return <CatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    }
    case 'label':
      if (task.id === 'security-check') {
        return <SecurityCheckGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
      }
      return <LabelGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'match':
      return <MatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'calendar':
      return orientation === 'portrait'
        ? <CalendarGamePortrait task={task} onComplete={onComplete} onBack={onBack} theme={theme} />
        : <CalendarGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} />;
    // --- Механики трека «Информатика во всём» ---
    case 'quiz':
      return <QuizGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'video-choice':
      return <VideoChoiceGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'audio-match':
      return <AudioMatchGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'compare':
      return <CompareGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'timeline':
      return <TimelineGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'builder':
      return <BuilderGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    case 'count':
      return <CountGame task={task} onComplete={onComplete} onBack={onBack} theme={theme} orientation={orientation} />;
    default:
      return <GamePlaceholder task={task} onComplete={onComplete} theme={theme} orientation={orientation} />;
  }
}
