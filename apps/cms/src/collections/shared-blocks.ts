import type { Block } from 'payload';
import { calloutVariantOptions, embedRatioOptions, mediaUploadField } from './field-labels';

export const calloutBlock: Block = {
  slug: 'calloutBlock',
  labels: {
    singular: '提示块',
    plural: '提示块',
  },
  fields: [
    { name: 'variant', type: 'select', label: '提示类型', required: true, defaultValue: 'info', options: calloutVariantOptions },
    { name: 'title', type: 'text', label: '标题' },
    { name: 'content', type: 'textarea', label: '内容', required: true },
  ],
};

export const codeBlockField: Block = {
  slug: 'codeBlock',
  labels: {
    singular: '代码块',
    plural: '代码块',
  },
  fields: [
    { name: 'language', type: 'text', label: '语言', admin: { placeholder: '例如 ts、tsx、bash' } },
    { name: 'filename', type: 'text', label: '文件名' },
    { name: 'code', type: 'textarea', label: '代码', required: true },
  ],
};

export const quoteBlock: Block = {
  slug: 'quoteBlock',
  labels: {
    singular: '引用块',
    plural: '引用块',
  },
  fields: [
    { name: 'content', type: 'textarea', label: '引用内容', required: true },
    { name: 'author', type: 'text', label: '作者' },
    { name: 'source', type: 'text', label: '来源' },
    { name: 'url', type: 'text', label: '来源链接' },
  ],
};

export const audioBlock: Block = {
  slug: 'audioBlock',
  labels: {
    singular: '音频块',
    plural: '音频块',
  },
  fields: [
    mediaUploadField({
      name: 'file',
      label: '音频文件',
      required: true,
      mimeType: 'audio',
      description: '上传后自动由 media 集合生成访问地址。',
    }),
    { name: 'title', type: 'text', label: '标题' },
    { name: 'duration', type: 'text', label: '时长', admin: { placeholder: '例如 12:30' } },
    mediaUploadField({
      name: 'downloadFile',
      label: '下载附件',
      description: '可选；不填时播放器会直接使用音频文件地址。',
    }),
  ],
};

export const imageBlock: Block = {
  slug: 'imageBlock',
  labels: {
    singular: '图片块',
    plural: '图片块',
  },
  fields: [
    mediaUploadField({
      name: 'image',
      label: '图片文件',
      required: true,
      mimeType: 'image',
      description: '上传后自动由 media 集合生成访问地址。',
    }),
    { name: 'alt', type: 'text', label: '替代文本', required: true },
    { name: 'caption', type: 'text', label: '图片说明' },
    { name: 'source', type: 'text', label: '图片来源' },
  ],
};

export const embedBlock: Block = {
  slug: 'embedBlock',
  labels: {
    singular: '嵌入块',
    plural: '嵌入块',
  },
  fields: [
    { name: 'src', type: 'text', label: '嵌入地址', required: true },
    { name: 'title', type: 'text', label: '标题' },
    { name: 'ratio', type: 'select', label: '宽高比例', options: embedRatioOptions, defaultValue: '16-9' },
  ],
};

export const stepsBlock: Block = {
  slug: 'stepsBlock',
  labels: {
    singular: '步骤块',
    plural: '步骤块',
  },
  fields: [
    { name: 'title', type: 'text', label: '标题' },
    {
      name: 'items',
      type: 'array',
      label: '步骤列表',
      required: true,
      labels: {
        singular: '步骤',
        plural: '步骤',
      },
      fields: [{ name: 'text', type: 'textarea', label: '步骤内容', required: true }],
    },
  ],
};

export const statGridBlock: Block = {
  slug: 'statGridBlock',
  labels: {
    singular: '数据卡片组',
    plural: '数据卡片组',
  },
  fields: [
    { name: 'columns', type: 'number', label: '列数', defaultValue: 3 },
    {
      name: 'items',
      type: 'array',
      label: '数据项',
      required: true,
      labels: {
        singular: '数据项',
        plural: '数据项',
      },
      fields: [
        { name: 'value', type: 'text', label: '数值', required: true },
        { name: 'label', type: 'text', label: '说明', required: true },
      ],
    },
  ],
};

export const compareTableBlock: Block = {
  slug: 'compareTableBlock',
  labels: {
    singular: '对比表',
    plural: '对比表',
  },
  fields: [
    { name: 'caption', type: 'text', label: '表格说明' },
    {
      name: 'columns',
      type: 'array',
      label: '表头',
      required: true,
      labels: {
        singular: '列',
        plural: '列',
      },
      fields: [
        { name: 'key', type: 'text', label: '字段键', required: true },
        { name: 'label', type: 'text', label: '显示名', required: true },
        { name: 'highlight', type: 'checkbox', label: '高亮列', defaultValue: false },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      label: '表格行',
      required: true,
      labels: {
        singular: '行',
        plural: '行',
      },
      fields: [{ name: 'data', type: 'json', label: '行数据', required: true }],
    },
  ],
};

export const sharedBlocks: Block[] = [
  calloutBlock,
  codeBlockField,
  audioBlock,
  imageBlock,
  quoteBlock,
  embedBlock,
  stepsBlock,
  statGridBlock,
  compareTableBlock,
];
