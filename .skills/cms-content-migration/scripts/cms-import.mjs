#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
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

const ENUMS = {
  lang: ['zh-CN', 'en'],
  status: ['draft', 'published', 'archived'],
  knowledgeArea: ['ai-agent', 'architecture', 'data-engineering', 'frontend', 'product', 'operations', 'management', 'tools'],
  knowledgeLevel: ['basic', 'intermediate', 'advanced'],
  resourceType: ['tool', 'book', 'article', 'video', 'repo', 'course'],
  timelineKind: ['milestone', 'release', 'learning'],
};

const COLLECTION_RULES = {
  posts: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'date', 'category'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'category', 'series', 'cover', 'content', 'contentBlocks'],
    mediaFields: { cover: 'image' },
    defaults: { featured: false, tags: [] },
  },
  podcast: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'date', 'episode', 'audioFile'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'episode', 'season', 'audioFile', 'duration', 'cover', 'transcript', 'hosts', 'guests', 'timeline', 'resources', 'content', 'contentBlocks'],
    mediaFields: { audioFile: 'audio', cover: 'image' },
    defaults: { featured: false, tags: [], season: 1, transcript: true, hosts: [], guests: [], timeline: [], resources: [] },
  },
  knowledge: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'area'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'area', 'level', 'order', 'content', 'contentBlocks'],
    defaults: { featured: false, tags: [], level: 'intermediate' },
  },
  topics: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'hero', 'items', 'content', 'contentBlocks'],
    mediaFields: { hero: 'image' },
    defaults: { featured: false, tags: [], items: [] },
  },
  projects: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'cover', 'role', 'stack', 'links', 'content', 'contentBlocks'],
    mediaFields: { cover: 'image' },
    defaults: { featured: false, tags: [], stack: [], links: [] },
  },
  resources: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'type'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'cover', 'type', 'url', 'asset', 'content'],
    mediaFields: { cover: 'image', asset: 'file' },
    defaults: { featured: false, tags: [] },
  },
  glossary: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'aliases', 'content'],
    defaults: { featured: false, tags: [], aliases: [] },
  },
  timeline: {
    required: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'date'],
    allowed: ['title', 'description', 'lang', 'translationKey', 'slug', 'status', 'featured', 'date', 'updated', 'tags', 'kind', 'content'],
    defaults: { featured: false, tags: [], kind: 'milestone' },
  },
};

const BLOCK_MAP = {
  richText: 'richText',
  callout: 'calloutBlock',
  code: 'codeBlock',
  audio: 'audioBlock',
  image: 'imageBlock',
  quote: 'quoteBlock',
  embed: 'embedBlock',
  steps: 'stepsBlock',
  statGrid: 'statGridBlock',
  compareTable: 'compareTableBlock',
};

function usage() {
  console.log(`Usage:
  node .skills/cms-content-migration/scripts/cms-import.mjs --input migration.json --dry-run
  node .skills/cms-content-migration/scripts/cms-import.mjs --input migration.json --apply
  node .skills/cms-content-migration/scripts/cms-import.mjs --from-md apps/web/src/content/posts/zh-CN --collection posts --dry-run

Options:
  --input <file>              Standard migration JSON.
  --from-md <file|dir>        Markdown/MDX file or directory to convert and import.
  --collection <slug>         Collection slug when input docs do not include one.
  --cms-url <url>             Payload REST API base URL. Defaults to CMS_API_URL or http://127.0.0.1:3000/api.
  --token <token>             CMS API JWT. Defaults to CMS_API_TOKEN.
  --auth-scheme <JWT|Bearer>  Authorization scheme. Defaults to JWT.
  --default-status <status>   Default status for docs without status. Defaults to draft.
  --publish                   Force status=published for imported docs.
  --public-dir <dir>          Public asset root for absolute local paths. Defaults to apps/web/public.
  --upload-remote-media       Download http(s) media and upload it to media collection.
  --print-json                Print normalized import payload after validation.
  --apply                     Write to CMS. Without this flag the script only dry-runs.
  --dry-run                   Validate only. This is the default.
`);
}

