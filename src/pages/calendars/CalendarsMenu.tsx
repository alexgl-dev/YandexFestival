import { useNavigate } from 'react-router';
import { Menu } from '../../components/ui';

export function CalendarsMenu() {
  const navigate = useNavigate();
  return (
    <Menu
      theme="cobalt"
      orientation="portrait"
      items={[
        { label: 'Разработка', onClick: () => navigate('/calendars/development') },
        { label: 'Работа с данными', onClick: () => navigate('/calendars/data') },
        { label: 'Менеджмент', onClick: () => navigate('/calendars/management') },
        { label: 'Креативный трек', onClick: () => navigate('/calendars/creative') },
      ]}
    />
  );
}
