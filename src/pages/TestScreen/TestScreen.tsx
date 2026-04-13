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

      {/* 2. Badges */}
      <div className={styles.section}>
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
            <Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />
            <Code>{'<Badge label="Групповое" type="outline" icon={<Icon name="people" color="blue" size="xs" />} />'}</Code>
          </div>
        </div>
      </div>

      {/* 3. Buttons */}
      <div className={styles.section}>
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
            <Button label="Контурная" type="outline" onClick={() => {}} />
            <Code>{'<Button label="Контурная" type="outline" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Большая" type="big" icon={<Icon name="done" color="white" size="s" />} onClick={() => {}} />
            <Code>{'<Button label="Большая" type="big" icon={<Icon name="done" color="white" size="s" />} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Описание" type="big_bottom" onClick={() => {}} />
            <Code>{'<Button label="Описание" type="big_bottom" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Button label="Нажатая" type="main" pressed onClick={() => {}} />
            <Code>{'<Button label="Нажатая" type="main" pressed />'}</Code>
          </div>
        </div>
      </div>

      {/* 4. Cards L */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Card size="l"</h2>
        <div className={styles.cardsRow}>
          <div className={styles.labeled}>
            <Card
              variant="ВАРИАНТ А"
              title="Яркий и игривый"
              description="Пастельные цвета, круглые формы"
              hint="Нажми, чтобы выбрать"
              state="default"
              size="l"
              onClick={() => {}}
            />
            <Code>{'<Card variant="..." title="..." description="..." hint="..." state="default" size="l" />'}</Code>
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
              title="Минимализм"
              description="Чистые формы, много воздуха"
              state="flipped"
              size="l"
              onClick={() => {}}
            />
            <Code>{'<Card ... state="flipped" size="l" />'}</Code>
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
        <div className={styles.cardsRow} style={{ flexDirection: 'column', gap: 16, gridTemplateColumns: '1fr' }}>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Описание карточки" state="default" size="m" onClick={() => {}} />
            <Code>{'<Card variant="..." title="..." description="..." state="default" size="m" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Описание карточки" state="disabled" size="m" />
            <Code>{'<Card ... state="disabled" size="m" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <Card variant="ВАРИАНТ А" title="Заголовок" description="Описание карточки" state="pressed" size="m" onClick={() => {}} />
            <Code>{'<Card ... state="pressed" size="m" />'}</Code>
          </div>
        </div>
      </div>

      {/* 5. ListItems */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>ListItem</h2>
        <div className={styles.listItems}>
          <div className={styles.labeled}>
            <ListItem title="Афиша" duration="5 мин" showPeople state="default" onClick={() => {}} />
            <Code>{'<ListItem title="Афиша" duration="5 мин" showPeople state="default" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ListItem title="Интервью с художником" duration="12 мин" state="default" onClick={() => {}} />
            <Code>{'<ListItem title="..." duration="12 мин" state="default" />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ListItem title="Нажатый элемент" duration="3 мин" showPeople state="pressed" onClick={() => {}} />
            <Code>{'<ListItem title="..." duration="3 мин" showPeople state="pressed" />'}</Code>
          </div>
        </div>
      </div>

      {/* 6. Player */}
      <div className={styles.section}>
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
      <div className={styles.section}>
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
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>PopUp</h2>
        <Button label="Показать попап" type="main" onClick={() => setShowPopUp(true)} />
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
      <div className={styles.section}>
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
      <div className={styles.section}>
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
        </div>
      </div>

      {/* 10. CheckList */}
      <div className={styles.section}>
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
        </div>
      </div>

      {/* 11. ProgressBar */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>ProgressBar</h2>
        <div className={styles.progressBars}>
          <div className={styles.labeled}>
            <ProgressBar type="mini" progress={60} />
            <Code>{'<ProgressBar type="mini" progress={60} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <ProgressBar type="main" progress={45} currentTime="01:23" totalTime="03:45" />
            <Code>{'<ProgressBar type="main" progress={45} currentTime="01:23" totalTime="03:45" />'}</Code>
          </div>
        </div>
      </div>

      {/* 12. Illustrations */}
      <div className={styles.section}>
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
      </div>

      {/* 13. Container */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Container</h2>
        <div className={styles.containerRow}>
          <div className={styles.labeled}>
            <Container size="m" state="default">
              <span style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)' }}>
                Контейнер с содержимым (M)
              </span>
            </Container>
            <Code>{'<Container size="m" state="default">{children}</Container>'}</Code>
          </div>
          <div className={styles.labeled}>
            <Container size="l" state="empty" />
            <Code>{'<Container size="l" state="empty" />'}</Code>
          </div>
        </div>
      </div>

      {/* 14. Background + Menu */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Background</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className={styles.labeled}>
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
              <Background theme="orange" orientation="landscape" onBack={() => {}}>
                <span style={{ color: 'white', fontSize: 48, fontFamily: 'var(--font-family)' }}>Cobalt</span>
              </Background>
            </div>
            <Code>{'<Background theme="orange" orientation="landscape" onBack={...}>{children}</Background>'}</Code>
          </div>
          <div className={styles.labeled}>
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
              <Background theme="orange" orientation="landscape" onBack={() => {}}>
                <span style={{ color: 'white', fontSize: 48, fontFamily: 'var(--font-family)' }}>Orange</span>
              </Background>
            </div>
            <Code>{'<Background theme="orange" orientation="landscape" onBack={...}>{children}</Background>'}</Code>
          </div>
        </div>

        <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Menu</h2>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className={styles.labeled}>
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
              <Menu
                theme="orange"
                orientation="landscape"
                items={[
                  { label: 'Описание направления' },
                  { label: 'Мои задания' },
                  { label: 'Истории яндексоидов' },
                  { label: 'Бинго-знакомство' },
                ]}
              />
            </div>
            <Code>{'<Menu theme="orange" items={[{ label: "...", onClick: ... }, ...]} />'}</Code>
          </div>
          <div className={styles.labeled}>
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1920 * 0.35, height: 1080 * 0.35 }}>
              <Menu
                theme="orange"
                orientation="landscape"
                items={[
                  { label: 'Описание направления' },
                  { label: 'Мои задания' },
                  { label: 'Истории яндексоидов' },
                  { label: 'Бинго-знакомство' },
                ]}
              />
            </div>
            <Code>{'<Menu theme="orange" items={[{ label: "...", onClick: ... }, ...]} />'}</Code>
          </div>
        </div>
      </div>
    </div>
  );
}
