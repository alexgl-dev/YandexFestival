import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';

export function DataMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('data');

  return (
    <Menu
      theme="cobalt"
      orientation="portrait"
      items={[
        { label: t("Описание направления"), onClick: () => navigate('/data/description') },
        { label: t("Задачи на день"), onClick: () => navigate('/data/tasks') },
        { label: t("Бинго-знакомство"), onClick: () => navigate('/data/test') },
      ]}
      onBack={() => navigate('/block/data')}
    />
  );
}
