import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { createApp } from './app.js';
import type { Config } from './config.js';

const config: Config = {
  host: '127.0.0.1',
  port: 0,
  bearerToken: 'test-token',
  allowedHosts: ['localhost', '127.0.0.1'],
  publicBaseUrl: 'https://bucket.example.com',
  maxUploadBytes: 1024 * 1024,
  s3: {
    endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
    region: 'oss-cn-hangzhou',
    bucket: 'test-bucket',
    accessKeyId: 'ak',
    secretAccessKey: 'sk',
    forcePathStyle: false,
  },
};

let server: Server;
let base: string;

before(async () => {
  const app = createApp(config);
  server = await new Promise<Server>((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => new Promise<void>((resolve) => server.close(() => resolve())));

function rpc(body: unknown, token: string | null = 'test-token') {
  return fetch(`${base}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
}

async function readRpc(res: Response) {
  const text = await res.text();
  const dataLine = text.split('\n').find((line) => line.startsWith('data:'));
  return JSON.parse(dataLine ? dataLine.slice('data:'.length) : text);
}

const callCreateUpload = (args: Record<string, unknown>) =>
  rpc({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'create_upload', arguments: args } });

describe('bearer auth', () => {
  it('没有 token 返回 401', async () => {
    assert.equal((await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, null)).status, 401);
  });

  it('错误 token 返回 401', async () => {
    assert.equal((await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, 'wrong')).status, 401);
  });

  it('健康检查不需要 token', async () => {
    const res = await fetch(`${base}/healthz`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'ok\n');
  });
});

describe('create_upload tool', () => {
  it('列出 create_upload 工具', async () => {
    const body = await readRpc(await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }));
    assert.ok(body.result.tools.some((tool: { name: string }) => tool.name === 'create_upload'));
  });

  it('返回预签名 PUT 地址与公开地址', async () => {
    const body = await readRpc(
      await callCreateUpload({ filename: '简历 2026.pdf', mimeType: 'application/pdf', size: 1024 }),
    );
    const target = JSON.parse(body.result.content[0].text);
    assert.match(target.key, /^mcp\/\d{4}\/\d{2}\/[0-9a-f-]{36}-简历_2026\.pdf$/);
    assert.equal(target.publicUrl, `https://bucket.example.com/${target.key.split('/').map(encodeURIComponent).join('/')}`);
    assert.deepEqual(target.requiredHeaders, { 'Content-Type': 'application/pdf', 'Content-Length': '1024' });
    assert.match(target.uploadUrl, /^https:\/\/test-bucket\.oss-cn-hangzhou\.aliyuncs\.com\/mcp\//);
    const signedHeaders = new URL(target.uploadUrl).searchParams.get('X-Amz-SignedHeaders')?.split(';');
    assert.deepEqual(signedHeaders?.sort(), ['content-length', 'content-type', 'host']);
  });

  it('拒绝不在白名单里的 MIME 类型', async () => {
    const body = await readRpc(
      await callCreateUpload({ filename: 'x.html', mimeType: 'text/html', size: 10 }),
    );
    assert.ok(body.error || body.result?.isError);
  });

  it('接受新增的文档、压缩包、图片音视频、字体与静态资源类型', async () => {
    for (const mimeType of ['application/msword', 'application/rtf', 'application/x-7z-compressed', 'image/heic', 'video/quicktime', 'audio/flac', 'font/woff2', 'text/css', 'text/javascript']) {
      const body = await readRpc(await callCreateUpload({ filename: 'x', mimeType, size: 10 }));
      assert.ok(body.result && !body.result.isError, mimeType);
    }
  });

  it('拒绝可在浏览器中直接执行脚本的类型', async () => {
    for (const mimeType of ['application/xhtml+xml', 'image/svg+xml']) {
      const body = await readRpc(await callCreateUpload({ filename: 'x', mimeType, size: 10 }));
      assert.ok(body.error || body.result?.isError, mimeType);
    }
  });

  it('拒绝超过上限的文件', async () => {
    const body = await readRpc(
      await callCreateUpload({ filename: 'x.pdf', mimeType: 'application/pdf', size: 2 * 1024 * 1024 }),
    );
    assert.ok(body.error || body.result?.isError);
  });
});
