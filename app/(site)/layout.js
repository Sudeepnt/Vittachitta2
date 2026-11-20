import { getRuntimeContent } from '../../lib/cms/content';

// Page title and description come from the CMS (Menu & loader tab); the bundled defaults are the original text.
export async function generateMetadata() {
  const { meta } = await getRuntimeContent();
  return { title: meta.title, description: meta.description };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1C0B26',
};

const ASSET_VERSION = '20261121u';

export default async function RootLayout({ children }) {
  const { meta } = await getRuntimeContent();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="og:title" content={meta.ogTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=DM+Mono:wght@300;400&family=Fraunces:opsz,wght@9..144,300..500&family=Noto+Serif+Devanagari:wght@400&display=swap"
        />
        <link rel="stylesheet" href={`/assets/css/site.css?v=${ASSET_VERSION}`} />
        <link rel="stylesheet" href={`/assets/css/motion.css?v=${ASSET_VERSION}`} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
