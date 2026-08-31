# 007 — «ML-инженер» (блок 3 — Аналитика, тач 43″, landscape, cobalt)

Раздел трека «Информатика во всём». Роут `/ml`, данные `src/pages/informatics/ml/data.ts` (`mlSection`).
Тексты финальные (гугл-док «Data Set», правка редактора учтена).
Исходный код механики: `../yandex-informatika/components/pages/MlDev/FirstFlow/FirstFlow.jsx` — там же массив `neuralNetworkData` (30 записей: `actual`, `detected`, `time` в мс, `comment`) — **данные брать оттуда**, перенести 1:1 в `countItems`.

Общие поля: `profession: 'ml-engineer'`, `mode: 'solo'`, `feedback: 'instant'`, `hideIntroModeBadge: true`, `isLast: true`.

---

## Задание 1 — `dataset` · «Data Set» · mechanic `count`

- title: `Data Set`
- duration: 5, order: 1
- intro:
  > Датасеты — это большие наборы информации. Как коллекция фотографий, текстов или цифр, которую компьютеры используют, чтобы учиться распознавать объекты и делать прогнозы.
- instruction:
  > Посчитай все объекты на картинке и введи число. Сравни свою скорость со скоростью искусственного интеллекта!
- steps[0]:
  - countLabel: `автомобили`
  - sampleSize: 5
  - countItems — 30 записей: `image: '/assets/games/ml/dataset/raw/imageN.jpg'`, `segmented: '/assets/games/ml/dataset/segmented/imageN.jpg'`, `actual`, `detected`, `aiTimeMs`, `comment` — из `neuralNetworkData` старого проекта (N = 1..30, поля один в один).
- Поведение (как в старом проекте): показывается фото, рядом экранная цифровая клавиатура (0–9, ⌫) и поле ввода, таймер стартует при показе фото. «Проверить» → экран сравнения: то же фото с разметкой (`segmented`), «Ты: N за M с» vs «Нейросеть: detected за aiTimeMs мс», правильный ответ `actual`, `comment`. «Дальше» → следующее фото. 5 случайных из 30 без повторов. После 5 → `onComplete` с результатами (correct = ответ === actual).
- moral:
  > Человек и ИИ воспринимают мир по-разному. Машины быстро считают, люди лучше понимают необычное. Вместе мы решаем сложные задачи!

---

## Видео раздела
`videos: []` — «Познакомься с ML-инженером»: файла нет, запрошен у заказчика (возможно, это тот же ролик, что отсутствующий `/videos/004/ml-engineer.mp4` в разделе `data`).
