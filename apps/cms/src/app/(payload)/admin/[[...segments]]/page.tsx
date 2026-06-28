import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import importMap from '@payloadcms/next/importMap';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '内容管理后台',
  robots: { index: false, follow: false },
};

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = ({ params, searchParams }: Args) => generatePageMetadata({ config, params, searchParams });

export default async function Page({ params, searchParams }: Args) {
  return RootPage({ config, importMap, params, searchParams });
}
