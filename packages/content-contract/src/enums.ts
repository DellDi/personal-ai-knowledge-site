export const LANGS = ['zh-CN', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'zh-CN';

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const KNOWLEDGE_AREAS = [
  'ai-agent',
  'architecture',
  'data-engineering',
  'frontend',
  'product',
  'operations',
  'management',
  'tools',
] as const;
export type KnowledgeArea = (typeof KNOWLEDGE_AREAS)[number];

export const KNOWLEDGE_LEVELS = ['basic', 'intermediate', 'advanced'] as const;
export type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number];

export const RESOURCE_TYPES = ['tool', 'book', 'article', 'video', 'repo', 'course'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const TIMELINE_KINDS = ['milestone', 'release', 'learning'] as const;
export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export const COLLECTION_SLUGS = [
  'podcast',
  'posts',
  'knowledge',
  'topics',
  'projects',
  'resources',
  'glossary',
  'timeline',
] as const;
export type CollectionSlug = (typeof COLLECTION_SLUGS)[number];

export const COLLECTION_BASE_PATHS: Record<CollectionSlug, string> = {
  podcast: '/podcast',
  posts: '/posts',
  knowledge: '/knowledge',
  topics: '/topics',
  projects: '/projects',
  resources: '/resources',
  glossary: '/glossary',
  timeline: '/timeline',
};
