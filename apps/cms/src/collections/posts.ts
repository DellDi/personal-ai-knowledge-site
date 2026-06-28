import type { CollectionConfig } from 'payload';
import {
  CONTENT_STATUSES,
  LANGS,
} from '@personal-ai-knowledge-site/content-contract';
import { sharedBlocks } from './shared-blocks';

export const posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'lang',
      type: 'select',
      required: true,
      defaultValue: 'zh-CN',
      options: [...LANGS],
    },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'category', type: 'text', required: true },
    { name: 'series', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [...CONTENT_STATUSES],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date', required: true },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: sharedBlocks,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      defaultValue: ({ user }: { user?: { id: string } }) => user?.id,
    },
  ],
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'lang', 'updatedAt'],
  },
};
