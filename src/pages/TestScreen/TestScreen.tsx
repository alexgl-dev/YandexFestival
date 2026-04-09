import { useState } from 'react';
import {
  Button,
  Card,
  Icon,
  IconButton,
  Badge,
  ListItem,
  Player,
  PopUp,
  CheckList,
  ProgressBar,
  Illustration,
  Container,
  Background,
  Menu,
} from '../../components/ui';
import styles from './TestScreen.module.css';

export function TestScreen() {
  const [showPopUp, setShowPopUp] = useState(false);

  return (
    <div className={styles.page}>
      {/* 1. Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>UI Kit Preview</h1>
        <Badge
          label="Групповое"
          type="filled"
          icon={<Icon name="people" color="white" size="xs" />}
        />
        <Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />
      </div>

      {/* 2. Buttons */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Кнопки</h2>
        <div className={styles.buttonsRow}>
          <Button
            label="Основная"
            type="main"
            onClick={() => console.log('main')}
          />
          <Button
            label="Вторичная"
            type="secondary"
            onClick={() => console.log('secondary')}
          />
          <Button
            label="Контурная"
            type="outline"
            onClick={() => console.log('outline')}
          />
          <Button
            label="Большая"
            type="big"
            icon={<Icon name="done" color="white" size="s" />}
            onClick={() => console.log('big')}
          />
          <Button
            label="Описание"
            type="big_bottom"
            onClick={() => console.log('big_bottom')}
          />
          <Button
            label="Нажатая"
            type="main"
            pressed
            onClick={() => console.log('pressed')}
          />
        </div>
      </div>

      {/* 3. Cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Карточки</h2>
        <div className={styles.cardsRow}>
          <Card
            variant="ВАРИАНТ А"
            title="Яркий и игривый"
            description="Пастельные цвета, круглые формы, большие буквы"
            hint="Нажми, чтобы выбрать"
            state="default"
            size="l"
            onClick={() => console.log('card default')}
          />
          <Card
            variant="ВАРИАНТ А"
            title="Яркий и игривый"
            description="Пастельные цвета, круглые формы, большие буквы"
            hint="Нажми, чтобы выбрать"
            state="disabled"
            size="l"
          />
          <Card
            variant="ВАРИАНТ В"
            title="Минимализм"
            description="Чистые формы, много воздуха, акцентный цвет"
            state="flipped"
            size="l"
            onClick={() => console.log('card flipped')}
          />
        </div>
        <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Карточки M</h2>
        <div className={styles.cardsRow} style={{ flexDirection: 'column', gap: 16 }}>
          <Card
            variant="ВАРИАНТ А"
            title="Заголовок"
            description="Фото — есть посмотри внимательнее на страницу товара"
            state="default"
            size="m"
            onClick={() => console.log('card m default')}
          />
          <Card
            variant="ВАРИАНТ А"
            title="Заголовок"
            description="Фото — есть посмотри внимательнее на страницу товара"
            state="disabled"
            size="m"
          />
          <Card
            variant="ВАРИАНТ А"
            title="Заголовок"
            description="Фото — есть посмотри внимательнее на страницу товара"
            state="pressed"
            size="m"
            onClick={() => console.log('card m pressed')}
          />
        </div>
      </div>

      {/* 4. ListItems */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Элементы списка</h2>
        <div className={styles.listItems}>
          <ListItem
            title="Афиша"
            duration="5 мин"
            showPeople
            state="default"
            onClick={() => console.log('list item 1')}
          />
          <ListItem
            title="Интервью с художником"
            duration="12 мин"
            state="default"
            onClick={() => console.log('list item 2')}
          />
          <ListItem
            title="Нажатый элемент"
            duration="3 мин"
            showPeople
            state="pressed"
            onClick={() => console.log('list item 3')}
          />
        </div>
      </div>

      {/* 5. Player */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Плеер</h2>
        <div className={styles.playerWrap} style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Player
            title="Графический дизайнер"
            state="default"
            orientation="horizontal"
            onPlay={() => console.log('play')}
          />
          <Player
            title="Графический дизайнер"
            state="playing"
            orientation="horizontal"
            currentTime="01:23"
            totalTime="03:45"
            progress={38}
            onPause={() => console.log('pause')}
          />
          <Player
            title="Графический дизайнер"
            state="fullscreen"
            orientation="horizontal"
          />
        </div>
      </div>

      {/* 6. PopUp trigger */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Всплывающее окно</h2>
        <Button
          label="Показать попап"
          type="main"
          onClick={() => setShowPopUp(true)}
        />
      </div>

      {showPopUp && (
        <div className={styles.overlay} onClick={() => setShowPopUp(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <PopUp
              icon="close"
              iconColor="red"
              title="Не совсем..."
              description="Фото — есть, посмотри внимательнее на страницу товара"
              buttonLabel="Попробовать снова"
              onButtonClick={() => setShowPopUp(false)}
            />
          </div>
        </div>
      )}

      {/* 7. Icons */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Иконки</h2>
        <div className={styles.iconsRow}>
          <div className={styles.iconLabel}>
            <Icon name="done" color="blue" size="m" />
            <span>done / blue / m</span>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="close" color="red" size="m" />
            <span>close / red / m</span>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="people" color="blue" size="xs" />
            <span>people / blue / xs</span>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="clock" color="blue" size="xs" />
            <span>clock / blue / xs</span>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="done" color="white" size="s" />
            <span>done / white / s</span>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="close" color="red" size="s" />
            <span>close / red / s</span>
          </div>
        </div>
      </div>

      {/* 7b. IconButtons */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Кнопки-иконки</h2>
        <div className={styles.iconButtonsRow}>
          <IconButton type="back" size="lg" onClick={() => console.log('back')} />
          <IconButton type="play" size="sm" onClick={() => console.log('play')} />
          <IconButton type="pause" size="sm" onClick={() => console.log('pause')} />
        </div>
      </div>

      {/* 8. CheckList */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Чеклист</h2>
        <div className={styles.checklistRow}>
          <div className={styles.checklistItem}>
            <CheckList checked />
            <span>Задача выполнена</span>
          </div>
          <div className={styles.checklistItem}>
            <CheckList checked={false} />
            <span>Задача не выполнена</span>
          </div>
          <div className={styles.checklistItem}>
            <CheckList checked />
            <span>Ещё одна готова</span>
          </div>
        </div>
      </div>

      {/* 9. ProgressBar */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Прогресс-бар</h2>
        <div className={styles.progressBars}>
          <div>
            <div className={styles.progressLabel}>Mini (60%)</div>
            <ProgressBar type="mini" progress={60} />
          </div>
          <div>
            <div className={styles.progressLabel}>Mini (25%)</div>
            <ProgressBar type="mini" progress={25} />
          </div>
          <div>
            <div className={styles.progressLabel}>Main (45%)</div>
            <ProgressBar type="main" progress={45} currentTime="01:23" totalTime="03:45" />
          </div>
        </div>
      </div>

      {/* 10. Illustrations */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Иллюстрации</h2>
        <div className={styles.illustrationsRow}>
          <Illustration type="laptop" size={250} />
          <Illustration type="mouse-red" size={200} />
          <Illustration type="keyboard-stickers" size={250} />
        </div>
      </div>

      {/* 11. Container */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Контейнеры</h2>
        <div className={styles.containerRow}>
          <Container size="m" state="default">
            <span style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)' }}>
              Контейнер с содержимым (M)
            </span>
          </Container>
          <Container size="l" state="empty" />
        </div>
      </div>

      {/* 12. Background + Menu */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Фоны и меню</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
            <Background theme="cobalt" orientation="landscape" onBack={() => console.log('back')}>
              <span style={{ color: 'white', fontSize: 48, fontFamily: 'var(--font-family)' }}>Фон Кобальт</span>
            </Background>
          </div>
          <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
            <Background theme="orange" orientation="landscape" onBack={() => console.log('back')}>
              <span style={{ color: 'white', fontSize: 48, fontFamily: 'var(--font-family)' }}>Фон Оранжевый</span>
            </Background>
          </div>
        </div>
        <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Меню</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
            <Menu
              theme="cobalt"
              orientation="landscape"
              items={[
                { label: 'Описание направления', onClick: () => console.log('desc') },
                { label: 'Мои задания', onClick: () => console.log('tasks') },
                { label: 'Истории яндексоидов', onClick: () => console.log('stories') },
                { label: 'Бинго-знакомство', onClick: () => console.log('bingo') },
              ]}
            />
          </div>
          <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
            <Menu
              theme="orange"
              orientation="landscape"
              items={[
                { label: 'Описание направления', onClick: () => console.log('desc') },
                { label: 'Мои задания', onClick: () => console.log('tasks') },
                { label: 'Истории яндексоидов', onClick: () => console.log('stories') },
                { label: 'Бинго-знакомство', onClick: () => console.log('bingo') },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
