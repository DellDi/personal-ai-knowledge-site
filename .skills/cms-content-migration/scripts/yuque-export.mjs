#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const COLLECTIONS = new Set([
  'podcast',
  'posts',
  'knowledge',
  'topics',
  'projects',
  'resources',
  'glossary',
  'timeline',
]);

const KNOWLEDGE_AREAS = new Set([
  'ai-agent',
  'architecture',
  'data-engineering',
  'frontend',
  'product',
  'operations',
  'management',
  'tools',
]);

const RESOURCE_TYPES = new Set(['tool', 'book', 'article', 'video', 'repo', 'course']);
const TIMELINE_KINDS = new Set(['milestone', 'release', 'learning']);

function usage() {
  console.log(`Usage:
  YUQUE_TOKEN=xxx node .skills/cms-content-migration/scripts/yuque-export.mjs \\
    --namespace user_or_group/book_slug \\
    --collection knowledge \\
    --knowledge-area tools \\
    --out migrations/yuque

Options:
  --namespace <namespace>       Yuque repo namespace, e.g. user/book. Repeatable or comma-separated.
  --repo-url <url>              Yuque repo/doc URL. The script extracts namespace from the first 2 path parts.
  --out <dir>                   Output directory. Defaults to migrations/yuque.
  --token <token>               Yuque access token. Defaults to YUQUE_TOKEN.
  --base-url <url>              Yuque API base. Defaults to YUQUE_API_URL or https://www.yuque.com/api/v2.
  --user-agent <value>          User-Agent sent to Yuque. Defaults to personal-ai-knowledge-site-yuque-export.
  --collection <slug>           Target CMS collection. Defaults to knowledge.
  --status <status>             Default CMS status. Defaults to draft.
  --tag <tag>                   Default tag. Repeatable or comma-separated.
  --default-tags <tags>         Comma-separated default tags.
  --knowledge-area <area>       Required for collection=knowledge. Defaults to tools.
  --knowledge-level <level>     Defaults to intermediate.
  --resource-type <type>        Required for collection=resources. Defaults to article.
  --category <category>         Required for collection=posts. Defaults to 语雀迁移.
  --timeline-kind <kind>        Required for collection=timeline. Defaults to learning.
  --include-drafts              Prefer body_draft over body when available.
  --skip-markdown               Only write migration JSON, not individual .md files.
  --print-json                  Print generated migration JSON.
  --help, -h                    Show help.

Output:
  <out>/migration.json
  <out>/<safe-namespace>/<doc-slug>.md
  <out>/<safe-namespace>/index.json
`);
}

function parseArgs(argv) {
  const opts = {
    namespaces: [],
    outDir: 'migrations/yuque',
    token: process.env.YUQUE_TOKEN || '',
    baseURL: process.env.YUQUE_API_URL || 'https://www.yuque.com/api/v2',
    userAgent: process.env.YUQUE_USER_AGENT || 'personal-ai-knowledge-site-yuque-export',
    collection: 'knowledge',
    status: 'draft',
    tags: [],
    knowledgeArea: 'tools',
    knowledgeLevel: 'intermediate',
    resourceType: 'article',
    category: '语雀迁移',
    timelineKind: 'learning',
    includeDrafts: false,
    writeMarkdown: true,
    printJson: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`Missing value for ${arg}`);
      return argv[i];
    };

    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--namespace') pushCSV(opts.namespaces, next());
    else if (arg === '--repo-url') opts.namespaces.push(namespaceFromURL(next()));
    else if (arg === '--out') opts.outDir = next();
    else if (arg === '--token') opts.token = next();
    else if (arg === '--base-url') opts.baseURL = next();
    else if (arg === '--user-agent') opts.userAgent = next();
    else if (arg === '--collection') opts.collection = next();
    else if (arg === '--status') opts.status = next();
    else if (arg === '--tag') pushCSV(opts.tags, next());
    else if (arg === '--default-tags') pushCSV(opts.tags, next());
    else if (arg === '--knowledge-area') opts.knowledgeArea = next();
    else if (arg === '--knowledge-level') opts.knowledgeLevel = next();
    else if (arg === '--resource-type') opts.resourceType = next();
    else if (arg === '--category') opts.category = next();
    else if (arg === '--timeline-kind') opts.timelineKind = next();
    else if (arg === '--include-drafts') opts.includeDrafts = true;
    else if (arg === '--skip-markdown') opts.writeMarkdown = false;
    else if (arg === '--print-json') opts.printJson = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  opts.namespaces = [...new Set(opts.namespaces.map((item) => item.trim()).filter(Boolean))];
  return opts;
}

