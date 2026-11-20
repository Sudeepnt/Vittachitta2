// Finds every piece of text in content/body.html and gives it a stable key, so the CMS can edit all of it
// without body.html being changed. The same function builds the list the dashboard shows and the page the
// public site serves, so the two can never disagree.
//
// A key is  <page>.<section>.<first words>-<hash>[~n]
//   - it does not depend on the order of the text on the page, only on the section and the original text,
//     so adding or moving other text does not detach an edit;
//   - if the original text in body.html is later rewritten, the old edit no longer matches and is ignored
//     (the dashboard reports it as an unused edit).

import { JS_STRINGS } from './jsStrings.mjs';

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'wbr', 'path', 'circle', 'rect', 'line', 'use', 'ellipse', 'polygon', 'polyline', 'stop']);
const EDIT_ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', middot: '·', copy: '©', rarr: '→' };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}
export const encodeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const encodeAttr = (s) => encodeText(s).replace(/"/g, '&quot;');

function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36).padStart(6, '0').slice(0, 6);
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-').slice(0, 4).join('-') || 'x';

// ---- how things are named in the dashboard ----
export const TABS = [
  { id: 'site', label: 'Menu & loader' },
  { id: 'home', label: 'Home' },
  { id: 'operating', label: 'Operating' },
  { id: 'office', label: "Founder's Office" },
  { id: 'chittha', label: 'Chittha' },
  { id: 'firm', label: 'The firm' },
  { id: 'letter', label: 'Letter' },
  { id: 'contact', label: 'Contact' },
  { id: 'shared', label: 'Footer & cookies' },
];
const SECTION_NAMES = {
  nav: 'Top bar', menu: 'Phone menu', loader: 'Loading screen', top: 'Hero', platforms: 'Platforms', process: 'Process',
  founders: 'Founders', letters: 'Letters', table: 'The Table', faq: 'Questions', commit: 'Commitments', cband: 'Closing band',
  footer: 'Footer', cookie: 'Cookie box', header: 'Page header',
};
const TAG_LABEL = {
  h1: 'Heading', h2: 'Heading', h3: 'Sub-heading', h4: 'Small heading', p: 'Paragraph', a: 'Link', button: 'Button', li: 'List item',
  td: 'Table cell', th: 'Table heading', summary: 'Question', span: 'Label', label: 'Label', option: 'Dropdown option', div: 'Text',
  b: 'Number', strong: 'Bold text', em: 'Emphasis', small: 'Small text', pre: 'Text', textarea: 'Text', select: 'Text',
};
const ATTR_LABEL = { placeholder: 'Placeholder', 'aria-label': 'Screen-reader label', alt: 'Image description', title: 'Tooltip', href: 'Link address' };

function parseTag(tok) {
  const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(tok);
  if (!m) return null;
  const name = m[2].toLowerCase();
  const closing = m[1] === '/';
  const self = !closing && (/\/\s*>$/.test(tok) || VOID.has(name));
  const attr = (a) => { const r = new RegExp('\\s' + a + '\\s*=\\s*"([^"]*)"', 'i').exec(tok); return r ? r[1] : null; };
  return { name, closing, self, attr };
}

const SPLIT = /<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>|<[a-zA-Z\/!][^>]*>|[^<]+|</g;

