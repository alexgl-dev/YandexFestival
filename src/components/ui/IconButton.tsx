import styles from './IconButton.module.css';

export interface IconButtonProps {
  type: 'back' | 'play' | 'pause';
  pressed?: boolean;
  size?: 'sm' | 'lg';
  onClick?: () => void;
  className?: string;
}

const defaultSize: Record<IconButtonProps['type'], 'sm' | 'lg'> = {
  back: 'lg',
  play: 'sm',
  pause: 'sm',
};

function getSrc(type: IconButtonProps['type'], pressed?: boolean) {
  if (type === 'back') return pressed ? '/icons/iconbtn-back-pressed.svg' : '/icons/iconbtn-back.svg';
  return `/icons/iconbtn-${type}.svg`;
}

export function IconButton({ type, pressed, size, onClick, className }: IconButtonProps) {
  const resolvedSize = size ?? defaultSize[type];
  const px = resolvedSize === 'lg' ? 150 : 90;

  return (
    <button
      className={`${styles.button} ${className ?? ''}`}
      style={{ width: px, height: px }}
      onClick={onClick}
      type="button"
    >
      <img src={getSrc(type, pressed)} alt={type} className={styles.icon} />
    </button>
  );
}
