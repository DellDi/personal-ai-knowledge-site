import type { Loader, LoaderContext } from 'astro/loaders';

export interface CmsLoaderOptions {
  /** Payload collection slug, e.g. 'posts' */
  collection: string;
  /** Payload REST API base URL, e.g. http://localhost:3000/api. Falls back to CMS_API_URL env. */
  apiURL?: string;
  /** Optional bearer token for authenticated reads. Falls back to CMS_API_TOKEN env. */
  token?: string;
  /** Max entries per page. Defaults to 100. */
  limit?: number;
  /** Set true to silently return empty when CMS is unreachable. Defaults to true. */
  graceful?: boolean;
}

interface PayloadDoc {
  id: string;
  title: string;
  description: string;
  lang: 'zh-CN' | 'en';
  translationKey: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  date?: string;
  updated?: string;
  tags?: string[];
  category?: string;
  series?: string;
  cover?: { url?: string };
  content?: unknown;
  contentBlocks?: unknown[];
  [key: string]: unknown;
}

interface PayloadListResponse {
  docs: PayloadDoc[];
  totalDocs: number;
  totalPages: number;
  nextPage?: number;
}

function resolveApiURL(opts: CmsLoaderOptions): string | undefined {
  return opts.apiURL ?? process.env.CMS_API_URL ?? undefined;
}

function resolveToken(opts: CmsLoaderOptions): string | undefined {
  return opts.token ?? process.env.CMS_API_TOKEN ?? undefined;
}

function richTextToMarkdown(doc: unknown): string {
  if (typeof doc === 'string') return doc;
  if (!doc || typeof doc !== 'object') return '';
  const node = doc as { type?: string; children?: unknown[]; text?: string; format?: string };
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  const children = Array.isArray(node.children) ? node.children : [];
  const inner = children.map(richTextToMarkdown).join('');
  if (node.type === 'paragraph') return `${inner}\n\n`;
  if (node.type === 'heading') {
    const level = (node.format && /^\d+$/.test(node.format) ? Number(node.format) : 2) as number;
    return `${'#'.repeat(Math.min(Math.max(level, 1), 6))} ${inner}\n\n`;
  }
  if (node.type === 'list') return `${inner}\n`;
  if (node.type === 'list-item-child') return `- ${inner}\n`;
  if (node.type === 'link') return `[${inner}]`;
  return inner;
}

function blocksToMarkdown(blocks: unknown[]): string {
  return blocks
    .map((block) => {
      const b = block as { blockType?: string; [key: string]: unknown };
      switch (b.blockType) {
        case 'calloutBlock': {
          const variant = b.variant as string;
          const title = b.title as string | undefined;
          const content = b.content as string | undefined;
          return `> **${title ?? variant}**\n> ${content ?? ''}\n`;
        }
        case 'codeBlock': {
          const code = b.code as string | undefined;
          const lang = b.language as string | undefined;
          return `\`\`\`${lang ?? ''}\n${code ?? ''}\n\`\`\`\n`;
        }
        case 'quoteBlock': {
          const content = b.content as string | undefined;
          const author = b.author as string | undefined;
          return `> ${content ?? ''}\n${author ? `> — ${author}\n` : ''}`;
        }
        case 'stepsBlock': {
          const items = (b.items as { text?: string }[]) ?? [];
          return items.map((item, i) => `${i + 1}. ${item.text ?? ''}`).join('\n') + '\n';
        }
        case 'statGridBlock': {
          const items = (b.items as { value?: string; label?: string }[]) ?? [];
          return items.map((item) => `- **${item.value ?? ''}** ${item.label ?? ''}`).join('\n') + '\n';
        }
        case 'compareTableBlock': {
          const cols = (b.columns as { key?: string; label?: string }[]) ?? [];
          const rows = (b.rows as { data?: Record<string, string> }[]) ?? [];
          const header = `| ${cols.map((c) => c.label ?? '').join(' | ')} |`;
          const divider = `| ${cols.map(() => '---').join(' | ')} |`;
          const body = rows
            .map((row) => `| ${cols.map((c) => row.data?.[c.key ?? ''] ?? '').join(' | ')} |`)
            .join('\n');
          return `${header}\n${divider}\n${body}\n`;
        }
        default:
          return '';
      }
    })
    .join('\n');
}

export function cmsLoader(options: CmsLoaderOptions): Loader {
  const { collection, limit = 100, graceful = true } = options;

  return {
    name: `cms-${collection}`,
    async load(ctx: LoaderContext) {
      const apiURL = resolveApiURL(options);
      const token = resolveToken(options);

      if (!apiURL) {
        if (graceful) {
          ctx.logger.warn(`CMS_API_URL 未设置，${collection} 集合将使用空数据。设置 CMS_API_URL 后从 Payload 拉取内容。`);
          ctx.store.clear();
          return;
        }
        throw new Error(`cmsLoader 需要 apiURL 或 CMS_API_URL 环境变量`);
      }

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `JWT ${token}`;

      ctx.logger.info(`从 CMS 拉取 ${collection}: ${apiURL}/${collection}`);

      try {
        const allDocs: PayloadDoc[] = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          const url = new URL(`${apiURL}/${collection}`);
          url.searchParams.set('limit', String(limit));
          url.searchParams.set('page', String(page));
          url.searchParams.set('where[status][equals]', 'published');
          url.searchParams.set('depth', '2');

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          let res: Response;
          try {
            res = await fetch(url, { headers, signal: controller.signal });
          } finally {
            clearTimeout(timeout);
          }
          if (!res.ok) {
            throw new Error(`CMS 响应 ${res.status}: ${res.statusText}`);
          }
          const body = (await res.json()) as PayloadListResponse;
          allDocs.push(...body.docs);
          totalPages = body.totalPages ?? 1;
          page = body.nextPage ?? page + 1;
          if (!body.nextPage) break;
        }

        ctx.store.clear();

        for (const doc of allDocs) {
          const id = doc.id;
          let markdown = '';
          if (doc.content) {
            markdown = richTextToMarkdown(doc.content);
          }
          if (Array.isArray(doc.contentBlocks) && doc.contentBlocks.length > 0) {
            markdown += '\n' + blocksToMarkdown(doc.contentBlocks);
          }

          const data = await ctx.parseData({
            id,
            data: {
              title: doc.title,
              description: doc.description,
              lang: doc.lang,
              translationKey: doc.translationKey,
              slug: doc.slug,
              tags: doc.tags ?? [],
              status: doc.status,
              featured: doc.featured ?? false,
              date: doc.date,
              updated: doc.updated,
              category: doc.category,
              series: doc.series,
            },
          });

          let rendered: { html: string; metadata?: Record<string, unknown> } | undefined;
          if (markdown.trim()) {
            rendered = await ctx.renderMarkdown(markdown);
          }

          ctx.store.set({
            id,
            data,
            body: markdown || undefined,
            rendered,
            digest: ctx.generateDigest({ id, updatedAt: doc.updated ?? doc.id }),
          });
        }

        ctx.logger.info(`${collection}: 从 CMS 加载 ${allDocs.length} 条已发布内容`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (graceful) {
          ctx.logger.warn(`CMS 不可达，${collection} 集合使用空数据: ${message}`);
          ctx.store.clear();
          return;
        }
        throw err;
      }
    },
  };
}
