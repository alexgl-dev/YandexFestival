import { useNavigate, useParams } from 'react-router';
import { Menu } from '../../components/ui';
import { findBlock } from './blocks';

/** Меню блока выставки: /block/:blockId — стартовый экран устройства. */
export function BlockMenu() {
  const navigate = useNavigate();
  const { blockId } = useParams();
  const block = findBlock(blockId);

  if (!block) {
    return <div>Блок не найден</div>;
  }

  return (
    <Menu
      theme={block.theme}
      orientation={block.orientation}
      items={block.items.map((item) => ({ label: item.label, onClick: () => navigate(item.to) }))}
    />
  );
}
