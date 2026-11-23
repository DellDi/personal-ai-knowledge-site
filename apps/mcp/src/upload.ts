import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Config } from './config.js';

export const UPLOAD_TTL_SECONDS = 900;

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'text/csv',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'video/mp4',
] as const;

export function createS3Client(config: Config) {
  return new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    forcePathStyle: config.s3.forcePathStyle,
    credentials: { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

export function sanitizeFilename(filename: string) {
  const name = filename.normalize('NFC').replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/^_+|_+$/g, '').slice(-120);
  return name || 'file';
}

export function buildObjectKey(filename: string, now = new Date()) {
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `mcp/${now.getUTCFullYear()}/${month}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

export function buildPublicUrl(publicBaseUrl: string, key: string) {
  return `${publicBaseUrl.replace(/\/+$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function createUploadTarget(
  s3: S3Client,
  config: Config,
  input: { filename: string; mimeType: string; size: number },
) {
  const key = buildObjectKey(input.filename);
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: config.s3.bucket, Key: key, ContentType: input.mimeType, ContentLength: input.size }),
    { expiresIn: UPLOAD_TTL_SECONDS, signableHeaders: new Set(['content-type', 'content-length']) },
  );
  return {
    uploadUrl,
    requiredHeaders: { 'Content-Type': input.mimeType, 'Content-Length': String(input.size) },
    publicUrl: buildPublicUrl(config.publicBaseUrl, key),
    key,
    expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
  };
}
