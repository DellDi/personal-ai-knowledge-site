export const BLOCK_TYPES = [
  'richText',
  'callout',
  'code',
  'audio',
  'image',
  'quote',
  'embed',
  'steps',
  'statGrid',
  'compareTable',
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface BaseBlock {
  id?: string;
  type: BlockType;
}

export interface RichTextBlock extends BaseBlock {
  type: 'richText';
  content: string;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'info' | 'tip' | 'warning' | 'danger';
  title?: string;
  content: string;
}

export interface CodeBlockField extends BaseBlock {
  type: 'code';
  language?: string;
  filename?: string;
  code: string;
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  src: string;
  title?: string;
  duration?: string;
  download?: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
  source?: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  author?: string;
  source?: string;
  url?: string;
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  src: string;
  title?: string;
  ratio?: '16-9' | '4-3' | '1-1';
}

export interface StepsBlock extends BaseBlock {
  type: 'steps';
  title?: string;
  items: string[];
}

export interface StatGridBlock extends BaseBlock {
  type: 'statGrid';
  columns?: 2 | 3 | 4;
  items: { value: string; label: string }[];
}

export interface CompareTableBlock extends BaseBlock {
  type: 'compareTable';
  caption?: string;
  columns: { key: string; label: string; highlight?: boolean }[];
  rows: Record<string, string>[];
}

export type Block =
  | RichTextBlock
  | CalloutBlock
  | CodeBlockField
  | AudioBlock
  | ImageBlock
  | QuoteBlock
  | EmbedBlock
  | StepsBlock
  | StatGridBlock
  | CompareTableBlock;

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === 'string' && (BLOCK_TYPES as readonly string[]).includes(value);
}
