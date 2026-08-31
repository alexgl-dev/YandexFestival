import type { SectionData, CountItem } from '../../../types/game';

/**
 * Данные нейросети по 30 фотографиям (перенесены 1:1 из старого проекта):
 * ../yandex-informatika/components/pages/MlDev/FirstFlow/FirstFlow.jsx → neuralNetworkData
 */
const countItems: CountItem[] = [
  { image: '/assets/games/ml/dataset/raw/image1.jpg', segmented: '/assets/games/ml/dataset/segmented/image1.jpg', actual: 20, detected: 19, aiTimeMs: 550, comment: 'почти все авто найдены, пропущены машина рядом с автобусом' },
  { image: '/assets/games/ml/dataset/raw/image2.jpg', segmented: '/assets/games/ml/dataset/segmented/image2.jpg', actual: 23, detected: 19, aiTimeMs: 486, comment: 'большинство верно, пара дальних автомобилей пропущена' },
  { image: '/assets/games/ml/dataset/raw/image3.jpg', segmented: '/assets/games/ml/dataset/segmented/image3.jpg', actual: 17, detected: 16, aiTimeMs: 511, comment: 'не обнаружена машина за линиями электропередачи. обычный человек найдет ее с легкостью' },
  { image: '/assets/games/ml/dataset/raw/image4.jpg', segmented: '/assets/games/ml/dataset/segmented/image4.jpg', actual: 6, detected: 6, aiTimeMs: 497, comment: 'все корректно, модели удалось распознать кусочек авто слева снизу' },
  { image: '/assets/games/ml/dataset/raw/image5.jpg', segmented: '/assets/games/ml/dataset/segmented/image5.jpg', actual: 39, detected: 19, aiTimeMs: 475, comment: 'большое количество авто на заднем плане не удалось распознать' },
  { image: '/assets/games/ml/dataset/raw/image6.jpg', segmented: '/assets/games/ml/dataset/segmented/image6.jpg', actual: 8, detected: 7, aiTimeMs: 472, comment: 'не удалось распознать минивэн (если считаем его за легковое авто)' },
  { image: '/assets/games/ml/dataset/raw/image7.jpg', segmented: '/assets/games/ml/dataset/segmented/image7.jpg', actual: 13, detected: 11, aiTimeMs: 405, comment: 'почти все корректно, не найдено пару авто на краю картинки' },
  { image: '/assets/games/ml/dataset/raw/image8.jpg', segmented: '/assets/games/ml/dataset/segmented/image8.jpg', actual: 10, detected: 9, aiTimeMs: 483, comment: 'не распознан черный пикап (если считаем за легковое авто)' },
  { image: '/assets/games/ml/dataset/raw/image9.jpg', segmented: '/assets/games/ml/dataset/segmented/image9.jpg', actual: 4, detected: 4, aiTimeMs: 494, comment: 'все корректно, трехколесное нечто тоже распознано как легковое авто' },
  { image: '/assets/games/ml/dataset/raw/image10.jpg', segmented: '/assets/games/ml/dataset/segmented/image10.jpg', actual: 22, detected: 15, aiTimeMs: 371, comment: 'некоторые авто вдалеке не были распознаны' },
  { image: '/assets/games/ml/dataset/raw/image11.jpg', segmented: '/assets/games/ml/dataset/segmented/image11.jpg', actual: 25, detected: 16, aiTimeMs: 378, comment: 'не удалось распознать авто, которые очень близко "слиплись" друг к другу' },
  { image: '/assets/games/ml/dataset/raw/image12.jpg', segmented: '/assets/games/ml/dataset/segmented/image12.jpg', actual: 3, detected: 3, aiTimeMs: 334, comment: 'все верно, при этом минивэн распознан как легковое авто' },
  { image: '/assets/games/ml/dataset/raw/image13.jpg', segmented: '/assets/games/ml/dataset/segmented/image13.jpg', actual: 25, detected: 28, aiTimeMs: 733, comment: 'распознан кусок клумбы, мотоциклист, островок и автобус как легковое авто' },
  { image: '/assets/games/ml/dataset/raw/image14.jpg', segmented: '/assets/games/ml/dataset/segmented/image14.jpg', actual: 4, detected: 4, aiTimeMs: 492, comment: 'все найдено корректно, без вопросов' },
  { image: '/assets/games/ml/dataset/raw/image15.jpg', segmented: '/assets/games/ml/dataset/segmented/image15.jpg', actual: 13, detected: 9, aiTimeMs: 480, comment: 'два авто на дороге распознаны за одно, не найдена часть авто на парковке' },
  { image: '/assets/games/ml/dataset/raw/image16.jpg', segmented: '/assets/games/ml/dataset/segmented/image16.jpg', actual: 27, detected: 16, aiTimeMs: 793, comment: 'большое количество авто не найдено из-за арматуры. надпись на знаке модель посчитала за часть авто' },
  { image: '/assets/games/ml/dataset/raw/image17.jpg', segmented: '/assets/games/ml/dataset/segmented/image17.jpg', actual: 23, detected: 17, aiTimeMs: 489, comment: 'не найдено часть авто вдалеке, синий "грузовичок" модель посчитала за легковушку' },
  { image: '/assets/games/ml/dataset/raw/image18.jpg', segmented: '/assets/games/ml/dataset/segmented/image18.jpg', actual: 6, detected: 6, aiTimeMs: 422, comment: 'все найдено корректно, без вопросов' },
  { image: '/assets/games/ml/dataset/raw/image19.jpg', segmented: '/assets/games/ml/dataset/segmented/image19.jpg', actual: 13, detected: 8, aiTimeMs: 498, comment: 'часть авто за железной арматурой не найдено, в остальном ок' },
  { image: '/assets/games/ml/dataset/raw/image20.jpg', segmented: '/assets/games/ml/dataset/segmented/image20.jpg', actual: 6, detected: 6, aiTimeMs: 524, comment: 'все ок, оранжевый мини-грузовичок модель за легковушку не посчитала' },
  { image: '/assets/games/ml/dataset/raw/image21.jpg', segmented: '/assets/games/ml/dataset/segmented/image21.jpg', actual: 13, detected: 12, aiTimeMs: 692, comment: 'два авто слиплись, автобус неверно распознан, легковушка за автобусом не найдена' },
  { image: '/assets/games/ml/dataset/raw/image22.jpg', segmented: '/assets/games/ml/dataset/segmented/image22.jpg', actual: 5, detected: 6, aiTimeMs: 542, comment: 'не найдено авто спереди, спойлер и кузов распознаны как разные авто, грузовик распознан как легковое, болиды не считаем' },
  { image: '/assets/games/ml/dataset/raw/image23.jpg', segmented: '/assets/games/ml/dataset/segmented/image23.jpg', actual: 16, detected: 15, aiTimeMs: 619, comment: 'почти все ок, но не распознано авто рядом с ярким грузом на крыше' },
  { image: '/assets/games/ml/dataset/raw/image24.jpg', segmented: '/assets/games/ml/dataset/segmented/image24.jpg', actual: 10, detected: 9, aiTimeMs: 696, comment: 'почти все ок, не распознан минивэн рядом с автобусом' },
  { image: '/assets/games/ml/dataset/raw/image25.jpg', segmented: '/assets/games/ml/dataset/segmented/image25.jpg', actual: 31, detected: 15, aiTimeMs: 473, comment: 'половина авто не распознана. модель может плохо распознавать ретро-автомобили, либо неудобный ракурс' },
  { image: '/assets/games/ml/dataset/raw/image26.jpg', segmented: '/assets/games/ml/dataset/segmented/image26.jpg', actual: 13, detected: 14, aiTimeMs: 450, comment: 'непонятно, считаем ли тук-туки за авто (это мотоциклы?), а вот модель часть считает, а часть — нет' },
  { image: '/assets/games/ml/dataset/raw/image27.jpg', segmented: '/assets/games/ml/dataset/segmented/image27.jpg', actual: 10, detected: 7, aiTimeMs: 864, comment: 'два автомобиля в тоннеле "слиплись", еще два модель просто не распознала' },
  { image: '/assets/games/ml/dataset/raw/image28.jpg', segmented: '/assets/games/ml/dataset/segmented/image28.jpg', actual: 11, detected: 12, aiTimeMs: 485, comment: 'модель посчитала самое дальнее авто за два отдельных автомобиля — разрезала его' },
  { image: '/assets/games/ml/dataset/raw/image29.jpg', segmented: '/assets/games/ml/dataset/segmented/image29.jpg', actual: 25, detected: 19, aiTimeMs: 697, comment: 'не распознано несколько авто за деревом и перед автобусами, не распознан минивэн снизу' },
  { image: '/assets/games/ml/dataset/raw/image30.jpg', segmented: '/assets/games/ml/dataset/segmented/image30.jpg', actual: 43, detected: 19, aiTimeMs: 793, comment: 'модель хорошо распознала ретро-авто, но из-за их количества ей стало труднее, сзади ничего не найдено' },
];

