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
      id: 'audio-description',
      title: 'Тифлокомментарий',
      mechanic: 'video-choice',
      profession: 'accessibility',
      duration: 3,
      mode: 'solo',
      hideIntroModeBadge: true,
      order: 1,
      isLast: true,
      feedback: 'instant',
      intro:
        'Тифлокомментарии — это словесное описание происходящего на экране для незрячих людей. Они помогают понять действия, предметы и обстановку на дисплее.\n\nПосмотри пример и узнай, как это работает!',
      introButtonLabel: 'Узнать!',
      introSecondaryButtonLabel: 'Посмотрю позже',
      instruction:
        'Выбери и посмотри ролик с тифлокомментариями, чтобы понять, как словесно описывают видеоконтент для незрячих людей.',
      steps: [
        {
          options: [
            {
              text: 'Мультсериал',
              // name: '«Объяснялкины»', — по доку; реальный файл cartoon.mp4 — другой ролик, подпись скрыта до подтверждения заказчиком
              video: '/videos/access/cartoon.mp4',
              correct: true,
              explanation: '',
            },
            {
              text: 'Сериал',
              // name: '«Игры»', — см. выше
              video: '/videos/access/series.mp4',
              correct: true,
              explanation: '',
            },
            {
              text: 'Фильм',
              // name: '«Баранкины и камни силы»', — см. выше
              video: '/videos/access/film.mp4',
              correct: true,
              explanation: '',
            },
          ],
        },
      ],
      moral:
        'Так словесно описывают видеоконтент для незрячих людей. Тифлокомментарий делает кино доступным каждому.',
    },
    {
      id: 'alt-text',
      title: 'Альтернативный текст',
      mechanic: 'audio-match',
      profession: 'accessibility',
      duration: 4,
      mode: 'solo',
      hideIntroModeBadge: true,
      order: 2,
      isLast: true,
      feedback: 'instant',
      intro:
        'Альтернативный текст — это описание картинки для незрячих пользователей. Программы чтения с экрана озвучивают его и помогают понять содержание изображения.',
      introButtonLabel: 'Послушать',
      introSecondaryButtonLabel: 'Послушаю позже',
      instruction:
        'Послушай аудио, найди альтернативный текст и перетяни его к нужному изображению.',
      steps: [
        {
          pairs: [
            {
              left: {
                type: 'audio',
                label: 'Послушать альтернативный текст 1',
                description: 'Раскрытый ноутбук в красно-розовом корпусе. На экране — голубой градиент, клавиатура серая.',
              },
              right: { type: 'image', image: '/illustrations/illustration-laptop.png' },
              explanation: '',
            },
            {
              left: {
                type: 'audio',
                label: 'Послушать альтернативный текст 2',
                description: 'Компьютерная клавиатура с красными и белыми клавишами, вид сверху под небольшим углом.',
              },
              right: { type: 'image', image: '/illustrations/illustration-keyboard.png' },
              explanation: '',
            },
            {
              left: {
                type: 'audio',
                label: 'Послушать альтернативный текст 3',
                description: 'Красная компьютерная мышь с серым колёсиком, лежит на боку, вид спереди.',
              },
              right: { type: 'image', image: '/illustrations/illustration-mouse-red.png' },
              explanation: '',
            },
          ],
        },
      ],
      moral:
        'Молодец! Все описания подобраны верно. Благодаря альтернативному тексту контент становится доступен каждому.',
    },
    {
      id: 'vision',
      title: 'Глазами другого',
      mechanic: 'compare',
      profession: 'accessibility',
      duration: 3,
      mode: 'solo',
      hideIntroModeBadge: true,
      order: 3,
      isLast: true,
      feedback: 'instant',
      intro:
        'Люди с особенностями зрения воспринимают мир по-разному. Для специалиста по цифровой доступности важно понимать эти различия и создавать контент, доступный каждому.',
      introSecondaryButtonLabel: 'Посмотрю позже',
      instruction:
        'Выбери одну из пяти кнопок. Посмотри, как меняется картинка у людей с особенностями зрения',
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
    },
  ],
  videos: [],
};
