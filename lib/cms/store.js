import { sbRest, hasService } from './supabase';
import { DEFAULT_CONTENT, mergeContent } from './content';

const q = (ts) => encodeURIComponent(ts);

// The saved row as the dashboard needs it. Edits are stored without the defaults, so the dashboard
// merges them over the bundled default (new default fields appear on their own).
export async function readRow() {
  if (!hasService()) return { configured: false, content: DEFAULT_CONTENT, updatedAt: null, hasBackup: false };
  const rows = await sbRest('cms_settings?id=eq.1&select=data,site_backup,updated_at', { role: 'service' });
  const row = rows && rows[0];
  return {
    configured: true,
    content: row && row.data ? mergeContent(DEFAULT_CONTENT, row.data) : DEFAULT_CONTENT,
    updatedAt: row ? row.updated_at : null,
    hasBackup: !!(row && row.site_backup),
  };
}

// Compare-and-swap on updated_at: the write only lands if nobody saved since this editor loaded.
export async function writeRow(content, baseUpdatedAt) {
  const now = new Date().toISOString();
  if (baseUpdatedAt) {
    const cur = await sbRest(`cms_settings?id=eq.1&updated_at=eq.${q(baseUpdatedAt)}&select=data`, { role: 'service' });
    if (!cur || !cur.length) return { conflict: true };
    const rows = await sbRest(`cms_settings?id=eq.1&updated_at=eq.${q(baseUpdatedAt)}`, {
      role: 'service', method: 'PATCH', prefer: 'return=representation',
      body: { data: content, site_backup: cur[0].data, updated_at: now },
    });
    if (!rows || !rows.length) return { conflict: true };
    return { updatedAt: rows[0].updated_at };
  }
  try {
    const rows = await sbRest('cms_settings', {
      role: 'service', method: 'POST', prefer: 'return=representation',
      body: { id: 1, data: content, default_data: DEFAULT_CONTENT, updated_at: now },
    });
    return { updatedAt: rows[0].updated_at };
  } catch (e) {
    if (/Supabase 409/.test(String(e.message))) return { conflict: true };
    throw e;
  }
}

// One-step undo: the previous version comes back and the current one becomes the new "previous".
export async function swapBackup(baseUpdatedAt) {
  const now = new Date().toISOString();
  const cur = await sbRest(`cms_settings?id=eq.1&updated_at=eq.${q(baseUpdatedAt)}&select=data,site_backup`, { role: 'service' });
  if (!cur || !cur.length) return { conflict: true };
  if (!cur[0].site_backup) return { nothing: true };
  const rows = await sbRest(`cms_settings?id=eq.1&updated_at=eq.${q(baseUpdatedAt)}`, {
    role: 'service', method: 'PATCH', prefer: 'return=representation',
    body: { data: cur[0].site_backup, site_backup: cur[0].data, updated_at: now },
  });
  if (!rows || !rows.length) return { conflict: true };
  return { updatedAt: rows[0].updated_at, content: mergeContent(DEFAULT_CONTENT, cur[0].site_backup) };
}
