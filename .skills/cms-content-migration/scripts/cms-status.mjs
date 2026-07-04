#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const COLLECTIONS = new Set(['podcast', 'posts', 'knowledge', 'topics', 'projects', 'resources', 'glossary', 'timeline']);
const STATUSES = new Set(['draft', 'published', 'archived']);

function usage() {
  console.log(`Usage:
  node .skills/cms-content-migration/scripts/cms-status.mjs \\
    --input migrations/yuque-classified/ai-topic.safe.migration.json \\
    --status published \\
    --dry-run

  CMS_API_URL="http://114.55.237.202:3000/api" CMS_API_TOKEN="***" \\
  node .skills/cms-content-migration/scripts/cms-status.mjs \\
    --input migrations/yuque-classified/ai-topic.safe.migration.json \\
    --status published \\
    --apply

Options:
  --input <file>              Standard migration JSON.
  --status <status>           Target status: draft, published, archived. Defaults to published.
  --only <collections>        Comma-separated collections to include.
  --exclude <collections>     Comma-separated collections to exclude.
  --lang <lang>               Match language. Defaults to zh-CN.
  --cms-url <url>             Payload REST API base URL. Defaults to CMS_API_URL or http://127.0.0.1:3000/api.
  --token <token>             CMS API JWT. Defaults to CMS_API_TOKEN.
  --auth-scheme <JWT|Bearer>  Authorization scheme. Defaults to JWT.
  --limit <n>                 Process at most n docs.
  --apply                     Patch CMS. Without this flag the script only dry-runs.
  --dry-run                   Validate and print planned changes. This is the default.
  --help, -h                  Show help.
`);
}

function parseArgs(argv) {
  const opts = {
    dryRun: true,
    status: 'published',
    lang: 'zh-CN',
    cmsURL: process.env.CMS_API_URL || 'http://127.0.0.1:3000/api',
    token: process.env.CMS_API_TOKEN || '',
    authScheme: process.env.CMS_API_AUTH_SCHEME || 'JWT',
    only: [],
    exclude: [],
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
    else if (arg === '--status') opts.status = next();
    else if (arg === '--only') opts.only = csv(next());
    else if (arg === '--exclude') opts.exclude = csv(next());
    else if (arg === '--lang') opts.lang = next();
    else if (arg === '--cms-url') opts.cmsURL = next();
    else if (arg === '--token') opts.token = next();
    else if (arg === '--auth-scheme') opts.authScheme = next();
    else if (arg === '--limit') opts.limit = Number(next());
    else if (arg === '--apply') opts.dryRun = false;
    else if (arg === '--dry-run') opts.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  return opts;
}

function csv(value) {
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function validateOptions(opts) {
  if (opts.help) return;
  if (!opts.input) throw new Error('Missing --input <file>.');
  if (!STATUSES.has(opts.status)) throw new Error(`Invalid --status: ${opts.status}`);
  if (!opts.dryRun && !opts.token) throw new Error('Missing CMS_API_TOKEN or --token for --apply.');
  if (opts.limit !== undefined && (!Number.isInteger(opts.limit) || opts.limit < 1)) {
    throw new Error('--limit must be a positive integer.');
  }
  for (const collection of [...opts.only, ...opts.exclude]) {
    if (!COLLECTIONS.has(collection)) throw new Error(`Invalid collection filter: ${collection}`);
  }
}

async function loadDocs(inputPath, opts) {
  const input = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
  const docs = flattenInput(input);
  const filtered = docs.filter((doc) => {
    if (opts.only.length > 0 && !opts.only.includes(doc.collection)) return false;
    if (opts.exclude.includes(doc.collection)) return false;
    return true;
  });
  return opts.limit ? filtered.slice(0, opts.limit) : filtered;
}

function flattenInput(input) {
  if (Array.isArray(input)) return input.map((doc) => withCollection(doc.collection, doc));
  if (input && typeof input === 'object' && Array.isArray(input.batches)) {
    return input.batches.flatMap((batch) => (batch.docs || []).map((doc) => withCollection(batch.collection, doc)));
  }
  if (input && typeof input === 'object' && Array.isArray(input.docs)) {
    return input.docs.map((doc) => withCollection(input.collection, doc));
  }
  if (input && typeof input === 'object') return [withCollection(input.collection, input)];
  throw new Error('Unsupported input format.');
}

function withCollection(collection, doc) {
  if (!collection || !COLLECTIONS.has(collection)) throw new Error(`Invalid or missing collection: ${collection || '(missing)'}`);
  if (!doc.slug) throw new Error(`${collection} doc missing slug.`);
  return {
    collection,
    slug: doc.slug,
    title: doc.title || doc.slug,
    lang: doc.lang || 'zh-CN',
  };
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

async function findExisting(opts, doc) {
  const url = new URL(apiURL(opts, doc.collection));
  url.searchParams.set('limit', '1');
  url.searchParams.set('depth', '0');
  url.searchParams.set('where[slug][equals]', doc.slug);
  url.searchParams.set('where[lang][equals]', opts.lang || doc.lang || 'zh-CN');
  const res = await fetch(url, { headers: headers(opts) });
  if (!res.ok) throw new Error(`Find ${doc.collection}/${doc.slug} failed: ${res.status} ${res.statusText}`);
  const body = await res.json();
  return Array.isArray(body.docs) && body.docs.length > 0 ? body.docs[0] : undefined;
}

async function patchStatus(opts, doc, existing) {
  const res = await fetch(apiURL(opts, doc.collection, existing.id), {
    method: 'PATCH',
    headers: headers(opts, true),
    body: JSON.stringify({ status: opts.status }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Patch ${doc.collection}/${doc.slug} failed: ${res.status} ${res.statusText}\n${text}`);
  }
  const body = await res.json();
  return body.doc || body;
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function printCounts(label, map) {
  const parts = [...map.entries()].map(([key, count]) => `${key}:${count}`).join(', ') || 'none';
  console.log(`[cms-status] ${label} ${parts}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    usage();
    return;
  }
  validateOptions(opts);

  const docs = await loadDocs(opts.input, opts);
  const perCollection = new Map();
  for (const doc of docs) increment(perCollection, doc.collection);

  console.log(`[cms-status] mode=${opts.dryRun ? 'dry-run' : 'apply'} target=${opts.status} docs=${docs.length}`);
  printCounts('collections=', perCollection);

  const planned = [];
  const missing = [];
  const unchanged = [];
  const fromStatuses = new Map();

  for (const doc of docs) {
    const existing = await findExisting(opts, doc);
    if (!existing) {
      missing.push(doc);
      console.warn(`[cms-status] missing ${doc.collection}/${doc.slug}`);
      continue;
    }

    increment(fromStatuses, existing.status || '(empty)');
    if (existing.status === opts.status) {
      unchanged.push({ doc, existing });
      continue;
    }

    planned.push({ doc, existing });
    console.log(`[cms-status] ${opts.dryRun ? 'would update' : 'updating'} ${doc.collection}/${doc.slug} id=${existing.id} ${existing.status || '(empty)'} -> ${opts.status}`);
    if (!opts.dryRun) {
      await patchStatus(opts, doc, existing);
    }
  }

  printCounts('current-status=', fromStatuses);
  console.log(`[cms-status] planned=${planned.length} unchanged=${unchanged.length} missing=${missing.length}`);
  if (missing.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[cms-status] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
