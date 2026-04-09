import styles from './Illustration.module.css';

export interface IllustrationProps {
  type:
    | 'laptop'
    | 'selector'
    | 'smart-watch'
    | 'mouse-red'
    | 'mouse-blue'
    | 'keyboard-stickers'
    | 'keyboard';
  size?: number;
  className?: string;
}

export function Illustration({
  type,
  size = 350,
  className,
}: IllustrationProps) {
  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <img
        src={`/illustrations/illustration-${type}.png`}
        alt={type}
        className={styles.image}
      />
    </div>
  );
}
