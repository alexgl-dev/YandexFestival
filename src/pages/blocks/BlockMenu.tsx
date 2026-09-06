import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Menu } from '../../components/ui';
import { findBlock } from './blocks';

/** Меню блока выставки: /block/:blockId — стартовый экран устройства. */
export function BlockMenu() {
  const { t } = useTranslation('blocks');
  const navigate = useNavigate();
  const { blockId } = useParams();
  const block = findBlock(blockId);

  if (!block) {
    return <div>{t('Блок не найден')}</div>;
  }

  return (
    <Menu
      theme={block.theme}
      orientation={block.orientation}
      items={block.items.map((item) => ({ label: t(item.label), onClick: () => navigate(item.to) }))}
    />
  );
}
