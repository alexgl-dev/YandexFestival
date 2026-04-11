---
type: task
id: dataset-sanitizers
title: "Санитары Датасетов"
mechanic: catch
profession: data-analyst
duration: 5
mode: group
order: 1
isLast: false
feedback: instant
---

# Intro
80% времени аналитика уходит на «уборку» данных от мусора. ИИ не сможет учиться, если в базе бардак. Вам нужно очистить базу клиентов интернет-магазина от мусорных данных и подтвердить данные, которые не содержат ошибок.

# Instruction
По конвейеру сверху вниз едут карточки с профилями пользователей. Среди них — мусорные карточки с логическими ошибками.

- Смахни в корзину (свайп влево/вправо) мусорные карточки
- Хорошие карточки не трогай — они сами уходят вниз

Вверху экрана — шкала чистоты данных. Верное смахивание заполняет шкалу, ошибочное — откатывает назад. Скорость конвейера постепенно растёт.

# Steps

## Step 1
prompt: "Очисти базу данных от мусора"

### Objects
- text: "Иван, 25 лет, ivan@mail.ru, Москва"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "Возраст: 150 лет, Анна, anna@gmail.com"
  shouldRemove: true
  explanation: "Возраст 150 лет — явная ошибка в данных. Такого клиента не существует."

- text: "Мария, 33 года, maria@yandex.ru, Казань"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "Имя: 12345, 28 лет, test@test.com"
  shouldRemove: true
  explanation: "Имя состоит из цифр — это мусорные данные, заполненные ботом или по ошибке."

- text: "Сергей, 41 год, sergey@inbox.ru, Новосибирск"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "Email: нет_адреса, Олег, 30 лет, Москва"
  shouldRemove: true
  explanation: "Невалидный email — без корректного адреса невозможно связаться с клиентом."

- text: "Елена, 29 лет, elena@mail.ru, Екатеринбург"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "Город: NaN, Дмитрий, 35 лет, dmitry@gmail.com"
  shouldRemove: true
  explanation: "NaN (Not a Number) — это системная ошибка. Город не определён, данные повреждены."

- text: "Алексей, 22 года, alex@yandex.ru, Самара"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "Возраст: -5 лет, Ника, nika@mail.ru, Сочи"
  shouldRemove: true
  explanation: "Отрицательный возраст — невозможное значение. Ошибка при вводе данных."

- text: "Ольга, 45 лет, olga@rambler.ru, Краснодар"
  shouldRemove: false
  explanation: "Корректный профиль — все данные логичны."

- text: "NULL, NULL, NULL, NULL"
  shouldRemove: true
  explanation: "Все поля пустые (NULL) — абсолютно бесполезная запись."

# Moral
Аналитика начинается с рутины. Если скормить алгоритму ошибку, предсказание будет неверным. Мусор на входе — мусор на выходе.
