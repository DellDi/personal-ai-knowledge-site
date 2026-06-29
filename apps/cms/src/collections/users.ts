import type { CollectionConfig } from 'payload';

export const users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '用户',
    plural: '用户',
  },
  auth: true,
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', label: '姓名' },
  ],
  admin: {
    useAsTitle: 'email',
  },
};
