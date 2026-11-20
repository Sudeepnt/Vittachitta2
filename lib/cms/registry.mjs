// Finds every piece of text in content/body.html and gives it a stable key, so the CMS can edit all of it.
// The same function builds the list the dashboard shows and the page the public site serves, so the two can
// never disagree.
//
// ORDER: everything is listed in the order a visitor meets it on the page (top bar, then each page from top to
// bottom, then the footer). Text drawn by the scripts is listed exactly where it appears; a link's address is
// listed right after the link's own text.
//
// A key is  <tab>.<section>.<first words>-<hash>[~n]
//   - it does not depend on where the text sits, only on its section and original wording, so adding or moving
//     other text does not detach an edit;
//   - if the original wording in body.html is later rewritten, the old edit no longer matches and is ignored
//     (the dashboard reports it as an unused edit).
//
// Social media links are not text nodes: body.html holds three markers (<!--vc:social:nav|tiles|footer-->)
// and the list kept in the CMS (content.socials) is drawn there. With an empty list nothing is drawn.

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

// ---- how things are named in the dashboard (tabs follow the order of the website) ----
export const TABS = [
  { id: 'site', label: 'Header & menu' },
  { id: 'home', label: 'Home page' },
  { id: 'operating', label: 'Operating page' },
  { id: 'office', label: "Founder's Office page" },
  { id: 'chittha', label: 'Chittha page' },
  { id: 'firm', label: 'The firm page' },
  { id: 'letter', label: 'Letter page' },
  { id: 'contact', label: 'Contact page' },
  { id: 'shared', label: 'Footer (every page)' },
  { id: 'cookie', label: 'Cookie box' },
  { id: 'meta', label: 'Browser tab & sharing' },
];
const SECTION_NAMES = {
  nav: 'Top bar', menu: 'Phone menu', loader: 'Loading screen', top: 'Hero', platforms: 'Platforms', process: 'Process',
  founders: 'Founders', letters: 'Letters', table: 'The Table', faq: 'Questions', commit: 'Commitments', cband: 'Closing band above the footer',
  footer: 'Footer', cookie: 'Cookie box', header: 'Page header', form: 'Booking form',
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

const anchorMatches = (anchor, t) => {
  const eq = anchor.indexOf('=');
  return eq < 0 ? t.attr('id') === anchor : t.attr(anchor.slice(0, eq)) === anchor.slice(eq + 1);
};

let cache = null;
export function buildRegistry(html) {
  if (cache && cache.html === html) return cache;
  const tokens = html.match(SPLIT) || [];
  if (tokens.join('') !== html) throw new Error('CMS: could not tokenise body.html cleanly');

  const entries = [];
  const edits = [];
  const sections = new Map();
  const seen = new Map();
  const stack = [];
  let seenMain = false, svg = 0;
  const secCount = {};

  const viewOf = () => { let v = null; for (const e of stack) if (e.view) v = e.view; return v; };

  // which tab and section the current position belongs to
  function where() {
    let secId = 'page';
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].sec) { secId = stack[i].sec; break; }
    let tab = viewOf() || (seenMain ? 'shared' : 'site');
    if (secId === 'cookie') tab = 'cookie';
    const sk = tab + '/' + secId;
    if (!sections.has(sk)) sections.set(sk, { id: secId, tab, label: SECTION_NAMES[secId] || null, firstHeading: null, order: sections.size });
    return { tab, secId, sec: sections.get(sk) };
  }

  function register(ti, kind, raw, tagName, attrName, start, end) {
    const lead = kind === 'text' ? raw.match(/^\s*/)[0] : '';
    const trail = kind === 'text' ? raw.match(/\s*$/)[0] : '';
    const core = kind === 'text' ? raw.slice(lead.length, raw.length - trail.length) : raw;
    const def = decode(core.replace(/\s+/g, ' '));
    if (!def.trim()) return; // a lone &nbsp; spacer is not text anyone edits
    const { tab, secId, sec } = where();
    const base = `${tab}.${secId}.${slug(def)}-${hash(def + '|' + (attrName || ''))}`;
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    const key = n ? `${base}~${n + 1}` : base;
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
    if (!attrName && /^[·|/•–—-]$/.test(def)) label = 'Separator';
    if (!attrName && tagName === 'div' && stack.length && /(^|\s)has(\s|$)/.test(stack[stack.length - 1].cls || '')) label = 'Menu title';
    if (!attrName && (tagName === 'span' || tagName === 'div') && stack.length) {
      const last = stack[stack.length - 1];
      if (/(^|\s)tagm(\s|$)/.test(last.cls || '')) label = 'Placeholder tag';
      else if (/(^|\s)mono(\s|$)/.test(last.cls || '')) label = 'Small caption';
      else if (/(^|\s)ey(\s|$)/.test(last.cls || '')) label = 'Eyebrow';
    }
    entries.push({ key, tab, section: secId, label, attr: attrName || null, default: def, multiline: false, group: sec.group || null });
    edits.push({ ti, kind, lead, trail, start, end, key, def });
  }

  function registerJs(js) {
    const { tab, secId, sec } = where();
    entries.push({ key: js.key, tab, section: secId, label: js.label, attr: null, default: js.default, multiline: !!(js.multiline || js.lines), js: true, group: sec.group || null });
  }

  tokens.forEach((tok, ti) => {
    if (tok[0] !== '<' || tok.startsWith('<!--') || /^<(script|style)\b/i.test(tok)) {
      if (tok[0] !== '<' && !/^\s*$/.test(tok) && svg === 0) {
        const parent = stack[stack.length - 1];
        if (parent && parent.id === 'yr') return; // the year is filled in by a script, so editing it would change nothing
        register(ti, 'text', tok, parent && parent.name, null);
      }
      return;
    }
    const t = parseTag(tok);
    if (!t) return;
    if (t.closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name !== t.name) continue;
        const el = stack[i];
        stack.length = i + 1; // so the element's own section is in scope
        for (const h of el.hrefs || []) register(el.ti, 'attr', h.value, el.name, 'href', h.start, h.end); // link address: after the link's text
        for (const js of el.anchors || []) registerJs(js); // script-drawn text: where the element sits
        stack.length = i;
        if (t.name === 'svg') svg--;
        if (t.name === 'main') seenMain = true;
        break;
      }
      return;
    }
    if (t.name === 'main') seenMain = true;
    const id = t.attr('id'), cls = t.attr('class') || '';
    const el = { name: t.name, id, cls, ti };
    if (t.name === 'div' && /(^|\s)view(\s|$)/.test(cls) && t.attr('data-view')) el.view = t.attr('data-view');
    if (t.name === 'div' && id === 'ldr') el.sec = 'loader';
    if (t.name === 'div' && id === 'ck') el.sec = 'cookie';
    if (t.name === 'header') el.sec = 'nav';
    if (t.name === 'nav' && id === 'mmenu') el.sec = 'menu';
    if (t.name === 'footer') el.sec = 'footer';
    if (t.name === 'section') {
      if (id) el.sec = id;
      else if (/(^|\s)phero(\s|$)/.test(cls)) el.sec = 'header';
      else if (/(^|\s)formv(\s|$)/.test(cls)) el.sec = 'form';
      else { const tb = viewOf() || (seenMain ? 'shared' : 'site'); secCount[tb] = (secCount[tb] || 0) + 1; el.sec = 's' + secCount[tb]; }
    }
    const anchors = JS_STRINGS.filter((j) => anchorMatches(j.anchor, t));
    if (anchors.length) el.anchors = anchors;
    if (svg === 0 || t.name === 'svg') {
      stack.push(el);
      for (const a of EDIT_ATTRS) {
        const m = new RegExp('(\\s' + a + '\\s*=\\s*")([^"]*)"', 'i').exec(tok);
        if (m) register(ti, 'attr', m[2], t.name, a, m.index + m[1].length, m.index + m[1].length + m[2].length);
      }
      const hm = /(\shref\s*=\s*")([^"]*)"/i.exec(tok);
      if (hm && /^(https?:|mailto:|tel:)/i.test(hm[2])) { const s0 = hm.index + hm[1].length; (el.hrefs = el.hrefs || []).push({ value: hm[2], start: s0, end: s0 + hm[2].length }); }
      stack.pop();
    }
    if (!t.self) { stack.push(el); if (t.name === 'svg') svg++; }
    else {
      // self-closing / void elements close at once
      stack.push(el);
      for (const h of el.hrefs || []) register(ti, 'attr', h.value, el.name, 'href', h.start, h.end);
      for (const js of el.anchors || []) registerJs(js);
      stack.pop();
    }
  });

  entries.forEach((e, i) => { e.order = i; });
  const sectionList = [...sections.values()].map((s) => ({
    id: s.id, tab: s.tab, order: s.order,
    label: s.label || (s.firstHeading ? s.firstHeading : 'Section ' + s.id.replace(/^s/, '')),
    hint: s.label && s.firstHeading ? s.firstHeading : null,
  }));

  const byKey = new Map(edits.map((e) => [e.key, e]));
  cache = { html, tokens, entries, edits, byKey, sections: sectionList };
  return cache;
}

