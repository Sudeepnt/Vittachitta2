import fs from 'node:fs';
import path from 'node:path';
import defaults from '../../content/site-content.json';
import { sbRest, hasAnon } from './supabase';

export const DEFAULT_CONTENT = defaults;

// objects merge deeply, arrays and strings replace
export function mergeContent(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over === undefined ? base : over;
  if (base && typeof base === 'object' && over && typeof over === 'object') {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = mergeContent(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

let bodyHtml = null;
export function getBodyHtml() {
  if (bodyHtml == null) bodyHtml = fs.readFileSync(path.join(process.cwd(), 'content', 'body.html'), 'utf8');
  return bodyHtml;
}

// What the public site reads: the saved edits merged over the bundled default. Cached for 60 s and
// refreshed on save; if the database is unreachable or not set up, the bundled default is used.
export async function getRuntimeContent() {
  if (!hasAnon()) return DEFAULT_CONTENT;
  try {
    const rows = await sbRest('cms_settings?id=eq.1&select=data', { role: 'anon', revalidate: 60, tags: ['cms'] });
    const data = rows && rows[0] && rows[0].data;
    return data && typeof data === 'object' ? mergeContent(DEFAULT_CONTENT, data) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

// the shape every saved or imported document must have
export function isValidContent(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return false;
  if (!c.texts || typeof c.texts !== 'object' || Array.isArray(c.texts)) return false;
  if (!Object.values(c.texts).every((v) => typeof v === 'string' && v.length <= 20000)) return false;
  if (c.meta !== undefined && (typeof c.meta !== 'object' || Array.isArray(c.meta) || !Object.values(c.meta).every((v) => typeof v === 'string'))) return false;
  return Object.keys(c.texts).length <= 5000;
}
