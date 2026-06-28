import { getPayload } from 'payload';

import config from '../src/payload.config';

const payload = await getPayload({ config });

payload.logger.info('Payload database schema initialized.');

const localAdminEmail = '875372314@qq.com';
const localAdminPassword = '123456';

const existingAdmin = await payload.find({
  collection: 'users',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  where: {
    email: {
      equals: localAdminEmail,
    },
  },
});

if (existingAdmin.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: {
      email: localAdminEmail,
      name: '本地管理员',
      password: localAdminPassword,
    },
    overrideAccess: true,
  });

  payload.logger.info(`Local CMS admin user created: ${localAdminEmail}`);
}

await payload.destroy();

process.exit(0);
