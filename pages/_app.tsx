import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { initializeIcons } from '@fluentui/react';

// FIXME: is this the right place to place this?
initializeIcons();

export default function ExplorerApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  );
}
