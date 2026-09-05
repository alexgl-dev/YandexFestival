import styles from './Message.module.css';

export interface MessageProps {
  title: string;
  description?: string;
  className?: string;
}

/** Message по Figma (28:396): белая плашка 870, padding 40, radius 30, заголовок YS Text Wide 32 + описание 24 */
export function Message({ title, description, className }: MessageProps) {
  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
