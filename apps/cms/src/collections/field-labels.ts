import type { Block, Field } from 'payload';
import {
  CONTENT_STATUSES,
  KNOWLEDGE_AREAS,
  KNOWLEDGE_LEVELS,
  LANGS,
  RESOURCE_TYPES,
  TIMELINE_KINDS,
  type ContentStatus,
  type KnowledgeArea,
  type KnowledgeLevel,
  type Lang,
  type ResourceType,
  type TimelineKind,
} from '@personal-ai-knowledge-site/content-contract';

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type MediaUploadFieldArgs = {
  name: string;
  label: string;
  required?: boolean;
  mimeType?: 'image' | 'audio' | 'video' | 'application/pdf';
  description?: string;
};

const toOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption<T>[] => values.map((value) => ({ label: labels[value], value }));

export const langOptions = toOptions<Lang>(LANGS, {
  'zh-CN': '中文（简体）',
  en: '英文',
});

export const statusOptions = toOptions<ContentStatus>(CONTENT_STATUSES, {
  draft: '草稿',
  published: '已发布',
  archived: '已下架',
});

export const knowledgeAreaOptions = toOptions<KnowledgeArea>(KNOWLEDGE_AREAS, {
  'ai-agent': 'AI Agent',
  architecture: '架构设计',
  'data-engineering': '数据工程',
  frontend: '前端工程',
  product: '产品方法',
  operations: '运营增长',
  management: '管理协作',
  tools: '工具效率',
});

export const knowledgeLevelOptions = toOptions<KnowledgeLevel>(KNOWLEDGE_LEVELS, {
  basic: '基础',
  intermediate: '进阶',
  advanced: '高级',
});

export const resourceTypeOptions = toOptions<ResourceType>(RESOURCE_TYPES, {
  tool: '工具',
  book: '书籍',
  article: '文章',
  video: '视频',
  repo: '代码仓库',
  course: '课程',
});

export const timelineKindOptions = toOptions<TimelineKind>(TIMELINE_KINDS, {
  milestone: '里程碑',
  release: '发布记录',
  learning: '学习记录',
});

export const calloutVariantOptions = [
  { label: '信息', value: 'info' },
  { label: '提示', value: 'tip' },
  { label: '警告', value: 'warning' },
  { label: '风险', value: 'danger' },
];

export const embedRatioOptions = [
  { label: '16:9 横屏', value: '16-9' },
  { label: '4:3 标准', value: '4-3' },
  { label: '1:1 方形', value: '1-1' },
];

export function mediaUploadField({
  name,
  label,
  required = false,
  mimeType,
  description,
}: MediaUploadFieldArgs): Field {
  return {
    name,
    type: 'upload',
    label,
    relationTo: 'media',
    required,
    ...(mimeType
      ? {
          filterOptions: {
            mimeType: { contains: mimeType },
          },
        }
      : {}),
    admin: description ? { description } : undefined,
  };
}

export const commonContentFields = ({
  dateRequired = false,
}: { dateRequired?: boolean } = {}): Field[] => [
  {
    name: 'title',
    type: 'text',
    label: '标题',
    required: true,
    admin: {
      placeholder: '输入一个清晰、有辨识度的中文标题',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    label: '摘要',
    required: true,
    admin: {
      description: '用于列表卡片、SEO 摘要和搜索结果，建议控制在 80 到 160 字。',
      placeholder: '用一小段话说明这条内容的价值和阅读对象',
    },
  },
  {
    name: 'lang',
    type: 'select',
    label: '语言',
    required: true,
    defaultValue: 'zh-CN',
    options: langOptions,
    admin: {
      description: '用于前台路由和内容过滤。当前主站优先维护中文内容。',
    },
  },
  {
    name: 'translationKey',
    type: 'text',
    label: '翻译关联键',
    required: true,
    admin: {
      description: '同一内容的不同语言版本使用相同 key；只写中文时也需要填写，方便未来扩展。',
      placeholder: '例如 profile-ai-fullstack',
    },
  },
  {
    name: 'slug',
    type: 'text',
    label: '访问路径',
    required: true,
    unique: true,
    admin: {
      description: '用于生成页面 URL，建议使用小写英文、数字和短横线。',
      placeholder: '例如 ai-fullstack-profile',
    },
  },
  {
    name: 'status',
    type: 'select',
    label: '发布状态',
    required: true,
    defaultValue: 'draft',
    options: statusOptions,
    admin: {
      description: '只有“已发布”的内容会进入公开页面、RSS 和搜索入口。',
    },
  },
  {
    name: 'featured',
    type: 'checkbox',
    label: '重点展示',
    defaultValue: false,
    admin: {
      description: '勾选后可用于首页、专题或重点内容区域的优先展示。',
    },
  },
  {
    name: 'date',
    type: 'date',
    label: '发布日期',
    required: dateRequired,
    admin: {
      description: dateRequired ? '公开发布时间，必填。' : '可选；不填写时不会作为强时间线内容处理。',
    },
  },
  {
    name: 'updated',
    type: 'date',
    label: '最后更新',
    admin: {
      description: '内容有明显修订时再填写，用于前台展示更新时间。',
    },
  },
  {
    name: 'tags',
    type: 'text',
    label: '标签',
    hasMany: true,
    defaultValue: [],
    admin: {
      description: '用于筛选、搜索和相关内容推荐。技术名词可以保留英文原名。',
    },
  },
];

export const richTextContentField = (): Field => ({
  name: 'content',
  type: 'richText',
  label: '正文',
  admin: {
    description: '适合录入连续正文；复杂展示结构建议使用下方“内容模块”。',
  },
});

export const contentBlocksField = (blocks: Block[]): Field => ({
  name: 'contentBlocks',
  type: 'blocks',
  label: '内容模块',
  labels: {
    singular: '内容模块',
    plural: '内容模块',
  },
  blocks,
  admin: {
    description: '用于构建提示、代码、图片、步骤、统计、对比表等更精致的展示区块。',
  },
});
