import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function CreativeMenu() {
  const navigate = useNavigate();

  return (
    <Menu
      theme="orange"
      orientation="portrait"
      items={[
        { label: 'Описание направления', onClick: () => navigate('/creative/description') },
        { label: 'Задачи на день', onClick: () => navigate('/creative/tasks') },
        { label: 'Истории яндексоидов', onClick: () => navigate('/creative/videos') },
        { label: 'Бинго-знакомство', onClick: () => navigate('/creative/test') },
      ]}
    />
  );
}
