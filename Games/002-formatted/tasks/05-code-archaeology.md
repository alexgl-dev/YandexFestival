---
type: task
id: code-archaeology
title: "Археология кода"
mechanic: match
profession: frontend-developer
duration: 3
mode: solo
order: 5
isLast: true
feedback: onComplete
---

# Intro
На столе разбросаны старые жёсткие диски. На одних сохранились исходники сайтов (фрагменты кода), на других — скриншоты того, как эти сайты выглядели в браузере. За годы хранения данные перепутались, и теперь никто не знает, какой код к какому интерфейсу относится.

Побудь аналитиком и восстанови соответствие между кодом и его визуальным воплощением.

# Instruction
Перед тобой 5 фрагментов кода и 5 картинок.

Внимательно посмотри на код. В нём есть подсказки:
- [HTML]{tooltip: "HyperText Markup Language — язык разметки. Описывает, какие элементы будут на странице: кнопки, поля ввода, картинки, заголовки"} — описывает, какие элементы будут на странице (кнопки, поля, картинки)
- [CSS]{tooltip: "Cascading Style Sheets — каскадные таблицы стилей. Описывает, как элементы будут выглядеть: цвет, размер, отступы, анимации"} — описывает, как они будут выглядеть (цвет, размер, отступы)

Найди для каждого кода его визуальное воплощение — ту картинку, которая получится на экране.

# Steps

## Step 1

### Pairs
- left:
    type: code
    image: /assets/games/002/code-archaeology/code-1.png
    hidden: true
    hintLabel: "Подсказка"
  right:
    type: image
    image: /assets/games/002/code-archaeology/ui-buy-button.png
    label: "Кнопка «Купить» в интернет-магазине"
  explanation: "HTML-тег <button> с классом 'buy' + CSS-стили с зелёным фоном и эффектом при наведении"

- left:
    type: code
    image: /assets/games/002/code-archaeology/code-2.png
    hidden: true
    hintLabel: "Подсказка"
  right:
    type: image
    image: /assets/games/002/code-archaeology/ui-dropdown-menu.png
    label: "Выпадающее меню на сайте"
  explanation: "HTML-список <ul> с вложенными <li> + CSS-стили с display:none/block для показа/скрытия"

- left:
    type: code
    image: /assets/games/002/code-archaeology/code-3.png
    hidden: true
    hintLabel: "Подсказка"
  right:
    type: image
    image: /assets/games/002/code-archaeology/ui-like-animation.png
    label: "Анимация лайка в соцсети"
  explanation: "CSS @keyframes анимация с transform: scale() для эффекта пульсации сердечка"

- left:
    type: code
    image: /assets/games/002/code-archaeology/code-4.png
    hidden: true
    hintLabel: "Подсказка"
  right:
    type: image
    image: /assets/games/002/code-archaeology/ui-login-form.png
    label: "Форма входа с проверкой пароля"
  explanation: "HTML <form> с <input type='password'> + JavaScript-валидация длины пароля"

- left:
    type: code
    image: /assets/games/002/code-archaeology/code-5.png
    hidden: true
    hintLabel: "Подсказка"
  right:
    type: image
    image: /assets/games/002/code-archaeology/ui-product-cards.png
    label: "Карточки товаров с фото и ценой"
  explanation: "HTML-структура с <img> и <span class='price'> + CSS Grid/Flexbox для сетки карточек"

### Scoring
useHint: -1
correctMatch: +2

# Moral
Фронтенд-разработчик — это переводчик между миром кода и миром, который видит пользователь. За каждой красивой кнопкой, анимацией или формой стоят строки HTML, CSS и JavaScript. Научившись читать код, ты начинаешь видеть "скелет" любого сайта — и это первый шаг к тому, чтобы создавать свои!
