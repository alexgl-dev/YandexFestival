---
type: task
id: match-icons
title: "Подбери иконки"
mechanic: categorize
profession: graphic-designer
duration: 3
mode: solo
order: 5
isLast: true
feedback: onComplete
---

# Intro
Тебе предстоит распределить набор из 20 иконок по двум категориям: какие подойдут для приложения "Слушать музыку", а какие — для приложения-навигатора "Карты".

# Steps

## Step 1

### Categories
- id: music
  title: "Слушать музыку"
  image: /assets/games/001/match-icons/app-music.png
- id: maps
  title: "Карты (Навигатор)"
  image: /assets/games/001/match-icons/app-maps.png

### Items
- icon: /assets/games/001/match-icons/icon-note.png
  belongs: [music]
  explanation: "Нотка — символ музыки"
- icon: /assets/games/001/match-icons/icon-geolocation.png
  belongs: [maps]
  explanation: "Геолокация — ключевая функция навигатора"
- icon: /assets/games/001/match-icons/icon-headphones.png
  belongs: [music]
  explanation: "Наушники ассоциируются с прослушиванием"
- icon: /assets/games/001/match-icons/icon-route.png
  belongs: [maps]
  explanation: "Маршрут — основа навигации"
- icon: /assets/games/001/match-icons/icon-search.png
  belongs: [music, maps]
  explanation: "Поиск — универсальная иконка, подходит обоим"
- icon: /assets/games/001/match-icons/icon-star.png
  belongs: [music, maps]
  explanation: "Звёздочка (избранное) — нужна в обоих приложениях"
- icon: /assets/games/001/match-icons/icon-settings.png
  belongs: [music, maps]
  explanation: "Настройки — универсальная иконка"
- icon: /assets/games/001/match-icons/icon-share.png
  belongs: [music, maps]
  explanation: "Поделиться — универсальная иконка"

<!-- TODO: дополнить до 20 иконок с финальным набором ассетов -->

# Moral
Графический дизайнер — это тот, кто помогает людям интуитивно находить нужное, делая приложения не только красивыми, но и понятными без слов! Попробуй написать фразу "иконками" и проверь: получится ли у друзей её отгадать.