function pushCSV(target, value) {
  for (const item of value.split(',')) {
    const trimmed = item.trim();
    if (trimmed) target.push(trimmed);
  }
}

function namespaceFromURL(value) {
  const url = new URL(value);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) throw new Error(`Cannot infer namespace from URL: ${value}`);
  return `${parts[0]}/${parts[1]}`;
}

function validateOptions(opts) {
  if (opts.help) return;
  if (!opts.token) throw new Error('Missing Yuque token. Set YUQUE_TOKEN or pass --token.');
  if (opts.namespaces.length === 0) throw new Error('Provide at least one --namespace or --repo-url.');
  if (!COLLECTIONS.has(opts.collection)) throw new Error(`Invalid collection: ${opts.collection}`);
  if (opts.collection === 'knowledge' && !KNOWLEDGE_AREAS.has(opts.knowledgeArea)) {
    throw new Error(`Invalid knowledge area: ${opts.knowledgeArea}`);
  }
  if (opts.collection === 'resources' && !RESOURCE_TYPES.has(opts.resourceType)) {
    throw new Error(`Invalid resource type: ${opts.resourceType}`);
  }
  if (opts.collection === 'timeline' && !TIMELINE_KINDS.has(opts.timelineKind)) {
    throw new Error(`Invalid timeline kind: ${opts.timelineKind}`);
  }
}

function apiPath(namespace, suffix = '') {
  const encoded = namespace.split('/').map(encodeURIComponent).join('/');
  return `/repos/${encoded}${suffix}`;
}

