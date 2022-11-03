import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { initializeIcons } from '@fluentui/react';
import Layout from 'components/Layout';

// FIXME: is this the right place to place this?
initializeIcons();

export default function ExplorerApp({ Component, pageProps }: AppProps) {
  return (
    <Layout {...pageProps}>
      <Component {...pageProps} />
    </Layout>
  );
}
