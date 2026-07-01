import { spawn } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultEnvFile = join(currentDir, 'env', 'production.env');

await loadEnvFile(process.env.WEBHOOK_ENV_FILE || defaultEnvFile);

const projectRoot = resolve(process.env.WEBHOOK_PROJECT_ROOT || join(currentDir, '..'));
const composeFile = process.env.WEBHOOK_COMPOSE_FILE || 'infra/docker-compose.prod.yml';
const composeFilePath = isAbsolute(composeFile) ? composeFile : join(projectRoot, composeFile);
const dockerBin = process.env.WEBHOOK_DOCKER_BIN || 'docker';
const host = process.env.WEBHOOK_HOST || '127.0.0.1';
const port = Number.parseInt(process.env.WEBHOOK_PORT || '4000', 10);
const commandTimeoutMs = Number.parseInt(process.env.WEBHOOK_BUILD_TIMEOUT_SECONDS || '1200', 10) * 1000;
const maxBodyBytes = Number.parseInt(process.env.WEBHOOK_MAX_BODY_BYTES || '65536', 10);

const state = {
  running: false,
  pending: false,
  pendingCount: 0,
  lastStartedAt: null,
  lastFinishedAt: null,
  lastSuccess: null,
  lastError: null,
  lastEvent: null,
};

const server = createServer(async (request, response) => {
  try {
    await handleRequest(request, response);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    log('error', 'request failed', { error: getErrorMessage(error), statusCode });
    sendJson(response, statusCode, { error: getPublicError(statusCode, error) });
  }
});

server.listen(port, host, () => {
  log('info', 'rebuild webhook listening', {
    address: `http://${host}:${port}`,
    projectRoot,
    composeFile: composeFilePath,
  });
});

async function handleRequest(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${host}:${port}`}`);

  if (request.method === 'GET' && url.pathname === '/healthz') {
    sendJson(response, 200, {
      ok: true,
      projectRoot,
      composeFile: composeFilePath,
      composeFileExists: existsSync(composeFilePath),
      tokenConfigured: Boolean(getRequiredToken(false)),
      ...state,
    });
    return;
  }

  const isRebuildRoute =
    request.method === 'POST' &&
    (url.pathname === '/hooks/rebuild' || url.pathname === '/hooks/rebuild-personal-site');

  if (isRebuildRoute) {
    verifyToken(request.headers);
    const payload = await readJsonBody(request);
    triggerRebuild(payload);
    sendJson(response, state.running && state.pending ? 202 : 202, {
      accepted: true,
      queued: state.pending,
      running: state.running,
    });
    return;
  }

  sendJson(response, 404, { error: 'not found' });
}

function triggerRebuild(payload) {
  if (state.running) {
    state.pending = true;
    state.pendingCount += 1;
    return;
  }

  state.running = true;
  state.pending = false;

  setImmediate(() => {
    rebuildWorker(payload).catch((error) => {
      log('error', 'rebuild worker crashed', { error: getErrorMessage(error) });
      state.running = false;
      state.lastSuccess = false;
      state.lastError = getErrorMessage(error);
      state.lastFinishedAt = new Date().toISOString();
    });
  });
}

async function rebuildWorker(initialPayload) {
  let payload = initialPayload;

  while (true) {
    await runRebuildOnce(payload);

    if (!state.pending) {
      state.running = false;
      return;
    }

    state.pending = false;
    payload = { event: 'coalesced' };
  }
}

async function runRebuildOnce(payload) {
  state.lastStartedAt = new Date().toISOString();
  state.lastFinishedAt = null;
  state.lastSuccess = null;
  state.lastError = null;
  state.lastEvent = typeof payload?.event === 'string' ? payload.event : 'manual';

  try {
    await runCommand([
      dockerBin,
      'compose',
      '-f',
      composeFilePath,
      '--profile',
      'build',
      'run',
      '--rm',
      'web-build',
    ]);
    await runCommand([
      dockerBin,
      'compose',
      '-f',
      composeFilePath,
      'up',
      '-d',
      '--force-recreate',
      '--no-deps',
      'web',
    ]);

    state.lastSuccess = true;
    state.lastError = null;
  } catch (error) {
    state.lastSuccess = false;
    state.lastError = getErrorMessage(error);
    throw error;
  } finally {
    state.lastFinishedAt = new Date().toISOString();
  }
}

function runCommand(command) {
  return new Promise((resolveCommand, rejectCommand) => {
    const [bin, ...args] = command;
    const startedAt = Date.now();
    const outputTail = [];

    log('info', 'running rebuild command', { command: command.join(' ') });

    const child = spawn(bin, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let settled = false;
    let killTimer = null;
    const timeout = setTimeout(() => {
      if (settled) return;
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
    }, commandTimeoutMs);

    child.stdout.on('data', (chunk) => collectTail(outputTail, chunk));
    child.stderr.on('data', (chunk) => collectTail(outputTail, chunk));

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (killTimer) clearTimeout(killTimer);
      rejectCommand(error);
    });

    child.on('close', (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (killTimer) clearTimeout(killTimer);

      const elapsedSeconds = Number(((Date.now() - startedAt) / 1000).toFixed(2));
      const tail = outputTail.join('\n');

      if (code === 0) {
        log('info', 'rebuild command finished', { elapsedSeconds, tail });
        resolveCommand();
        return;
      }

      const suffix = signal ? `signal ${signal}` : `exit code ${code}`;
      rejectCommand(new Error(`Command failed with ${suffix}: ${command.join(' ')}\n${tail}`));
    });
  });
}

async function readJsonBody(request) {
  const chunks = [];
  let receivedBytes = 0;

  for await (const chunk of request) {
    receivedBytes += chunk.length;
    if (receivedBytes > maxBodyBytes) {
      const error = new Error('request body too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('invalid json body');
    error.statusCode = 400;
    throw error;
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function collectTail(lines, chunk) {
  const text = chunk.toString('utf8');
  for (const line of text.split(/\r?\n/)) {
    const value = line.trimEnd();
    if (!value) continue;
    lines.push(value);
    if (lines.length > 120) lines.shift();
  }
}

function verifyToken(headers) {
  const expected = getRequiredToken(true);
  const provided = extractToken(headers);

  if (!provided || !safeEqual(provided, expected)) {
    const error = new Error('invalid webhook token');
    error.statusCode = 401;
    throw error;
  }
}

function getRequiredToken(throwIfMissing) {
  const token = process.env.REBUILD_WEBHOOK_TOKEN || process.env.WEBHOOK_TOKEN || '';
  if (!token && throwIfMissing) {
    const error = new Error('REBUILD_WEBHOOK_TOKEN is not configured');
    error.statusCode = 503;
    throw error;
  }
  return token;
}

function extractToken(headers) {
  const authorization = headers.authorization;
  if (typeof authorization === 'string') {
    const [scheme, value] = authorization.split(/\s+/, 2);
    if (scheme?.toLowerCase() === 'bearer' && value) return value.trim();
  }

  const headerValue = headers['x-webhook-token'];
  if (typeof headerValue === 'string') return headerValue;
  if (Array.isArray(headerValue)) return headerValue[0] || '';
  return '';
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = await readFile(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = stripEnvQuotes(rawValue);
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function getPublicError(statusCode, error) {
  if (statusCode >= 500) return 'internal server error';
  return getErrorMessage(error);
}

function log(level, message, data = {}) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...data,
  };
  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log('info', 'shutting down rebuild webhook', { signal });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
