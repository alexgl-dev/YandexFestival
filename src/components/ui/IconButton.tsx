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

function getSrc(type: IconButtonProps['type']) {
  if (type === 'back') {
    return '/icons/icon-back.svg';
  }
  return `/icons/iconbtn-${type}.svg`;
}

export function IconButton({ type, size, onClick, className }: IconButtonProps) {
  const resolvedSize = size ?? defaultSize[type];
  const isBack = type === 'back';
  const px = resolvedSize === 'lg' ? 96 : resolvedSize === 'md' ? 74 : 63;

  return (
    <button
      className={`${styles.button} ${isBack ? styles.buttonBack : ''} ${className ?? ''}`}
      style={isBack ? undefined : { width: px, height: px }}
      onClick={onClick}
      type="button"
    >
      <img src={getSrc(type)} alt={type} className={styles.icon} />
    </button>
  );
}
