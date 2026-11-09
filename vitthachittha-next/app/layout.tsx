import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Mono, Newsreader, Noto_Serif_Devanagari } from 'next/font/google';
import { chrome, runtimeSrc, siteDescription } from '@/lib/content';
import Navigator from '@/components/Navigator';
import './globals.css';

// Self-hosted by next/font: no request to Google at runtime. Only the headline and
// label fonts are preloaded; the larger text face loads as soon as the CSS asks for it.
const display = Bricolage_Grotesque({ subsets: ['latin'], axes: ['opsz'], variable: '--font-display', display: 'swap' });
const body = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], variable: '--font-text', display: 'swap', preload: false });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });
// Only the two words on the Story page use this, so it isn't preloaded.
const deva = Noto_Serif_Devanagari({ subsets: ['devanagari'], weight: '500', variable: '--font-deva', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: { default: 'VitthaChittha', template: '%s · VitthaChittha' },
  description: siteDescription,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// The browser runtime mutates these containers, so their contents stay outside React.
const raw = (name: Parameters<typeof chrome>[0]) => ({ __html: chrome(name) });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${deva.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" dangerouslySetInnerHTML={raw('sprite')} />
        <header className="top" id="top" suppressHydrationWarning dangerouslySetInnerHTML={raw('header')} />
        <div className="track" aria-hidden="true" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '<i id="track"></i>' }} />
        <nav className="switch" id="switch" aria-label="Sections on this page" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '<ol></ol>' }} />
        <div className="switch-m" id="switchM" role="group" aria-label="Section switcher" suppressHydrationWarning dangerouslySetInnerHTML={raw('switchM')} />
        <div className="curtain" id="curtain" aria-hidden="true" suppressHydrationWarning dangerouslySetInnerHTML={raw('curtain')} />
        <div className="overlay" id="menu" hidden role="dialog" aria-modal="true" aria-label="Menu" suppressHydrationWarning dangerouslySetInnerHTML={raw('menu')} />
        {children}
        <footer className="foot" suppressHydrationWarning dangerouslySetInnerHTML={raw('footer')} />
        {/* The static export gets the script inlined at the end of <body> by scripts/inline-assets.mjs. */}
        {process.env.STATIC_EXPORT ? null : <script src={runtimeSrc()} />}
        <Navigator />
      </body>
    </html>
  );
}
