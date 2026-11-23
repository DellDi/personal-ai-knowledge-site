import { createHash, timingSafeEqual } from 'node:crypto';
import { requireBearerAuth, createMcpExpressApp } from '@modelcontextprotocol/express';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer, OAuthError, OAuthErrorCode, type AuthInfo } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { Config } from './config.js';
import { ALLOWED_MIME_TYPES, createS3Client, createUploadTarget } from './upload.js';

const TOKEN_EXPIRES_AT = 4102444800;

const digest = (value: string) => createHash('sha256').update(value).digest();

function verifyBearerToken(token: string, expected: string): AuthInfo {
  if (!timingSafeEqual(digest(token), digest(expected))) {
    throw new OAuthError(OAuthErrorCode.InvalidToken, 'invalid token');
  }
  return { token, clientId: 'owner', scopes: [], expiresAt: TOKEN_EXPIRES_AT };
}

export function createApp(config: Config) {
  const s3 = createS3Client(config);
  const handler = createMcpHandler(() => {
    const server = new McpServer({ name: 'personal-attachments', version: '0.0.1' });
    server.registerTool(
      'create_upload',
      {
        description:
          '为一个附件申请上传地址。用返回的 uploadUrl 以 PUT 方式上传文件，请求头 Content-Type 必须与 requiredHeaders 一致；上传成功后把 publicUrl 返回给用户。',
        inputSchema: z.object({
          filename: z.string().min(1).max(200).describe('原始文件名，含扩展名'),
          mimeType: z.enum(ALLOWED_MIME_TYPES).describe('文件 MIME 类型'),
          size: z.number().int().positive().max(config.maxUploadBytes).describe('文件字节数'),
        }),
      },
      async ({ filename, mimeType, size }) => {
        const target = await createUploadTarget(s3, config, { filename, mimeType, size });
        return { content: [{ type: 'text', text: JSON.stringify(target, null, 2) }] };
      },
    );
    return server;
  });

  const app = createMcpExpressApp({ host: config.host, allowedHosts: config.allowedHosts });
  const auth = requireBearerAuth({
    verifier: { verifyAccessToken: async (token) => verifyBearerToken(token, config.bearerToken) },
  });
  const node = toNodeHandler(handler);

  app.get('/healthz', (_req, res) => {
    res.type('text/plain').send('ok\n');
  });
  app.all('/mcp', auth, (req, res) => void node(req, res, req.body));
  return app;
}
