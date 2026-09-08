import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { glueOrphansPostProcessor } from './glueOrphans';
import { NAMESPACES } from './namespaces';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enBlocks from './locales/en/blocks.json';
import enCreative from './locales/en/creative.json';
import enDevelopment from './locales/en/development.json';
import enManagement from './locales/en/management.json';
import enData from './locales/en/data.json';
import enInformatics from './locales/en/informatics.json';
import enCalendars from './locales/en/calendars.json';
import enSharedGames1 from './locales/en/sharedGames1.json';
import enSharedGames2 from './locales/en/sharedGames2.json';
import enSharedOther from './locales/en/sharedOther.json';

export const LANGUAGE_STORAGE_KEY = 'app-language';

const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

/**
 * Ключи перевода — это сами русские фразы (t('Исходный текст')). Для ru
 * отдельного словаря нет: i18next возвращает ключ как есть, если перевода
 * не нашлось, а ключ и есть исходный русский текст.
 */
i18n
  .use(glueOrphansPostProcessor)
  .use(initReactI18next)
  .init({
  lng: storedLanguage === 'en' ? 'en' : 'ru',
  fallbackLng: 'ru',
  ns: NAMESPACES,
  defaultNS: 'common',
  // Общие компоненты (TaskIntro, TaskMoral, GameInstruction, календарные карточки
  // и т.п.) рендерят текст из data.ts разных треков через t(), но сами привязаны
  // к своему namespace (sharedOther/sharedGamesN/calendars). Перевод конкретной
  // строки при этом лежит в namespace того трека, откуда пришли данные (creative,
  // development, management, data, informatics). Поэтому при поиске ключа нужно
  // проверять ВСЕ namespace, а не только свой.
  fallbackNS: NAMESPACES,
  postProcess: ['glueOrphans'],
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  resources: {
    en: {
      common: enCommon,
      home: enHome,
      blocks: enBlocks,
      creative: enCreative,
      development: enDevelopment,
      management: enManagement,
      data: enData,
      informatics: enInformatics,
      calendars: enCalendars,
      sharedGames1: enSharedGames1,
      sharedGames2: enSharedGames2,
      sharedOther: enSharedOther,
    },
  },
});

export function setLanguage(lang: 'ru' | 'en') {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
}

export default i18n;
