import { useState } from 'react';
import {
  Button,
  Card,
  Icon,
  IconButton,
  InfoButton,
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
  Message,
  SlideIndicator,
} from '../../components/ui';
import { CalendarGame } from '../shared/games/CalendarGame';
import { CalendarGamePortrait } from '../shared/games/CalendarGamePortrait';
import { CalendarDayPortrait } from '../shared/games/CalendarDayPortrait';
import type { Task } from '../../types/game';
import { GameInstruction } from '../shared/GameInstruction';
import { StagePreview } from './StagePreview';
import { TaskPlayground } from './TaskPlayground';
import styles from './TestScreen.module.css';

const CALENDAR_DAY_MOCK = {
  day: { id: 'mon', abbr: 'Пн', date: '14 марта' },
  cards: [
    { id: 'a1', title: 'Созвон с командой', durationSlots: 1, tooltip: '30 минут — ежедневный стендап', anchorDay: 'mon', anchorStartSlot: 0 },
    { id: 'a2', title: 'Подготовка презентации для хурала', durationSlots: 6, tooltip: '3 часа', anchorDay: 'mon', anchorStartSlot: 2 },
    { id: 'a3', title: 'Инструктаж для стажёра', durationSlots: 2, tooltip: '1 час', anchorDay: 'mon', anchorStartSlot: 10 },
    { id: 'a4', title: 'Пробежка с беговым клубом Яндекса', durationSlots: 4, tooltip: '2 часа', anchorDay: 'mon', anchorStartSlot: 13 },
  ],
};

const CALENDAR_MOCK_TASK: Task = {
  id: 'preview',
  title: 'Календарь',
  mechanic: 'calendar' as never,
  profession: 'management',
  duration: 5,
  mode: 'group' as never,
  order: 1,
  isLast: false,
  feedback: {} as never,
  intro: '',
  moral: '',
  steps: [{
    calendarCards: [
      { id: 'c1', title: 'Созвон с разработчиком Петей', durationSlots: 1, tooltip: '30 минут', validDays: ['mon'] },
      { id: 'c2', title: 'Подготовка презентации для хурала', durationSlots: 6, tooltip: '3 часа', validDays: ['mon', 'tue'] },
      { id: 'c3', title: 'Встреча с дизайнером Светой', durationSlots: 2, tooltip: '1 час', validDays: ['tue'] },
      { id: 'c4', title: 'Бронирование переговорки для технического теста', durationSlots: 4, tooltip: '2 часа', validDays: ['wed'] },
      { id: 'c5', title: 'Инструктаж для стажёра', durationSlots: 2, tooltip: '1 час', validDays: ['mon', 'tue', 'wed'] },
    ],
  }],
};

function Code({ children }: { children: string }) {
  return <code className={styles.codeTag}>{children}</code>;
}

