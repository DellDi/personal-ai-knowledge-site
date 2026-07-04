#!/usr/bin/env node
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const COLLECTIONS = new Set(['posts', 'knowledge', 'projects', 'resources', 'glossary', 'timeline']);
const KNOWLEDGE_AREAS = new Set(['ai-agent', 'architecture', 'data-engineering', 'frontend', 'product', 'operations', 'management', 'tools']);
const KNOWLEDGE_LEVELS = new Set(['basic', 'intermediate', 'advanced']);
const RESOURCE_TYPES = new Set(['tool', 'book', 'article', 'video', 'repo', 'course']);
const TIMELINE_KINDS = new Set(['milestone', 'release', 'learning']);

function usage() {
  console.log(`Usage:
  DEEPSEEK_API_KEY="***" node .skills/cms-content-migration/scripts/yuque-classify.mjs \\
    --from migrations/yuque-raw \\
    --out migrations/yuque-classified/migration.json \\
    --review-out migrations/yuque-classified/review.json

Options:
  --from <dir>                    Directory exported by yuque-exporter.
  --out <file>                    Output standard migration JSON. Defaults to migrations/yuque-classified/migration.json.
  --review-out <file>             Output review JSON. Defaults to migrations/yuque-classified/review.json.
  --cache <file>                  Classification cache. Defaults to migrations/yuque-classified/classifications.json.
  --include-dir <names>           Only classify top-level directories. Repeatable or comma-separated.
  --exclude-dir <names>           Exclude top-level directories. Repeatable or comma-separated.
  --allowed-collections <slugs>   Defaults to posts,knowledge,projects,resources,glossary,timeline.
  --model <name>                  DeepSeek model. Defaults to deepseek-chat.
  --api-url <url>                 Chat completions URL. Defaults to https://api.deepseek.com/chat/completions.
  --api-key <key>                 Defaults to DEEPSEEK_API_KEY.
  --status <status>               Migration default status. Defaults to draft.
  --limit <n>                     Classify at most n files.
  --concurrency <n>               Parallel LLM requests. Defaults to 2.
  --max-chars <n>                 Max markdown chars sent per file. Defaults to 9000.
  --min-confidence <n>            Docs below confidence become knowledge/operations. Defaults to 0.45.
  --reuse-cache                   Reuse cached classifications. Defaults to true.
  --no-reuse-cache                Ignore cached classifications.
  --print-json                    Print generated migration JSON.
  --help, -h                      Show help.
`);
}

function parseArgs(argv) {
  const opts = {
    out: 'migrations/yuque-classified/migration.json',
    reviewOut: 'migrations/yuque-classified/review.json',
    cache: 'migrations/yuque-classified/classifications.json',
    allowedCollections: [...COLLECTIONS],
    includeDirs: [],
    excludeDirs: [],
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    apiURL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    status: 'draft',
    concurrency: 2,
    maxChars: 9000,
    minConfidence: 0.45,
    reuseCache: true,
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
    else if (arg === '--from') opts.from = next();
    else if (arg === '--out') opts.out = next();
    else if (arg === '--review-out') opts.reviewOut = next();
    else if (arg === '--cache') opts.cache = next();
    else if (arg === '--include-dir') pushCSV(opts.includeDirs, next());
    else if (arg === '--exclude-dir') pushCSV(opts.excludeDirs, next());
    else if (arg === '--allowed-collections') opts.allowedCollections = csv(next());
    else if (arg === '--model') opts.model = next();
    else if (arg === '--api-url') opts.apiURL = next();
    else if (arg === '--api-key') opts.apiKey = next();
    else if (arg === '--status') opts.status = next();
    else if (arg === '--limit') opts.limit = Number(next());
    else if (arg === '--concurrency') opts.concurrency = Number(next());
    else if (arg === '--max-chars') opts.maxChars = Number(next());
    else if (arg === '--min-confidence') opts.minConfidence = Number(next());
    else if (arg === '--reuse-cache') opts.reuseCache = true;
    else if (arg === '--no-reuse-cache') opts.reuseCache = false;
    else if (arg === '--print-json') opts.printJson = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  opts.includeDirs = [...new Set(opts.includeDirs)];
  opts.excludeDirs = [...new Set(opts.excludeDirs)];
  opts.allowedCollections = [...new Set(opts.allowedCollections)];
  return opts;
}

function pushCSV(target, value) {
  for (const item of csv(value)) target.push(item);
}

function csv(value) {
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function validateOptions(opts) {
  if (opts.help) return;
  if (!opts.from) throw new Error('Missing --from <dir>.');
  if (!opts.apiKey) throw new Error('Missing DEEPSEEK_API_KEY or --api-key.');
  if (opts.allowedCollections.length === 0) throw new Error('--allowed-collections must not be empty.');
  if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) throw new Error('--concurrency must be a positive integer.');
  if (!Number.isInteger(opts.maxChars) || opts.maxChars < 1000) throw new Error('--max-chars must be >= 1000.');
  if (opts.limit !== undefined && (!Number.isInteger(opts.limit) || opts.limit < 1)) throw new Error('--limit must be a positive integer.');
  for (const collection of opts.allowedCollections) {
    if (!COLLECTIONS.has(collection)) throw new Error(`Unsupported collection for LLM classification: ${collection}`);
  }
}

async function collectMarkdownFiles(dir) {
  const root = path.resolve(dir);
  const files = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(full);
    }
  }
  await walk(root);
  return files.sort();
}

