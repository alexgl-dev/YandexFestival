import styles from './Icon.module.css';

export interface IconProps {
  name: 'done' | 'close' | 'people' | 'clock';
  color: 'white' | 'blue' | 'red';
  size: 'xs' | 's' | 'm';
  className?: string;
}

const sizeMap: Record<IconProps['size'], number> = {
  xs: 30,
  s: 44,
  m: 80,
};

/* People and Clock are flat icons (no circle background in SVG) */
const flatIcons = new Set(['people', 'clock']);

export function Icon({ name, color, size, className }: IconProps) {
  const px = sizeMap[size];
  const isFlat = flatIcons.has(name);

  if (isFlat) {
    return (
      <img
        src={`/icons/icon-${name}-${color}-${size}.svg`}
        alt={name}
        width={px}
        height={px}
        className={`${styles.flat} ${className ?? ''}`}
      />
    );
  }

  return (
    <div
      className={`${styles.circle} ${styles[color]} ${className ?? ''}`}
      style={{ width: px, height: px }}
    >
      <img
        src={`/icons/icon-${name}-${color}-${size}.svg`}
        alt={name}
        className={styles.icon}
      />
    </div>
  );
}
