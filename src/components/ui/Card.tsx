import styles from './Card.module.css';
import { Icon } from './Icon';

export interface CardProps {
  variant: string;
  title: string;
  description: string;
  /** L: синяя подсказка справа от метки («Нажми, чтобы выбрать»). В disabled скрыта, место сохраняется. */
  hint?: string;
  image?: string;
  state?: 'default' | 'disabled' | 'flipped' | 'wrong' | 'pressed';
  size?: 'm' | 'l';
  className?: string;
  onClick?: () => void;
}

/** Иконки из Figma (Card / Icon Done_white): 40px для L flipped, 45px для M pressed */
const DONE_ICON_L = '/icons/figma/card-done-white-40.svg';
const DONE_ICON_M = '/icons/figma/card-done-white-45.svg';

/**
 * Card по Figma «OUT_Яндекс Музей» (Card / State=*, Size=L|M).
 * L — вертикальная с картинкой; flipped = синяя с белой галочкой, wrong = белая с красным крестом.
 * M — горизонтальная: метка слева, заголовок + описание справа; pressed = синяя с галочкой.
 */
export function Card({
  variant,
  title,
  description,
  hint,
  image,
  state = 'default',
  size = 'l',
  className,
  onClick,
}: CardProps) {
  const isFlipped = state === 'flipped';
  const isWrong = state === 'wrong';
  const isRevealed = isFlipped || isWrong;
  const isPressed = state === 'pressed';

  const imageArea = (
    <div className={styles.imageArea}>
      {image ? <img src={image} alt={title} className={styles.image} /> : <div className={styles.placeholder} />}
    </div>
  );

  return (
    <div
      className={`${styles.root} ${styles[`size_${size}`]} ${styles[state]} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* L revealed (flipped / wrong): иконка + текст + картинка */}
      {isRevealed && size === 'l' && (
        <>
          <div className={styles.flippedContent}>
            {isFlipped ? (
              <img src={DONE_ICON_L} alt="" className={styles.stateIcon} />
            ) : (
              <Icon name="close" color="red" size="s" />
            )}
            <div className={styles.textBlock}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
          {imageArea}
        </>
      )}

      {/* L default / disabled: метка + подсказка, текст, картинка */}
      {!isRevealed && size === 'l' && (
        <>
          <div className={styles.topSection}>
            <div className={styles.header}>
              <span className={styles.variant}>{variant}</span>
              {hint && (
                <span className={`${styles.hint} ${state !== 'default' ? styles.hintHidden : ''}`}>{hint}</span>
              )}
            </div>
            {(title || description) && (
              <div className={styles.textBlock}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {description && <p className={styles.description}>{description}</p>}
              </div>
            )}
          </div>
          {imageArea}
        </>
      )}

      {/* M: метка слева, текст справа, галочка в pressed */}
      {size === 'm' && (
        <>
          {/* Колонка метки (140px) только при непустом variant — узкие карточки в играх идут без неё */}
          {variant && (
            <div className={styles.labelColumn}>
              <span className={styles.variant}>{variant}</span>
            </div>
          )}
          <div className={styles.textBlock}>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {isPressed && <img src={DONE_ICON_M} alt="" className={styles.stateIcon} />}
        </>
      )}
    </div>
  );
}
