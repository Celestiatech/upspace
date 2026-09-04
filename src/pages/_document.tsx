import { Head, Html, Main, NextScript } from 'next/document';

// Explicit legacy document keeps Next's pages compatibility layer available
// alongside the App Router during production page-data collection.
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
