import type { CollectionConfig } from 'payload';
import {
  commonContentFields,
  contentBlocksField,
  knowledgeAreaOptions,
  knowledgeLevelOptions,
  mediaUploadField,
  resourceTypeOptions,
  richTextContentField,
  timelineKindOptions,
} from './field-labels';
import { sharedBlocks } from './shared-blocks';

export const podcast: CollectionConfig = {
  slug: 'podcast',
  labels: {
    singular: '播客',
    plural: '播客',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields({ dateRequired: true }),
    { name: 'episode', type: 'number', label: '单集编号', required: true },
    { name: 'season', type: 'number', label: '季', defaultValue: 1 },
    mediaUploadField({
      name: 'audioFile',
      label: '音频文件',
      required: true,
      mimeType: 'audio',
      description: '上传到 media 集合；本地写入 MinIO，生产通过同一套配置写入阿里 OSS。',
    }),
    { name: 'duration', type: 'text', label: '时长', admin: { placeholder: '例如 42:18' } },
    mediaUploadField({ name: 'cover', label: '封面', mimeType: 'image' }),
    { name: 'transcript', type: 'checkbox', label: '包含文字稿', defaultValue: true },
    { name: 'hosts', type: 'text', label: '主持人', hasMany: true, defaultValue: [] },
    { name: 'guests', type: 'text', label: '嘉宾', hasMany: true, defaultValue: [] },
    {
      name: 'timeline',
      type: 'array',
      label: '时间轴',
      labels: {
        singular: '时间点',
        plural: '时间点',
      },
      fields: [
        { name: 'time', type: 'text', label: '时间', required: true, admin: { placeholder: '例如 08:30' } },
        { name: 'label', type: 'text', label: '说明', required: true },
      ],
      defaultValue: [],
    },
    {
      name: 'resources',
      type: 'array',
      label: '本期资源',
      labels: {
        singular: '资源',
        plural: '资源',
      },
      fields: [
        { name: 'label', type: 'text', label: '名称', required: true },
        { name: 'url', type: 'text', label: '外部链接' },
        mediaUploadField({
          name: 'file',
          label: '上传附件',
          description: '外部链接和上传附件二选一。附件会进入 media 集合，由 MinIO/OSS 托管。',
        }),
        { name: 'note', type: 'text', label: '备注' },
      ],
      defaultValue: [],
    },
    richTextContentField(),
    contentBlocksField(sharedBlocks),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'episode', 'updatedAt'] },
};

export const knowledge: CollectionConfig = {
  slug: 'knowledge',
  labels: {
    singular: '知识库',
    plural: '知识库',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields(),
    { name: 'area', type: 'select', label: '知识领域', required: true, options: knowledgeAreaOptions },
    { name: 'level', type: 'select', label: '难度层级', defaultValue: 'intermediate', options: knowledgeLevelOptions },
    { name: 'order', type: 'number', label: '排序', admin: { description: '同一知识领域下的手动排序，数字越小越靠前。' } },
    richTextContentField(),
    contentBlocksField(sharedBlocks),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'area', 'updatedAt'] },
};

export const topics: CollectionConfig = {
  slug: 'topics',
  labels: {
    singular: '专题',
    plural: '专题',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields(),
    mediaUploadField({ name: 'hero', label: '专题封面', mimeType: 'image' }),
    {
      name: 'items',
      type: 'text',
      label: '关联内容',
      hasMany: true,
      defaultValue: [],
      admin: {
        description: '填写关联内容的 slug 或 translationKey，用于专题聚合和后续推荐。',
      },
    },
    richTextContentField(),
    contentBlocksField(sharedBlocks),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: '项目',
    plural: '项目',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields(),
    mediaUploadField({ name: 'cover', label: '项目封面', mimeType: 'image' }),
    { name: 'role', type: 'text', label: '我的角色', admin: { placeholder: '例如 全栈工程师 / 架构设计 / 产品共创' } },
    { name: 'stack', type: 'text', label: '技术栈', hasMany: true, defaultValue: [] },
    {
      name: 'links',
      type: 'array',
      label: '相关链接',
      labels: {
        singular: '链接',
        plural: '链接',
      },
      fields: [
        { name: 'label', type: 'text', label: '名称', required: true },
        { name: 'url', type: 'text', label: '链接', required: true },
      ],
      defaultValue: [],
    },
    richTextContentField(),
    contentBlocksField(sharedBlocks),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const resources: CollectionConfig = {
  slug: 'resources',
  labels: {
    singular: '资源',
    plural: '资源',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields(),
    mediaUploadField({ name: 'cover', label: '资源封面', mimeType: 'image' }),
    { name: 'type', type: 'select', label: '资源类型', required: true, options: resourceTypeOptions },
    {
      name: 'url',
      type: 'text',
      label: '外部链接',
      admin: {
        description: '外部资料、站外文章、代码仓库、视频课程等继续填写链接。',
      },
    },
    mediaUploadField({
      name: 'asset',
      label: '上传附件',
      description: '站内 PDF、图片、音频、文档等资源走上传附件，最终由 MinIO/OSS 托管。',
    }),
    richTextContentField(),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'type', 'updatedAt'] },
};

export const glossary: CollectionConfig = {
  slug: 'glossary',
  labels: {
    singular: '术语',
    plural: '术语',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields(),
    { name: 'aliases', type: 'text', label: '别名', hasMany: true, defaultValue: [] },
    richTextContentField(),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] },
};

export const timeline: CollectionConfig = {
  slug: 'timeline',
  labels: {
    singular: '时间线',
    plural: '时间线',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields({ dateRequired: true }),
    { name: 'kind', type: 'select', label: '时间线类型', defaultValue: 'milestone', options: timelineKindOptions },
    richTextContentField(),
  ],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'kind', 'date'] },
};