function parseArgs(argv) {
  const opts = {
    dryRun: true,
    mode: 'upsert',
    cmsURL: process.env.CMS_API_URL || 'http://127.0.0.1:3000/api',
    token: process.env.CMS_API_TOKEN || '',
    authScheme: process.env.CMS_API_AUTH_SCHEME || 'JWT',
    defaultStatus: 'draft',
    publicDir: 'apps/web/public',
    uploadRemoteMedia: false,
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
    else if (arg === '--input') opts.input = next();
    else if (arg === '--from-md') opts.fromMd = next();
    else if (arg === '--collection') opts.collection = next();
    else if (arg === '--cms-url') opts.cmsURL = next();
    else if (arg === '--token') opts.token = next();
    else if (arg === '--auth-scheme') opts.authScheme = next();
    else if (arg === '--default-status') opts.defaultStatus = next();
    else if (arg === '--public-dir') opts.publicDir = next();
    else if (arg === '--upload-remote-media') opts.uploadRemoteMedia = true;
    else if (arg === '--print-json') opts.printJson = true;
    else if (arg === '--publish') opts.publish = true;
    else if (arg === '--apply') opts.dryRun = false;
    else if (arg === '--dry-run') opts.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  return opts;
}

function repoRoot() {
  return process.cwd();
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function isHttpURL(value) {
  return /^https?:\/\//i.test(value);
}

function isSpecialURL(value) {
  return /^(mailto:|tel:|#)/i.test(value);
}

function inferCollectionFromPath(filePath) {
  const normalized = toPosixPath(path.resolve(filePath));
  const marker = '/apps/web/src/content/';
  const index = normalized.indexOf(marker);
  if (index === -1) return undefined;
  const rest = normalized.slice(index + marker.length);
  const [collection] = rest.split('/');
  return COLLECTIONS.has(collection) ? collection : undefined;
}

async function collectMarkdownFiles(inputPath) {
  const absolute = path.resolve(inputPath);
  const info = await stat(absolute);
  if (info.isFile()) {
    return /\.(md|mdx)$/i.test(absolute) ? [absolute] : [];
  }
  if (!info.isDirectory()) return [];

  const files = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) files.push(full);
    }
  }
  await walk(absolute);
  return files.sort();
}

function splitFrontmatter(source) {
  const text = source.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, '');
  return { data: parseYamlSubset(raw), body };
}

function parseYamlSubset(raw) {
  const lines = raw.split('\n');
  const result = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s+#/.test(line)) {
      i += 1;
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) {
      i += 1;
      continue;
    }
    const key = match[1];
    const value = match[2] ?? '';

    if (value.trim()) {
      result[key] = parseScalar(value.trim());
      i += 1;
      continue;
    }

    const block = [];
    i += 1;
    while (i < lines.length && (/^\s+/.test(lines[i]) || !lines[i].trim())) {
      if (lines[i].trim()) block.push(lines[i]);
      i += 1;
    }
    result[key] = parseYamlBlock(block);
  }

  return result;
}

function parseYamlBlock(lines) {
  if (lines.length === 0) return [];
  if (lines.every((line) => line.trim().startsWith('- '))) {
    return lines.map((line) => parseScalar(line.trim().slice(2).trim()));
  }

  const items = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('- ')) {
      if (current) items.push(current);
      const first = trimmed.slice(2).trim();
      const firstMatch = first.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (firstMatch) {
        current = { [firstMatch[1]]: parseScalar(firstMatch[2].trim()) };
      } else {
        current = parseScalar(first);
      }
      continue;
    }
    const pair = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair && current && typeof current === 'object' && !Array.isArray(current)) {
      current[pair[1]] = parseScalar(pair[2].trim());
    }
  }
  if (current) items.push(current);
  return items.length > 0 ? items : lines.map((line) => line.trim()).join('\n');
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed === '[]') return [];
  if (trimmed === '{}') return {};
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitInlineArray(inner).map(parseScalar);
  }
  return trimmed;
}

function splitInlineArray(inner) {
  const values = [];
  let current = '';
  let quote = '';
  for (const char of inner) {
    if ((char === '"' || char === "'") && !quote) {
      quote = char;
      current += char;
      continue;
    }
    if (char === quote) {
      quote = '';
      current += char;
      continue;
    }
    if (char === ',' && !quote) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) values.push(current.trim());
  return values;
}

