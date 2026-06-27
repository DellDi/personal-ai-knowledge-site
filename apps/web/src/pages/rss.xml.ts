import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { collectionNames, getAllPublishedEntries, getEntryPath } from '../lib/content';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://example.com');
  const entries = await getAllPublishedEntries();

  return rss({
    title: 'Personal AI Knowledge Site',
    description: 'Podcast, posts, knowledge, topics, projects, resources, and glossary updates.',
    site,
    items: entries.map(({ collection, entry }) => ({
      title: entry.data.title,
      description: `${collectionNames[entry.data.lang][collection]} / ${entry.data.description}`,
      pubDate: entry.data.date ?? entry.data.updated ?? new Date(),
      link: getEntryPath(collection, entry),
    })),
  });
}
