import { useTranslation } from 'react-i18next';
import styles from './FindBugMockups.module.css';

/* ============================
   BooksMockup — Free books app
   Bug: no search button
   ============================ */
export function BooksMockup({ className }: { className?: string }) {
  const { t } = useTranslation('sharedGames2');
  const books = [
    { emoji: '📗', title: t("Евгений Онегин"), author: t("А.С. Пушкин") },
    { emoji: '📘', title: t("Война и мир"), author: t("Л.Н. Толстой") },
    { emoji: '📕', title: t("Мёртвые души"), author: t("Н.В. Гоголь") },
    { emoji: '📙', title: t("Отцы и дети"), author: t("И.С. Тургенев") },
    { emoji: '📗', title: t("Преступление и наказание"), author: t("Ф.М. Достоевский") },
    { emoji: '📘', title: t("Капитанская дочка"), author: t("А.С. Пушкин") },
    { emoji: '📕', title: t("Анна Каренина"), author: t("Л.Н. Толстой") },
  ];

  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header — NO search icon, that's the bug */}
      <div className={styles.booksHeader}>
        <span className={styles.booksLogo}>📚</span>
        <span className={styles.booksTitle}>{t("Бесплатно. Книги–онлайн")}</span>
        {/* search icon intentionally absent */}
      </div>

      {/* Category tabs */}
      <div className={styles.booksTabs}>
        <span className={`${styles.booksTab} ${styles.booksTabActive}`}>{t("Все")}</span>
        <span className={styles.booksTab}>{t("Классика")}</span>
        <span className={styles.booksTab}>{t("Современность")}</span>
        <span className={styles.booksTab}>{t("Детские")}</span>
      </div>

      {/* Book list */}
      <div className={styles.booksList}>
        {books.map((book, i) => (
          <div key={i} className={styles.bookRow}>
            <div className={styles.bookCover}>{book.emoji}</div>
            <div className={styles.bookInfo}>
              <p className={styles.bookName}>{book.title}</p>
              <p className={styles.bookAuthor}>{book.author}</p>
              <span className={styles.bookFree}>{t("Бесплатно")}</span>
            </div>
            <span className={styles.bookArrow}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================
   MessengerMockup — Chat dialog
   Bug: no back button
   ============================ */
export function MessengerMockup({ className }: { className?: string }) {
  const { t } = useTranslation('sharedGames2');
  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header — NO back arrow, that's the bug */}
      <div className={styles.messengerHeader}>
        {/* back button intentionally absent */}
        <div className={styles.messengerAvatar}>М</div>
        <div className={styles.messengerContactInfo}>
          <span className={styles.messengerContactName}>{t("Максим")}</span>
          <span className={styles.messengerOnline}>{t("в сети")}</span>
        </div>
        <div className={styles.messengerActions}>
          <span className={styles.messengerActionIcon}>📞</span>
          <span className={styles.messengerActionIcon}>📷</span>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messengerMessages}>
        <div className={`${styles.messageBubble} ${styles.messageLeft}`}>
          <span>{t("Привет! Как дела? 😊")}</span>
          <div className={styles.messageTime}>14:02</div>
        </div>
        <div className={`${styles.messageBubble} ${styles.messageRight}`}>
          <span>{t("Всё отлично, спасибо!")}</span>
          <div className={styles.messageTime}>14:03</div>
        </div>
        <div className={`${styles.messageBubble} ${styles.messageLeft}`}>
          <span>{t("Встретимся сегодня вечером?")}</span>
          <div className={styles.messageTime}>14:05</div>
        </div>
        <div className={`${styles.messageBubble} ${styles.messageRight}`}>
          <span>{t("Конечно, в 19:00?")}</span>
          <div className={styles.messageTime}>14:06</div>
        </div>
        <div className={`${styles.messageBubble} ${styles.messageLeft}`}>
          <span>{t("Отлично, договорились!")}</span>
          <div className={styles.messageTime}>14:07</div>
        </div>
      </div>

      {/* Message input — present (not the bug) */}
      <div className={styles.messengerInput}>
        <div className={styles.messengerInputField}>
          <span className={styles.messengerInputPlaceholder}>{t("Написать сообщение...")}</span>
        </div>
        <button className={styles.messengerSendBtn}>➤</button>
      </div>
    </div>
  );
}

/* ============================
   FoodMockup — Food order cart
   Bug: no "Оформить заказ" button
   ============================ */
export function FoodMockup({ className }: { className?: string }) {
  const { t } = useTranslation('sharedGames2');
  const items = [
    { emoji: '🥤', name: t("Кола 0.5л"), qty: 2, price: 298 },
    { emoji: '🍔', name: t("Двойной бургер"), qty: 1, price: 790 },
    { emoji: '🍌', name: t("Бананы 1 кг"), qty: 1, price: 220 },
    { emoji: '🧃', name: t("Апельсиновый сок"), qty: 2, price: 280 },
    { emoji: '🍟', name: t("Картофель фри"), qty: 1, price: 760 },
  ];

  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header */}
      <div className={styles.foodHeader}>
        <span className={styles.foodBackArrow}>←</span>
        <span className={styles.foodHeaderTitle}>{t("Корзина")}</span>
        <span className={styles.foodBadge}>5</span>
      </div>

      {/* Cart items */}
      <div className={styles.foodItems}>
        {items.map((item, i) => (
          <div key={i} className={styles.foodItem}>
            <div className={styles.foodItemEmoji}>{item.emoji}</div>
            <div className={styles.foodItemInfo}>
              <p className={styles.foodItemName}>{item.name}</p>
              <p className={styles.foodItemPrice}>{item.price} ₽</p>
            </div>
            <div className={styles.foodQty}>
              <span className={styles.foodQtyBtn}>−</span>
              <span className={styles.foodQtyNum}>{item.qty}</span>
              <span className={styles.foodQtyBtn}>+</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add more button */}
      <div className={styles.foodAddMore}>
        <span className={styles.foodAddMoreText}>+ {t("Добавить ещё")}</span>
      </div>

      {/* Total */}
      <div className={styles.foodTotal}>
        <span className={styles.foodTotalLabel}>{t("Итого:")}</span>
        <span className={styles.foodTotalPrice}>2 348 ₽</span>
      </div>

      {/* NO "Оформить заказ" button — that's the bug! */}
      <div className={styles.foodBottom} />
    </div>
  );
}

/* ============================
   MarketplaceMockup — "Шоп-стар" product page
   Bug: no cart icon in header
   ============================ */
export function MarketplaceMockup({ className }: { className?: string }) {
  const { t } = useTranslation('sharedGames2');
  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header — NO cart icon, that's the bug */}
      <div className={styles.shopHeader}>
        <span className={styles.shopMenuIcon}>☰</span>
        <span className={styles.shopBrand}>{t("Шоп-стар")}</span>
        <span className={styles.shopNotify}>🔔</span>
        {/* cart icon intentionally absent */}
      </div>

      {/* Product image */}
      <div className={styles.shopProductImage}>🎧</div>

      {/* Product info */}
      <div className={styles.shopBody}>
        <p className={styles.shopProductName}>{t("Наушники Premium BT-500")}</p>
        <div className={styles.shopPriceRow}>
          <span className={styles.shopPrice}>4 990 ₽</span>
          <span className={styles.shopOldPrice}>6 000 ₽</span>
        </div>
        <p className={styles.shopRating}>
          ⭐ 4.8 <span className={styles.shopRatingMuted}>{t("({{count}} отзывов)", { count: 256 })}</span>
        </p>
        <p className={styles.shopDescription}>
          {t("Беспроводные наушники с активным шумоподавлением. Время работы 30 часов. Bluetooth 5.0.")}
        </p>

        <p className={styles.shopColorLabel}>{t("Цвет")}</p>
        <div className={styles.shopColors}>
          <span className={`${styles.shopColorDot} ${styles.shopColorBlack}`} />
          <span className={styles.shopColorDot} style={{ background: '#fff', border: '2px solid #ccc' }} />
          <span className={styles.shopColorDot} style={{ background: '#E53935' }} />
        </div>
      </div>

      {/* Add to cart button — present but can't view cart */}
      <div className={styles.shopBtnArea}>
        <button className={styles.shopAddBtn}>{t("Добавить в корзину")}</button>
      </div>
    </div>
  );
}
