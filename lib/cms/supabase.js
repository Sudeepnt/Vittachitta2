// Minimal Supabase REST helper. The service-role key is only ever read here, on the server.
const URL_ = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
export const hasAnon = () => !!(URL_() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasService = () => !!(URL_() && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function sbRest(pathAndQuery, { role = 'service', method = 'GET', body, prefer, revalidate, tags } = {}) {
  const key = role === 'anon' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL_() || !key) throw new Error('Supabase is not configured');
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  if (prefer) headers.Prefer = prefer;
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (method === 'GET' && revalidate) init.next = { revalidate, tags };
  else init.cache = 'no-store';
  const res = await fetch(`${URL_()}/rest/v1/${pathAndQuery}`, init);
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}
