import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';

export function CalendarsMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('calendars');
  return (
    <Menu
      theme="cobalt"
      orientation="portrait"
      showLogo={true}
      items={[
        { label: t('Разработка'), onClick: () => navigate('/calendars/development') },
        { label: t('Работа с данными'), onClick: () => navigate('/calendars/data') },
        { label: t('Менеджмент'), onClick: () => navigate('/calendars/management') },
        { label: t('Креативный трек'), onClick: () => navigate('/calendars/creative') },
      ]}
      onBack={() => navigate('/block/management')}
    />
  );
}
