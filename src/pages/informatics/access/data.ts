import type { SectionData } from '../../../types/game';

/**
 * Блок 1 — «Цифровая доступность» (трек «Информатика во всём»).
 * Контент и механики: Games/005-access/SOURCE.md.
 */
export const accessSection: SectionData = {
  id: '005',
  slug: 'access',
  title: 'Цифровая доступность',
  theme: 'orange',
  orientation: 'portrait',
  block: 'management',
  professions: [],
  description: '',
  tasks: [
    {
      id: 'vision',
      title: 'Глазами другого',
      mechanic: 'compare',
      profession: 'accessibility',
      duration: 3,
      mode: 'solo',
      hideIntroModeBadge: true,
      order: 1,
      isLast: true,
      feedback: 'instant',
      intro:
        'Люди с особенностями зрения воспринимают мир по-разному. Для специалиста по цифровой доступности важно понимать эти различия и создавать контент, доступный каждому.',
      introSecondaryButtonLabel: 'Посмотрю позже',
      instruction:
        'Выбери одну из пяти кнопок. Посмотри, как меняется картинка у людей с особенностями зрения',
      instructionButtonLabel: 'Сравнить',
      steps: [
        {
          image: '/assets/games/access/vision-base.jpg',
          options: [
            {
              text: 'Близорукость',
              filterId: 'myopia',
              correct: true,
              explanation:
                'Близорукость — это когда хорошо видишь вблизи, но вдали всё расплывается. Без очков или линз дальние объекты кажутся размытыми.',
            },
            {
              text: 'Дальтонизм',
              filterId: 'colorblind',
              correct: true,
              explanation:
                'Дальтонизм — особенность зрения, при которой человек не различает некоторые цвета, чаще всего красный и зелёный. Мир выглядит иначе, чем для большинства людей.',
            },
            {
              text: 'Катаракта',
              filterId: 'cataract',
              correct: true,
              explanation:
                'Катаракта — это помутнение хрусталика глаза. Из-за этого зрение становится нечётким, как будто смотришь через запотевшее стекло. Цвета тускнеют, а яркий свет может ослеплять.',
            },
            {
              text: 'Глаукома',
              filterId: 'glaucoma',
              correct: true,
              explanation:
                'Глаукома — заболевание, при котором повышается давление внутри глаза. Постепенно сужается поле зрения, появляются тёмные пятна, словно смотришь через трубочку.',
            },
            {
              text: 'Дегенерация жёлтого пятна',
              filterId: 'macular',
              correct: true,
              explanation:
                'Дегенерация жёлтого пятна — это когда центр поля зрения становится размытым или тёмным. Трудно различать лица и читать: видны пятна в центре, но боковое зрение сохраняется.',
            },
          ],
        },
      ],
      moral:
        'У тебя получилось посмотреть, как по-разному люди воспринимают одно и то же изображение. Чтобы контент был понятен всем, важно учитывать особенности.',
      moralButtonLabel: 'Узнать новое',
    },
  ],
  videos: [
    {
      profession: 'vasilina',
      title: 'Василина Дрогичинская',
      src: '/videos/access/vasilina.mp4',
    },
  ],
};