async function yuqueGet(opts, route) {
  const url = new URL(`${opts.baseURL.replace(/\/$/, '')}${route}`);
  const res = await fetch(url, {
    headers: {
      'X-Auth-Token': opts.token,
      'User-Agent': opts.userAgent,
      Accept: 'application/json',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Yuque GET ${route} failed: ${res.status} ${res.statusText}\n${body}`);
  }
  return res.json();
}

async function loadRepo(opts, namespace) {
  const [repo, toc, docs] = await Promise.all([
    yuqueGet(opts, apiPath(namespace)),
    yuqueGet(opts, apiPath(namespace, '/toc')).catch(() => ({ data: [] })),
    yuqueGet(opts, apiPath(namespace, '/docs')),
  ]);

  const tocMap = new Map((toc.data || []).map((item) => [item.slug, item]));
  const details = [];
  for (const item of docs.data || []) {
    const detail = await yuqueGet(opts, apiPath(namespace, `/docs/${encodeURIComponent(item.slug)}`));
    details.push({ ...item, ...detail.data, toc: tocMap.get(item.slug) });
  }

  return {
    namespace,
    repo: repo.data,
    toc: toc.data || [],
    docs: details,
  };
}

function docBody(doc, opts) {
  if (opts.includeDrafts && doc.body_draft) return doc.body_draft;
  if (opts.includeDrafts && doc.bodyDraft) return doc.bodyDraft;
  return doc.body || doc.body_draft || doc.bodyDraft || '';
}

function excerpt(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, ' ')
    .replace(/[#>*_`~|[\]-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, 150) || '从语雀迁移过来的知识记录，待在 CMS 中补充摘要。';
}

function safeSlug(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|#]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled';
}

function translationKey(namespace, slug) {
  return `yuque-${safeSlug(namespace.replace('/', '-'))}-${safeSlug(slug)}`;
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function targetDoc(repoPack, doc, opts) {
  const markdown = docBody(doc, opts);
  const title = doc.title || doc.slug || '未命名语雀文档';
  const tags = [...new Set([...opts.tags, '语雀', repoPack.repo?.name].filter(Boolean))];
  const base = {
    title,
    description: excerpt(markdown),
    translationKey: translationKey(repoPack.namespace, doc.slug || doc.id),
    slug: safeSlug(doc.slug || doc.id || title),
    date: normalizeDate(doc.content_updated_at || doc.contentUpdatedAt || doc.updated_at || doc.updatedAt || doc.created_at || doc.createdAt),
    updated: normalizeDate(doc.updated_at || doc.updatedAt || doc.content_updated_at || doc.contentUpdatedAt),
    tags,
    bodyMarkdown: markdown,
  };

  if (opts.collection === 'knowledge') {
    return {
      ...base,
      area: opts.knowledgeArea,
      level: opts.knowledgeLevel,
    };
  }
  if (opts.collection === 'posts') {
    return {
      ...base,
      category: opts.category,
    };
  }
  if (opts.collection === 'resources') {
    return {
      ...base,
      type: opts.resourceType,
    };
  }
  if (opts.collection === 'timeline') {
    return {
      ...base,
      kind: opts.timelineKind,
      date: base.date || new Date().toISOString().slice(0, 10),
    };
  }
  return base;
}

function frontmatter(doc, repoPack) {
  return [
    '---',
    `title: ${JSON.stringify(doc.title || doc.slug || '未命名语雀文档')}`,
    `yuqueNamespace: ${JSON.stringify(repoPack.namespace)}`,
    `yuqueRepo: ${JSON.stringify(repoPack.repo?.name || '')}`,
    `yuqueSlug: ${JSON.stringify(doc.slug || '')}`,
    `yuqueId: ${JSON.stringify(doc.id || '')}`,
    `yuqueURL: ${JSON.stringify(doc.url || doc.web_url || '')}`,
    `createdAt: ${JSON.stringify(doc.created_at || doc.createdAt || '')}`,
    `updatedAt: ${JSON.stringify(doc.updated_at || doc.updatedAt || '')}`,
    '---',
    '',
  ].join('\n');
}

async function writeRepoFiles(opts, repoPack) {
  const repoDir = path.join(opts.outDir, safeSlug(repoPack.namespace.replace('/', '-')));
  await mkdir(repoDir, { recursive: true });

  if (opts.writeMarkdown) {
    for (const doc of repoPack.docs) {
      const filePath = path.join(repoDir, `${safeSlug(doc.slug || doc.id || doc.title)}.md`);
      await writeFile(filePath, `${frontmatter(doc, repoPack)}${docBody(doc, opts).trim()}\n`, 'utf8');
    }
  }

  const index = {
    namespace: repoPack.namespace,
    repo: repoPack.repo,
    toc: repoPack.toc,
    docs: repoPack.docs.map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      format: doc.format,
      status: doc.status,
      createdAt: doc.created_at || doc.createdAt,
      updatedAt: doc.updated_at || doc.updatedAt,
      contentUpdatedAt: doc.content_updated_at || doc.contentUpdatedAt,
    })),
  };
  await writeFile(path.join(repoDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    usage();
    return;
  }
  validateOptions(opts);

  await mkdir(opts.outDir, { recursive: true });
  const batches = [];
  const exportSummary = [];

  for (const namespace of opts.namespaces) {
    console.log(`[yuque-export] fetching ${namespace}`);
    const repoPack = await loadRepo(opts, namespace);
    await writeRepoFiles(opts, repoPack);
    batches.push({
      collection: opts.collection,
      docs: repoPack.docs.map((doc) => targetDoc(repoPack, doc, opts)),
    });
    exportSummary.push(`${namespace}:${repoPack.docs.length}`);
  }

  const migration = {
    mode: 'upsert',
    defaults: {
      lang: 'zh-CN',
      status: opts.status,
      featured: false,
    },
    batches,
  };

  const migrationPath = path.join(opts.outDir, 'migration.json');
  await writeFile(migrationPath, `${JSON.stringify(migration, null, 2)}\n`, 'utf8');

  console.log(`[yuque-export] exported ${exportSummary.join(', ')}`);
  console.log(`[yuque-export] wrote ${migrationPath}`);
  console.log('[yuque-export] next: node .skills/cms-content-migration/scripts/cms-import.mjs --input ' + migrationPath + ' --dry-run --print-json');
  if (opts.printJson) console.log(JSON.stringify(migration, null, 2));
}

main().catch((error) => {
  console.error(`[yuque-export] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
