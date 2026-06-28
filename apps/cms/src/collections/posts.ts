import type { CollectionConfig, Field, Block } from 'payload';
import {
  CONTENT_STATUSES,
  LANGS,
} from '@personal-ai-knowledge-site/content-contract';

const calloutBlock: Block = {
  slug: 'calloutBlock',
  fields: [
    { name: 'variant', type: 'select', required: true, defaultValue: 'info', options: ['info', 'tip', 'warning', 'danger'] },
    { name: 'title', type: 'text' },
    { name: 'content', type: 'textarea', required: true },
  ],
};

const codeBlockField: Block = {
  slug: 'codeBlock',
  fields: [
    { name: 'language', type: 'text' },
    { name: 'filename', type: 'text' },
    { name: 'code', type: 'textarea', required: true },
  ],
};

const quoteBlock: Block = {
  slug: 'quoteBlock',
  fields: [
    { name: 'content', type: 'textarea', required: true },
    { name: 'author', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'url', type: 'text' },
  ],
};

const stepsBlock: Block = {
  slug: 'stepsBlock',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
  ],
};

const statGridBlock: Block = {
  slug: 'statGridBlock',
  fields: [
    { name: 'columns', type: 'number', defaultValue: 3 },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
};

const compareTableBlock: Block = {
  slug: 'compareTableBlock',
  fields: [
    { name: 'caption', type: 'text' },
    {
      name: 'columns',
      type: 'array',
      required: true,
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'highlight', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      required: true,
      fields: [{ name: 'data', type: 'json', required: true }],
    },
  ],
};

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
    { name: 'date', type: 'date' },
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
      blocks: [calloutBlock, codeBlockField, quoteBlock, stepsBlock, statGridBlock, compareTableBlock],
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
