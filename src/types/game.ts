export type Mechanic = 'choose' | 'find' | 'sequence' | 'categorize' | 'match' | 'label' | 'mark' | 'catch' | 'quiz' | 'bingo';
export type Mode = 'group' | 'solo';
export type Feedback = 'instant' | 'onComplete';

export interface Profession {
  id: string;
  title: string;
  description: string;
}

export interface TaskOption {
  text?: string;
  image?: string;
  correct: boolean;
  explanation: string;
  hint?: string;
}

export interface TaskBlock {
  text?: string;
  code?: string;
  description?: string;
  order: number | null;
  explanation?: string;
}

export interface TaskPair {
  left: { type: string; value?: string; image?: string; avatar?: string; description?: string; label?: string; hidden?: boolean };
  right: { type: string; value?: string; image?: string; label?: string };
  explanation: string;
}

export interface TaskCategory {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

export interface TaskItem {
  text?: string;
  icon?: string;
  image?: string;
  content?: { type: string; value: string; description?: string };
  belongs?: string[];
  correctLabel?: string;
  explanation: string;
}

export interface TaskLabel {
  id: string;
  title: string;
  icon?: string;
  color?: string;
}

export interface TaskTarget {
  area: { x: number; y: number; radius: number };
  explanation: string;
}

export interface CatchObject {
  icon: string;
  title: string;
  description: string;
  category: string;
}

export interface TaskStep {
  prompt?: string;
  image?: string;
  hints?: string;
  options?: TaskOption[];
  blocks?: TaskBlock[];
  pairs?: TaskPair[];
  categories?: TaskCategory[];
  items?: TaskItem[];
  labels?: TaskLabel[];
  targets?: TaskTarget[];
  objects?: CatchObject[];
  trash?: { enabled: boolean; label: string };
  catcher?: { type: string; label: string };
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  mechanic: Mechanic;
  profession: string;
  duration: number;
  mode: Mode;
  order: number;
  isLast: boolean;
  feedback: Feedback;
  intro: string;
  instruction?: string;
  steps: TaskStep[];
  moral: string;
}

export interface Video {
  profession: string;
  title: string;
  src: string;
  subtitles?: string;
}

export interface QuizQuestion {
  prompt: string;
  options: TaskOption[];
}

export interface BingoQuestion {
  gridLabel: string;        // short label for the grid cell (e.g. "напиток")
  prompt: string;           // question text
  options: string[];        // 4 answer options (just text strings)
  expertAnswer: string;     // the expert's answer for comparison
}

export interface BingoExpert {
  name: string;
  role: string;
  profession: string;
}

export interface BingoTest {
  expert: BingoExpert;
  gridLabels: string[];     // 8 labels for the 3×3 grid (center = expert role)
  intro: string;
  instruction: string;
  resultText: string;
  questions: BingoQuestion[];
}

export interface SectionData {
  id: string;
  slug: string;
  title: string;
  professions: Profession[];
  description: string;
  tasks: Task[];
  videos: Video[];
  test?: QuizQuestion[];      // keep for backwards compat but make optional
  bingo?: BingoTest;          // new bingo test
}
