import { useNavigate } from 'react-router';
import { Background, Button } from '../../components/ui';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Background theme="orange" orientation="landscape" showBackButton={false}>
      <div className={styles.container}>
        <h1 className={styles.title}>YandexSuperHot</h1>
        <p className={styles.subtitle}>Интерактивная выставка</p>
        <div className={styles.sections}>
          <Button
            label="Креативный трек"
            type="main"
            onClick={() => navigate('/creative')}
          />
        </div>
      </div>
    </Background>
  );
}
