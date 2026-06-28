import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const config: NextConfig = withPayload({
  reactStrictMode: true,
  transpilePackages: ['payload', '@payloadcms/*'],
});

export default config;
