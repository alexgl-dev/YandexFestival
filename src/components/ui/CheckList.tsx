import styles from './CheckList.module.css';

export interface CheckListProps {
  checked: boolean;
  className?: string;
}

export function CheckList({ checked, className }: CheckListProps) {
  return (
    <div
      className={`${styles.circle} ${checked ? styles.checked : styles.unchecked} ${className ?? ''}`}
    >
      {checked && (
        <svg
          className={styles.checkmark}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12.5L9.5 17L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