async function loadInput(opts) {
  if (opts.input && opts.fromMd) throw new Error('Use either --input or --from-md, not both.');
  if (!opts.input && !opts.fromMd) throw new Error('Provide --input or --from-md.');

  if (opts.input) {
    const raw = await readFile(path.resolve(opts.input), 'utf8');
    return normalizeImportShape(JSON.parse(raw), opts);
  }

  const files = await collectMarkdownFiles(opts.fromMd);
  const docs = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const { data, body } = splitFrontmatter(raw);
    const collection = opts.collection || inferCollectionFromPath(file);
    if (!collection) throw new Error(`Cannot infer collection for ${file}. Pass --collection.`);
    docs.push({
      collection,
      sourcePath: path.resolve(file),
      bodyMarkdown: body,
      ...data,
    });
  }
  return normalizeImportShape(docs, opts);
}

function normalizeImportShape(input, opts) {
  if (Array.isArray(input)) {
    return groupDocs(input, opts);
  }
  if (input && typeof input === 'object' && Array.isArray(input.batches)) {
    return input.batches.map((batch) => ({
      collection: assertCollection(batch.collection || opts.collection),
      mode: batch.mode || input.mode || opts.mode,
      defaults: { ...(input.defaults || {}), ...(batch.defaults || {}) },
      docs: batch.docs || [],
    }));
  }
  if (input && typeof input === 'object' && Array.isArray(input.docs)) {
    return [{
      collection: assertCollection(input.collection || opts.collection),
      mode: input.mode || opts.mode,
      defaults: input.defaults || {},
      docs: input.docs,
    }];
  }
  if (input && typeof input === 'object') {
    return groupDocs([input], opts);
  }
  throw new Error('Unsupported input format.');
}

function groupDocs(docs, opts) {
  const groups = new Map();
  for (const doc of docs) {
    const collection = assertCollection(doc.collection || opts.collection);
    const copy = { ...doc };
    delete copy.collection;
    if (!groups.has(collection)) {
      groups.set(collection, { collection, mode: opts.mode, defaults: {}, docs: [] });
    }
    groups.get(collection).docs.push(copy);
  }
  return [...groups.values()];
}

function assertCollection(collection) {
  if (!collection || !COLLECTIONS.has(collection)) {
    throw new Error(`Invalid or missing collection: ${collection || '(missing)'}`);
  }
  return collection;
}

function headers(opts, json = false) {
  const output = {};
  if (opts.token) output.Authorization = `${opts.authScheme} ${opts.token}`;
  if (json) output['Content-Type'] = 'application/json';
  return output;
}

function apiURL(opts, collection, id) {
  const base = opts.cmsURL.replace(/\/$/, '');
  return id ? `${base}/${collection}/${id}` : `${base}/${collection}`;
}

async function findExisting(opts, collection, doc) {
  const url = new URL(apiURL(opts, collection));
  url.searchParams.set('limit', '1');
  url.searchParams.set('depth', '0');
  url.searchParams.set('where[slug][equals]', doc.slug);
  url.searchParams.set('where[lang][equals]', doc.lang);
  const res = await fetch(url, { headers: headers(opts) });
  if (!res.ok) throw new Error(`Find ${collection}/${doc.slug} failed: ${res.status} ${res.statusText}`);
  const body = await res.json();
  return Array.isArray(body.docs) && body.docs.length > 0 ? body.docs[0] : undefined;
}

