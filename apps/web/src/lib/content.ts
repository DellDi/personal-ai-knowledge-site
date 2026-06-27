import { getCollection, type CollectionEntry } from 'astro:content';
import { type Locale } from './i18n';

export const publicCollections = [
  'podcast',
  'posts',
  'knowledge',
  'topics',
  'projects',
  'resources',
  'glossary',
  'timeline',
] as const;

export type PublicCollection = (typeof publicCollections)[number];
export type PublicEntry = CollectionEntry<PublicCollection>;

export const collectionBasePaths: Record<PublicCollection, string> = {
  podcast: '/podcast',
  posts: '/posts',
  knowledge: '/knowledge',
  topics: '/topics',
  projects: '/projects',
  resources: '/resources',
  glossary: '/glossary',
  timeline: '/timeline',
};

export const collectionNames: Record<Locale, Record<PublicCollection, string>> = {
  'zh-CN': {
    podcast: '播客',
    posts: '文章',
    knowledge: '知识库',
    topics: '专题',
    projects: '项目',
    resources: '资源',
    glossary: '术语',
    timeline: '时间线',
  },
  en: {
    podcast: 'Podcast',
    posts: 'Posts',
    knowledge: 'Knowledge',
    topics: 'Topics',
    projects: 'Projects',
    resources: 'Resources',
    glossary: 'Glossary',
    timeline: 'Timeline',
  },
};

export function isPublished(entry: PublicEntry) {
  return entry.data.status === 'published';
}

export function sortByDateDesc<T extends PublicEntry>(entries: T[]) {
  return [...entries].sort((a, b) => {
    const bDate = b.data.date?.getTime() ?? b.data.updated?.getTime() ?? 0;
    const aDate = a.data.date?.getTime() ?? a.data.updated?.getTime() ?? 0;
    return bDate - aDate;
  });
}

export async function getPublishedEntries<T extends PublicCollection>(collection: T, locale: Locale) {
  const entries = await getCollection(collection, ({ data }) => {
    return data.status === 'published' && data.lang === locale;
  });

  return sortByDateDesc(entries as CollectionEntry<T>[]);
}

export async function getAllPublishedEntries(locale?: Locale) {
  const groups = await Promise.all(
    publicCollections.map(async (collection) => {
      const entries = await getCollection(collection, ({ data }) => {
        return data.status === 'published' && (!locale || data.lang === locale);
      });

      return entries.map((entry) => ({ collection, entry })) as {
        collection: PublicCollection;
        entry: PublicEntry;
      }[];
    }),
  );

  return groups.flat().sort((a, b) => {
    const bDate = b.entry.data.date?.getTime() ?? b.entry.data.updated?.getTime() ?? 0;
    const aDate = a.entry.data.date?.getTime() ?? a.entry.data.updated?.getTime() ?? 0;
    return bDate - aDate;
  });
}

export async function getTags(locale: Locale) {
  const all = await getAllPublishedEntries(locale);
  return [...new Set(all.flatMap(({ entry }) => entry.data.tags))].sort((a, b) => a.localeCompare(b));
}

export async function getEntriesByTag(locale: Locale, tag: string) {
  const all = await getAllPublishedEntries(locale);
  return all.filter(({ entry }) => entry.data.tags.includes(tag));
}

export async function getTranslationAlternates(collection: PublicCollection, entry: PublicEntry) {
  const related = await getCollection(collection, ({ data }) => {
    return data.status === 'published' && data.translationKey === entry.data.translationKey;
  });

  return related.map((item) => ({
    locale: item.data.lang,
    path: getEntryPath(collection, item as PublicEntry),
  }));
}

export function getEntryPath(collection: PublicCollection, entry: PublicEntry) {
  return `/${entry.data.lang}${collectionBasePaths[collection]}/${entry.data.slug}`;
}

export function getCollectionPath(collection: PublicCollection, locale: Locale) {
  return `/${locale}${collectionBasePaths[collection]}`;
}

export function formatDate(date: Date | undefined, locale: Locale) {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
