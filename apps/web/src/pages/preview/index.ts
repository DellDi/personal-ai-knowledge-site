import type { APIRoute } from 'astro';
import type { Block } from '@personal-ai-knowledge-site/content-contract';

export const prerender = false;

interface CmsDoc {
  id: string;
  title: string;
  description: string;
  lang: 'zh-CN' | 'en';
  translationKey: string;
  slug: string;
  status: string;
  featured: boolean;
  date?: string;
  updated?: string;
  tags?: string[];
  category?: string;
  series?: string;
  content?: unknown;
  contentBlocks?: Block[];
  [key: string]: unknown;
}

function getApiBase(): string | undefined {
  return process.env.CMS_API_URL ?? undefined;
}

function getToken(): string | undefined {
  return process.env.CMS_API_TOKEN ?? undefined;
}

async function fetchDoc(collection: string, id: string): Promise<CmsDoc | undefined> {
  const base = getApiBase();
  if (!base) return undefined;
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `JWT ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${base}/${collection}/${id}?depth=2&draft=true`, {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) return undefined;
    return (await res.json()) as CmsDoc;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

function richTextToHtml(doc: unknown): string {
  if (typeof doc === 'string') return doc;
  if (!doc || typeof doc !== 'object') return '';
  const node = doc as { type?: string; children?: unknown[]; text?: string };
  if (node.type === 'text' && typeof node.text === 'string') return node.text;
  const children = Array.isArray(node.children) ? node.children : [];
  const inner = children.map(richTextToHtml).join('');
  if (node.type === 'paragraph') return `<p>${inner}</p>`;
  if (node.type === 'heading') return `<h2>${inner}</h2>`;
  if (node.type === 'link') return `<a href="#">${inner}</a>`;
  return inner;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BLOCK_TYPE_MAP: Record<string, Block['type']> = {
  richTextBlock: 'richText',
  calloutBlock: 'callout',
  codeBlock: 'code',
  audioBlock: 'audio',
  imageBlock: 'image',
  quoteBlock: 'quote',
  embedBlock: 'embed',
  stepsBlock: 'steps',
  statGridBlock: 'statGrid',
  compareTableBlock: 'compareTable',
};

function normalizeBlock(block: unknown): Block | undefined {
  if (!block || typeof block !== 'object') return undefined;
  const record = block as Record<string, unknown>;
  const rawType = typeof record.type === 'string' ? record.type : typeof record.blockType === 'string' ? record.blockType : '';
  const type = BLOCK_TYPE_MAP[rawType] ?? rawType;
  if (!type) return undefined;
  return { ...record, type } as Block;
}

function renderBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';

  return blocks
    .map(normalizeBlock)
    .filter((block): block is Block => Boolean(block))
    .map((block) => {
      if (block.type === 'richText') return `<section class="preview-block">${richTextToHtml(block.content)}</section>`;
      if (block.type === 'callout') {
        return `<aside class="preview-block callout"><strong>${escapeHtml(block.title ?? '提示')}</strong><p>${escapeHtml(block.content)}</p></aside>`;
      }
      if (block.type === 'code') {
        return `<figure class="preview-block code"><figcaption>${escapeHtml(block.filename ?? block.language ?? 'code')}</figcaption><pre><code>${escapeHtml(block.code)}</code></pre></figure>`;
      }
      if (block.type === 'audio') {
        return `<figure class="preview-block media"><figcaption>${escapeHtml(block.title ?? '音频')}</figcaption><audio controls src="${escapeHtml(block.src)}"></audio></figure>`;
      }
      if (block.type === 'image') {
        return `<figure class="preview-block media"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" /><figcaption>${escapeHtml(block.caption ?? '')}</figcaption></figure>`;
      }
      if (block.type === 'quote') {
        return `<blockquote class="preview-block quote"><p>${escapeHtml(block.content)}</p>${block.author ? `<cite>${escapeHtml(block.author)}</cite>` : ''}</blockquote>`;
      }
      if (block.type === 'embed') {
        return `<section class="preview-block embed"><a href="${escapeHtml(block.src)}">${escapeHtml(block.title ?? block.src)}</a></section>`;
      }
      if (block.type === 'steps') {
        const items = (block.items as unknown[])
          .map((item) => `<li>${escapeHtml(typeof item === 'object' && item !== null && 'text' in item ? item.text : item)}</li>`)
          .join('');
        return `<section class="preview-block"><h2>${escapeHtml(block.title ?? '步骤')}</h2><ol>${items}</ol></section>`;
      }
      if (block.type === 'statGrid') {
        const items = block.items
          .map((item) => `<li><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></li>`)
          .join('');
        return `<section class="preview-block"><ul class="stat-grid">${items}</ul></section>`;
      }
      if (block.type === 'compareTable') {
        const columns = block.columns ?? [];
        const headers = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
        const rows = block.rows
          .map((row) => {
            const data = 'data' in row && typeof row.data === 'object' && row.data !== null ? row.data : row;
            const cells = columns
              .map((column) => `<td>${escapeHtml((data as Record<string, unknown>)[column.key])}</td>`)
              .join('');
            return `<tr>${cells}</tr>`;
          })
          .join('');
        return `<section class="preview-block table-wrap"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
      }
      return '';
    })
    .join('');
}

const CONTENT_COLLECTIONS = ['posts', 'podcast', 'knowledge', 'topics', 'projects', 'resources', 'glossary', 'timeline'];

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const collection = params.get('collection') ?? '';
  const id = params.get('id') ?? '';

  if (!collection || !id || !CONTENT_COLLECTIONS.includes(collection)) {
    return new Response('参数缺失或集合无效。需要 ?collection=<slug>&id=<docId>', { status: 400 });
  }

  const doc = await fetchDoc(collection, id);
  if (!doc) {
    return new Response('无法从 CMS 读取草稿。请检查 CMS_API_URL 和 CMS_API_TOKEN。', { status: 502 });
  }

  const contentHtml = doc.content ? richTextToHtml(doc.content) : '';
  const blocksHtml = renderBlocks(doc.contentBlocks);

  const statusBadge = doc.status === 'draft' ? '草稿预览' : doc.status === 'published' ? '已发布' : doc.status;

  const html = `<!doctype html>
<html lang="${doc.lang}" data-theme="light" data-theme-preference="system">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${doc.title} | 预览</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;600;700;800&family=Public+Sans:wght@400;500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --color-bg: #f4f0e8; --color-surface: #fffaf0; --color-ink: #111111;
    --color-muted: #655d54; --color-border: #111111; --color-accent: #ff4d00;
    --color-accent-2: #0057ff; --color-accent-3: #dfff00;
    --shadow-hard-sm: 3px 3px 0 var(--color-border);
    --border-width: 2px; --radius-sm: 4px;
    --font-display: "Newsreader", Georgia, serif;
    --font-body: "Public Sans", Arial, sans-serif;
    --font-mono: "Space Mono", monospace;
  }
  :root[data-theme="dark"] {
    --color-bg: #0d0d0d; --color-surface: #171717; --color-ink: #f7f2e8;
    --color-muted: #b8afa4; --color-border: #f7f2e8;
  }
  * { box-sizing: border-box; }
  body { min-width: 320px; margin: 0; background: var(--color-bg); color: var(--color-ink); font-family: var(--font-body); }
  .container { width: min(100% - 48px, 760px); margin-inline: auto; }
  .preview-banner { padding: 12px 20px; background: var(--color-accent-3); border-bottom: var(--border-width) solid var(--color-border); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; }
  .preview-banner span { color: var(--color-ink); }
  article { padding-block: 48px; }
  h1 { margin: 0 0 16px; font-family: var(--font-display); font-size: clamp(2.4rem, 7vw, 5rem); line-height: 0.92; }
  .description { color: var(--color-muted); font-size: 1.1rem; line-height: 1.55; margin: 0 0 24px; }
  .prose { line-height: 1.75; font-size: 1.04rem; }
  .prose p { margin-block: 1rem; }
  .prose h2 { font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.6rem); margin-top: 1.8em; }
  .preview-block { margin-top: 24px; padding: 18px; border: var(--border-width) solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); box-shadow: var(--shadow-hard-sm); }
  .preview-block.callout { background: #fff3d1; }
  :root[data-theme="dark"] .preview-block.callout { background: #29210d; }
  .preview-block pre { overflow-x: auto; margin: 12px 0 0; padding: 14px; background: #111; color: #f7f2e8; }
  .preview-block figcaption { margin-bottom: 10px; color: var(--color-muted); font-family: var(--font-mono); font-size: 0.78rem; }
  .preview-block img { display: block; max-width: 100%; border: var(--border-width) solid var(--color-border); }
  .preview-block audio { width: 100%; }
  .quote p { font-family: var(--font-display); font-size: 1.35rem; line-height: 1.35; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 0; list-style: none; }
  .stat-grid li { display: grid; gap: 6px; padding: 12px; border: 1px solid var(--color-border); }
  .stat-grid strong { font-family: var(--font-display); font-size: 1.8rem; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; min-width: 520px; }
  th, td { padding: 10px; border: 1px solid var(--color-border); text-align: left; vertical-align: top; }
  .meta { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }
  .badge { padding: 4px 8px; border: var(--border-width) solid var(--color-border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700; background: var(--color-accent); color: #111; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .tag { padding: 5px 9px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.76rem; color: var(--color-muted); }
</style>
</head>
<body>
<div class="preview-banner"><span>⚠ ${statusBadge}</span> — 此页面为 CMS 草稿预览，未被搜索引擎索引，不会出现在公开站点。</div>
<main class="container">
  <article>
    <div class="meta">
      <span class="badge">${collection}</span>
      <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-muted);">${doc.status}</span>
    </div>
    <h1>${doc.title}</h1>
    <p class="description">${doc.description}</p>
    <div class="prose" data-preview-content>
      ${contentHtml}
      ${blocksHtml}
    </div>
    <div class="tags">
      ${(doc.tags ?? []).map((t) => `<span class="tag">#${t}</span>`).join('')}
    </div>
  </article>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
  });
};
