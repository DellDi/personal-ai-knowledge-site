import type { CollectionConfig } from 'payload';
import {
  CONTENT_STATUSES,
  LANGS,
  KNOWLEDGE_AREAS,
  KNOWLEDGE_LEVELS,
  RESOURCE_TYPES,
  TIMELINE_KINDS,
} from '@personal-ai-knowledge-site/content-contract';
import { sharedBlocks } from './shared-blocks';

export const podcast: CollectionConfig = {
  slug: 'podcast',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date', required: true },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'episode', type: 'number', required: true },
    { name: 'season', type: 'number', defaultValue: 1 },
    { name: 'audio', type: 'text', required: true },
    { name: 'duration', type: 'text' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'transcript', type: 'checkbox', defaultValue: true },
    { name: 'hosts', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'guests', type: 'text', hasMany: true, defaultValue: [] },
    {
      name: 'timeline',
      type: 'array',
      fields: [
        { name: 'time', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
      defaultValue: [],
    },
    {
      name: 'resources',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'note', type: 'text' },
      ],
      defaultValue: [],
    },
    { name: 'content', type: 'richText' },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: sharedBlocks,
    },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'episode', 'updatedAt'] },
};

export const knowledge: CollectionConfig = {
  slug: 'knowledge',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date' },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'area', type: 'select', required: true, options: [...KNOWLEDGE_AREAS] },
    { name: 'level', type: 'select', defaultValue: 'intermediate', options: [...KNOWLEDGE_LEVELS] },
    { name: 'order', type: 'number' },
    { name: 'content', type: 'richText' },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: sharedBlocks,
    },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'area', 'updatedAt'] },
};

export const topics: CollectionConfig = {
  slug: 'topics',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date' },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'hero', type: 'upload', relationTo: 'media' },
    { name: 'items', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'content', type: 'richText' },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: sharedBlocks,
    },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date' },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'role', type: 'text' },
    { name: 'stack', type: 'text', hasMany: true, defaultValue: [] },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
      defaultValue: [],
    },
    { name: 'content', type: 'richText' },
    {
      name: 'contentBlocks',
      type: 'blocks',
      blocks: sharedBlocks,
    },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const resources: CollectionConfig = {
  slug: 'resources',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date' },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'type', type: 'select', required: true, options: [...RESOURCE_TYPES] },
    { name: 'url', type: 'text' },
    { name: 'content', type: 'richText' },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'type', 'updatedAt'] },
};

export const glossary: CollectionConfig = {
  slug: 'glossary',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date' },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'aliases', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'content', type: 'richText' },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const timeline: CollectionConfig = {
  slug: 'timeline',
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'lang', type: 'select', required: true, defaultValue: 'zh-CN', options: [...LANGS] },
    { name: 'translationKey', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [...CONTENT_STATUSES] },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'date', type: 'date', required: true },
    { name: 'updated', type: 'date' },
    { name: 'tags', type: 'text', hasMany: true, defaultValue: [] },
    { name: 'kind', type: 'select', defaultValue: 'milestone', options: [...TIMELINE_KINDS] },
    { name: 'content', type: 'richText' },
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'kind', 'date'] },
};