async function writeDoc(opts, collection, doc) {
  const existing = await findExisting(opts, collection, doc);
  const method = existing ? 'PATCH' : 'POST';
  const url = existing ? apiURL(opts, collection, existing.id) : apiURL(opts, collection);
  const res = await fetch(url, {
    method,
    headers: headers(opts, true),
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${collection}/${doc.slug} failed: ${res.status} ${res.statusText}\n${text}`);
  }
  const body = await res.json();
  return { action: existing ? 'updated' : 'created', doc: body.doc || body };
}

function isLocalCandidate(value) {
  return typeof value === 'string' && value && !isHttpURL(value) && !isSpecialURL(value);
}

function decodePathSegment(value) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

async function resolveLocalAsset(value, sourcePath, opts) {
  if (!isLocalCandidate(value)) return undefined;
  if (value.startsWith('/zh-CN/') || value.startsWith('/en/') || value.startsWith('/rss') || value.startsWith('/podcast/rss')) {
    return undefined;
  }

  const clean = decodePathSegment(value.split('#')[0].split('?')[0]);
  const candidates = [];
  if (path.isAbsolute(clean)) {
    candidates.push(clean);
  }
  if (clean.startsWith('/')) {
    candidates.push(path.resolve(repoRoot(), opts.publicDir, clean.slice(1)));
  } else {
    const baseDir = sourcePath ? path.dirname(sourcePath) : repoRoot();
    candidates.push(path.resolve(baseDir, clean));
  }

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {}
  }
  return undefined;
}

function inferMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return map[ext] || 'application/octet-stream';
}

function isImageFile(filePath) {
  return inferMime(filePath).startsWith('image/');
}

async function uploadMedia(opts, ctx, asset, meta = {}) {
  if (!asset) return undefined;
  const key = asset.startsWith('http') ? asset : path.resolve(asset);
  if (ctx.mediaCache.has(key)) return ctx.mediaCache.get(key);

  if (opts.dryRun) {
    const dry = {
      id: `dry-run:${path.basename(asset)}`,
      url: asset,
      filename: path.basename(asset),
    };
    ctx.mediaCache.set(key, dry);
    ctx.wouldUpload.push(asset);
    return dry;
  }

  let bytes;
  let filename = path.basename(asset);
  let mimeType = inferMime(asset);
  if (isHttpURL(asset)) {
    const res = await fetch(asset);
    if (!res.ok) throw new Error(`Download remote media failed: ${asset} (${res.status})`);
    const arrayBuffer = await res.arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
    const urlName = new URL(asset).pathname.split('/').filter(Boolean).pop();
    filename = urlName || filename;
    mimeType = res.headers.get('content-type')?.split(';')[0] || mimeType;
  } else {
    bytes = await readFile(asset);
  }

  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType }), filename);
  if (meta.alt) form.append('alt', meta.alt);
  if (meta.caption) form.append('caption', meta.caption);
  if (meta.source) form.append('source', meta.source);

  const res = await fetch(apiURL(opts, 'media'), {
    method: 'POST',
    headers: headers(opts),
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload media failed: ${asset} (${res.status} ${res.statusText})\n${text}`);
  }
  const body = await res.json();
  const doc = body.doc || body;
  const uploaded = {
    id: doc.id,
    url: doc.url || doc.filename || '',
    filename: doc.filename || filename,
  };
  ctx.mediaCache.set(key, uploaded);
  return uploaded;
}

async function mediaReference(opts, ctx, value, sourcePath, meta = {}) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.id) return value.id;
  if (typeof value !== 'string') return value;

  if (isHttpURL(value)) {
    if (!opts.uploadRemoteMedia) {
      const message = `Remote media not uploaded without --upload-remote-media: ${value}`;
      if (!opts.dryRun) throw new Error(message);
      ctx.warnings.push(message);
      return value;
    }
    const uploaded = await uploadMedia(opts, ctx, value, meta);
    return uploaded.id;
  }

  const local = await resolveLocalAsset(value, sourcePath, opts);
  if (!local) {
    const message = `Local media not found: ${value}${sourcePath ? ` (from ${sourcePath})` : ''}`;
    if (!opts.dryRun) throw new Error(message);
    ctx.warnings.push(message);
    return value;
  }
  const uploaded = await uploadMedia(opts, ctx, local, meta);
  return uploaded.id;
}

async function mediaURLReference(opts, ctx, value, sourcePath, meta = {}) {
  if (!value || typeof value !== 'string') return value;
  if (isHttpURL(value) && !opts.uploadRemoteMedia) return value;

  let asset = value;
  if (!isHttpURL(value)) {
    const local = await resolveLocalAsset(value, sourcePath, opts);
    if (!local) return value;
    asset = local;
  }
  const uploaded = await uploadMedia(opts, ctx, asset, meta);
  return uploaded.url || value;
}

