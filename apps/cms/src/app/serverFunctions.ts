'use server';

import { handleServerFunctions } from '@payloadcms/next/layouts';

export async function serverFunction(args: Parameters<typeof handleServerFunctions>[0]) {
  return handleServerFunctions(args);
}