let cache = null;
export function buildRegistry(html) {
  if (cache && cache.html === html) return cache;
  const tokens = html.match(SPLIT) || [];
  if (tokens.join('') !== html) throw new Error('CMS: could not tokenise body.html cleanly');

  const entries = [];
  const edits = []; // { tok, kind:'text'|'attr', lead, trail, start, end, key }
  const sections = new Map(); // `${tab}/${sectionId}` -> { tab, id, label, firstHeading, order }
  const seen = new Map();
  const stack = [];
  let seenMain = false, svg = 0, secCount = {};

  const viewOf = () => { let v = null; for (const e of stack) if (e.view) v = e.view; return v; };

  tokens.forEach((tok, ti) => {
    if (tok[0] !== '<' || tok.startsWith('<!--') || /^<(script|style)\b/i.test(tok)) {
      if (tok[0] !== '<' && !/^\s*$/.test(tok) && svg === 0) {
        const parent = stack[stack.length - 1];
        register(ti, 'text', tok, parent && parent.name, null);
      }
      return;
    }
    const t = parseTag(tok);
    if (!t) return;
    if (t.closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === t.name) { if (t.name === 'svg') svg--; if (t.name === 'main') seenMain = true; stack.length = i; break; }
      }
      return;
    }
    if (t.name === 'main') seenMain = true;
    const id = t.attr('id'), cls = t.attr('class') || '';
    const el = { name: t.name, id, cls };
    if (t.name === 'div' && /(^|\s)view(\s|$)/.test(cls) && t.attr('data-view')) el.view = t.attr('data-view');
    if (t.name === 'div' && id === 'ldr') el.sec = 'loader';
    if (t.name === 'div' && id === 'ck') el.sec = 'cookie';
    if (t.name === 'header') el.sec = 'nav';
    if (t.name === 'nav' && id === 'mmenu') el.sec = 'menu';
    if (t.name === 'footer') el.sec = 'footer';
    if (t.name === 'section') {
      if (id) el.sec = id;
      else if (/(^|\s)phero(\s|$)/.test(cls) || /(^|\s)formv(\s|$)/.test(cls)) el.sec = 'header';
      else { const tb = viewOf() || (seenMain ? 'shared' : 'site'); secCount[tb] = (secCount[tb] || 0) + 1; el.sec = 's' + secCount[tb]; }
    }
    // attributes first (they belong to this tag, not to what is inside it)
    if (svg === 0 || t.name === 'svg') {
      for (const a of [...EDIT_ATTRS, 'href']) {
        const re = new RegExp('(\\s' + a + '\\s*=\\s*")([^"]*)"', 'i');
        const m = re.exec(tok);
        if (!m) continue;
        if (a === 'href' && !/^(https?:|mailto:|tel:)/i.test(m[2])) continue;
        const start = m.index + m[1].length;
        stack.push(el);
        register(ti, 'attr', m[2], t.name, a, start, start + m[2].length);
        stack.pop();
      }
    }
    if (!t.self) { stack.push(el); if (t.name === 'svg') svg++; }
  });

  function register(ti, kind, raw, tagName, attrName, start, end) {
    let tab = viewOf() || (seenMain ? 'shared' : 'site');
    let secId = 'page';
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].sec) { secId = stack[i].sec; break; }
    const lead = kind === 'text' ? raw.match(/^\s*/)[0] : '';
    const trail = kind === 'text' ? raw.match(/\s*$/)[0] : '';
    const core = kind === 'text' ? raw.slice(lead.length, raw.length - trail.length) : raw;
    const def = decode(core.replace(/\s+/g, ' '));
    if (!def.trim()) return; // a lone &nbsp; spacer is not text anyone edits
    const base = `${tab}.${secId}.${slug(def)}-${hash(def + '|' + (attrName || ''))}`;
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    const key = n ? `${base}~${n + 1}` : base;
    const sk = tab + '/' + secId;
    if (!sections.has(sk)) sections.set(sk, { id: secId, tab, label: SECTION_NAMES[secId] || null, firstHeading: null, order: sections.size });
    const sec = sections.get(sk);
    if ((tagName === 'h1' || tagName === 'h2') && kind === 'text') {
      // a heading split by <br> is several text nodes in one element: treat it as one heading
      const el = stack[stack.length - 1];
      if (!sec.firstHeading) { sec.firstHeading = def; sec.fhEl = el; }
      else if (sec.fhEl === el) sec.firstHeading += ' ' + def;
      if (tagName === 'h2') { if (sec.groupEl === el) sec.group += ' ' + def; else { sec.group = def; sec.groupEl = el; } }
    }
    let label = attrName ? ATTR_LABEL[attrName] : TAG_LABEL[tagName] || 'Text';
    if (!attrName && tagName === 'p') {
      for (let i = stack.length - 1; i >= 0; i--) { if (stack[i].name === 'details') { label = 'Answer'; break; } if (stack[i].cls && /(^|\s)note(\s|$)/.test(stack[i].cls)) { label = 'Note'; break; } }
    }
    if (!attrName && (tagName === 'span' || tagName === 'div') && stack.length) {
      const last = stack[stack.length - 1];
      if (/(^|\s)tagm(\s|$)/.test(last.cls || '')) label = 'Placeholder tag';
      else if (/(^|\s)mono(\s|$)/.test(last.cls || '')) label = 'Small caption';
      else if (/(^|\s)ey(\s|$)/.test(last.cls || '')) label = 'Eyebrow';
    }
    entries.push({ key, tab, section: secId, label, attr: attrName || null, default: def, multiline: false, group: sec.group || null, order: entries.length });
    edits.push({ ti, kind, lead, trail, start, end, key, def });
  }

  // script-drawn text sits at the end of the section that holds its anchor element
  const anchorSection = findAnchorSections(tokens);
  for (const js of JS_STRINGS) {
    const where = anchorSection[js.anchor];
    if (!where) continue;
    const sk = where.tab + '/' + where.sec;
    if (!sections.has(sk)) sections.set(sk, { id: where.sec, tab: where.tab, label: SECTION_NAMES[where.sec] || null, firstHeading: null, order: sections.size });
    entries.push({ key: js.key, tab: where.tab, section: where.sec, label: js.label, attr: null, default: js.default, multiline: !!(js.multiline || js.lines), js: true, order: entries.length + 100000 });
  }

  const sectionList = [...sections.values()].map((s) => ({
    id: s.id, tab: s.tab, order: s.order,
    label: s.label || (s.firstHeading ? s.firstHeading : 'Section ' + s.id.replace(/^s/, '')),
    hint: s.label && s.firstHeading ? s.firstHeading : null,
  }));

  const byKey = new Map(edits.map((e) => [e.key, e]));
  cache = { html, tokens, entries, edits, byKey, sections: sectionList };
  return cache;
}

