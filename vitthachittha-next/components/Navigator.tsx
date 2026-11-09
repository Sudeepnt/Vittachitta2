'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

declare global {
  interface Window {
    VC?: { page: () => boolean; closeMenu: () => void; cover: (go: () => void) => void };
  }
}

// Page markup is plain HTML, so its <a href="/…"> links are ordinary anchors.
// This turns same-site clicks into client-side navigations behind the curtain
// (only the new page's content is fetched) and prefetches a page on hover, focus
// or touch, or as soon as the menu opens, so it is ready when the curtain lifts.
export default function Navigator() {
  const router = useRouter();
  const pathname = usePathname();

  // Before paint: wire up the new page's panels, charts and canvases.
  useLayoutEffect(() => {
    if (window.VC && !window.VC.page()) {
      requestAnimationFrame(() => window.VC?.page());
    }
  }, [pathname]);

  useEffect(() => {
    const done = new Set<string>();
    const internal = (el: EventTarget | null): URL | null => {
      const a = (el as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
      const url = new URL(a.href, location.href);
      return url.origin === location.origin ? url : null;
    };
    const prefetch = (url: URL | null) => {
      if (!url || url.pathname === location.pathname || done.has(url.pathname)) return;
      done.add(url.pathname);
      router.prefetch(url.pathname);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('#menuBtn')) {
        document.querySelectorAll('#menu a[href^="/"]').forEach((a) => prefetch(internal(a)));
        return;
      }
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = internal(e.target);
      if (!url) return;
      e.preventDefault();
      if (url.pathname === location.pathname) return;
      prefetch(url);
      const go = () => router.push(url.pathname);
      if (window.VC) window.VC.cover(go);
      else go();
    };
    const onIntent = (e: Event) => prefetch(internal(e.target));

    document.addEventListener('click', onClick);
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('touchstart', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, [router]);

  return null;
}
