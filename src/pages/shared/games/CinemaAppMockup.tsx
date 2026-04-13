import styles from './CinemaAppMockup.module.css';

export type CinemaZoneId =
  | 'hero-poster'
  | 'description-text'
  | 'purchase-steps'
  | 'schedule-btn'
  | 'promo-banner'
  | 'calendar-dates'
  | 'payment-btn'
  | 'reg-btn'
  | 'profile-icon';

export const CINEMA_ZONES: Array<{ id: CinemaZoneId; label: string }> = [
  { id: 'hero-poster', label: 'Яркая афиша фильма' },
  { id: 'description-text', label: 'Описание фильма' },
  { id: 'purchase-steps', label: 'Шаги покупки билета' },
  { id: 'schedule-btn', label: 'Кнопка «Расписание»' },
  { id: 'promo-banner', label: 'Акция' },
  { id: 'calendar-dates', label: 'Выбор даты' },
  { id: 'payment-btn', label: 'Кнопка «Оплатить»' },
  { id: 'reg-btn', label: 'Кнопка «Зарегистрироваться»' },
  { id: 'profile-icon', label: 'Иконка профиля' },
];

export const CINEMA_PROBLEM_ZONES = new Set<CinemaZoneId>([
  'description-text',
  'reg-btn',
  'payment-btn',
  'profile-icon',
]);

export type ZoneStatus = 'correct' | 'wrong' | 'missed';

interface CinemaAppMockupProps {
  selectedZones: Set<string>;
  zoneResults?: Record<string, ZoneStatus>;
  onZoneClick?: (zoneId: CinemaZoneId) => void;
}

