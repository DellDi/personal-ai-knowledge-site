import type { Block } from 'payload';

export const calloutBlock: Block = {
  slug: 'calloutBlock',
  fields: [
    { name: 'variant', type: 'select', required: true, defaultValue: 'info', options: ['info', 'tip', 'warning', 'danger'] },
    { name: 'title', type: 'text' },
    { name: 'content', type: 'textarea', required: true },
  ],
};

export const codeBlockField: Block = {
  slug: 'codeBlock',
  fields: [
    { name: 'language', type: 'text' },
    { name: 'filename', type: 'text' },
    { name: 'code', type: 'textarea', required: true },
  ],
};

export const quoteBlock: Block = {
  slug: 'quoteBlock',
  fields: [
    { name: 'content', type: 'textarea', required: true },
    { name: 'author', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'url', type: 'text' },
  ],
};

export const audioBlock: Block = {
  slug: 'audioBlock',
  fields: [
    { name: 'src', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'duration', type: 'text' },
    { name: 'download', type: 'text' },
  ],
};

export const imageBlock: Block = {
  slug: 'imageBlock',
  fields: [
    { name: 'src', type: 'text', required: true },
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
    { name: 'source', type: 'text' },
  ],
};

export const embedBlock: Block = {
  slug: 'embedBlock',
  fields: [
    { name: 'src', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'ratio', type: 'select', options: ['16-9', '4-3', '1-1'], defaultValue: '16-9' },
  ],
};

export const stepsBlock: Block = {
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

export const statGridBlock: Block = {
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

export const compareTableBlock: Block = {
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