export function TestScreen() {
  const [showPopUp, setShowPopUp] = useState(false);

  return (
    <div className={styles.page}>
      {/* 1. Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>UI Kit Preview</h1>
      </div>
      <nav className={styles.toc}>
          <a href="#sec-badge" className={styles.tocLink}>Badge</a>
          <a href="#sec-button" className={styles.tocLink}>Button</a>
          <a href="#sec-card-size-l" className={styles.tocLink}>Card size="l"</a>
          <a href="#sec-listitem" className={styles.tocLink}>ListItem</a>
          <a href="#sec-player" className={styles.tocLink}>Player</a>
          <a href="#sec-player-orientation-vertical" className={styles.tocLink}>Player orientation="vertical"</a>
          <a href="#sec-popup" className={styles.tocLink}>PopUp</a>
          <a href="#sec-icon" className={styles.tocLink}>Icon</a>
          <a href="#sec-iconbutton" className={styles.tocLink}>IconButton</a>
          <a href="#sec-infobutton" className={styles.tocLink}>InfoButton</a>
          <a href="#sec-checklist" className={styles.tocLink}>CheckList</a>
          <a href="#sec-progressbar" className={styles.tocLink}>ProgressBar</a>
          <a href="#sec-message" className={styles.tocLink}>Message</a>
          <a href="#sec-illustration" className={styles.tocLink}>Illustration</a>
          <a href="#sec-container" className={styles.tocLink}>Container</a>
          <a href="#sec-calendar" className={styles.tocLink}>Calendar*</a>
          <a href="#sec-background" className={styles.tocLink}>Background</a>
          <a href="#sec-menu" className={styles.tocLink}>Menu</a>
          <a href="#sec-gameinstruction" className={styles.tocLink}>GameInstruction</a>
          <a href="#sec-tasks" className={styles.tocLink}>Задания</a>
      </nav>

      {/* 2. Badges */}
      <div className={styles.section} id="sec-badge">
        <h2 className={styles.sectionTitle}>Badge</h2>
        <div className={styles.buttonsRow}>
          <div className={styles.labeled}>
            <Badge
              label="Групповое"
              type="filled"
              icon={<Icon name="people" color="white" size="xs" />}
            />
            <Code>{'<Badge label="Групповое" type="filled" icon={<Icon name="people" color="white" size="xs" />} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Badge label="Групповое" type="filled_pill" />
            <Code>{'<Badge label="Групповое" type="filled_pill" />  // Figma filled 2: pill, Medium'}</Code>
          </div>
          <div className={styles.labeled}>
            <Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />
            <Code>{'<Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Badge label="5 минут" type="filled" icon={<Icon name="clock" color="white" size="xs" />} />
            <Code>{'<Badge label="5 минут" type="filled" icon={<Icon name="clock" color="white" size="xs" />} />'}</Code>
          </div>
        </div>
      </div>

      {/* 3. Buttons */}
      <div className={styles.section} id="sec-button">
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.buttonsRow}>
          <div className={styles.labeled}>
            <Button label="Основная" type="main" onClick={() => {}} />
            <Code>{'<Button label="Основная" type="main" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Вторичная" type="secondary" onClick={() => {}} />
            <Code>{'<Button label="Вторичная" type="secondary" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.whitePlate}>
              <Button label="Контурная" type="outline" onClick={() => {}} />
            </div>
            <Code>{'<Button label="Контурная" type="outline" />  // для белых плашек'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.whitePlate}>
              <Button label="Большая" type="big" onClick={() => {}} />
            </div>
            <Code>{'<Button label="Большая" type="big" />  // бордер чёрный, pressed — чёрная'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Описание" type="big_bottom" onClick={() => {}} />
            <Code>{'<Button label="Описание" type="big_bottom" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Нажатая" type="main" pressed onClick={() => {}} />
            <Code>{'<Button label="Нажатая" type="main" pressed />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Графический дизайнер" type="main" arrow onClick={() => {}} />
            <Code>{'<Button label="..." type="main" arrow />  // Icon=Yes'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.whitePlate}>
              <Button label="Пропустить задание" type="big" arrow onClick={() => {}} />
            </div>
            <Code>{'<Button label="Пропустить задание" type="big" arrow />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Смотреть" type="big_white" onClick={() => {}} />
            <Code>{'<Button label="Смотреть" type="big_white" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Смотреть" type="big_blue" onClick={() => {}} />
            <Code>{'<Button label="Смотреть" type="big_blue" />  // primary в PopUp'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Согласен" type="big_bottom" icon={<Icon name="done" color="blue" size="m" />} onClick={() => {}} />
            <Code>{'<Button label="Согласен" type="big_bottom" icon={<Icon name="done" color="blue" size="m" />} />'}</Code>
          </div>
        </div>
      </div>

      {/* 4. Cards L */}
      <div className={styles.section} id="sec-card-size-l">
        <h2 className={styles.sectionTitle}>Card size="l"</h2>
        <div className={styles.cardsRow}>
          <div className={styles.labeled}>
            <Card
              variant="ВАРИАНТ А"
              title="Яркий и игривый"
              description="Пастельные цвета, круглые формы, большие буквы"
              hint="Нажми, чтобы выбрать"
              state="default"
              size="l"
              onClick={() => {}}
            />
            <Code>{'<Card variant="..." title="..." description="..." hint="..." state="default" size="l" />  // Figma 28:525'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card
              variant="ВАРИАНТ А"
              title="Яркий и игривый"
              description="Пастельные цвета, круглые формы"
              hint="Нажми, чтобы выбрать"
              state="disabled"
              size="l"
            />
            <Code>{'<Card ... state="disabled" size="l" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card
              variant="ВАРИАНТ В"
              title="Верно!"
              description="Легкость и веселье отлично передают атмосферу мороженого"
              state="flipped"
              size="l"
              onClick={() => {}}
            />
            <Code>{'<Card ... state="flipped" size="l" />  // Figma 28:542'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card
              variant="ВАРИАНТ С"
              title="Не совсем..."
              description="Этот вариант не подходит для данного события"
              state="wrong"
              size="l"
              onClick={() => {}}
            />
            <Code>{'<Card ... state="wrong" size="l" />'}</Code>
          </div>
        </div>

        <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Card size="m"</h2>
        <div className={styles.cardsRow} style={{ flexDirection: 'column', gap: 16, gridTemplateColumns: '1fr', maxWidth: 884 }}>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Фото — есть посмотри внимательнее на страницу товара" state="default" size="m" onClick={() => {}} />
            <Code>{'<Card variant="..." title="..." description="..." state="default" size="m" />  // Figma 28:549'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Фото — есть посмотри внимательнее на страницу товара" state="disabled" size="m" />
            <Code>{'<Card ... state="disabled" size="m" />  // Figma 28:557'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Фото — есть посмотри внимательнее на страницу товара" state="pressed" size="m" onClick={() => {}} />
            <Code>{'<Card ... state="pressed" size="m" />  // Figma 28:565'}</Code>
          </div>
        </div>
      </div>

      {/* 5. ListItems */}
      <div className={styles.section} id="sec-listitem">
        <h2 className={styles.sectionTitle}>ListItem</h2>
        <div className={styles.listItems}>
          <div className={styles.labeled}>
            <ListItem title="Афиша" duration="5 минут" showPeople state="default" onClick={() => {}} />
            <Code>{'<ListItem title="Афиша" duration="5 минут" showPeople state="default" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ListItem title="Интервью с художником" duration="12 минут" state="default" onClick={() => {}} />
            <Code>{'<ListItem title="..." duration="12 минут" state="default" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ListItem title="Нажатый элемент" duration="3 минут" showPeople state="pressed" onClick={() => {}} />
            <Code>{'<ListItem title="..." duration="3 минут" showPeople state="pressed" />'}</Code>
          </div>
        </div>
        <div className={styles.labeled} style={{ marginTop: 24 }}>
          <ListItem
            size="l"
            badge="Фишинг"
            title="Срочно: подтвердите данные карты"
            description="support@sberbank-security-alert.ru"
            icon={<Icon name="close" color="blue" size="m" />}
            onClick={() => {}}
          />
          <Code>{'<ListItem size="l" badge="Фишинг" title="..." description="..." icon={<Icon name="close" color="blue" size="m" />} />  // Figma 28:481'}</Code>
        </div>
      </div>

      {/* 6. Player */}
      <div className={styles.section} id="sec-player">
        <h2 className={styles.sectionTitle}>Player</h2>
        <div className={styles.playerWrap} style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="default" orientation="horizontal" onPlay={() => {}} />
            <Code>{'<Player title="..." state="default" orientation="horizontal" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="playing" orientation="horizontal" currentTime="01:23" totalTime="03:45" progress={38} onPause={() => {}} />
            <Code>{'<Player title="..." state="playing" currentTime="01:23" totalTime="03:45" progress={38} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="fullscreen" orientation="horizontal" />
            <Code>{'<Player title="..." state="fullscreen" orientation="horizontal" />'}</Code>
          </div>
        </div>
      </div>

      {/* 6b. Player Vertical */}
      <div className={styles.section} id="sec-player-orientation-vertical">
        <h2 className={styles.sectionTitle}>Player orientation="vertical"</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="default" orientation="vertical" onPlay={() => {}} />
            <Code>{'<Player title="..." state="default" orientation="vertical" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="playing" orientation="vertical" currentTime="01:23" totalTime="03:45" progress={38} onPause={() => {}} />
            <Code>{'<Player title="..." state="playing" orientation="vertical" progress={38} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Player title="Графический дизайнер" state="fullscreen" orientation="vertical" />
            <Code>{'<Player title="..." state="fullscreen" orientation="vertical" />'}</Code>
          </div>
        </div>
      </div>

      {/* 7. PopUp trigger */}
      <div className={styles.section} id="sec-popup">
        <h2 className={styles.sectionTitle}>PopUp</h2>
        <div className={styles.labeled} style={{ marginBottom: 32 }}>
          <PopUp
            icon="close"
            title="Не совсем..."
            description={'Фото — есть посмотри внимательнее\nна страницу товара'}
            buttonLabel="Попробовать снова"
            secondaryButtonLabel="Отменить"
            onButtonClick={() => {}}
            onSecondaryButtonClick={() => {}}
            onClose={() => {}}
          />
          <Code>{'<PopUp icon="close" title="Не совсем..." description="..." buttonLabel="Попробовать снова" secondaryButtonLabel="Отменить" onClose={...} />  // Figma 28:574 Type=White'}</Code>
        </div>
        <Button label="Показать попап в оверлее" type="main" onClick={() => setShowPopUp(true)} />
        <Code>{'<PopUp icon="close" iconColor="red" title="..." description="..." buttonLabel="Попробовать снова" />'}</Code>
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

      {/* 8. Icons */}
      <div className={styles.section} id="sec-icon">
        <h2 className={styles.sectionTitle}>Icon</h2>
        <div className={styles.iconsRow}>
          <div className={styles.iconLabel}>
            <Icon name="done" color="blue" size="m" />
            <Code>{'<Icon name="done" color="blue" size="m" />'}</Code>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="close" color="red" size="m" />
            <Code>{'<Icon name="close" color="red" size="m" />'}</Code>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="people" color="blue" size="xs" />
            <Code>{'<Icon name="people" color="blue" size="xs" />'}</Code>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="clock" color="blue" size="xs" />
            <Code>{'<Icon name="clock" color="blue" size="xs" />'}</Code>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="done" color="white" size="s" />
            <Code>{'<Icon name="done" color="white" size="s" />'}</Code>
          </div>
          <div className={styles.iconLabel}>
            <Icon name="close" color="red" size="s" />
            <Code>{'<Icon name="close" color="red" size="s" />'}</Code>
          </div>
        </div>
      </div>

      {/* 9. IconButtons */}
      <div className={styles.section} id="sec-iconbutton">
        <h2 className={styles.sectionTitle}>IconButton</h2>
        <div className={styles.iconButtonsRow}>
          <div className={styles.labeled}>
            <IconButton type="back" size="lg" onClick={() => {}} />
            <Code>{'<IconButton type="back" size="lg" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <IconButton type="back" variant="light" size="lg" onClick={() => {}} />
            <Code>{'<IconButton type="back" variant="light" size="lg" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <IconButton type="play" size="sm" onClick={() => {}} />
            <Code>{'<IconButton type="play" size="sm" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <IconButton type="pause" size="sm" onClick={() => {}} />
            <Code>{'<IconButton type="pause" size="sm" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <IconButton type="back" pressed onClick={() => {}} />
            <Code>{'<IconButton type="back" pressed />'}</Code>
          </div>
          <div className={styles.labeled}>
            <IconButton type="close" onClick={() => {}} />
            <Code>{'<IconButton type="close" />'}</Code>
          </div>
        </div>
      </div>

      {/* 9b. InfoButton */}
      <div className={styles.section} id="sec-infobutton">
        <h2 className={styles.sectionTitle}>InfoButton</h2>
        <div className={styles.iconButtonsRow}>
          <div className={styles.labeled}>
            <InfoButton size="sm" variant="dark" onClick={() => {}} />
            <Code>{'<InfoButton size="sm" variant="dark" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <InfoButton size="md" variant="dark" onClick={() => {}} />
            <Code>{'<InfoButton size="md" variant="dark" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <InfoButton size="lg" variant="dark" onClick={() => {}} />
            <Code>{'<InfoButton size="lg" variant="dark" />'}</Code>
          </div>
          <div className={styles.labeled} style={{ background: '#4161FF', padding: 16, borderRadius: 16 }}>
            <InfoButton size="sm" variant="ghost" onClick={() => {}} />
            <Code>{'<InfoButton size="sm" variant="ghost" />'}</Code>
          </div>
          <div className={styles.labeled} style={{ background: '#4161FF', padding: 16, borderRadius: 16 }}>
            <InfoButton size="md" variant="ghost" onClick={() => {}} />
            <Code>{'<InfoButton size="md" variant="ghost" />'}</Code>
          </div>
          <div className={styles.labeled} style={{ background: '#4161FF', padding: 16, borderRadius: 16 }}>
            <InfoButton size="lg" variant="ghost" onClick={() => {}} />
            <Code>{'<InfoButton size="lg" variant="ghost" />'}</Code>
          </div>
        </div>
      </div>

      {/* 10. CheckList */}
      <div className={styles.section} id="sec-checklist">
        <h2 className={styles.sectionTitle}>CheckList</h2>
        <div className={styles.checklistRow}>
          <div className={styles.labeled}>
            <div className={styles.checklistItem}>
              <CheckList checked />
              <span>Задача выполнена</span>
            </div>
            <Code>{'<CheckList checked />'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.checklistItem}>
              <CheckList checked={false} />
              <span>Задача не выполнена</span>
            </div>
            <Code>{'<CheckList checked={false} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.checklistItem}>
              <CheckList checked type="black" />
              <CheckList checked={false} type="black" />
              <span>Type=Black</span>
            </div>
            <Code>{'<CheckList checked type="black" />'}</Code>
          </div>
        </div>
      </div>

      {/* 11. ProgressBar */}
      <div className={styles.section} id="sec-progressbar">
        <h2 className={styles.sectionTitle}>ProgressBar</h2>
        <div className={styles.progressBars}>
          <div className={styles.labeled}>
            <ProgressBar type="mini" progress={60} />
            <Code>{'<ProgressBar type="mini" progress={60} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ProgressBar type="mini" progress={59} segments={4} current={2} />
            <Code>{'<ProgressBar type="mini" progress={59} segments={4} current={2} />  // Figma Mini: Slide Indicator × 4'}</Code>
          </div>
          <div className={styles.labeled}>
            <ProgressBar type="main" progress={50} label="Загрузка данных 50%" />
            <Code>{'<ProgressBar type="main" progress={50} label="Загрузка данных 50%" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <div className={styles.iconsRow}>
              <SlideIndicator state="default" />
              <SlideIndicator state="progress" progress={59} />
              <SlideIndicator state="filled" />
            </div>
            <Code>{'<SlideIndicator state="default | progress | filled" progress={59} />'}</Code>
          </div>
        </div>
      </div>

      {/* 11b. Message */}
      <div className={styles.section} id="sec-message">
        <h2 className={styles.sectionTitle}>Message</h2>
        <div className={styles.labeled}>
          <Message title="Заголовок" description="Подготовка инструментов" />
          <Code>{'<Message title="Заголовок" description="Подготовка инструментов" />  // Figma 28:396'}</Code>
        </div>
      </div>

      {/* 12. Illustrations */}
      <div className={styles.section} id="sec-illustration">
        <h2 className={styles.sectionTitle}>Illustration</h2>
        <div className={styles.illustrationsRow}>
          <div className={styles.labeled}>
            <Illustration type="laptop" size={250} />
            <Code>{'<Illustration type="laptop" size={250} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Illustration type="mouse-red" size={200} />
            <Code>{'<Illustration type="mouse-red" size={200} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Illustration type="keyboard-stickers" size={250} />
            <Code>{'<Illustration type="keyboard-stickers" size={250} />'}</Code>
          </div>
        </div>
        <h3 className={styles.subTitle}>Figma: линейные иллюстрации 160×160 (чёрные, на светлом фоне)</h3>
        <div className={styles.illustrationsRow} style={{ background: 'var(--color-white)', padding: 24, borderRadius: 24 }}>
          {(['bag', 'calculator', 'calendar', 'computer', 'cup', 'faces', 'hanger', 'hoodie', 'horse', 'negative', 'people', 'percent', 'playstation', 'positive', 'projector', 'thumbs-up', 'wand', 'wc'] as const).map((t) => (
            <div key={t} className={styles.iconLabel} style={{ color: 'var(--color-grey-dark)' }}>
              <Illustration type={t} size={120} />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <Code>{'<Illustration type="bag" />  // 18 типов из Figma, size по умолчанию 160'}</Code>
      </div>

      {/* 13. Container */}
      <div className={styles.section} id="sec-container">
        <h2 className={styles.sectionTitle}>Container</h2>
        <div className={styles.containerRow}>
          <div className={styles.labeled}>
            <Container size="m" state="default" />
            <Code>{'<Container size="m" state="default" />  // синяя, «Открыть приложение»'}</Code>
          </div>
          <div className={styles.labeled}>
            <Container size="m" state="empty" />
            <Code>{'<Container size="m" state="empty" />  // серый бордер'}</Code>
          </div>
          <div className={styles.labeled}>
            <Container size="l" state="empty" />
            <Code>{'<Container size="l" state="empty" />  // пунктир, «Перетащи сюда ненужные шаги»'}</Code>
          </div>
        </div>
      </div>

      {/* 14. Календарные игры */}
      <div className={styles.section} id="sec-calendar">
        <h2 className={styles.sectionTitle}>CalendarGame / CalendarGamePortrait / CalendarDayPortrait</h2>
        <div className={styles.stagesRow}>
          <div className={styles.labeled}>
            <StagePreview orientation="landscape" width={960}>
              <CalendarGame task={CALENDAR_MOCK_TASK} theme="cobalt" onComplete={() => {}} onBack={() => {}} />
            </StagePreview>
            <Code>{'<CalendarGame task={task} theme="cobalt" onComplete={...} onBack={...} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <StagePreview orientation="portrait" width={360}>
              <CalendarGamePortrait task={CALENDAR_MOCK_TASK} theme="orange" onComplete={() => {}} onBack={() => {}} />
            </StagePreview>
            <Code>{'<CalendarGamePortrait task={task} theme="orange" onComplete={...} onBack={...} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <StagePreview orientation="portrait" width={360}>
              <CalendarDayPortrait cards={CALENDAR_DAY_MOCK.cards as never} theme="orange" onBack={() => {}} />
            </StagePreview>
            <Code>{'<CalendarDayPortrait day={day} cards={cards} theme="orange" onBack={...} />'}</Code>
          </div>
        </div>
      </div>

      {/* 15. Background */}
      <div className={styles.section} id="sec-background">
        <h2 className={styles.sectionTitle}>Background</h2>
        <div className={styles.stagesRow}>
          <div className={styles.labeled}>
            <StagePreview orientation="landscape" width={640}>
              <Background theme="cobalt" orientation="landscape" onBack={() => {}}>
                <span className={styles.stageLabel}>cobalt · landscape</span>
              </Background>
            </StagePreview>
            <Code>{'<Background theme="cobalt" orientation="landscape" onBack={...}>{children}</Background>'}</Code>
          </div>
          <div className={styles.labeled}>
            <StagePreview orientation="portrait" width={360}>
              <Background theme="orange" orientation="portrait" onBack={() => {}}>
                <span className={styles.stageLabel}>orange · portrait</span>
              </Background>
            </StagePreview>
            <Code>{'<Background theme="orange" orientation="portrait" onBack={...}>{children}</Background>'}</Code>
          </div>
        </div>
      </div>

      {/* 16. Menu */}
      <div className={styles.section} id="sec-menu">
        <h2 className={styles.sectionTitle}>Menu</h2>
        <div className={styles.stagesRow}>
          <div className={styles.labeled}>
            <StagePreview orientation="landscape" width={640}>
              <Menu
                theme="cobalt"
                orientation="landscape"
                onBack={() => {}}
                items={[
                  { label: 'Описание направления' },
                  { label: 'Задачи на день' },
                  { label: 'Истории яндексоидов' },
                  { label: 'Бинго-знакомство' },
                ]}
              />
            </StagePreview>
            <Code>{'<Menu theme="cobalt" orientation="landscape" onBack={...} items={[{ label, onClick }, ...]} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <StagePreview orientation="portrait" width={360}>
              <Menu
                theme="orange"
                orientation="portrait"
                items={[
                  { label: 'Тифлокомментарий' },
                  { label: 'Альтернативный текст' },
                  { label: 'Глазами другого' },
                ]}
              />
            </StagePreview>
            <Code>{'<Menu theme="orange" orientation="portrait" items={[...]} />  // без onBack — нет кнопки назад'}</Code>
          </div>
        </div>
      </div>

      {/* 17. GameInstruction */}
      <div className={styles.section} id="sec-gameinstruction">
        <h2 className={styles.sectionTitle}>GameInstruction</h2>
        <div className={styles.stagesRow}>
          <div className={styles.labeled}>
            <StagePreview orientation="landscape" width={640}>
              <Background theme="cobalt" orientation="landscape" onBack={() => {}}>
                <GameInstruction instruction="Перетащи задачи к нужному специалисту. Нажми «Начать», чтобы закрыть подсказку — она снова откроется по кнопке «i»." />
              </Background>
            </StagePreview>
            <Code>{'<GameInstruction instruction="..." />  // внутри Background; InfoButton открывает оверлей повторно'}</Code>
          </div>
        </div>
      </div>

      {/* 18. Задания: intro → игра → мораль → результат */}
      <div className={styles.section} id="sec-tasks">
        <h2 className={styles.sectionTitle}>Задания (TaskIntro → GameRouter → TaskMoral / TaskResult)</h2>
        <TaskPlayground />
      </div>
    </div>
  );
}
