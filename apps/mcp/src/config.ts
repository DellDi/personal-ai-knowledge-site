export type Config = {
  host: string;
  port: number;
  bearerToken: string;
  allowedHosts: string[];
  publicBaseUrl: string;
  maxUploadBytes: number;
  s3: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
  };
};

function required(env: NodeJS.ProcessEnv, name: string) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    host: env.HOST ?? '127.0.0.1',
    port: Number(env.PORT ?? 3300),
    bearerToken: required(env, 'MCP_BEARER_TOKEN'),
    allowedHosts: (env.MCP_ALLOWED_HOSTS ?? 'localhost,127.0.0.1').split(',').map((host) => host.trim()).filter(Boolean),
    publicBaseUrl: required(env, 'MCP_PUBLIC_BASE_URL'),
    maxUploadBytes: Number(env.MCP_MAX_UPLOAD_BYTES ?? 100 * 1024 * 1024),
    s3: {
      endpoint: required(env, 'S3_ENDPOINT'),
      region: required(env, 'S3_REGION'),
      bucket: required(env, 'S3_BUCKET'),
      accessKeyId: required(env, 'MCP_S3_ACCESS_KEY_ID'),
      secretAccessKey: required(env, 'MCP_S3_SECRET_ACCESS_KEY'),
      forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
    },
  };
}
