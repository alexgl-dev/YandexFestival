import styles from './AppMockup.module.css';
import { ZONES, ZONE_RECTS } from './appMockupZones';

// DEBUG: временно показывать все рамки как выбранные.
// Поставь false, когда подгонишь координаты.
const FORCE_ALL_SELECTED = false;

interface AppMockupProps {
  className?: string;
  selectedZones: Set<string>;
  selectedOrder?: string[];
  zoneResults?: Record<string, 'correct' | 'wrong'>;
  onZoneClick: (zoneId: string) => void;
}

export function AppMockup({ selectedZones, selectedOrder, zoneResults, onZoneClick }: AppMockupProps) {
  const visualSelectedZones = FORCE_ALL_SELECTED
    ? new Set<string>(ZONES.map((z) => z.id))
    : selectedZones;
  const order = selectedOrder ?? [...visualSelectedZones];

  const zoneClass = (id: string) => {
    const classes = [styles.zone];
    if (visualSelectedZones.has(id)) classes.push(styles.zoneSelected);
    if (zoneResults?.[id] === 'correct') classes.push(styles.zoneCorrect);
    if (zoneResults?.[id] === 'wrong') classes.push(styles.zoneWrong);
    return classes.join(' ');
  };

  const badge = (id: string) => {
    const index = order.indexOf(id);
    if (index === -1) return null;
    return <span className={styles.zoneBadge}>{index + 1}</span>;
  };

  return (
    <div className={styles.mockup}>
      <div className={styles.overlayLayer}>
        {ZONES.map(({ id }) => {
          const rect = ZONE_RECTS[id];
          return (
            <div
              key={id}
              className={`${styles.zoneOverlay} ${zoneClass(id)}`}
              style={{
                top: `${rect.top}%`,
                left: `${rect.left}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                borderRadius: rect.radius != null ? `${rect.radius}px` : undefined,
              }}
              onClick={(e) => { e.stopPropagation(); onZoneClick(id); }}
            >
              {badge(id)}
            </div>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.logo}>CINEMA GO</span>
        <div className={styles.regBtn}>
          Зарегистрироваться
        </div>
      </div>

      {/* ── Hero poster + description ── */}
      <div className={styles.heroBlock}>
        <img
          src="/assets/games/001/ux-review-hero.png"
          alt="Афиша фильма"
          className={styles.heroImg}
        />
        <div className={styles.description} />
      </div>

      {/* ── Profile + title ── */}
      <div className={styles.profileRow}>
        <img
          src="/assets/games/001/ux-review-profile.png"
          alt="Профиль и заголовок"
          className={styles.profileImg}
        />
      </div>

      {/* ── Purchase steps ── */}
      <div className={styles.steps}>
        <img
          src="/assets/games/001/ux-review-steps.png"
          alt="Шаги покупки билета"
          className={styles.stepsImg}
        />
      </div>

      {/* ── Buttons ── */}
      <div className={styles.buttons}>
        <img
          src="/assets/games/001/ux-review-buttons.png"
          alt="Кнопки"
          className={styles.buttonsImg}
        />
      </div>

      {/* ── Promo banner ── */}
      <div className={styles.promo}>
        <img
          src="/assets/games/001/ux-review-promo.png"
          alt="Акция"
          className={styles.promoImg}
        />
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