async function processMarkdownResources(markdown, opts, ctx, sourcePath, blocks) {
  let output = await replaceAsync(markdown, /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, async (_match, alt, rawURL, title) => {
    const local = await resolveLocalAsset(rawURL, sourcePath, opts);
    if (local || (isHttpURL(rawURL) && opts.uploadRemoteMedia)) {
      const asset = local || rawURL;
      const uploaded = await uploadMedia(opts, ctx, asset, { alt, caption: title });
      blocks.push({
        blockType: 'imageBlock',
        image: uploaded.id,
        alt: alt || path.basename(rawURL),
        ...(title ? { caption: title } : {}),
      });
      return '';
    }
    if (isHttpURL(rawURL)) return `[${alt || rawURL}](${rawURL})`;
    ctx.warnings.push(`Markdown image not found: ${rawURL}${sourcePath ? ` (from ${sourcePath})` : ''}`);
    return '';
  });

  output = await replaceAsync(output, /(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, async (match, label, rawURL) => {
    const local = await resolveLocalAsset(rawURL, sourcePath, opts);
    if (local || (isHttpURL(rawURL) && opts.uploadRemoteMedia)) {
      const asset = local || rawURL;
      const uploaded = await uploadMedia(opts, ctx, asset, { alt: label });
      return `[${label}](${uploaded.url || rawURL})`;
    }
    return match;
  });

  return output;
}

async function replaceAsync(input, regex, replacer) {
  const parts = [];
  let lastIndex = 0;
  for (const match of input.matchAll(regex)) {
    parts.push(input.slice(lastIndex, match.index));
    parts.push(await replacer(...match));
    lastIndex = match.index + match[0].length;
  }
  parts.push(input.slice(lastIndex));
  return parts.join('');
}

function extractCodeBlocks(markdown, blocks) {
  return markdown.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (_match, info, code) => {
    const [language, ...rest] = info.trim().split(/\s+/).filter(Boolean);
    blocks.push({
      blockType: 'codeBlock',
      ...(language ? { language } : {}),
      ...(rest.length > 0 ? { filename: rest.join(' ') } : {}),
      code: code.replace(/\n$/, ''),
    });
    return '\n\n';
  });
}