export function CinemaAppMockup({
  selectedZones,
  zoneResults,
  onZoneClick,
}: CinemaAppMockupProps) {
  const interactive = !!onZoneClick;

  const zoneClass = (id: CinemaZoneId) => {
    const cls = [styles.zone];
    if (interactive) cls.push(styles.zoneInteractive);
    if (selectedZones.has(id)) cls.push(styles.zoneSelected);
    if (zoneResults) {
      const s = zoneResults[id];
      if (s === 'correct') cls.push(styles.zoneCorrect);
      if (s === 'wrong' || s === 'missed') cls.push(styles.zoneWrong);
    }
    return cls.join(' ');
  };

  const badge = (id: CinemaZoneId) => {
    if (!selectedZones.has(id) && !zoneResults?.[id]) return null;
    const s = zoneResults?.[id];
    const icon = s === 'correct' ? '✓' : s === 'wrong' || s === 'missed' ? '✗' : null;
    if (!icon && !selectedZones.has(id)) return null;
    return (
      <span
        className={`${styles.badge} ${
          s === 'correct' ? styles.badgeBlue : s ? styles.badgeRed : styles.badgeNeutral
        }`}
      >
        {icon ?? '!'}
      </span>
    );
  };

  const click = (id: CinemaZoneId) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onZoneClick?.(id);
  };

  return (
    <div className={styles.mockup}>
      {/* ─── Top bar ─── */}
      <div className={styles.topBar}>
        <span className={styles.logo}>CINEMA GO</span>

        <div className={styles.topRight}>
          <span
            className={`${styles.regBtn} ${zoneClass('reg-btn')}`}
            onClick={click('reg-btn')}
          >
            зарегистрироваться
            {badge('reg-btn')}
          </span>

          <div
            className={`${styles.profileCircle} ${zoneClass('profile-icon')}`}
            onClick={click('profile-icon')}
          >
            <svg viewBox="0 0 24 24" fill="none" className={styles.profileIcon}>
              <circle cx="12" cy="9" r="4" fill="#090a0f" />
              <path
                d="M4 20C4 16 7.5 14 12 14C16.5 14 20 16 20 20"
                stroke="#090a0f"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </svg>
            {badge('profile-icon')}
          </div>
        </div>
      </div>

      {/* ─── Hero (cropped from PNG) ─── */}
      <div
        className={`${styles.hero} ${zoneClass('hero-poster')}`}
        onClick={click('hero-poster')}
      >
        {badge('hero-poster')}
      </div>

      {/* ─── Carousel dots ─── */}
      <div className={styles.dots}>
        <span className={styles.dotActive} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>

      {/* ─── Description (3 pale bars) ─── */}
      <div
        className={`${styles.description} ${zoneClass('description-text')}`}
        onClick={click('description-text')}
      >
        <div className={styles.descBar} style={{ width: '100%' }} />
        <div className={styles.descBar} style={{ width: '94%' }} />
        <div className={styles.descBar} style={{ width: '72%' }} />
        {badge('description-text')}
      </div>

      {/* ─── Section heading ─── */}
      <p className={styles.heading}>Как купить билет</p>

      {/* ─── Step cards row ─── */}
      <div className={styles.stepsRow}>
        <div
          className={`${styles.stepCard} ${zoneClass('calendar-dates')}`}
          onClick={click('calendar-dates')}
        >
          <svg viewBox="0 0 48 48" className={styles.stepIcon}>
            <rect x="6" y="10" width="36" height="32" rx="3" stroke="#fbcb2a" strokeWidth="3.2" fill="none" />
            <line x1="6" y1="20" x2="42" y2="20" stroke="#fbcb2a" strokeWidth="3.2" />
            <line x1="15" y1="5" x2="15" y2="14" stroke="#fbcb2a" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="33" y1="5" x2="33" y2="14" stroke="#fbcb2a" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="15" cy="28" r="2" fill="#fbcb2a" />
            <circle cx="24" cy="28" r="2" fill="#fbcb2a" />
            <circle cx="33" cy="28" r="2" fill="#fbcb2a" />
            <circle cx="15" cy="36" r="2" fill="#fbcb2a" />
            <circle cx="24" cy="36" r="2" fill="#fbcb2a" />
          </svg>
          <span className={styles.stepLabel}>Выберите дату</span>
          {badge('calendar-dates')}
        </div>

        <span className={styles.arrow}>›</span>

        <div
          className={`${styles.stepCard} ${zoneClass('payment-btn')}`}
          onClick={click('payment-btn')}
        >
          <svg viewBox="0 0 48 48" className={styles.stepIcon}>
            <rect x="6" y="12" width="36" height="26" rx="3" stroke="rgba(255,255,255,0.22)" strokeWidth="3.2" fill="none" />
            <line x1="6" y1="20" x2="42" y2="20" stroke="rgba(255,255,255,0.22)" strokeWidth="3.2" />
            <line x1="12" y1="30" x2="20" y2="30" stroke="rgba(255,255,255,0.22)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className={styles.stepLabelPale}>Оплатите билет</span>
          {badge('payment-btn')}
        </div>

        <span className={styles.arrow}>›</span>

        <div
          className={`${styles.stepCard} ${zoneClass('purchase-steps')}`}
          onClick={click('purchase-steps')}
        >
          <svg viewBox="0 0 48 48" className={styles.stepIcon}>
            <rect x="4" y="10" width="40" height="24" rx="3" stroke="#fbcb2a" strokeWidth="3.2" fill="none" />
            <line x1="16" y1="42" x2="32" y2="42" stroke="#fbcb2a" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="24" y1="34" x2="24" y2="42" stroke="#fbcb2a" strokeWidth="3.2" />
          </svg>
          <span className={styles.stepLabel}>Идите в кино</span>
          {badge('purchase-steps')}
        </div>
      </div>

      {/* ─── Schedule button ─── */}
      <div
        className={`${styles.scheduleBtn} ${zoneClass('schedule-btn')}`}
        onClick={click('schedule-btn')}
      >
        <span>Расписание фильмов</span>
        <span className={styles.scheduleArrow}>→</span>
        {badge('schedule-btn')}
      </div>

      {/* ─── Promo banner (cropped from PNG) ─── */}
      <div
        className={`${styles.promo} ${zoneClass('promo-banner')}`}
        onClick={click('promo-banner')}
      >
        {badge('promo-banner')}
      </div>

      {/* ─── Bottom nav ─── */}
      <div className={styles.bottomNav}>
        <svg viewBox="0 0 24 24" className={`${styles.navIcon} ${styles.navIconActive}`}>
          <path d="M3 12L12 4L21 12V20H14V14H10V20H3V12Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" className={styles.navIcon}>
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 24 24" className={styles.navIcon}>
          <path d="M12 20C12 20 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.54 3 23 5.46 23 8.5C23 13.5 14 20 14 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" className={styles.navIcon}>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <path d="M21 17L16 12L9 19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" className={styles.navIcon}>
          <circle cx="5" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="19" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
