import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CodeArchaeologyMockups.module.css';

interface MockupProps {
  id: string;
}

export function CodeArchaeologyMockup({ id }: MockupProps) {
  switch (id) {
    case 'buy-button':
      return <BuyButtonMockup />;
    case 'login-form':
      return <LoginFormMockup />;
    case 'heart-animation':
      return <HeartAnimationMockup />;
    case 'dropdown-menu':
      return <DropdownMenuMockup />;
    case 'product-cards':
      return <ProductCardsMockup />;
    default:
      return null;
  }
}

function Container({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}

function BuyButtonMockup() {
  const { t } = useTranslation('sharedGames1');
  return (
    <Container>
      <div className={styles.buyButton}>{t("Купить")}</div>
    </Container>
  );
}

function LoginFormMockup() {
  const { t } = useTranslation('sharedGames1');
  return (
    <Container>
      <div className={styles.loginForm}>
        <div className={styles.input}>{t("Логин")}</div>
        <div className={styles.inputGroup}>
          <div className={`${styles.input} ${styles.inputError}`}>{t("Пароль")}</div>
          <p className={styles.errorText}>{t("Вы ввели неверный пароль")}</p>
        </div>
        <div className={styles.signInBtn}>{t("Войти")}</div>
      </div>
    </Container>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.heartIcon}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartAnimationMockup() {
  return (
    <Container>
      <div className={styles.heartsRow}>
        <HeartIcon filled={false} />
        <HeartIcon filled={true} />
      </div>
    </Container>
  );
}

function DropdownMenuMockup() {
  const { t } = useTranslation('sharedGames1');
  return (
    <Container>
      <div className={styles.dropdown}>
        <div className={styles.dropdownHeader}>
          <span>{t("Популярные товары")}</span>
          <svg
            viewBox="0 0 24 24"
            className={styles.chevron}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 15l6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.dropdownItem}>{t("Подешевле")}</div>
        <div className={styles.dropdownItem}>{t("Подороже")}</div>
        <div className={styles.dropdownItem}>{t("Высокий рейтинг")}</div>
      </div>
    </Container>
  );
}

function ProductCard({ name, price }: { name: string; price: string }) {
  const { t } = useTranslation('sharedGames1');
  return (
    <div className={styles.productCard}>
      <div className={styles.productImage} />
      <div className={styles.productInfo}>
        <p className={styles.productName}>{t(name)}</p>
        <p className={styles.productPrice}>
          {price} <span>₽</span>
        </p>
      </div>
    </div>
  );
}

function ProductCardsMockup() {
  return (
    <Container>
      <div className={styles.productCards}>
        <ProductCard name="Ноутбук" price="38 055" />
        <ProductCard name="Смартфон" price="13 163" />
      </div>
    </Container>
  );
}
