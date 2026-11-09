import fs from 'node:fs';
import path from 'node:path';
import site from '@/content/site.json';

// All content is static HTML. It is read at build time only: every route is
// prerendered, so nothing here runs per request.

export type PageMeta = { id: string; title: string | null; description: string };
export type Chrome = 'sprite' | 'header' | 'switchM' | 'curtain' | 'menu' | 'footer' | 'cookie';

const dir = path.join(process.cwd(), 'content');

export const pages: PageMeta[] = site.pages;
export const siteDescription: string = site.siteDescription;

export function getPage(id: string) {
  const meta = pages.find((p) => p.id === id);
  if (!meta) return null;
  return { ...meta, html: fs.readFileSync(path.join(dir, 'pages', `${id}.html`), 'utf8') };
}

export function chrome(name: Chrome) {
  return fs.readFileSync(path.join(dir, 'chrome', `${name}.html`), 'utf8');
}

// Written by scripts/prepare-runtime.mjs, which runs before every dev and build.
export function runtimeSrc(): string {
  return JSON.parse(fs.readFileSync(path.join(dir, 'runtime.json'), 'utf8')).src;
}
