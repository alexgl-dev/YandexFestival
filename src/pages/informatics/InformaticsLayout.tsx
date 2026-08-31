import { Outlet } from 'react-router';
import type { SectionData } from '../../types/game';

/**
 * Generic-layout раздела трека «Информатика во всём».
 * Данные раздела передаются пропом, а не импортом — один набор страниц на 4 раздела.
 */
export function InformaticsLayout({ data }: { data: SectionData }) {
  return <Outlet context={data} />;
}
