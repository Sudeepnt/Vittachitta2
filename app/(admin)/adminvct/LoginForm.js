'use client';

import { useState } from 'react';
import { loginAdmin } from '../../../lib/cms/actions';

export default function LoginForm({ configured }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr('');
    try {
      const r = await loginAdmin(pw);
      if (r.ok) { window.location.href = '/adminvct/dashboard'; return; }
      setErr(r.error);
    } catch {
      setErr('Could not reach the server. Try again.');
    }
    setBusy(false);
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={submit}>
        <span className="mono">Admin</span>
        <h1>VitthaChittha</h1>
        <p>Sign in to edit the text on the website.</p>
        <label htmlFor="pw" className="sr">Password</label>
        <input id="pw" type="password" autoComplete="current-password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus disabled={!configured} />
        {!configured && <div className="err" role="alert">Admin is not set up. ADMIN_PASSWORD and ADMIN_SECRET must be set on the server.</div>}
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn" type="submit" disabled={busy || !configured || !pw}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
