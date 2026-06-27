import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lang = z.enum(['zh-CN', 'en']);
const status = z.enum(['draft', 'published', 'archived']).default('draft');

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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/podcast' }),
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
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    category: z.string(),
    series: z.string().optional(),
  }),
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/knowledge' }),
  schema: z.object({
    ...common,
    area: z.enum([
      'ai-agent',
      'architecture',
      'data-engineering',
      'frontend',
      'product',
      'operations',
      'management',
      'tools',
    ]),
    level: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
    order: z.number().optional(),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/topics' }),
  schema: z.object({
    ...common,
    items: z.array(z.string()).default([]),
    hero: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
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
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/resources' }),
  schema: z.object({
    ...common,
    type: z.enum(['tool', 'book', 'article', 'video', 'repo', 'course']),
    url: z.string().optional(),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: z.object({
    ...common,
    aliases: z.array(z.string()).default([]),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/timeline' }),
  schema: z.object({
    ...common,
    date: z.coerce.date(),
    kind: z.enum(['milestone', 'release', 'learning']).default('milestone'),
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
