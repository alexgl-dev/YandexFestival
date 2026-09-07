import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';
import type { SectionData } from '../../types/game';
import { blockPath } from '../blocks/blocks';

/**
 * Меню раздела «Информатика во всём»: пункт на каждое задание.
 * Ролики раздела показываются не здесь, а в «Историях яндексоидов» блока (см. src/pages/blocks/videos.ts).
 * Названия пунктов — task.title (в доках это «Текст кнопки» основного меню).
 */
export function InformaticsMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('informatics');
  const data = useOutletContext<SectionData>();

  const items = [
    ...data.tasks
      .filter((task) => !task.hidden)
      .map((task) => ({ label: t(task.title), onClick: () => navigate(`/${data.slug}/tasks/${task.id}`) })),
  ];

  return (
    <Menu
      theme={data.theme}
      orientation={data.orientation}
      items={items}
      onBack={data.block ? () => navigate(blockPath(data.block!)) : undefined}
    />
  );
}
