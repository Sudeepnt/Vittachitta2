import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const COOKIE = 'vct_admin';
const TTL_MS = 8 * 60 * 60 * 1000;

// Both must be set in the environment. There is no default password and no default secret.
export const authConfigured = () => !!(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

const sign = (payload) => crypto.createHmac('sha256', process.env.ADMIN_SECRET).update(payload).digest('hex');
const sha = (s) => crypto.createHash('sha256').update(s).digest();

export function passwordOk(input) {
  if (!authConfigured() || typeof input !== 'string') return false;
  return crypto.timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD));
}

export function makeToken() {
  const exp = String(Date.now() + TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function tokenOk(token) {
  if (!authConfigured() || typeof token !== 'string') return false;
  const [exp, mac] = token.split('.');
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp), 'hex');
  let got;
  try { got = Buffer.from(mac, 'hex'); } catch { return false; }
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

export async function isAdmin() {
  const jar = await cookies();
  return tokenOk(jar.get(COOKIE)?.value);
}

// every server action starts with this
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Not signed in');
}

export async function requireAdminPage() {
  if (!(await isAdmin())) redirect('/adminvct');
}
