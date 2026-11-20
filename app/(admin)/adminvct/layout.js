import './admin.css';

// The admin has its own root layout: it shares nothing with the public site (no header, footer or site CSS).
export const metadata = {
  title: 'VitthaChittha admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1C0B26' };

// Sets the saved theme before the page paints, so there is no flash.
const THEME_JS = `try{var t=localStorage.getItem('vct_admin_theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function AdminLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,300..500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_JS }} />
      </head>
      <body className="adm">{children}</body>
    </html>
  );
}