function markdownToLexical(markdown) {
  const children = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  function pushParagraph(buffer) {
    const text = buffer.join(' ').trim();
    if (!text) return;
    children.push(paragraphNode(text));
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      children.push(headingNode(`h${heading[1].length}`, heading[2].trim()));
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const buffer = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buffer.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      children.push(quoteNode(buffer.join(' ').trim()));
      continue;
    }

    const listMatch = trimmed.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\d+\./.test(listMatch[1]);
      const items = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(/^([-*]|\d+\.)\s+(.+)$/);
        if (!item) break;
        items.push(item[2].trim());
        i += 1;
      }
      children.push(listNode(ordered, items));
      continue;
    }

    const buffer = [];
    while (i < lines.length && lines[i].trim()) {
      const next = lines[i].trim();
      if (/^(#{1,6})\s+/.test(next) || /^>\s?/.test(next) || /^([-*]|\d+\.)\s+/.test(next)) break;
      buffer.push(next);
      i += 1;
    }
    pushParagraph(buffer);
  }

  return {
    root: {
      type: 'root',
      children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

function textNode(text) {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  };
}

function inlineChildren(text) {
  const children = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(regex)) {
    if (match.index > last) children.push(textNode(text.slice(last, match.index)));
    children.push({
      children: [textNode(match[1])],
      direction: null,
      fields: { url: match[2], newTab: false, linkType: 'custom' },
      format: '',
      indent: 0,
      type: 'link',
      version: 3,
    });
    last = match.index + match[0].length;
  }
  if (last < text.length) children.push(textNode(text.slice(last)));
  return children.length > 0 ? children : [textNode(text)];
}

function paragraphNode(text) {
  return {
    children: inlineChildren(text),
    direction: null,
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  };
}

function headingNode(tag, text) {
  return {
    children: inlineChildren(text),
    direction: null,
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  };
}

function quoteNode(text) {
  return {
    children: inlineChildren(text),
    direction: null,
    format: '',
    indent: 0,
    type: 'quote',
    version: 1,
  };
}

function listNode(ordered, items) {
  return {
    children: items.map((item, index) => ({
      children: [paragraphNode(item)],
      direction: null,
      format: '',
      indent: 0,
      type: 'listitem',
      value: index + 1,
      version: 1,
    })),
    direction: null,
    format: '',
    indent: 0,
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    type: 'list',
    version: 1,
  };
}

async function normalizeDoc(batch, rawDoc, opts, ctx) {
  const collection = batch.collection;
  const rules = COLLECTION_RULES[collection];
  const sourcePath = rawDoc.sourcePath ? path.resolve(rawDoc.sourcePath) : undefined;
  const doc = {
    lang: 'zh-CN',
    status: opts.defaultStatus,
    ...rules.defaults,
    ...batch.defaults,
    ...rawDoc,
  };
  delete doc.sourcePath;

  if (opts.publish) doc.status = 'published';
  if (!doc.translationKey && doc.slug) doc.translationKey = doc.slug;
  if (collection === 'podcast' && doc.audio && !doc.audioFile) doc.audioFile = doc.audio;
  delete doc.audio;

  if (collection === 'resources' && doc.url && isLocalCandidate(doc.url)) {
    const assetPath = await resolveLocalAsset(doc.url, sourcePath, opts);
    if (assetPath) {
      doc.asset = doc.asset || doc.url;
      delete doc.url;
    }
  }

  for (const [field] of Object.entries(rules.mediaFields || {})) {
    if (doc[field]) {
      doc[field] = await mediaReference(opts, ctx, doc[field], sourcePath, { alt: doc.title });
    }
  }

  if (Array.isArray(doc.resources)) {
    doc.resources = await Promise.all(
      doc.resources.map(async (item) => {
        if (!item || typeof item !== 'object') return item;
        const copy = { ...item };
        if (copy.url && isLocalCandidate(copy.url)) {
          const assetPath = await resolveLocalAsset(copy.url, sourcePath, opts);
          if (assetPath) {
            copy.file = await mediaReference(opts, ctx, copy.url, sourcePath, { alt: copy.label });
            delete copy.url;
          }
        }
        return copy;
      }),
    );
  }

  const blocks = [];
  if (Array.isArray(doc.contentBlocks)) {
    for (const block of doc.contentBlocks) {
      blocks.push(await normalizeBlock(block, opts, ctx, sourcePath));
    }
  }

  const bodyMarkdown = doc.bodyMarkdown || doc.markdown || '';
  delete doc.bodyMarkdown;
  delete doc.markdown;
  if (bodyMarkdown && !doc.content) {
    const withoutCode = extractCodeBlocks(bodyMarkdown, blocks);
    const withUploadedLinks = await processMarkdownResources(withoutCode, opts, ctx, sourcePath, blocks);
    doc.content = markdownToLexical(withUploadedLinks.trim());
  }
  if (blocks.length > 0 && collection !== 'resources' && collection !== 'glossary' && collection !== 'timeline') {
    doc.contentBlocks = blocks.filter(Boolean);
  } else {
    delete doc.contentBlocks;
  }

  normalizeEnums(collection, doc);
  validateRequired(collection, doc);

  return pickAllowed(doc, rules.allowed);
}

async function normalizeBlock(block, opts, ctx, sourcePath) {
  if (!block || typeof block !== 'object') return undefined;
  const type = block.type || block.blockType;
  if (!type) return undefined;
  const normalizedType = type.endsWith('Block') ? type : BLOCK_MAP[type];
  if (!normalizedType) {
    ctx.warnings.push(`Unsupported block type: ${type}`);
    return undefined;
  }

  const copy = { ...block, blockType: normalizedType };
  delete copy.type;

  if (normalizedType === 'imageBlock') {
    const src = copy.image || copy.src;
    copy.image = await mediaReference(opts, ctx, src, sourcePath, { alt: copy.alt, caption: copy.caption, source: copy.source });
    delete copy.src;
  }
  if (normalizedType === 'audioBlock') {
    const src = copy.file || copy.src;
    copy.file = await mediaReference(opts, ctx, src, sourcePath, { alt: copy.title });
    if (copy.download) {
      copy.downloadFile = await mediaReference(opts, ctx, copy.download, sourcePath, { alt: copy.title });
      delete copy.download;
    }
    delete copy.src;
  }
  if (normalizedType === 'stepsBlock' && Array.isArray(copy.items)) {
    copy.items = copy.items.map((item) => (typeof item === 'string' ? { text: item } : item));
  }
  if (normalizedType === 'compareTableBlock' && Array.isArray(copy.rows)) {
    copy.rows = copy.rows.map((row) => (row && typeof row === 'object' && 'data' in row ? row : { data: row }));
  }

  return copy;
}

function normalizeEnums(collection, doc) {
  if (!ENUMS.lang.includes(doc.lang)) throw new Error(`Invalid lang: ${doc.lang}`);
  if (!ENUMS.status.includes(doc.status)) throw new Error(`Invalid status: ${doc.status}`);
  if (collection === 'knowledge') {
    if (!ENUMS.knowledgeArea.includes(doc.area)) throw new Error(`Invalid knowledge.area: ${doc.area}`);
    if (doc.level && !ENUMS.knowledgeLevel.includes(doc.level)) throw new Error(`Invalid knowledge.level: ${doc.level}`);
  }
  if (collection === 'resources' && !ENUMS.resourceType.includes(doc.type)) {
    throw new Error(`Invalid resources.type: ${doc.type}`);
  }
  if (collection === 'timeline' && doc.kind && !ENUMS.timelineKind.includes(doc.kind)) {
    throw new Error(`Invalid timeline.kind: ${doc.kind}`);
  }
}

function validateRequired(collection, doc) {
  const missing = COLLECTION_RULES[collection].required.filter((field) => {
    const value = doc[field];
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0 && field !== 'tags');
  });
  if (missing.length > 0) {
    throw new Error(`${collection}/${doc.slug || doc.title || '(untitled)'} missing required fields: ${missing.join(', ')}`);
  }
}

