import type { CollectionConfig } from 'payload';

export const users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req: { user } }: { req: { user?: unknown } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text' },
  ],
  admin: {
    useAsTitle: 'email',
  },
};
