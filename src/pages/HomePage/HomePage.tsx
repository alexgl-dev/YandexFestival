import { useNavigate } from 'react-router';
import { Background, Button } from '../../components/ui';
import { blocks, blockPath } from '../blocks/blocks';
import styles from './HomePage.module.css';

/** Служебный хаб для разработки: список блоков выставки. Киоски стартуют сразу с /block/:id. */
export function HomePage() {
  const navigate = useNavigate();

  return (
    <Background theme="orange" orientation="landscape" showBackButton={false}>
      <div className={styles.container}>
        <h1 className={styles.title}>Фестиваль молодёжи</h1>
        <p className={styles.subtitle}>Интерактивная выставка — выбери блок</p>
        <div className={styles.sections}>
          {blocks.map((block) => (
            <Button
              key={block.id}
              label={block.title}
              type="secondary"
              onClick={() => navigate(blockPath(block.id))}
            />
          ))}
        </div>
      </div>
    </Background>
  );
}
