import styles from './AppMockup.module.css';

interface AppMockupProps {
  className?: string;
  selectedZones: Set<string>;
  zoneResults?: Record<string, 'correct' | 'wrong'>;
  onZoneClick: (zoneId: string) => void;
}

export const ZONES = [
  { id: 'header-left', label: 'Область назад/домой' },
  { id: 'header-menu', label: 'Гамбургер-меню' },
  { id: 'search', label: 'Поиск' },
  { id: 'hero', label: 'Баннер' },
  { id: 'categories', label: 'Категории' },
  { id: 'cards', label: 'Карточки ресторанов' },
  { id: 'reg-button', label: 'Кнопка регистрации' },
] as const;

export const PROBLEM_ZONES = new Set(['header-left', 'header-menu', 'reg-button']);

export function AppMockup({ selectedZones, zoneResults, onZoneClick }: AppMockupProps) {
  const selectedOrder = [...selectedZones];

  const zoneClass = (id: string) => {
    const classes = [styles.zone];
    if (selectedZones.has(id)) classes.push(styles.zoneSelected);
    if (zoneResults?.[id] === 'correct') classes.push(styles.zoneCorrect);
    if (zoneResults?.[id] === 'wrong') classes.push(styles.zoneWrong);
    return classes.join(' ');
  };

  const zoneBadge = (id: string) => {
    const index = selectedOrder.indexOf(id);
    if (index === -1) return null;
    return <span className={styles.zoneBadge}>{index + 1}</span>;
  };

  return (
    <div className={styles.mockup}>
      {/* Header */}
      <div className={styles.header}>
        <div
          className={`${styles.headerLeft} ${zoneClass('header-left')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('header-left'); }}
        >
          <span className={styles.headerLeftLabel}>?</span>
          {zoneBadge('header-left')}
        </div>
        <span className={styles.headerTitle}>FoodExpress</span>
        <div
          className={`${styles.hamburger} ${zoneClass('header-menu')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('header-menu'); }}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          {zoneBadge('header-menu')}
        </div>
      </div>

      {/* Search */}
      <div
        className={`${styles.searchBar} ${zoneClass('search')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('search'); }}
      >
        <span className={styles.searchIcon}>🔍</span>
        <span className={styles.searchText}>Найти ресторан или блюдо...</span>
        {zoneBadge('search')}
      </div>

      {/* Hero */}
      <div
        className={`${styles.hero} ${zoneClass('hero')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('hero'); }}
      >
        <p className={styles.heroTitle}>Лучшие рестораны рядом</p>
        <p className={styles.heroSubtitle}>Доставка от 30 минут</p>
        {zoneBadge('hero')}
      </div>

      {/* Categories */}
      <div
        className={`${styles.categories} ${zoneClass('categories')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('categories'); }}
      >
        <span className={`${styles.pill} ${styles.pillActive}`}>Пицца</span>
        <span className={styles.pill}>Суши</span>
        <span className={styles.pill}>Бургеры</span>
        <span className={styles.pill}>Десерты</span>
        {zoneBadge('categories')}
      </div>

      {/* Cards */}
      <div
        className={`${styles.cardsWrap} ${zoneClass('cards')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('cards'); }}
      >
        <p className={styles.sectionTitle}>Популярное</p>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardImage} style={{ background: '#FFE0CC' }}>🍕</div>
            <div className={styles.cardInfo}>
              <p className={styles.cardName}>Pizza Roma</p>
              <p className={styles.cardMeta}>Итальянская · 25-35 мин</p>
              <p className={styles.cardRating}>⭐ 4.8</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardImage} style={{ background: '#D4F5D4' }}>🍣</div>
            <div className={styles.cardInfo}>
              <p className={styles.cardName}>Суши Мастер</p>
              <p className={styles.cardMeta}>Японская · 30-40 мин</p>
              <p className={styles.cardRating}>⭐ 4.6</p>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardImage} style={{ background: '#FFE8D6' }}>🍔</div>
            <div className={styles.cardInfo}>
              <p className={styles.cardName}>Burger Lab</p>
              <p className={styles.cardMeta}>Фастфуд · 15-25 мин</p>
              <p className={styles.cardRating}>⭐ 4.5</p>
            </div>
          </div>
        </div>
        {zoneBadge('cards')}
      </div>

      {/* Registration button — broken */}
      <div
        className={`${styles.regButton} ${zoneClass('reg-button')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('reg-button'); }}
      >
        Регистрация
        {zoneBadge('reg-button')}
      </div>
    </div>
  );
}
