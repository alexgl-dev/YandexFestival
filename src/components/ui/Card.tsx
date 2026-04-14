import styles from './Card.module.css';
import { Icon } from './Icon';

export interface CardProps {
  variant: string;
  title: string;
  description: string;
  hint?: string;
  image?: string;
  state?: 'default' | 'disabled' | 'flipped' | 'wrong' | 'pressed';
  size?: 'm' | 'l';
  className?: string;
  onClick?: () => void;
}

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

  return (
    <div
      className={`${styles.root} ${styles[`size_${size}`]} ${styles[state]} ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Revealed L (flipped correct / wrong): icon + text + image */}
      {isRevealed && size === 'l' && (
        <>
          <div className={styles.flippedContent}>
            {isFlipped ? (
              <Icon name="done" color="white" size="s" />
            ) : (
              <Icon name="close" color="red" size="m" />
            )}
            <div className={styles.textBlock}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
          {image && (
            <div className={styles.imageArea}>
              <img src={image} alt={title} className={styles.image} />
            </div>
          )}
        </>
      )}

      {/* Default/Disabled L: header + text + image */}
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
          <div className={styles.imageArea}>
            {image ? (
              <img src={image} alt={title} className={styles.image} />
            ) : (
              <div className={styles.placeholder} />
            )}
          </div>
        </>
      )}

      {/* M: header + text (no image) */}
      {size === 'm' && (
        <>
          <div className={styles.header}>
            <span className={styles.variant}>{variant}</span>
            <span className={isPressed ? undefined : styles.iconHidden}>
              <Icon name="done" color="blue" size="s" />
            </span>
          </div>
          <div className={styles.textBlock}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
        </>
      )}
    </div>
  );
}
