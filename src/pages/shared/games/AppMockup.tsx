import styles from './AppMockup.module.css';

interface AppMockupProps {
  className?: string;
  selectedZones: Set<string>;
  zoneResults?: Record<string, 'correct' | 'wrong'>;
  onZoneClick: (zoneId: string) => void;
}

export const ZONES = [
  { id: 'hero-poster',      label: 'Баннер с афишей фильма' },
  { id: 'purchase-steps',   label: 'Шаги покупки билета' },
  { id: 'description-text', label: 'Описание фильма' },
  { id: 'schedule-btn',     label: 'Кнопка «Расписание»' },
  { id: 'reg-btn',          label: 'Кнопка «Зарегистрироваться»' },
  { id: 'calendar-dates',   label: 'Шаг с календарём' },
  { id: 'promo-banner',     label: 'Акционный баннер' },
  { id: 'payment-btn',      label: 'Кнопка «Оплатить билет»' },
  { id: 'profile-icon',     label: 'Иконка профиля' },
] as const;

export const PROBLEM_ZONES = new Set(['description-text', 'reg-btn', 'payment-btn', 'profile-icon']);

export function AppMockup({ selectedZones, zoneResults, onZoneClick }: AppMockupProps) {
  const selectedOrder = [...selectedZones];

  const zoneClass = (id: string) => {
    const classes = [styles.zone];
    if (selectedZones.has(id)) classes.push(styles.zoneSelected);
    if (zoneResults?.[id] === 'correct') classes.push(styles.zoneCorrect);
    if (zoneResults?.[id] === 'wrong') classes.push(styles.zoneWrong);
    return classes.join(' ');
  };

  const badge = (id: string) => {
    const index = selectedOrder.indexOf(id);
    if (index === -1) return null;
    return <span className={styles.zoneBadge}>{index + 1}</span>;
  };

  return (
    <div className={styles.mockup}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.logo}>CINEMA GO</span>
        <div
          className={`${styles.regBtn} ${zoneClass('reg-btn')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('reg-btn'); }}
        >
          Зарегистрироваться
          {badge('reg-btn')}
        </div>
      </div>

      {/* ── Hero poster + description ── */}
      <div
        className={`${styles.heroBlock} ${zoneClass('hero-poster')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('hero-poster'); }}
      >
        <img
          src="/assets/games/001/ux-review-hero.png"
          alt="Афиша фильма"
          className={styles.heroImg}
        />
        <div
          className={`${styles.description} ${zoneClass('description-text')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('description-text'); }}
        >
          {badge('description-text')}
        </div>
        {badge('hero-poster')}
      </div>

      {/* ── Profile + title ── */}
      <div
        className={`${styles.profileRow} ${zoneClass('profile-icon')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('profile-icon'); }}
      >
        <img
          src="/assets/games/001/ux-review-profile.png"
          alt="Профиль и заголовок"
          className={styles.profileImg}
        />
        {badge('profile-icon')}
      </div>

      {/* ── Purchase steps ── */}
      <div
        className={`${styles.steps} ${zoneClass('purchase-steps')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('purchase-steps'); }}
      >
        <img
          src="/assets/games/001/ux-review-steps.png"
          alt="Шаги покупки билета"
          className={styles.stepsImg}
        />
        {badge('purchase-steps')}
      </div>

      {/* ── Buttons ── */}
      <div className={styles.buttons}>
        <img
          src="/assets/games/001/ux-review-buttons.png"
          alt="Кнопки"
          className={styles.buttonsImg}
        />
        <div
          className={`${styles.scheduleBtnZone} ${zoneClass('schedule-btn')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('schedule-btn'); }}
        >
          {badge('schedule-btn')}
        </div>
        <div
          className={`${styles.paymentBtnZone} ${zoneClass('payment-btn')}`}
          onClick={(e) => { e.stopPropagation(); onZoneClick('payment-btn'); }}
        >
          {badge('payment-btn')}
        </div>
      </div>

      {/* ── Promo banner ── */}
      <div
        className={`${styles.promo} ${zoneClass('promo-banner')}`}
        onClick={(e) => { e.stopPropagation(); onZoneClick('promo-banner'); }}
      >
        <img
          src="/assets/games/001/ux-review-promo.png"
          alt="Акция"
          className={styles.promoImg}
        />
        {badge('promo-banner')}
      </div>

      {/* ── Bottom nav ── */}
      <div className={styles.bottomNav}>
        <img
          src="/assets/games/001/ux-review-nav.png"
          alt="Навигация"
          className={styles.navImg}
        />
      </div>

    </div>
  );
}
