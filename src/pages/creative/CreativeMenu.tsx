import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';

export function CreativeMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('creative');

  return (
    <Menu
      theme="orange"
      orientation="portrait"
      items={[
        { label: t('Описание направления'), onClick: () => navigate('/creative/description') },
        { label: t('Задачи на день'), onClick: () => navigate('/creative/tasks') },
        { label: t('Истории яндексоидов'), onClick: () => navigate('/creative/videos') },
        { label: t('Бинго-знакомство'), onClick: () => navigate('/creative/test') },
      ]}
      onBack={() => navigate('/block/creative')}
    />
  );
}
