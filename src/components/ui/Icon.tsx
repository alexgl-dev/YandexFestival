import styles from './Icon.module.css';

export interface IconProps {
  name: 'done' | 'close' | 'people' | 'clock';
  color: 'white' | 'blue' | 'red';
  size: 'xs' | 's' | 'm';
  className?: string;
}

/** Figma «OUT_Яндекс Музей», Icon: XS=36 (People, Clock), S=40, M=56 (Done, Close) */
const sizeMap: Record<IconProps['size'], number> = {
  xs: 36,
  s: 40,
  m: 56,
};

/* People и Clock — плоские иконки без круга */
const flatIcons = new Set(['people', 'clock']);

function iconSrc({ name, color, size }: Pick<IconProps, 'name' | 'color' | 'size'>): string {
  if (name === 'people' || name === 'clock') {
    // Из Figma есть white и blue; red нет — берём blue
    return `/icons/figma/icon-${name}-${color === 'white' ? 'white' : 'blue'}.svg`;
  }
  const circleSize = size === 'm' ? 'm' : 's';
  if (name === 'done' && color !== 'red') {
    return `/icons/figma/icon-done-${color}-${circleSize}.svg`;
  }
  // close (все цвета) и done red — прежние иконки проекта, тот же глиф «круг + крест/галочка»
  return `/icons/icon-${name}-${color}-${circleSize}.svg`;
}

export function Icon({ name, color, size, className }: IconProps) {
  const px = sizeMap[size];
  const isFlat = flatIcons.has(name);

  return (
    <img
      src={iconSrc({ name, color, size })}
      alt={name}
      width={px}
      height={px}
      className={`${styles.icon} ${isFlat ? styles.flat : ''} ${name === 'clock' ? styles.clock : ''} ${className ?? ''}`}
    />
  );
}
