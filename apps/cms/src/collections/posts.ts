import type { CollectionConfig } from 'payload';
import { commonContentFields, contentBlocksField, mediaUploadField, richTextContentField } from './field-labels';
import { sharedBlocks } from './shared-blocks';

export const posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: '文章',
    plural: '文章',
  },
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
  },
  fields: [
    ...commonContentFields({ dateRequired: true }),
    { name: 'category', type: 'text', label: '分类', required: true },
    { name: 'series', type: 'text', label: '系列' },
    mediaUploadField({ name: 'cover', label: '封面', mimeType: 'image' }),
    richTextContentField(),
    contentBlocksField(sharedBlocks),
    {
      name: 'author',
      type: 'relationship',
      label: '作者',
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
