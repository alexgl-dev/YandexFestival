import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';

export function DevelopmentMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('development');

  return (
    <Menu
      theme="cobalt"
      orientation="landscape"
      items={[
        { label: t("Описание направления"), onClick: () => navigate('/development/description') },
        { label: t("Задачи на день"), onClick: () => navigate('/development/tasks') },
        { label: t("Бинго-знакомство"), onClick: () => navigate('/development/test') },
      ]}
      onBack={() => navigate('/block/development')}
    />
  );
}
