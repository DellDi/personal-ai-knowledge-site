#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const COLLECTIONS = new Set(['posts', 'knowledge', 'topics', 'projects', 'resources', 'glossary', 'timeline']);
const KNOWLEDGE_AREAS = new Set(['ai-agent', 'architecture', 'data-engineering', 'frontend', 'product', 'operations', 'management', 'tools']);
const RESOURCE_TYPES = new Set(['tool', 'book', 'article', 'video', 'repo', 'course']);
const TIMELINE_KINDS = new Set(['milestone', 'release', 'learning']);

function usage() {
  console.log(`Usage:
  node .skills/cms-content-migration/scripts/yuque-fs-to-migration.mjs \\
    --from .codex/external/yuque-exporter/output \\
    --collection knowledge \\
    --knowledge-area tools \\
    --out migrations/yuque-exporter/migration.json

Options:
  --from <dir>                 Directory exported by yuque-exporter.
  --out <file>                 Output migration JSON. Defaults to migrations/yuque-exporter/migration.json.
  --collection <slug>          Target CMS collection. Defaults to knowledge.
  --status <status>            Default status. Defaults to draft.
  --tag <tag>                  Default tag. Repeatable or comma-separated.
  --default-tags <tags>        Comma-separated default tags.
  --include-dir <names>        Only convert top-level directories. Repeatable or comma-separated.
  --exclude-dir <names>        Exclude top-level directories. Repeatable or comma-separated.
  --knowledge-area <area>      Required for collection=knowledge. Defaults to tools.
  --knowledge-level <level>    Defaults to intermediate.
  --resource-type <type>       Required for collection=resources. Defaults to article.
  --category <category>        Required for collection=posts. Defaults to 语雀迁移.
  --timeline-kind <kind>       Required for collection=timeline. Defaults to learning.
  --print-json                 Print generated JSON.
  --help, -h                   Show help.
`);
}

function parseArgs(argv) {
  const opts = {
    out: 'migrations/yuque-exporter/migration.json',
    collection: 'knowledge',
    status: 'draft',
    tags: ['语雀'],
    includeDirs: [],
    excludeDirs: [],
    knowledgeArea: 'tools',
    knowledgeLevel: 'intermediate',
    resourceType: 'article',
    category: '语雀迁移',
    timelineKind: 'learning',
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
    else if (arg === '--collection') opts.collection = next();
    else if (arg === '--status') opts.status = next();
    else if (arg === '--tag') pushCSV(opts.tags, next());
    else if (arg === '--default-tags') pushCSV(opts.tags, next());
    else if (arg === '--include-dir') pushCSV(opts.includeDirs, next());
    else if (arg === '--exclude-dir') pushCSV(opts.excludeDirs, next());
    else if (arg === '--knowledge-area') opts.knowledgeArea = next();
    else if (arg === '--knowledge-level') opts.knowledgeLevel = next();
    else if (arg === '--resource-type') opts.resourceType = next();
    else if (arg === '--category') opts.category = next();
    else if (arg === '--timeline-kind') opts.timelineKind = next();
    else if (arg === '--print-json') opts.printJson = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  opts.tags = [...new Set(opts.tags)];
  opts.includeDirs = [...new Set(opts.includeDirs)];
  opts.excludeDirs = [...new Set(opts.excludeDirs)];
  return opts;
}

function pushCSV(target, value) {
  for (const item of value.split(',')) {
    const trimmed = item.trim();
    if (trimmed) target.push(trimmed);
  }
}

function validateOptions(opts) {
  if (opts.help) return;
  if (!opts.from) throw new Error('Missing --from <dir>.');
  if (!COLLECTIONS.has(opts.collection)) throw new Error(`Invalid collection: ${opts.collection}`);
  if (opts.collection === 'knowledge' && !KNOWLEDGE_AREAS.has(opts.knowledgeArea)) throw new Error(`Invalid knowledge area: ${opts.knowledgeArea}`);
  if (opts.collection === 'resources' && !RESOURCE_TYPES.has(opts.resourceType)) throw new Error(`Invalid resource type: ${opts.resourceType}`);
  if (opts.collection === 'timeline' && !TIMELINE_KINDS.has(opts.timelineKind)) throw new Error(`Invalid timeline kind: ${opts.timelineKind}`);
}

async function collectMarkdownFiles(dir) {
  const root = path.resolve(dir);
  const files = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        files.push(full);
      }
    }
  }
  await walk(root);
  return files.sort();
}

function filterMarkdownFiles(root, files, opts) {
  return files.filter((file) => {
    const relative = path.relative(root, file);
    const topLevelDir = relative.split(path.sep)[0];

    if (opts.excludeDirs.includes(topLevelDir)) return false;
    if (opts.includeDirs.length === 0) return true;
    return opts.includeDirs.includes(topLevelDir);
  });
}

function stripFrontmatter(markdown) {
  const text = markdown.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---', 4);
  if (end === -1) return text;
  return text.slice(end + 4).replace(/^\n/, '');
}

function titleFromMarkdown(markdown, filePath) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) return cleanTitle(heading[1]);
  return cleanTitle(path.basename(filePath, path.extname(filePath)));
}

function cleanTitle(value) {
  return String(value)
    .replace(/\[[^\]]*]\([^)]+\)/g, '')
    .replace(/[*_`#]/g, '')
    .trim() || '未命名语雀文档';
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

async function fileDoc(root, filePath, opts) {
  const raw = await readFile(filePath, 'utf8');
  const bodyMarkdown = stripFrontmatter(raw).trim();
  const title = titleFromMarkdown(bodyMarkdown || raw, filePath);
  const relative = path.relative(root, filePath);
  const slug = `yuque-${hash(relative)}`;
  const info = await stat(filePath);
  const tags = [...new Set([...opts.tags, ...folderTags(root, filePath)])];
  const base = {
    title,
    description: excerpt(bodyMarkdown),
    translationKey: slug,
    slug,
    date: info.mtime.toISOString().slice(0, 10),
    updated: info.mtime.toISOString().slice(0, 10),
    tags,
    sourcePath: path.resolve(filePath),
    bodyMarkdown,
  };

  if (opts.collection === 'knowledge') return { ...base, area: opts.knowledgeArea, level: opts.knowledgeLevel };
  if (opts.collection === 'posts') return { ...base, category: opts.category };
  if (opts.collection === 'resources') return { ...base, type: opts.resourceType };
  if (opts.collection === 'timeline') return { ...base, kind: opts.timelineKind };
  return base;
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
  const docs = [];
  for (const file of files) docs.push(await fileDoc(root, file, opts));

  const migration = {
    collection: opts.collection,
    mode: 'upsert',
    defaults: {
      lang: 'zh-CN',
      status: opts.status,
      featured: false,
    },
    docs,
  };

  await mkdir(path.dirname(path.resolve(opts.out)), { recursive: true });
  await writeFile(path.resolve(opts.out), `${JSON.stringify(migration, null, 2)}\n`, 'utf8');
  console.log(`[yuque-fs-to-migration] files=${files.length}`);
  if (files.length !== allFiles.length) {
    console.log(`[yuque-fs-to-migration] filtered from ${allFiles.length} files`);
  }
  console.log(`[yuque-fs-to-migration] wrote ${opts.out}`);
  console.log(`[yuque-fs-to-migration] next: node .skills/cms-content-migration/scripts/cms-import.mjs --input ${opts.out} --dry-run --print-json`);
  if (opts.printJson) console.log(JSON.stringify(migration, null, 2));
}

main().catch((error) => {
  console.error(`[yuque-fs-to-migration] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
