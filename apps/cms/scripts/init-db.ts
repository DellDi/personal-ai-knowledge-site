import { getPayload } from 'payload';

import config from '../src/payload.config';

const payload = await getPayload({ config });

const adapter = payload.db as typeof payload.db & {
  drizzle?: unknown;
  execute?: (args: { drizzle?: unknown; raw?: string }) => Promise<{ rows: unknown[] }>;
  extensions?: Record<string, boolean>;
  requireDrizzleKit?: () => {
    pushSchema: (
      schema: Record<string, unknown>,
      drizzle: unknown,
      filterSchema?: string[],
      tablesFilter?: string[],
      extensionsFilter?: string[],
    ) => Promise<{
      apply: () => Promise<void>;
      hasDataLoss: boolean;
      warnings: string[];
    }>;
  };
  schema?: Record<string, unknown>;
  schemaName?: string;
  tables?: {
    payload_migrations?: unknown;
  };
  tablesFilter?: string[];
};

if (adapter?.requireDrizzleKit && adapter.schema && adapter.drizzle) {
  const { pushSchema } = adapter.requireDrizzleKit();
  const { apply, hasDataLoss, warnings } = await pushSchema(
    adapter.schema,
    adapter.drizzle,
    adapter.schemaName ? [adapter.schemaName] : undefined,
    adapter.tablesFilter,
    adapter.extensions?.postgis ? ['postgis'] : undefined,
  );

  if (warnings.length > 0) {
    const message = [
      'Payload schema push detected warnings:',
      ...warnings,
      hasDataLoss ? 'Possible data loss detected.' : undefined,
      'Set PAYLOAD_ACCEPT_SCHEMA_PUSH_WARNINGS=true to apply anyway.',
    ]
      .filter(Boolean)
      .join('\n');

    if (process.env.PAYLOAD_ACCEPT_SCHEMA_PUSH_WARNINGS !== 'true') {
      throw new Error(message);
    }

    payload.logger.warn(message);
  }

  await apply();

  if (adapter.execute && adapter.tables?.payload_migrations) {
    const migrationsTable = adapter.schemaName ? `"${adapter.schemaName}"."payload_migrations"` : '"payload_migrations"';
    const result = await adapter.execute({
      drizzle: adapter.drizzle,
      raw: `SELECT * FROM ${migrationsTable} WHERE batch = '-1'`,
    });

    if (result.rows.length === 0) {
      await (adapter.drizzle as { insert: (table: unknown) => { values: (data: unknown) => Promise<void> } })
        .insert(adapter.tables.payload_migrations)
        .values({
          name: 'dev',
          batch: -1,
        });
    } else {
      await adapter.execute({
        drizzle: adapter.drizzle,
        raw: `UPDATE ${migrationsTable} SET updated_at = CURRENT_TIMESTAMP WHERE batch = '-1'`,
      });
    }
  }
}

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
