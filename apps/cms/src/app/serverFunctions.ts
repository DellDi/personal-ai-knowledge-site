'use server';

import { handleServerFunctions } from '@payloadcms/next/layouts';
import { importMap } from '@payloadcms/next/importMap';
import config from '@payload-config';

export async function serverFunction(args: Parameters<typeof handleServerFunctions>[0]) {
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
}
