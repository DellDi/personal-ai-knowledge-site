import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

interface WebhookPayload {
  event: 'publish' | 'unpublish' | 'delete';
  collection: string;
  id: string;
  slug?: string;
  status?: string;
  timestamp: string;
}

function getWebhookURL(): string | undefined {
  return process.env.REBUILD_WEBHOOK_URL ?? undefined;
}

async function notifyWebhook(payload: WebhookPayload): Promise<void> {
  const url = getWebhookURL();
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[webhook] 重建通知失败: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.warn(`[webhook] 重建通知异常: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeout);
  }
}

export const afterChangeHook: CollectionAfterChangeHook = async ({ doc, collection, operation }) => {
  const slug = collection.slug;
  const status = doc?.status;
  const id = String(doc?.id ?? '');

  if (operation === 'create' || operation === 'update') {
    if (status === 'published') {
      await notifyWebhook({
        event: 'publish',
        collection: slug,
        id,
        slug: doc?.slug,
        status,
        timestamp: new Date().toISOString(),
      });
    } else if (status === 'archived' || status === 'draft') {
      await notifyWebhook({
        event: 'unpublish',
        collection: slug,
        id,
        slug: doc?.slug,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return doc;
};

export const afterDeleteHook: CollectionAfterDeleteHook = async ({ doc, collection }) => {
  const slug = collection.slug;
  const id = String(doc?.id ?? '');

  await notifyWebhook({
    event: 'delete',
    collection: slug,
    id,
    slug: doc?.slug,
    timestamp: new Date().toISOString(),
  });

  return doc;
};
