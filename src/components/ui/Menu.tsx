import { useTranslation } from 'react-i18next';
import styles from './Menu.module.css';
import { Background } from './Background';
import { setLanguage } from '../../i18n';

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
  /** Переключатель RU/EN в правом верхнем углу. */
  showLanguageSwitcher?: boolean;
}

export function Menu({
  theme,
  orientation = 'landscape',
  items,
  onBack,
  className,
  showLogo = true,
  showLanguageSwitcher = true,
}: MenuProps) {
  const { i18n } = useTranslation();

  return (
    <Background
      theme={theme}
      orientation={orientation}
      showBackButton={!!onBack}
      onBack={onBack}
      backShowLabel
      className={className}
    >
      {showLanguageSwitcher && (
        <div className={styles.languageSwitcher}>
          <button
            type="button"
            className={`${styles.langButton} ${i18n.language === 'ru' ? styles.langButtonActive : ''}`}
            onClick={() => setLanguage('ru')}
          >
            RU
          </button>
          <button
            type="button"
            className={`${styles.langButton} ${i18n.language === 'en' ? styles.langButtonActive : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>
      )}
      {showLogo && (
        <img
          src={i18n.language === 'en' ? '/icons/figma/logo-white-en.png' : '/icons/figma/logo-white.svg'}
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
