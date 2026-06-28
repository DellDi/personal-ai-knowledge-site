import type { CollectionConfig } from 'payload';

export const media: CollectionConfig = {
  slug: 'media',
  upload: {
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'feature', width: 1600, height: 900, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'audio/*', 'application/pdf'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'alt', type: 'text', label: '替代文本' },
    { name: 'caption', type: 'text' },
    { name: 'source', type: 'text' },
  ],
  admin: {
    useAsTitle: 'filename',
  },
};
