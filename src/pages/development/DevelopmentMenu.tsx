import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function DevelopmentMenu() {
  const navigate = useNavigate();

  return (
    <Menu
      theme="cobalt"
      orientation="landscape"
      items={[
        { label: 'Описание направления', onClick: () => navigate('/development/description') },
        { label: 'Задачи на день', onClick: () => navigate('/development/tasks') },
        { label: 'Истории яндексоидов', onClick: () => navigate('/development/videos') },
        { label: 'Бинго-знакомство', onClick: () => navigate('/development/test') },
      ]}
    />
  );
}
