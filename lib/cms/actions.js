'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { COOKIE, authConfigured, passwordOk, makeToken, requireAdmin } from './auth';
import { isValidContent } from './content';
import { hasService } from './supabase';
import { writeRow, swapBackup } from './store';

export async function loginAdmin(password) {
  if (!authConfigured()) return { ok: false, error: 'Admin is not set up. ADMIN_PASSWORD and ADMIN_SECRET must be set on the server.' };
  if (!passwordOk(password)) return { ok: false, error: 'Wrong password.' };
  const jar = await cookies();
  jar.set(COOKIE, makeToken(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/adminvct', maxAge: 8 * 60 * 60 });
  return { ok: true };
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/adminvct', maxAge: 0 });
  return { ok: true };
}

export async function saveSiteContent(content, baseUpdatedAt) {
  await requireAdmin();
  if (!hasService()) return { ok: false, error: 'Saving is not available here: Supabase is not set up.' };
  if (!isValidContent(content)) return { ok: false, error: 'That content is not in the expected format. Nothing was saved.' };
  const clean = { meta: content.meta || {}, texts: content.texts };
  const r = await writeRow(clean, baseUpdatedAt || null);
  if (r.conflict) return { ok: false, conflict: true, error: 'Someone else saved while you were editing. Reload to see their changes; nothing of theirs was overwritten.' };
  revalidatePath('/');
  return { ok: true, updatedAt: r.updatedAt, hasBackup: true };
}

export async function restorePrevious(baseUpdatedAt) {
  await requireAdmin();
  if (!hasService()) return { ok: false, error: 'Saving is not available here: Supabase is not set up.' };
  if (!baseUpdatedAt) return { ok: false, error: 'There is no earlier version yet.' };
  const r = await swapBackup(baseUpdatedAt);
  if (r.conflict) return { ok: false, conflict: true, error: 'Someone else saved while you were editing. Reload first.' };
  if (r.nothing) return { ok: false, error: 'There is no earlier version yet.' };
  revalidatePath('/');
  return { ok: true, updatedAt: r.updatedAt, content: r.content, hasBackup: true };
}