function filterMarkdownFiles(root, files, opts) {
  const filtered = files.filter((file) => {
    const relative = path.relative(root, file);
    const topLevelDir = relative.split(path.sep)[0];
    if (opts.excludeDirs.includes(topLevelDir)) return false;
    if (opts.includeDirs.length === 0) return true;
    return opts.includeDirs.includes(topLevelDir);
  });
  return opts.limit ? filtered.slice(0, opts.limit) : filtered;
}

async function readCache(file) {
  try {
    return JSON.parse(await readFile(path.resolve(file), 'utf8'));
  } catch {
    return {};
  }
}

async function writeJSON(file, data) {
  const absolute = path.resolve(file);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function stripFrontmatter(markdown) {
  const text = markdown.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---', 4);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\n/, '');
}

function cleanTitle(value) {
  return String(value)
    .replace(/\[[^\]]*]\([^)]+\)/g, '')
    .replace(/[*_`#]/g, '')
    .trim() || '未命名语雀文档';
}

function titleFromMarkdown(markdown, filePath) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return cleanTitle(heading[1]);
  return cleanTitle(path.basename(filePath, path.extname(filePath)));
}

function excerpt(markdown) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, ' ')
    .replace(/[#>*_`~|[\]-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, 150) || '从语雀导出的知识记录，待在 CMS 中补充摘要。';
}

function headings(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^#{1,3}\s+/.test(line))
    .slice(0, 24)
    .map((line) => line.replace(/^#{1,3}\s+/, '').trim());
}

function hash(input) {
  let value = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
}

function folderTags(root, filePath) {
  const relative = path.relative(root, path.dirname(filePath));
  if (!relative || relative === '.') return [];
  return relative.split(path.sep).map((item) => item.trim()).filter(Boolean);
}

function cacheKey(root, filePath, markdown) {
  const relative = path.relative(root, filePath);
  return `${relative}::${hash(markdown)}`;
}

function sampleMarkdown(markdown, maxChars) {
  if (markdown.length <= maxChars) return markdown;
  const head = markdown.slice(0, Math.floor(maxChars * 0.72));
  const tail = markdown.slice(-Math.floor(maxChars * 0.28));
  return `${head}\n\n...[content truncated for classification]...\n\n${tail}`;
}

function systemPrompt(allowedCollections) {
  return `你是 personal-ai-knowledge-site 的内容迁移分类器。你的任务是把语雀 Markdown 文档分类到 CMS collection，并补齐迁移所需元数据。只输出 JSON，不要输出 Markdown。

可用 collection: ${allowedCollections.join(', ')}

分类准则：
- projects: 具体项目、产品实践、案例复盘、作品介绍，通常包含背景、目标、职责、技术栈、结果。
- posts: 面向公开表达的文章、观点、复盘、教程、长文随笔。
- knowledge: 可复用知识笔记、概念解释、方法论、技术记录、操作手册。
- resources: 工具、书籍、文章、视频、仓库、课程等资源推荐或清单。
- glossary: 单个术语/概念的简明定义和解释。
- timeline: 带明确日期的里程碑、发布记录、学习记录、成长节点。

枚举：
- knowledge.area: ai-agent, architecture, data-engineering, frontend, product, operations, management, tools
- knowledge.level: basic, intermediate, advanced
- resources.type: tool, book, article, video, repo, course
- timeline.kind: milestone, release, learning

输出 JSON schema:
{
  "collection": "knowledge",
  "title": "中文标题",
  "description": "80字以内中文摘要",
  "tags": ["中文标签"],
  "confidence": 0.0,
  "reason": "一句话说明分类依据",
  "category": "posts 需要",
  "area": "knowledge 需要",
  "level": "knowledge 需要",
  "type": "resources 需要",
  "kind": "timeline 需要",
  "role": "projects 可选",
  "stack": ["projects 可选"],
  "aliases": ["glossary 可选"]
}`;
}

function userPrompt({ relative, topLevelDir, title, fallbackDescription, docHeadings, markdown }) {
  return `请分类下面这篇语雀文档。

文件路径: ${relative}
一级目录: ${topLevelDir}
候选标题: ${title}
候选摘要: ${fallbackDescription}
标题结构:
${docHeadings.map((item) => `- ${item}`).join('\n') || '- 无'}

Markdown:
${markdown}`;
}

async function classifyWithDeepSeek(input, opts) {
  const response = await fetch(opts.apiURL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: systemPrompt(opts.allowedCollections) },
        { role: 'user', content: userPrompt(input) },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || response.statusText;
    throw new Error(`DeepSeek request failed: ${response.status} ${message}`);
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('DeepSeek response did not include choices[0].message.content.');
  return normalizeClassification(parseJSONContent(content), opts);
}

function parseJSONContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('LLM response is not JSON.');
    return JSON.parse(match[0]);
  }
}

