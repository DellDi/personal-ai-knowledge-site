import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, redirect }) => {
  const { collection, id } = params;
  if (!collection || !id) {
    return new Response('参数缺失', { status: 400 });
  }
  const target = new URL('/preview/', 'http://placeholder');
  target.searchParams.set('collection', collection);
  target.searchParams.set('id', id);
  return redirect(target.pathname + target.search, 302);
};
