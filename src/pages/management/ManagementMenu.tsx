import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function ManagementMenu() {
  const navigate = useNavigate();

  return (
    <Menu
      theme="orange"
      orientation="portrait"
      items={[
        { label: 'Описание направления', onClick: () => navigate('/management/description') },
        { label: 'Задачи на день', onClick: () => navigate('/management/tasks') },
        { label: 'Истории яндексоидов', onClick: () => navigate('/management/videos') },
        { label: 'Тест', onClick: () => navigate('/management/test') },
      ]}
    />
  );
}