function normalizeClassification(raw, opts) {
  const result = raw && typeof raw === 'object' ? { ...raw } : {};
  if (!opts.allowedCollections.includes(result.collection)) {
    result.collection = opts.allowedCollections.includes('knowledge') ? 'knowledge' : opts.allowedCollections[0];
  }
  result.title = result.title ? cleanTitle(result.title) : '';
  result.description = String(result.description || '').replace(/\s+/g, ' ').trim().slice(0, 150);
  result.tags = Array.isArray(result.tags) ? result.tags.map((item) => String(item).trim()).filter(Boolean).slice(0, 12) : [];
  result.confidence = Number.isFinite(Number(result.confidence)) ? clamp(Number(result.confidence), 0, 1) : 0;
  result.reason = String(result.reason || '').replace(/\s+/g, ' ').trim().slice(0, 160);

  if (result.confidence < opts.minConfidence) {
    result.collection = opts.allowedCollections.includes('knowledge') ? 'knowledge' : opts.allowedCollections[0];
    result.area = 'operations';
    result.level = 'intermediate';
    result.reason = result.reason ? `${result.reason}；置信度低，降级为知识库草稿复核。` : '置信度低，降级为知识库草稿复核。';
  }

  if (result.collection === 'posts') {
    result.category = String(result.category || '知识沉淀').trim();
  } else if (result.collection === 'knowledge') {
    if (!KNOWLEDGE_AREAS.has(result.area)) result.area = 'tools';
    if (!KNOWLEDGE_LEVELS.has(result.level)) result.level = 'intermediate';
  } else if (result.collection === 'resources') {
    if (!RESOURCE_TYPES.has(result.type)) result.type = 'article';
  } else if (result.collection === 'timeline') {
    if (!TIMELINE_KINDS.has(result.kind)) result.kind = 'learning';
  } else if (result.collection === 'projects') {
    result.role = String(result.role || '').trim();
    result.stack = Array.isArray(result.stack) ? result.stack.map((item) => String(item).trim()).filter(Boolean).slice(0, 12) : [];
  } else if (result.collection === 'glossary') {
    result.aliases = Array.isArray(result.aliases) ? result.aliases.map((item) => String(item).trim()).filter(Boolean).slice(0, 10) : [];
  }

  return result;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function docFromClassification(root, item, classification, opts) {
  const slug = `yuque-${hash(item.relative)}`;
  const tags = [...new Set(['语雀', ...folderTags(root, item.filePath), ...classification.tags])];
  const base = {
    title: classification.title || item.title,
    description: classification.description || item.fallbackDescription,
    translationKey: slug,
    slug,
    date: item.mtime,
    updated: item.mtime,
    tags,
    sourcePath: item.filePath,
    bodyMarkdown: item.bodyMarkdown,
  };

  if (classification.collection === 'posts') return { ...base, category: classification.category || '知识沉淀' };
  if (classification.collection === 'knowledge') return { ...base, area: classification.area || 'tools', level: classification.level || 'intermediate' };
  if (classification.collection === 'resources') return { ...base, type: classification.type || 'article' };
  if (classification.collection === 'timeline') return { ...base, kind: classification.kind || 'learning' };
  if (classification.collection === 'projects') {
    return {
      ...base,
      ...(classification.role ? { role: classification.role } : {}),
      stack: classification.stack || [],
      links: [],
    };
  }
  if (classification.collection === 'glossary') return { ...base, aliases: classification.aliases || [] };
  return base;
}

function migrationFromResults(root, results, opts) {
  const batches = [];
  for (const collection of opts.allowedCollections) {
    const docs = results
      .filter((item) => item.classification.collection === collection)
      .map((item) => docFromClassification(root, item, item.classification, opts));
    if (docs.length > 0) batches.push({ collection, docs });
  }

  return {
    mode: 'upsert',
    defaults: {
      lang: 'zh-CN',
      status: opts.status,
      featured: false,
    },
    batches,
  };
}

function reviewFromResults(results) {
  return results.map((item) => ({
    sourcePath: item.filePath,
    relativePath: item.relative,
    title: item.title,
    collection: item.classification.collection,
    confidence: item.classification.confidence,
    reason: item.classification.reason,
    description: item.classification.description,
    tags: item.classification.tags,
    fields: {
      category: item.classification.category,
      area: item.classification.area,
      level: item.classification.level,
      type: item.classification.type,
      kind: item.classification.kind,
      role: item.classification.role,
      stack: item.classification.stack,
      aliases: item.classification.aliases,
    },
  }));
}

async function loadMarkdownItem(root, filePath, opts) {
  const raw = await readFile(filePath, 'utf8');
  const bodyMarkdown = stripFrontmatter(raw).trim();
  const title = titleFromMarkdown(bodyMarkdown || raw, filePath);
  const relative = path.relative(root, filePath);
  const info = await stat(filePath);
  return {
    filePath: path.resolve(filePath),
    relative,
    topLevelDir: relative.split(path.sep)[0],
    title,
    fallbackDescription: excerpt(bodyMarkdown),
    headings: headings(bodyMarkdown),
    bodyMarkdown,
    mtime: info.mtime.toISOString().slice(0, 10),
    cacheKey: cacheKey(root, filePath, bodyMarkdown),
    promptMarkdown: sampleMarkdown(bodyMarkdown, opts.maxChars),
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    usage();
    return;
  }
  validateOptions(opts);

  const root = path.resolve(opts.from);
  const allFiles = await collectMarkdownFiles(root);
  const files = filterMarkdownFiles(root, allFiles, opts);
  const cache = opts.reuseCache ? await readCache(opts.cache) : {};
  const items = await mapLimit(files, 8, (file) => loadMarkdownItem(root, file, opts));

  let reused = 0;
  const results = await mapLimit(items, opts.concurrency, async (item, index) => {
    let classification = cache[item.cacheKey];
    if (classification) {
      reused += 1;
      classification = normalizeClassification(classification, opts);
    } else {
      console.log(`[yuque-classify] ${index + 1}/${items.length} ${item.relative}`);
      classification = await classifyWithDeepSeek({
        relative: item.relative,
        topLevelDir: item.topLevelDir,
        title: item.title,
        fallbackDescription: item.fallbackDescription,
        docHeadings: item.headings,
        markdown: item.promptMarkdown,
      }, opts);
      cache[item.cacheKey] = classification;
      await writeJSON(opts.cache, cache);
    }
    return { ...item, classification };
  });

  const migration = migrationFromResults(root, results, opts);
  const review = reviewFromResults(results);
  await writeJSON(opts.out, migration);
  await writeJSON(opts.reviewOut, review);
  await writeJSON(opts.cache, cache);

  const counts = Object.fromEntries(migration.batches.map((batch) => [batch.collection, batch.docs.length]));
  console.log(`[yuque-classify] files=${files.length}${files.length !== allFiles.length ? ` filtered from ${allFiles.length}` : ''}`);
  console.log(`[yuque-classify] cache reused=${reused}`);
  console.log(`[yuque-classify] counts=${JSON.stringify(counts)}`);
  console.log(`[yuque-classify] wrote ${opts.reviewOut}`);
  console.log(`[yuque-classify] wrote ${opts.out}`);
  console.log(`[yuque-classify] next: node .skills/cms-content-migration/scripts/cms-import.mjs --input ${opts.out} --dry-run --print-json`);
  if (opts.printJson) console.log(JSON.stringify(migration, null, 2));
}

main().catch((error) => {
  console.error(`[yuque-classify] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
