import type { CollectionEntry } from 'astro:content';
import type { PublicCollection, PublicEntry } from './content';
import { getEntryPath } from './content';
import { ui, type Locale } from './i18n';

type JsonLd = Record<string, unknown>;

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], site: URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, site).toString() } : {}),
    })),
  };
}

export function buildArticleJsonLd(
  collection: PublicCollection,
  entry: PublicEntry,
  site: URL,
  locale: Locale,
): JsonLd {
  const path = getEntryPath(collection, entry);
  const url = new URL(path, site).toString();
  const date = entry.data.date ?? entry.data.updated;
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.data.title,
    description: entry.data.description,
    url,
    inLanguage: locale,
    author: {
      '@type': 'Person',
      name: ui[locale].siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: ui[locale].siteName,
    },
    keywords: entry.data.tags.join(', '),
  };
  if (date) {
    base.datePublished = date.toISOString();
  }
  if (entry.data.updated) {
    base.dateModified = entry.data.updated.toISOString();
  }
  return base;
}

export function buildPodcastEpisodeJsonLd(
  entry: CollectionEntry<'podcast'>,
  site: URL,
  locale: Locale,
): JsonLd {
  const data = entry.data;
  const path = getEntryPath('podcast', entry);
  const url = new URL(path, site).toString();
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PodcastEpisode',
    name: data.title,
    description: data.description,
    url,
    inLanguage: locale,
    episodeNumber: data.episode,
    partOfSeason: {
      '@type': 'PodcastSeason',
      seasonNumber: data.season,
    },
    author: {
      '@type': 'Person',
      name: ui[locale].siteName,
    },
  };
  if (data.date) {
    node.datePublished = data.date.toISOString();
  }
  if (data.duration) {
    node.duration = data.duration;
  }
  if (data.transcript) {
    node.transcript = url;
  }
  return node;
}
