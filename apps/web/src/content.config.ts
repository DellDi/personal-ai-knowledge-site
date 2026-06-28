import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  BLOCK_TYPES,
  CONTENT_STATUSES,
  KNOWLEDGE_AREAS,
  KNOWLEDGE_LEVELS,
  RESOURCE_TYPES,
  TIMELINE_KINDS,
} from '@personal-ai-knowledge-site/content-contract';
import { cmsLoader } from './lib/cms-loader';

const lang = z.enum(['zh-CN', 'en']);
const status = z.enum(CONTENT_STATUSES).default('draft');

const blockSchema = z.union([
  z.object({ type: z.literal('richText'), content: z.string() }),
  z.object({ type: z.literal('callout'), variant: z.enum(['info', 'tip', 'warning', 'danger']), title: z.string().optional(), content: z.string() }),
  z.object({ type: z.literal('code'), language: z.string().optional(), filename: z.string().optional(), code: z.string() }),
  z.object({ type: z.literal('audio'), src: z.string(), title: z.string().optional(), duration: z.string().optional(), download: z.string().optional() }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string(), caption: z.string().optional(), source: z.string().optional() }),
  z.object({ type: z.literal('quote'), content: z.string(), author: z.string().optional(), source: z.string().optional(), url: z.string().optional() }),
  z.object({ type: z.literal('embed'), src: z.string(), title: z.string().optional(), ratio: z.enum(['16-9', '4-3', '1-1']).optional() }),
  z.object({ type: z.literal('steps'), title: z.string().optional(), items: z.array(z.string()) }),
  z.object({ type: z.literal('statGrid'), columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(), items: z.array(z.object({ value: z.string(), label: z.string() })) }),
  z.object({ type: z.literal('compareTable'), caption: z.string().optional(), columns: z.array(z.object({ key: z.string(), label: z.string(), highlight: z.boolean().optional() })), rows: z.array(z.record(z.string(), z.string())) }),
]);

const contentBlocksField = z.array(blockSchema).optional();

void BLOCK_TYPES;

function collectionLoader(slug: string, passthroughFields: string[] = []) {
  const localLoader = glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${slug}` });
  const cmsURL = process.env.CMS_API_URL;
  if (cmsURL) {
    const remoteLoader = cmsLoader({
      collection: slug,
      apiURL: cmsURL,
      graceful: true,
      clearStore: false,
      passthroughFields,
    });

    return {
      name: `hybrid-${slug}`,
      async load(ctx) {
        await localLoader.load(ctx);
        await remoteLoader.load(ctx);
      },
    } satisfies Loader;
  }
  return localLoader;
}

const common = {
  title: z.string(),
  description: z.string(),
  lang,
  translationKey: z.string(),
  slug: z.string(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  status,
  featured: z.boolean().default(false),
};

const podcast = defineCollection({
  loader: collectionLoader('podcast', ['timeline', 'resources', 'episode', 'season', 'audio', 'duration', 'cover', 'transcript', 'hosts', 'guests']),
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    episode: z.number(),
    season: z.number().default(1),
    audio: z.string(),
    duration: z.string().optional(),
    cover: z.string().optional(),
    transcript: z.boolean().default(true),
    hosts: z.array(z.string()).default([]),
    guests: z.array(z.string()).default([]),
    timeline: z
      .array(
        z.object({
          time: z.string(),
          label: z.string(),
        }),
      )
      .default([]),
    resources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          note: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const posts = defineCollection({
  loader: collectionLoader('posts', ['contentBlocks']),
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    category: z.string(),
    series: z.string().optional(),
    contentBlocks: contentBlocksField,
  }),
});

const knowledge = defineCollection({
  loader: collectionLoader('knowledge', ['area', 'level', 'order', 'contentBlocks']),
  schema: z.object({
    ...common,
    area: z.enum(KNOWLEDGE_AREAS),
    level: z.enum(KNOWLEDGE_LEVELS).default('intermediate'),
    order: z.number().optional(),
    contentBlocks: contentBlocksField,
  }),
});

const topics = defineCollection({
  loader: collectionLoader('topics', ['items', 'hero', 'contentBlocks']),
  schema: z.object({
    ...common,
    items: z.array(z.string()).default([]),
    hero: z.string().optional(),
    contentBlocks: contentBlocksField,
  }),
});

const projects = defineCollection({
  loader: collectionLoader('projects', ['role', 'stack', 'links', 'contentBlocks']),
  schema: z.object({
    ...common,
    role: z.string().optional(),
    stack: z.array(z.string()).default([]),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .default([]),
    contentBlocks: contentBlocksField,
  }),
});

const resources = defineCollection({
  loader: collectionLoader('resources', ['type', 'url']),
  schema: z.object({
    ...common,
    type: z.enum(RESOURCE_TYPES),
    url: z.string().optional(),
  }),
});

const glossary = defineCollection({
  loader: collectionLoader('glossary', ['aliases']),
  schema: z.object({
    ...common,
    aliases: z.array(z.string()).default([]),
  }),
});

const timeline = defineCollection({
  loader: collectionLoader('timeline', ['kind']),
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    kind: z.enum(TIMELINE_KINDS).default('milestone'),
  }),
});

export const collections = {
  podcast,
  posts,
  knowledge,
  topics,
  projects,
  resources,
  glossary,
  timeline,
};
