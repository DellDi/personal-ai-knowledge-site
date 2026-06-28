import config from '@payload-config';
import '@payloadcms/next/css';
import { RootLayout } from '@payloadcms/next/layouts';
import { importMap } from '@payloadcms/next/importMap';
import './styles.scss';
import { serverFunction } from './serverFunctions';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction as never}
    >
      {children}
    </RootLayout>
  );
}
