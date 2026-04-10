import styles from './FindBugMockups.module.css';

/* ============================
   ShopMockup — E-commerce product page
   Bug: no "Купить" button
   ============================ */
export function ShopMockup({ className }: { className?: string }) {
  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header */}
      <div className={styles.shopHeader}>
        <span className={styles.shopHeaderTitle}>ShopNow</span>
      </div>

      {/* Product image */}
      <div className={styles.shopProductImage}>👟</div>

      {/* Product info */}
      <div className={styles.shopBody}>
        <p className={styles.shopProductName}>Кроссовки NeoRun</p>
        <p className={styles.shopPrice}>4 990 ₽</p>
        <p className={styles.shopRating}>
          ⭐ 4.7 <span className={styles.shopRatingMuted}>(128 отзывов)</span>
        </p>

        <p className={styles.shopSizeLabel}>Размер</p>
        <div className={styles.shopSizes}>
          <span className={styles.shopSizePill}>38</span>
          <span className={styles.shopSizePill}>39</span>
          <span className={`${styles.shopSizePill} ${styles.shopSizePillActive}`}>40</span>
          <span className={styles.shopSizePill}>41</span>
          <span className={styles.shopSizePill}>42</span>
        </div>

        <p className={styles.shopDescription}>
          Лёгкие и удобные кроссовки для бега и повседневной носки.
          Дышащий верх, амортизирующая подошва, стильный дизайн.
        </p>
      </div>

      {/* NO BUY BUTTON — this is the problem! */}
      <div className={styles.shopBottom} />
    </div>
  );
}

/* ============================
   MessengerMockup — Chat app
   Bug: no message input field
   ============================ */
export function MessengerMockup({ className }: { className?: string }) {
  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header */}
      <div className={styles.messengerHeader}>
        <span className={styles.messengerBackArrow}>←</span>
        <div className={styles.messengerAvatar}>А</div>
        <div className={styles.messengerContactInfo}>
          <span className={styles.messengerContactName}>Алиса</span>
          <span className={styles.messengerOnline}>в сети</span>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messengerMessages}>
        <div className={`${styles.messageBubble} ${styles.messageLeft}`}>
          <span>Привет! Как дела?</span>
          <div className={styles.messageTime}>14:02</div>
        </div>

        <div className={`${styles.messageBubble} ${styles.messageRight}`}>
          <span>Всё отлично, спасибо!</span>
          <div className={styles.messageTime}>14:03</div>
        </div>

        <div className={`${styles.messageBubble} ${styles.messageLeft}`}>
          <span>Встретимся завтра в 18:00?</span>
          <div className={styles.messageTime}>14:05</div>
        </div>

        <div className={`${styles.messageBubble} ${styles.messageRight}`}>
          <span>Да, договорились!</span>
          <div className={styles.messageTime}>14:06</div>
        </div>
      </div>

      {/* NO MESSAGE INPUT — this is the problem! */}
      <div className={styles.messengerBottom} />
    </div>
  );
}

/* ============================
   MusicMockup — Music player
   Bug: no playback controls
   ============================ */
export function MusicMockup({ className }: { className?: string }) {
  return (
    <div className={`${styles.mockup} ${className ?? ''}`}>
      {/* Header */}
      <div className={styles.musicHeader}>
        <span className={styles.musicHeaderTitle}>Музыка</span>
      </div>

      {/* Now playing */}
      <div className={styles.musicNowPlaying}>
        <div className={styles.musicAlbumArt}>🎵</div>
        <div className={styles.musicTrackInfo}>
          <p className={styles.musicTrackName}>Летний вечер</p>
          <p className={styles.musicArtist}>Тёплые волны</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.musicProgress}>
        <div className={styles.musicProgressBar}>
          <div className={styles.musicProgressFill} />
        </div>
        <div className={styles.musicProgressTimes}>
          <span>1:12</span>
          <span>3:28</span>
        </div>
      </div>

      {/* NO PLAYBACK CONTROLS — this is the problem! */}
      <div className={styles.musicControlsPlaceholder} />

      {/* Up next */}
      <div className={styles.musicUpNext}>
        <p className={styles.musicUpNextTitle}>Далее</p>

        <div className={styles.musicTrackRow}>
          <div className={styles.musicTrackThumb} style={{ background: '#D4F5D4' }}>🎶</div>
          <div className={styles.musicTrackRowInfo}>
            <p className={styles.musicTrackRowName}>Ночной город</p>
            <p className={styles.musicTrackRowArtist}>Электро</p>
          </div>
        </div>

        <div className={styles.musicTrackRow}>
          <div className={styles.musicTrackThumb} style={{ background: '#FFE0CC' }}>🎸</div>
          <div className={styles.musicTrackRowInfo}>
            <p className={styles.musicTrackRowName}>Дорога домой</p>
            <p className={styles.musicTrackRowArtist}>Акустика</p>
          </div>
        </div>

        <div className={styles.musicTrackRow}>
          <div className={styles.musicTrackThumb} style={{ background: '#E8ECFF' }}>🎹</div>
          <div className={styles.musicTrackRowInfo}>
            <p className={styles.musicTrackRowName}>Утренний кофе</p>
            <p className={styles.musicTrackRowArtist}>Джаз-бэнд</p>
          </div>
        </div>
      </div>
    </div>
  );
}
