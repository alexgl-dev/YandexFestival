import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';

export function ManagementMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('management');

  return (
    <Menu
      theme="orange"
      orientation="portrait"
      items={[
        { label: t('Описание направления'), onClick: () => navigate('/management/description') },
        { label: t('Задачи на день'), onClick: () => navigate('/management/tasks') },
        { label: t('Бинго-знакомство'), onClick: () => navigate('/management/test') },
      ]}
      onBack={() => navigate('/block/management')}
    />
  );
}