/**
 * Блок 3 — «ML-инженер» (трек «Информатика во всём»).
 * Контент и механики: Games/007-ml/SOURCE.md.
 */
export const mlSection: SectionData = {
  id: '007',
  slug: 'ml',
  title: 'ML-инженер',
  theme: 'cobalt',
  orientation: 'landscape',
  block: 'data',
  professions: [],
  description: '',
  tasks: [
    {
      id: 'dataset',
      title: 'Data Set',
      mechanic: 'count',
      profession: 'ml-engineer',
      duration: 5,
      mode: 'solo',
      hideIntroModeBadge: true,
      order: 1,
      isLast: true,
      feedback: 'instant',
      intro:
        'Датасеты — это большие наборы информации. Как коллекция фотографий, текстов или цифр, которую компьютеры используют, чтобы учиться распознавать объекты и делать прогнозы.',
      instruction:
        'Посчитай все объекты на картинке и введи число. Сравни свою скорость со скоростью искусственного интеллекта!',
      steps: [
        {
          countLabel: 'автомобили',
          sampleSize: 5,
          countItems,
        },
      ],
      moral:
        'Человек и ИИ воспринимают мир по-разному. Машины быстро считают, люди лучше понимают необычное. Вместе мы решаем сложные задачи!',
    },
  ],
  // Видео «Познакомься с ML-инженером» — файла пока нет (запрошен у заказчика).
  videos: [],
};
