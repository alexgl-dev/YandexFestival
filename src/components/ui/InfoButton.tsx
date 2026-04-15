import styles from './InfoButton.module.css';

export interface InfoButtonProps {
  /** sm=40px  md=64px  lg=96px */
  size?: 'sm' | 'md' | 'lg';
  /** dark — серый фон (на светлом)  ghost — полупрозрачный (на цветном/тёмном) */
  variant?: 'dark' | 'ghost';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const sizeMap: Record<NonNullable<InfoButtonProps['size']>, { px: number; fontSize: string }> = {
  sm: { px: 40,  fontSize: 'var(--font-size-2xs)' },
  md: { px: 64,  fontSize: 'var(--font-size-xs)'  },
  lg: { px: 96,  fontSize: 'var(--font-size-sm)'  },
};

export function InfoButton({ size = 'md', variant = 'dark', onClick, className }: InfoButtonProps) {
  const { px, fontSize } = sizeMap[size];

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className ?? ''}`}
      style={{ width: px, height: px, fontSize }}
      onClick={onClick}
      type="button"
    >
      ?
    </button>
  );
}
