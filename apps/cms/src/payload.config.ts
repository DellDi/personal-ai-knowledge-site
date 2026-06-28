import { buildConfig, CollectionConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage } from '@payloadcms/storage-s3';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { posts as postsRaw } from './collections/posts';
import { media } from './collections/media';
import { users } from './collections/users';
import {
  podcast as podcastRaw,
  knowledge as knowledgeRaw,
  topics as topicsRaw,
  projects as projectsRaw,
  resources as resourcesRaw,
  glossary as glossaryRaw,
  timeline as timelineRaw,
} from './collections/content-collections';
import { withPublishHooks } from './hooks';

const posts = withPublishHooks(postsRaw);
const podcast = withPublishHooks(podcastRaw);
const knowledge = withPublishHooks(knowledgeRaw);
const topics = withPublishHooks(topicsRaw);
const projects = withPublishHooks(projectsRaw);
const resources = withPublishHooks(resourcesRaw);
const glossary = withPublishHooks(glossaryRaw);
const timeline = withPublishHooks(timelineRaw);

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const enableAutoLogin = process.env.PAYLOAD_ENABLE_AUTOLOGIN === 'true';
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
const corsOrigins = process.env.PAYLOAD_CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['*'];
const csrfOrigins =
  process.env.PAYLOAD_CSRF_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [
    'http://localhost:4321',
    'http://localhost:3000',
  ];

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      importMapFile: path.resolve(dirname, '../importMap.ts'),
    },
    ...(enableAutoLogin
      ? {
          autoLogin: {
            email: 'owner@example.com',
            password: 'local-dev-only-password',
          },
        }
      : {}),
  },
  collections: [users, posts, podcast, knowledge, topics, projects, resources, glossary, timeline, media],
  editor: slateEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? 'payload_secret_change_me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ??
        'postgres://content:content_password@localhost:5432/content_platform',
    },
    push: true,
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET ?? 'content-platform',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minio_admin',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minio_admin_password',
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      },
    }),
  ],
  serverURL,
  cors: corsOrigins,
  csrf: csrfOrigins,
});

export type { CollectionConfig };
