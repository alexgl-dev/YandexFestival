import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function DataMenu() {
  const navigate = useNavigate();

  return (
    <Menu
      theme="cobalt"
      orientation="landscape"
      items={[
        { label: 'Описание направления', onClick: () => navigate('/data/description') },
        { label: 'Задания', onClick: () => navigate('/data/tasks') },
        { label: 'Истории яндексоидов', onClick: () => navigate('/data/videos') },
        { label: 'Тест', onClick: () => navigate('/data/test') },
      ]}
    />
  );
}
