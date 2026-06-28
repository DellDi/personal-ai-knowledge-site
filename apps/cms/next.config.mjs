import { withPayload } from '@payloadcms/next/withPayload';

const config = withPayload({
  reactStrictMode: true,
  transpilePackages: ['payload', '@payloadcms/*'],
});

export default config;
