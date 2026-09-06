export const NAMESPACES = [
  'common',
  'home',
  'blocks',
  'creative',
  'development',
  'management',
  'data',
  'informatics',
  'calendars',
  'sharedGames1',
  'sharedGames2',
  'sharedOther',
] as const;

export type Namespace = (typeof NAMESPACES)[number];
