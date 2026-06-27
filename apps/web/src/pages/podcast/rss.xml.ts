import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedEntries } from '../../lib/content';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://example.com');
  const zh = await getPublishedEntries('podcast', 'zh-CN');
  const en = await getPublishedEntries('podcast', 'en');
  const entries = [...zh, ...en];

  return rss({
    title: 'AI 知识实践站播客',
    description: '围绕我的 AI 实践、工程经验、项目复盘和知识管理的播客节目。',
    site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/${entry.data.lang}/podcast/${entry.data.slug}`,
      customData: `<enclosure url="${new URL(entry.data.audio, site).toString()}" type="audio/mpeg" />`,
    })),
  });
}