// second pass: for every element id, which tab and section does it sit in
function findAnchorSections(tokens) {
  const out = {};
  const stack = [];
  let seenMain = false, n = {};
  for (const tok of tokens) {
    if (tok[0] !== '<' || tok.startsWith('<!--') || /^<(script|style)\b/i.test(tok)) continue;
    const t = parseTag(tok);
    if (!t) continue;
    if (t.closing) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === t.name) { if (t.name === 'main') seenMain = true; stack.length = i; break; }
      continue;
    }
    if (t.name === 'main') seenMain = true;
    const id = t.attr('id'), cls = t.attr('class') || '';
    const el = { name: t.name };
    if (t.name === 'div' && /(^|\s)view(\s|$)/.test(cls) && t.attr('data-view')) el.view = t.attr('data-view');
    if (t.name === 'div' && id === 'ldr') el.sec = 'loader';
    if (t.name === 'div' && id === 'ck') el.sec = 'cookie';
    if (t.name === 'header') el.sec = 'nav';
    if (t.name === 'nav' && id === 'mmenu') el.sec = 'menu';
    if (t.name === 'footer') el.sec = 'footer';
    if (t.name === 'section') {
      if (id) el.sec = id;
      else if (/(^|\s)(phero|formv)(\s|$)/.test(cls)) el.sec = 'header';
      else { let tb = null; for (const e of stack) if (e.view) tb = e.view; tb = tb || (seenMain ? 'shared' : 'site'); n[tb] = (n[tb] || 0) + 1; el.sec = 's' + n[tb]; }
    }
    if (id) {
      let tab = null, sec = null;
      for (const e of [...stack, el]) { if (e.view) tab = e.view; if (e.sec) sec = e.sec; }
      out[id] = { tab: tab || (seenMain ? 'shared' : 'site'), sec: sec || 'page' };
    }
    if (!t.self) stack.push(el);
  }
  return out;
}

export function entryList(html) {
  const r = buildRegistry(html);
  return { entries: r.entries, sections: r.sections, tabs: TABS };
}

// ---- applying edits ----
export function applyContent(html, content) {
  const texts = (content && content.texts) || {};
  const keys = Object.keys(texts);
  if (!keys.length) return html;
  const r = buildRegistry(html);
  const tokens = r.tokens.slice();
  const perToken = new Map();
  let jsOver = null;
  for (const k of keys) {
    const v = texts[k];
    if (typeof v !== 'string') continue;
    if (k.startsWith('js.')) { (jsOver = jsOver || {})[k] = v; continue; }
    const e = r.byKey.get(k);
    if (!e) continue;
    if (!perToken.has(e.ti)) perToken.set(e.ti, []);
    perToken.get(e.ti).push({ e, v });
  }
  for (const [ti, list] of perToken) {
    let tok = tokens[ti];
    const first = list[0].e;
    if (first.kind === 'text') {
      tokens[ti] = first.lead + encodeText(list[0].v) + first.trail;
    } else {
      list.sort((a, b) => b.e.start - a.e.start);
      for (const { e, v } of list) tok = tok.slice(0, e.start) + encodeAttr(v) + tok.slice(e.end);
      tokens[ti] = tok;
    }
  }
  let out = tokens.join('');
  if (jsOver) {
    const json = JSON.stringify(jsOver).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const marker = '<script src="/assets/js/puzzle.js';
    const at = out.indexOf(marker);
    if (at >= 0) out = out.slice(0, at) + '<script>window.vcText=' + json + ';</script>\n' + out.slice(at);
  }
  return out;
}

// edits that no longer match the page (their original text was rewritten in body.html)
export function unusedKeys(html, content) {
  const r = buildRegistry(html);
  const known = new Set(JS_STRINGS.map((j) => j.key));
  return Object.keys((content && content.texts) || {}).filter((k) => !r.byKey.has(k) && !known.has(k));
}
