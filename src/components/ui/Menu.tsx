import styles from './Menu.module.css';
import { Background } from './Background';

export interface MenuItem {
  label: string;
  onClick?: () => void;
}

export interface MenuProps {
  theme: 'cobalt' | 'orange';
  orientation?: 'landscape' | 'portrait';
  items: MenuItem[];
  onBack?: () => void;
  className?: string;
  showLogo?: boolean;
}

export function Menu({
  theme,
  orientation = 'landscape',
  items,
  onBack,
  className,
  showLogo = true,
}: MenuProps) {
  return (
    <Background
      theme={theme}
      orientation={orientation}
      showBackButton={!!onBack}
      onBack={onBack}
      backShowLabel
      className={className}
    >
      {showLogo && (
        <img
          src="/icons/figma/logo-white.svg"
          alt=""
          className={`${styles.logo} ${orientation === 'landscape' ? styles.logoLandscape : styles.logoPortrait}`}
        />
      )}
      <nav className={styles.nav}>
        {items.map((item, i) => (
          <button
            key={i}
            className={styles.menuItem}
            onClick={item.onClick}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </Background>
  );
}