function pickAllowed(doc, allowed) {
  const output = {};
  for (const field of allowed) {
    if (doc[field] !== undefined) output[field] = doc[field];
  }
  return output;
}

async function normalizeBatches(batches, opts) {
  const ctx = {
    mediaCache: new Map(),
    warnings: [],
    wouldUpload: [],
  };
  const normalized = [];
  for (const batch of batches) {
    const collection = assertCollection(batch.collection);
    const docs = [];
    for (const rawDoc of batch.docs) {
      docs.push(await normalizeDoc(batch, rawDoc, opts, ctx));
    }
    normalized.push({ collection, mode: batch.mode || opts.mode, docs });
  }
  return { batches: normalized, ctx };
}

async function applyBatches(batches, opts) {
  if (!opts.token) throw new Error('CMS token is required for --apply. Set CMS_API_TOKEN or pass --token.');
  const results = [];
  for (const batch of batches) {
    for (const doc of batch.docs) {
      if (batch.mode !== 'upsert') throw new Error(`Unsupported mode: ${batch.mode}`);
      const result = await writeDoc(opts, batch.collection, doc);
      results.push({ collection: batch.collection, slug: doc.slug, action: result.action, id: result.doc.id });
    }
  }
  return results;
}

function summarize(normalized, ctx, opts) {
  const docs = normalized.batches.reduce((sum, batch) => sum + batch.docs.length, 0);
  const perCollection = normalized.batches.map((batch) => `${batch.collection}:${batch.docs.length}`).join(', ');
  console.log(`[cms-import] mode=${opts.dryRun ? 'dry-run' : 'apply'} docs=${docs} (${perCollection})`);
  if (ctx.wouldUpload.length > 0) {
    const unique = [...new Set(ctx.wouldUpload.map((item) => path.isAbsolute(item) ? path.relative(repoRoot(), item) : item))];
    console.log(`[cms-import] media uploads=${unique.length}`);
    for (const item of unique.slice(0, 20)) console.log(`  - ${item}`);
    if (unique.length > 20) console.log(`  ... ${unique.length - 20} more`);
  }
  for (const warning of ctx.warnings) {
    console.warn(`[cms-import] warning: ${warning}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    usage();
    return;
  }
  const batches = await loadInput(opts);
  const normalized = await normalizeBatches(batches, opts);
  summarize(normalized, normalized.ctx, opts);
  if (opts.printJson) {
    console.log(JSON.stringify({ batches: normalized.batches }, null, 2));
  }
  if (!opts.dryRun) {
    const results = await applyBatches(normalized.batches, opts);
    for (const result of results) {
      console.log(`[cms-import] ${result.action} ${result.collection}/${result.slug} id=${result.id}`);
    }
  }
}

main().catch((error) => {
  console.error(`[cms-import] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
