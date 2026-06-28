import type { CollectionConfig } from 'payload';
import { afterChangeHook, afterDeleteHook } from './webhook';

const CONTENT_SLUGS = [
  'posts',
  'podcast',
  'knowledge',
  'topics',
  'projects',
  'resources',
  'glossary',
  'timeline',
];

export function withPublishHooks(config: CollectionConfig): CollectionConfig {
  if (!CONTENT_SLUGS.includes(config.slug)) return config;
  return {
    ...config,
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange ?? []), afterChangeHook],
      afterDelete: [...(config.hooks?.afterDelete ?? []), afterDeleteHook],
    },
  };
}
