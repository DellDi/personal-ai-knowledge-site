import type { Loader, LoaderContext } from 'astro/loaders';
import type { Block } from '@personal-ai-knowledge-site/content-contract';

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
  /** Clear the collection store before writing CMS docs. Defaults to true. */
  clearStore?: boolean;
  /** Extra field names to pass through from CMS docs into entry data. */
  passthroughFields?: string[];
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
  if (!doc || typeof doc !== 'object') return '';
  const node = doc as {
    type?: string;
    children?: unknown[];
    text?: string;
    tag?: string;
    url?: string;
    fields?: { url?: string };
    root?: unknown;
  };
  if (node.root) return richTextToMarkdown(node.root);
  if (typeof node.text === 'string') {
    if (node.type === 'code') return `\`${node.text}\``;
    return node.text;
  }
  const children = Array.isArray(node.children) ? node.children : [];
  const inner = children.map(richTextToMarkdown).join('');
  if (node.type === 'paragraph') return `${inner}\n\n`;
  if (node.type === 'heading') {
    const tagLevel = node.tag?.match(/^h([1-6])$/)?.[1];
    const level = tagLevel ? Number(tagLevel) : 2;
    return `${'#'.repeat(Math.min(Math.max(level, 1), 6))} ${inner.trim()}\n\n`;
  }
  if (node.type === 'root') return inner;
  if (node.type === 'list') return `${inner}\n`;
  if (node.type === 'listitem') return `- ${inner.trim()}\n`;
  if (node.type === 'quote') return `> ${inner.trim()}\n\n`;
  if (node.type === 'link') {
    const url = node.url ?? node.fields?.url;
    return url ? `[${inner}](${url})` : inner;
  }
  return inner;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function mediaURL(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return undefined;
  const url = stringValue(value.url) ?? stringValue(value.filename);
  if (!url) return undefined;
  return url;
}

function blockColumns(value: unknown): 2 | 3 | 4 | undefined {
  return value === 2 || value === 3 || value === 4 ? value : undefined;
}

