import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function CreativeMenu() {
  const navigate = useNavigate();

  return (
    <Menu
      theme="cobalt"
      orientation="landscape"
      items={[
        { label: 'Описание направления', onClick: () => navigate('/creative/description') },
        { label: 'Задания', onClick: () => navigate('/creative/tasks') },
        { label: 'Истории яндексоидов', onClick: () => navigate('/creative/videos') },
        { label: 'Тест', onClick: () => navigate('/creative/test') },
      ]}
    />
  );
}
