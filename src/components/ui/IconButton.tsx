import styles from './IconButton.module.css';

export interface IconButtonProps {
  type: 'back' | 'play' | 'pause';
  variant?: 'default' | 'light' | 'orange';
  pressed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const defaultSize: Record<IconButtonProps['type'], 'sm' | 'lg'> = {
  back: 'lg',
  play: 'sm',
  pause: 'sm',
};

function getSrc(type: IconButtonProps['type'], variant: 'default' | 'light' | 'orange', pressed?: boolean) {
  if (type === 'back') {
    if (variant === 'orange') return '/icons/iconbtn-back-orange.svg';
    if (variant === 'light') return '/icons/iconbtn-back-light.svg';
    return pressed ? '/icons/iconbtn-back-pressed.svg' : '/icons/iconbtn-back.svg';
  }
  return `/icons/iconbtn-${type}.svg`;
}

export function IconButton({ type, variant = 'default', pressed, size, onClick, className }: IconButtonProps) {
  const resolvedSize = size ?? defaultSize[type];
  const px = resolvedSize === 'lg' ? 84 : resolvedSize === 'md' ? 74 : 63;

  return (
    <button
      className={`${styles.button} ${className ?? ''}`}
      style={{ width: px, height: px }}
      onClick={onClick}
      type="button"
    >
      <img src={getSrc(type, variant, pressed)} alt={type} className={styles.icon} />
    </button>
  );
}
