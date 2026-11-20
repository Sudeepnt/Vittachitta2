export const metadata = {
  title: "VitthaChittha | The founder's office for finance",
  description:
    'VitthaChittha builds the financial systems inside your company, runs them, and speaks for you to everyone your money touches, from the first idea to the exit.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1C0B26',
};

const ASSET_VERSION = '20261120w';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta property="og:title" content="VitthaChittha" />
        <meta property="og:description" content="The founder's office for finance, based in Bengaluru." />
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