export function entryList(html) {
  const r = buildRegistry(html);
  return { entries: r.entries, sections: r.sections, tabs: TABS };
}

// ---- social media links ----
const GLYPHS = { linkedin: 'in', x: 'X', twitter: 'X', instagram: 'ig', youtube: 'yt', facebook: 'f', github: 'gh', whatsapp: 'wa', threads: '@', telegram: 'tg', medium: 'M' };
export const glyphFor = (name) => GLYPHS[name.trim().toLowerCase()] || name.trim().replace(/[^a-z0-9]/gi, '').slice(0, 2).toLowerCase() || '?';
const MAX_TILES = 4; // the tile block above the footer shows the first four; the top bar and footer show all
export const safeSocials = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((s) => s && typeof s.name === 'string' && typeof s.url === 'string' && s.name.trim() && /^https?:\/\/[^\s"<>]+$/i.test(s.url.trim()))
    .map((s) => ({ name: s.name.trim().slice(0, 40), url: s.url.trim().slice(0, 500) }));

function socialHtml(where, list) {
  const link = (s) => `href="${encodeAttr(s.url)}" target="_blank" rel="noopener"`;
  if (where === 'nav') return list.map((s) => `<a class="r" ${link(s)}>${encodeText(s.name)}</a>`).join('\n  ');
  if (where === 'footer') return list.map((s) => `<li><a ${link(s)}>${encodeText(s.name)}</a></li>`).join('');
  return list.slice(0, MAX_TILES).map((s) => `<a ${link(s)} aria-label="${encodeAttr(s.name)}"><svg class="iso" data-soc="text" data-glyph="${encodeAttr(glyphFor(s.name))}" viewBox="-60 -44 120 84"></svg></a>`).join('');
}

// ---- applying edits ----
export function applyContent(html, content) {
  const r = buildRegistry(html);
  const texts = (content && content.texts) || {};
  const socials = safeSocials(content && content.socials);
  const tokens = r.tokens.slice();
  const perToken = new Map();
  let jsOver = null;
  for (const k of Object.keys(texts)) {
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
  for (let i = 0; i < tokens.length; i++) {
    const m = /^<!--vc:social:(nav|tiles|footer)-->$/.exec(tokens[i]);
    if (m) tokens[i] = socialHtml(m[1], socials);
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
