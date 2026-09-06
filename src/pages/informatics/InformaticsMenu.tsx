import { useNavigate, useOutletContext } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu } from '../../components/ui';
import type { SectionData } from '../../types/game';
import { blockPath } from '../blocks/blocks';

/**
 * Меню раздела «Информатика во всём»: пункт на каждое задание + «Видео», если есть ролики.
 * Названия пунктов — task.title (в доках это «Текст кнопки» основного меню).
 */
export function InformaticsMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation('informatics');
  const data = useOutletContext<SectionData>();

  const items = [
    ...(data.videos.length > 0
      ? [{ label: t("Познакомься со специалистом"), onClick: () => navigate(`/${data.slug}/videos`) }]
      : []),
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
