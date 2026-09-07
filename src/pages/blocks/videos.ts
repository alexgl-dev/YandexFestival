/**
 * Все ролики блока в одном месте: «Истории яндексоидов» живут на уровне блока,
 * а не внутри отдельных разделов. Здесь склеиваются видео всех разделов блока
 * (и «Профориентации», и «Информатики во всём») в порядке разделов.
 */
import type { SectionData, Video } from '../../types/game';
import type { Namespace } from '../../i18n/namespaces';
import { creativeSection } from '../creative/data';
import { developmentSection } from '../development/data';
import { managementSection } from '../management/data';
import { dataSection } from '../data/data';
import { accessSection } from '../informatics/access/data';
import { advertisingSection } from '../informatics/advertising/data';
import { mlSection } from '../informatics/ml/data';
import { aiSection } from '../informatics/ai/data';

/** Ролик + пространство имён своего раздела — заголовки переводятся своим неймспейсом. */
export interface BlockVideo extends Video {
  ns: Namespace;
}

/** Раздел → блок и неймспейс переводов. Порядок задаёт порядок роликов на экране. */
const sections: { section: SectionData; block: string; ns: Namespace }[] = [
  { section: managementSection, block: 'management', ns: 'management' },
  { section: accessSection, block: 'management', ns: 'informatics' },
  { section: creativeSection, block: 'creative', ns: 'creative' },
  { section: advertisingSection, block: 'creative', ns: 'informatics' },
  { section: dataSection, block: 'data', ns: 'data' },
  { section: mlSection, block: 'data', ns: 'informatics' },
  { section: developmentSection, block: 'development', ns: 'development' },
  { section: aiSection, block: 'development', ns: 'informatics' },
];

/** Ролики блока — из всех его разделов подряд. */
export function videosForBlock(blockId?: string): BlockVideo[] {
  if (!blockId) return [];
  return sections
    .filter((entry) => entry.block === blockId)
    .flatMap((entry) => entry.section.videos.map((video) => ({ ...video, ns: entry.ns })));
}

/** Есть ли у блока ролики (нужно ли показывать пункт меню). */
export function blockHasVideos(blockId?: string): boolean {
  return videosForBlock(blockId).length > 0;
}

/**
 * Путь к ролику на нужном языке. Конвенция: у каждого RU-файла лежит
 * англоязычная версия рядом, в подпапке `en/` (например
 * `/videos/003/kirill.mp4` → `/videos/003/en/kirill.mp4`). При добавлении
 * нового ролика с одним лишь RU-файлом переключение на EN покажет пустой
 * плеер — держать оба файла в паре.
 */
export function localizedVideoSrc(src: string, lang: string): string {
  if (lang !== 'en') return src;
  const lastSlash = src.lastIndexOf('/');
  return `${src.slice(0, lastSlash)}/en${src.slice(lastSlash)}`;
}