function normalizeBlock(block: unknown): Block | undefined {
  if (!isRecord(block)) return undefined;
  const blockType = stringValue(block.blockType) ?? stringValue(block.type);

  switch (blockType) {
    case 'richText': {
      const content = stringValue(block.content);
      return content ? { type: 'richText', content } : undefined;
    }
    case 'callout':
    case 'calloutBlock': {
      const content = stringValue(block.content);
      if (!content) return undefined;
      const variant = block.variant === 'tip' || block.variant === 'warning' || block.variant === 'danger' ? block.variant : 'info';
      return {
        type: 'callout',
        variant,
        title: stringValue(block.title),
        content,
      };
    }
    case 'code':
    case 'codeBlock': {
      const code = stringValue(block.code);
      return code
        ? {
            type: 'code',
            language: stringValue(block.language),
            filename: stringValue(block.filename),
            code,
          }
        : undefined;
    }
    case 'audio':
    case 'audioBlock': {
      const src = mediaURL(block.src);
      return src
        ? {
            type: 'audio',
            src,
            title: stringValue(block.title),
            duration: stringValue(block.duration),
            download: mediaURL(block.download),
          }
        : undefined;
    }
    case 'image':
    case 'imageBlock': {
      const src = mediaURL(block.src);
      const alt = stringValue(block.alt);
      return src && alt
        ? {
            type: 'image',
            src,
            alt,
            caption: stringValue(block.caption),
            source: stringValue(block.source),
          }
        : undefined;
    }
    case 'quote':
    case 'quoteBlock': {
      const content = stringValue(block.content);
      return content
        ? {
            type: 'quote',
            content,
            author: stringValue(block.author),
            source: stringValue(block.source),
            url: stringValue(block.url),
          }
        : undefined;
    }
    case 'embed':
    case 'embedBlock': {
      const src = stringValue(block.src);
      const ratio = block.ratio === '4-3' || block.ratio === '1-1' ? block.ratio : '16-9';
      return src
        ? {
            type: 'embed',
            src,
            title: stringValue(block.title),
            ratio,
          }
        : undefined;
    }
    case 'steps':
    case 'stepsBlock': {
      const items = Array.isArray(block.items)
        ? block.items
            .map((item) => {
              if (typeof item === 'string') return item;
              return isRecord(item) ? stringValue(item.text) : undefined;
            })
            .filter((item): item is string => Boolean(item))
        : [];
      return items.length > 0
        ? {
            type: 'steps',
            title: stringValue(block.title),
            items,
          }
        : undefined;
    }
    case 'statGrid':
    case 'statGridBlock': {
      const items = Array.isArray(block.items)
        ? block.items
            .map((item) => {
              if (!isRecord(item)) return undefined;
              const value = stringValue(item.value);
              const label = stringValue(item.label);
              return value && label ? { value, label } : undefined;
            })
            .filter((item): item is { value: string; label: string } => Boolean(item))
        : [];
      return items.length > 0
        ? {
            type: 'statGrid',
            columns: blockColumns(block.columns),
            items,
          }
        : undefined;
    }
    case 'compareTable':
    case 'compareTableBlock': {
      const columns = Array.isArray(block.columns)
        ? block.columns
            .map((column) => {
              if (!isRecord(column)) return undefined;
              const key = stringValue(column.key);
              const label = stringValue(column.label);
              return key && label ? { key, label, highlight: column.highlight === true } : undefined;
            })
            .filter((column): column is { key: string; label: string; highlight: boolean } => Boolean(column))
        : [];
      const rows = Array.isArray(block.rows)
        ? block.rows
            .map((row) => {
              const data = isRecord(row) && isRecord(row.data) ? row.data : row;
              if (!isRecord(data)) return undefined;
              return Object.fromEntries(
                Object.entries(data)
                  .filter(([, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => [key, String(value)]),
              );
            })
            .filter((row): row is Record<string, string> => Boolean(row))
        : [];
      return columns.length > 0 && rows.length > 0
        ? {
            type: 'compareTable',
            caption: stringValue(block.caption),
            columns,
            rows,
          }
        : undefined;
    }
    default:
      return undefined;
  }
}

function normalizeBlocks(blocks: unknown): Block[] | undefined {
  if (!Array.isArray(blocks)) return undefined;
  const normalized = blocks.map(normalizeBlock).filter((block): block is Block => Boolean(block));
  return normalized.length > 0 ? normalized : undefined;
}

function normalizePassthroughField(field: string, value: unknown): unknown {
  if (field === 'contentBlocks') return normalizeBlocks(value);
  if (field === 'cover' || field === 'hero') return mediaURL(value);
  return value;
}

export function cmsLoader(options: CmsLoaderOptions): Loader {
  const { collection, limit = 100, graceful = true, clearStore = true, passthroughFields = [] } = options;

  return {
    name: `cms-${collection}`,
    async load(ctx: LoaderContext) {
      const apiURL = resolveApiURL(options);
      const token = resolveToken(options);

      if (!apiURL) {
        if (graceful) {
          ctx.logger.warn(
            clearStore
              ? `CMS_API_URL 未设置，${collection} 集合将使用空数据。设置 CMS_API_URL 后从 Payload 拉取内容。`
              : `CMS_API_URL 未设置，${collection} 集合保留现有内容。`,
          );
          if (clearStore) ctx.store.clear();
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

        if (clearStore) ctx.store.clear();

        for (const doc of allDocs) {
          const id = doc.id;
          let markdown = '';
          if (doc.content) {
            markdown = richTextToMarkdown(doc.content);
          }
          const normalizedBlocks = normalizeBlocks(doc.contentBlocks);

          const rawData: Record<string, unknown> = {
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
          };
          for (const field of passthroughFields) {
            if (doc[field] !== undefined) {
              rawData[field] = normalizePassthroughField(field, doc[field]);
            }
          }
          if (passthroughFields.includes('contentBlocks') && normalizedBlocks) {
            rawData.contentBlocks = normalizedBlocks;
          }

          const data = await ctx.parseData({
            id,
            data: rawData,
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
          ctx.logger.warn(
            clearStore
              ? `CMS 不可达，${collection} 集合使用空数据: ${message}`
              : `CMS 不可达，${collection} 集合保留现有内容: ${message}`,
          );
          if (clearStore) ctx.store.clear();
          return;
        }
        throw err;
      }
    },
  };
}
