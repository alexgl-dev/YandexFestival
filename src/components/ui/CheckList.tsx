import { useTranslation } from 'react-i18next';
import styles from './CheckList.module.css';

export interface CheckListProps {
  checked: boolean;
  /** blue — синий бордер / синяя галочка; black — серый бордер / чёрная галочка */
  type?: 'blue' | 'black';
  className?: string;
}

/** Check list по Figma (28:491…28:498): квадрат 44, radius 8, бордер 2; checked — SVG из макета */
export function CheckList({ checked, type = 'blue', className }: CheckListProps) {
  const { t } = useTranslation('common');
  if (checked) {
    return (
      <img
        src={`/icons/figma/checklist-true-${type}.svg`}
        alt={t("выбрано")}
        className={`${styles.box} ${className ?? ''}`}
      />
    );
  }
  return <div className={`${styles.box} ${styles.unchecked} ${styles[type]} ${className ?? ''}`} />;
}
