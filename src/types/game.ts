export type Mechanic = 'choose' | 'find' | 'sequence' | 'categorize' | 'distribute' | 'match' | 'label' | 'mark' | 'catch' | 'quiz' | 'bingo' | 'calendar';
export type Mode = 'group' | 'solo';
export type Feedback = 'instant' | 'onComplete';

export interface ProfessionSection {
  heading: string;
  text: string;
}

export interface GlossaryTerm {
  word: string;
  definition: string;
}

export interface Profession {
  id: string;
  title: string;
  description: string;
  sections?: ProfessionSection[];
  glossary?: GlossaryTerm[];
}

export interface TaskOption {
  text?: string;
  image?: string;
  correct: boolean;
  explanation: string;
  hint?: string;
  name?: string;
  role?: string;
  quote?: string;
  details?: string[];
}

export interface TaskBlock {
  text?: string;
  code?: string;
  description?: string;
  order: number | null;
  explanation?: string;
  icon?: string;
}

export interface TaskPair {
  left: { type: string; value?: string; image?: string; avatar?: string; description?: string; label?: string; hidden?: boolean; mockupId?: string };
  right: { type: string; value?: string; image?: string; label?: string; code?: string; hidden?: boolean; mockupId?: string };
  explanation: string;
}

export interface TaskCategory {
  id: string;
  title: string;
  description?: string;
  image?: string;
  emoji?: string;
  avatar?: string;
  color?: string;
  tooltip?: string;
}

export interface EmailField {
  value: string;
  note?: string;
  suspicious?: boolean;
}

export interface EmailBlock {
  type: 'text' | 'link' | 'attachment';
  text: string;
  href?: string;
  note?: string;
  suspicious?: boolean;
}

export interface EmailContent {
  from: EmailField;
  to: EmailField;
  subject: EmailField;
  body: EmailBlock[];
}

export interface TaskItem {
  title?: string;
  text?: string;
  name?: string;
  emoji?: string;
  icon?: string;
  image?: string;
  content?: { type: string; value: string; description?: string };
  email?: EmailContent;
  belongs?: string[];
  correctLabel?: string;
  box?: { x: number; y: number; width: number; height: number };
  /** Подмножество id из step.labels, которое показывается в пикере именно для этого объекта. Если не задано — показываются все step.labels. */
  options?: string[];
  /** Подсказка про точность рамки, показывается в пикере под заголовком. */
  boxTip?: string;
  explanation: string;
  wrongHint?: string;
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

export interface UxReview {
  id: string;
  text: string;
  isProblem: boolean;
  zone: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  role: 'pm' | 'dev' | 'design' | 'qa';
  time: string;
  text: string;
  isProblem?: boolean;
  explanation?: string;
  tooltip?: string;
  signalMeaning?: string;
  signalConsequence?: string;
  signalAction?: string;
}

export interface CatchObject {
  icon: string;
  title: string;
  description: string;
  category: string;
  emoji?: string;
  correctComment?: string;
  wrongComment?: string;
  glossary?: GlossaryTerm[];
  fields?: {
    name: string;
    age: string;
    email: string;
    city: string;
  };
}

export interface CalendarCardData {
  id: string;
  title: string;
  durationSlots: number; // 30-min units: 1=30min, 2=1hr, 4=2hr, 6=3hr
  /** Отображаемая длительность в минутах (если нужно 15/45 и т.п. при сетке 30 мин). */
  durationMin?: number;
  tooltip: string;
  isAnchor?: boolean;
  anchorDay?: string;         // 'mon' | 'tue' | 'wed'
  anchorStartSlot?: number;   // index from 0 (9:00=0, 9:30=1, ...)
  /** Смещение старта внутри слота `anchorStartSlot` (0–29 минут) — для отображения «не ровно по сетке». */
  anchorStartMinuteOffset?: number;
  validDays?: string[];
  minStartSlot?: number;
  maxStartSlot?: number;
  exactStartSlot?: number;
  wrongExplanation?: string;
  glossary?: { word: string; definition: string }[];
}

export interface TaskStep {
  prompt?: string;
  /** Длинный текст с `[слово]{tooltip: "…"}` для подсказки робота в CodeSequenceGame (без стартового оверлея). */
  briefing?: string;
  image?: string;
  hints?: string;
  options?: TaskOption[];
  blocks?: TaskBlock[];
  pairs?: TaskPair[];
  categories?: TaskCategory[];
  items?: TaskItem[];
  labels?: TaskLabel[];
  targets?: TaskTarget[];
  reviews?: UxReview[];
  messages?: ChatMessage[];
  objects?: CatchObject[];
  trash?: { enabled: boolean; label: string };
  catcher?: { type: string; label: string };
  resultCorrect?: string;
  resultWrong?: string;
  calendarCards?: CalendarCardData[];
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  mechanic: Mechanic;
  profession: string;
  duration: number;
  mode: Mode;
  /** Не показывать бейдж «Групповое» / «Индивидуальное» на экране вступления к задаче */
  hideIntroModeBadge?: boolean;
  order: number;
  isLast: boolean;
  feedback: Feedback;
  intro: string;
  introTooltips?: GlossaryTerm[];
  instruction?: string;
  steps: TaskStep[];
  moral: string;
  moralFailure?: string;
  /** Подсветка терминов в морали: тап открывает то же всплывающее окно, что и introTooltips на вступлении. */
  moralTooltips?: GlossaryTerm[];
  hidden?: boolean;
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
  expertComment?: string;   // text shown on the flipped bingo card back
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
  theme: 'cobalt' | 'orange';
  orientation: 'landscape' | 'portrait';
  professions: Profession[];
  description: string;
  tasks: Task[];
  videos: Video[];
  test?: QuizQuestion[];      // keep for backwards compat but make optional
  bingo?: BingoTest;          // new bingo test
}
