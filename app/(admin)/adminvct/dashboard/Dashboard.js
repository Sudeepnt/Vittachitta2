'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logoutAdmin, restorePrevious, saveSiteContent } from '../../../../lib/cms/actions';

const META_FIELDS = [
  { k: 'title', label: 'Browser tab title', multiline: false },
  { k: 'description', label: 'Search result description', multiline: true },
  { k: 'ogTitle', label: 'Link preview title', multiline: false },
  { k: 'ogDescription', label: 'Link preview description', multiline: true },
];

// ---------- generic pieces ----------
function Field({ id, label, value, def, multiline, onChange, onReset, note }) {
  const mod = value !== def;
  const long = multiline || def.length > 60 || value.length > 60;
  const rows = Math.min(10, Math.max(2, Math.ceil(value.length / 85) + (value.split('\n').length - 1)));
  return (
    <div className={'field' + (mod ? ' mod' : '')}>
      <div className="lb">
        <label htmlFor={id}>{label}</label>
        {mod && <span className="edited">Edited</span>}
        {mod && <button type="button" className="reset" onClick={onReset}>Reset</button>}
      </div>
      {long ? (
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {note && <div className="note">{note}</div>}
    </div>
  );
}

function ConfirmHost({ dlg }) {
  const first = useRef(null);
  useEffect(() => { if (dlg && first.current) first.current.focus(); }, [dlg]);
  useEffect(() => {
    if (!dlg) return;
    const k = (e) => { if (e.key === 'Escape') dlg.resolve(dlg.cancel); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [dlg]);
  if (!dlg) return null;
  return (
    <div className="scrim" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) dlg.resolve(dlg.cancel); }}>
      <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlgT">
        <h3 id="dlgT">{dlg.title}</h3>
        <p>{dlg.message}</p>
        <div className="row">
          {dlg.buttons.map((b, i) => (
            <button key={b.value} ref={i === dlg.buttons.length - 1 ? first : null} type="button" className={'btn' + (b.outline ? ' o' : '')} onClick={() => dlg.resolve(b.value)}>{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- the dashboard ----------
export default function Dashboard({ tabs, sections, entries, defaultMeta, initial, updatedAt, hasBackup: hb, canSave, loadError, unused }) {
  const [texts, setTexts] = useState(initial.texts);
  const [meta, setMeta] = useState({ ...defaultMeta, ...initial.meta });
  const [baseAt, setBaseAt] = useState(updatedAt);
  const [hasBackup, setHasBackup] = useState(hb);
  const [tab, setTab] = useState(tabs[0].id);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState(null);
  const [dlg, setDlg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState('light');
  const fileRef = useRef(null);
  const leaving = useRef(false);

  const metaOver = useCallback((m) => Object.fromEntries(Object.entries(m).filter(([k, v]) => v !== defaultMeta[k])), [defaultMeta]);
  const norm = useCallback((m, t) => JSON.stringify({ meta: metaOver(m), texts: Object.fromEntries(Object.keys(t).sort().map((k) => [k, t[k]])) }), [metaOver]);
  const [savedSnap, setSavedSnap] = useState(() => norm({ ...defaultMeta, ...initial.meta }, initial.texts));
  const dirty = norm(meta, texts) !== savedSnap;

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme');
    setTheme(t === 'dark' ? 'dark' : 'light');
  }, []);
  function flipTheme() {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n);
    document.documentElement.setAttribute('data-theme', n);
    try { localStorage.setItem('vct_admin_theme', n); } catch {}
  }

  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { if (leaving.current) return; e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const toastT = useRef(null);
  const say = useCallback((msg, bad) => {
    setToast({ msg, bad });
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), bad ? 7000 : 3500);
  }, []);
  const ask = useCallback((title, message, buttons, cancel) => new Promise((resolve) => setDlg({ title, message, buttons, cancel, resolve: (v) => { setDlg(null); resolve(v); } })), []);

  // ---------- editing ----------
  const byKey = useMemo(() => new Map(entries.map((e) => [e.key, e])), [entries]);
  const setText = (key, v) => setTexts((p) => { const n = { ...p }; if (v === byKey.get(key).def) delete n[key]; else n[key] = v; return n; });
  const resetText = (key) => setTexts((p) => { const n = { ...p }; delete n[key]; return n; });

  const editedByTab = useMemo(() => {
    const c = {};
    for (const k of Object.keys(texts)) { const e = byKey.get(k); if (e) c[e.tab] = (c[e.tab] || 0) + 1; }
    for (const f of META_FIELDS) if (meta[f.k] !== defaultMeta[f.k]) c.site = (c.site || 0) + 1;
    return c;
  }, [texts, meta, byKey, defaultMeta]);

  const needle = q.trim().toLowerCase();
  const blocks = useMemo(() => {
    const secs = sections.filter((s) => s.tab === tab).sort((a, b) => a.order - b.order);
    return secs.map((s) => {
      let list = entries.filter((e) => e.tab === tab && e.section === s.id);
      if (needle) list = list.filter((e) => (e.def + ' ' + (texts[e.key] ?? '') + ' ' + e.label).toLowerCase().includes(needle));
      return { s, list };
    }).filter((b) => b.list.length);
  }, [sections, entries, tab, needle, texts]);

  const showMeta = tab === 'site' && (!needle || META_FIELDS.some((f) => (f.label + meta[f.k]).toLowerCase().includes(needle)));

  // ---------- actions ----------
  const payload = () => ({ meta: metaOver(meta), texts });

  async function save() {
    if (busy) return false;
    if (!canSave) { say('Saving is not available here: Supabase is not set up.', true); return false; }
    setBusy(true);
    try {
      const r = await saveSiteContent(payload(), baseAt);
      if (r.ok) { setBaseAt(r.updatedAt); setHasBackup(true); setSavedSnap(norm(meta, texts)); say('Saved. The website now shows your changes.'); setBusy(false); return true; }
      say(r.error, true);
    } catch { say('Could not save. Check your connection and try again.', true); }
    setBusy(false);
    return false;
  }

  function load(content) {
    const m = { ...defaultMeta, ...(content.meta || {}) };
    const t = content.texts || {};
    setMeta(m); setTexts(t);
    return norm(m, t);
  }

  async function restore() {
    if (!hasBackup) { say('There is no earlier version yet.', true); return; }
    const c = await ask('Restore the previous version?', (dirty ? 'Your unsaved changes will be lost. ' : '') + 'The website goes back to how it was before the last save. You can undo this by pressing Restore previous again.', [{ value: 'no', label: 'Cancel', outline: true }, { value: 'yes', label: 'Restore' }], 'no');
    if (c !== 'yes') return;
    setBusy(true);
    try {
      const r = await restorePrevious(baseAt);
      if (r.ok) { const snap = load(r.content); setSavedSnap(snap); setBaseAt(r.updatedAt); setHasBackup(true); say('Previous version restored.'); }
      else say(r.error, true);
    } catch { say('Could not restore. Try again.', true); }
    setBusy(false);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vitthachittha-content-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function pickImport() {
    if (dirty) {
      const c = await ask('Import and discard your changes?', 'You have unsaved changes. Importing replaces everything on this screen.', [{ value: 'keep', label: 'Keep editing', outline: true }, { value: 'go', label: 'Discard and import' }], 'keep');
      if (c !== 'go') return;
    }
    fileRef.current.value = '';
    fileRef.current.click();
  }
  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const okTexts = j && typeof j === 'object' && j.texts && typeof j.texts === 'object' && !Array.isArray(j.texts) && Object.values(j.texts).every((v) => typeof v === 'string');
      const okMeta = j.meta === undefined || (j.meta && typeof j.meta === 'object' && !Array.isArray(j.meta) && Object.values(j.meta).every((v) => typeof v === 'string'));
      if (!okTexts || !okMeta) throw new Error('shape');
      load(j);
      say('Imported. Press Save to publish it.');
    } catch { say('That file is not a VitthaChittha content export. Nothing was changed.', true); }
  }

  async function logout() {
    if (dirty) {
      const c = await ask('Save before you log out?', 'You have unsaved changes.', [{ value: 'discard', label: 'Discard', outline: true }, { value: 'keep', label: 'Keep editing', outline: true }, { value: 'save', label: 'Save' }], 'keep');
      if (c === 'keep') return;
      if (c === 'save') { const ok = await save(); if (!ok) return; }
    }
    try { await logoutAdmin(); } catch {}
    leaving.current = true;
    window.location.href = '/adminvct';
  }

  const changeTab = (id) => { setTab(id); setQ(''); window.scrollTo({ top: 0 }); };

  return (
    <>
      <div className="top">
        <div className="top-in">
          <div className="brand">VitthaChittha <span className="mono">Admin</span>{dirty && <span className="dirty" role="status">Unsaved changes</span>}</div>
          <div className="acts">
            <button type="button" className="btn o icon" onClick={flipTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title={theme === 'dark' ? 'Light theme' : 'Dark theme'}>{theme === 'dark' ? '☀' : '☾'}</button>
            <a className="btn o" href="/" target="_blank" rel="noopener">View site</a>
            <button type="button" className="btn o" onClick={restore} disabled={busy || !hasBackup}>Restore previous</button>
            <button type="button" className="btn o" onClick={exportJson}>Export JSON</button>
            <button type="button" className="btn o" onClick={pickImport}>Import JSON</button>
            <button type="button" className="btn o" onClick={logout}>Log out</button>
          </div>
          <button type="button" className="btn save" onClick={save} disabled={busy || !dirty}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
        <div className="tabs" role="tablist" aria-label="Pages">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="tab" onClick={() => changeTab(t.id)}>
              {t.label}{editedByTab[t.id] ? <span className="n">{editedByTab[t.id]}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />

      <main className="wrap">
        {!canSave && <div className="banner" role="status">Saving isn&rsquo;t available here. Supabase is not set up, so you can look around and use Export, but changes can&rsquo;t be saved to the website.</div>}
        {loadError && <div className="banner" role="alert">{loadError}</div>}
        {unused > 0 && <div className="banner" role="status">{unused} saved {unused === 1 ? 'edit no longer matches' : 'edits no longer match'} the page text, so {unused === 1 ? 'it is' : 'they are'} not shown on the site. This happens when the original wording in the code was rewritten.</div>}

        <div className="bar">
          <input className="find" type="search" placeholder="Find text on this page" aria-label="Find text on this page" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="mono">{editedByTab[tab] ? `${editedByTab[tab]} edited here` : 'Nothing edited here'}</span>
        </div>

        {showMeta && (
          <section className="card">
            <header><h2>Browser tab &amp; link previews</h2><span className="hint">What appears in the browser tab, in search results and when the link is shared.</span></header>
            {META_FIELDS.map((f) => (
              <Field key={f.k} id={'meta-' + f.k} label={f.label} value={meta[f.k]} def={defaultMeta[f.k]} multiline={f.multiline}
                onChange={(v) => setMeta((p) => ({ ...p, [f.k]: v }))} onReset={() => setMeta((p) => ({ ...p, [f.k]: defaultMeta[f.k] }))} />
            ))}
          </section>
        )}

        {blocks.map(({ s, list }) => {
          let last = null;
          return (
            <section className="card" key={s.id}>
              <header>
                <h2>{s.label}</h2>
                <span className="mono">{list.length} {list.length === 1 ? 'text' : 'texts'}</span>
                {s.hint && <span className="hint">{s.hint}</span>}
              </header>
              {list.map((e) => {
                const g = e.group && e.group !== s.label && e.group !== s.hint ? e.group : null;
                const head = g && g !== last ? g : null;
                if (g) last = g;
                return (
                  <Fragment key={e.key}>
                    {head && <div className="grp">{head}</div>}
                    <Field id={e.key} label={e.label} value={texts[e.key] ?? e.def} def={e.def} multiline={e.multiline}
                      onChange={(v) => setText(e.key, v)} onReset={() => resetText(e.key)} />
                  </Fragment>
                );
              })}
            </section>
          );
        })}

        {!blocks.length && !showMeta && <div className="empty">No text matches &ldquo;{q}&rdquo;.</div>}
      </main>

      <ConfirmHost dlg={dlg} />
      {toast && <div className={'toast' + (toast.bad ? ' bad' : '')} role="status">{toast.msg}</div>}
    </>
  );
}
