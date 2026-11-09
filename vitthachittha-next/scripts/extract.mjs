// One-time converter: splits the single-file site (../index.html) into per-route
// HTML fragments, shared chrome, global CSS and the browser runtime.
//
//   npm run extract
//
// Re-running overwrites content/, app/globals.css and lib/site-runtime.js. After
// the migration those files are the source of truth; only re-run if you go back
// to editing the single HTML file. Every edit below is asserted, so a change in
// the source fails loudly rather than producing a half-converted site.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const s = fs.readFileSync(path.resolve(root, process.argv[2] ?? '../index.html'), 'utf8');

const decode = (t) => t.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const text = (h) => decode(h.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const between = (a, b, from = 0) => {
  const i = s.indexOf(a, from);
  if (i < 0) throw new Error('missing ' + a);
  const j = s.indexOf(b, i + a.length);
  if (j < 0) throw new Error('missing ' + b);
  return s.slice(i + a.length, j);
};

function editor(input) {
  let out = input;
  const sub = (a, b) => {
    const n = out.split(a).length - 1;
    if (n !== 1) throw new Error(`expected exactly one match, found ${n}: ${a.slice(0, 90)}`);
    out = out.split(a).join(b);
  };
  const cut = (a, z, b) => {
    const i = out.indexOf(a);
    const j = out.indexOf(z, i + a.length);
    if (i < 0 || j < 0) throw new Error('cut: missing ' + a.slice(0, 60));
    out = out.slice(0, i) + b + out.slice(j);
  };
  return { sub, cut, get: () => out };
}

// ---------- views ----------
const views = [...s.matchAll(/<main class="view" data-view="(\w+)" hidden>([\s\S]*?)\n<\/main>/g)].map((m) => ({ id: m[1], inner: m[2] }));
const ids = views.map((v) => v.id);
if (ids[0] !== 'home' || ids.length !== 10) throw new Error('unexpected views: ' + ids);

// Only view names are rewritten; href="#mark" (the SVG sprite) and href="#" stay.
const rewrite = (html) => html.replace(/href="#(\w+)"/g, (all, h) => (ids.includes(h) ? `href="${h === 'home' ? '/' : '/' + h}"` : all));

// ---------- chrome ----------
const chrome = {
  sprite: between('<svg width="0" height="0" style="position:absolute" aria-hidden="true">', '</svg>\n\n<header'),
  header: between('<header class="top" id="top">', '</header>'),
  switchM: between('<div class="switch-m" id="switchM" role="group" aria-label="Section switcher">', '</div>\n\n<div class="curtain"'),
  curtain: between('<div class="curtain" id="curtain" aria-hidden="true">', '</div>\n\n<div class="overlay"'),
  menu: between('<div class="overlay" id="menu" hidden role="dialog" aria-modal="true" aria-label="Menu">', '</div>\n\n<!-- ================= HOME'),
  footer: between('<footer class="foot">', '</footer>'),
};

// ---------- css ----------
const css = editor(between('<style>', '</style>').trim() + '\n');
css.sub('--f-display:"Bricolage Grotesque",', '--f-display:var(--font-display),"Bricolage Grotesque",');
css.sub('--f-text:"Newsreader",', '--f-text:var(--font-text),"Newsreader",');
css.sub('--f-mono:"IBM Plex Mono",', '--f-mono:var(--font-mono),"IBM Plex Mono",');
css.sub('.word .dev{font-family:"Noto Serif Devanagari",', '.word .dev{font-family:var(--font-deva),"Noto Serif Devanagari",');

// ---------- runtime ----------
const js = editor(between('<script>\n', '</script>\n</body>'));

js.sub(`  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var names = views.map(function(v){ return v.getAttribute('data-view'); });
`, `  /* links to the old single-page addresses (/#story) keep working */
  var oldHash = location.hash.slice(1);
  if(location.pathname === '/' && ${JSON.stringify(ids)}.indexOf(oldHash) > 0){ location.replace('/' + oldHash); return; }
`);

js.sub(`  var scenes = [];
  Array.prototype.forEach.call(document.querySelectorAll('canvas[data-mode]'), function(cv, i){ cv.setAttribute('data-sid', i); scenes.push(new Scene(cv)); });
`, `  var scenes = [];
  function buildScenes(view){ stopScene(); active = null; scenes = []; Array.prototype.forEach.call(view.querySelectorAll('canvas[data-mode]'), function(cv, i){ cv.setAttribute('data-sid', i); scenes.push(new Scene(cv)); }); }
`);

// Everything that decorated all ten views once now decorates the current page.
js.sub(`  /* ================= headline splitting ================= */
  Array.prototype.forEach.call(document.querySelectorAll('[data-split]'), function(h){`, `  /* ================= headline splitting ================= */
  function decorate(view){
  Array.prototype.forEach.call(view.querySelectorAll('[data-split]'), function(h){`);
js.sub(`Array.prototype.forEach.call(document.querySelectorAll('.pnl-in, .col'), function(c){`, `Array.prototype.forEach.call(view.querySelectorAll('.pnl-in, .col'), function(c){`);
js.sub(`  var waf = document.querySelector('.waffle');`, `  var waf = view.querySelector('.waffle');`);
js.sub(`  var wk = document.querySelector('.week');`, `  var wk = view.querySelector('.week');`);
js.sub(`else if((j*7) % 46 < 16) b.className = 'ad'; wk.appendChild(b); } }
`, `else if((j*7) % 46 < 16) b.className = 'ad'; wk.appendChild(b); } }
  }
`);

js.sub(`var chartBoxes = Array.prototype.slice.call(document.querySelectorAll('.chart[data-chart]')), widths = new WeakMap();`, `var chartBoxes = [], widths = new WeakMap();`);

js.sub(`  views.forEach(function(v){
    var ps = v.querySelectorAll(':scope > .pnl'), n = ps.length;`, `  function numberPanels(v){
    var ps = v.querySelectorAll(':scope > .pnl'), n = ps.length;`);
js.sub(`      p.appendChild(tag);
    });
  });
`, `      p.appendChild(tag);
    });
  }
`);

js.sub(`  var pin = document.getElementById('pinOnes'), oWord = document.getElementById('onesWord'), oLine = document.getElementById('onesLine'), oCount = document.getElementById('onesCount'), oBar = document.getElementById('onesBar'), oList = document.getElementById('onesList'), oi = 0;
  if(pin){
`, `  var pin = null, oWord, oLine, oCount, oBar, oList, oi = 0;
  function setupOnes(view){
    pin = view.querySelector('#pinOnes'); if(!pin) return;
    oWord = view.querySelector('#onesWord'); oLine = view.querySelector('#onesLine'); oCount = view.querySelector('#onesCount'); oBar = view.querySelector('#onesBar'); oList = view.querySelector('#onesList');
`);
js.sub(`  if(pin) paintOne(0, false);

  /* ================= thesis index`, `
  /* ================= thesis index`);

js.sub(`  var thIndex = document.getElementById('thIndex');
  if(thIndex){
    var tv = document.querySelector('[data-view="thesis"]'), tps = tv.querySelectorAll(':scope > .pnl');
`, `  function setupThesis(view){
    var thIndex = view.querySelector('#thIndex'); if(!thIndex) return;
    var tps = view.querySelectorAll(':scope > .pnl');
`);

js.cut('  function show(name){', '  function openMenu(){', `  function setup(view){ decorate(view); numberPanels(view); setupOnes(view); setupThesis(view); setupForm(view); }
  /* Called once per page: on first load, then by components/Navigator.tsx after each route change. */
  function page(){
    var v = document.querySelector('main.view');
    if(!v) return false;
    if(v === curView) return true;
    var first = !curView;
    curView = v; current = v.getAttribute('data-view');
    setup(v); buildScenes(v);
    Array.prototype.forEach.call(document.querySelectorAll('.ov-links a'), function(a){ if(a.getAttribute('href') === '/'+current) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    closeMenu();
    panels = Array.prototype.slice.call(v.querySelectorAll(':scope > .pnl'));
    panels.forEach(function(p){ p.classList.remove('seen'); });
    activeIdx = -1; buildSwitch();
    root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.scrollBehavior = '';
    chartBoxes = Array.prototype.slice.call(v.querySelectorAll('.chart[data-chart]'));
    renderCharts(true);
    oi = 0; if(pin) paintOne(0, false);
    requestAnimationFrame(function(){ requestAnimationFrame(onScroll); });
    if(!first && !reduce){ curtain.classList.add('lift'); curtain.classList.remove('cover'); setTimeout(function(){ curtain.classList.remove('lift'); }, 600); }
    return true;
  }
  /* Bring the curtain down, then navigate behind it. */
  function cover(go){
    if(reduce){ go(); return; }
    if(curtain.classList.contains('cover')) return;
    curtain.classList.remove('lift'); void curtain.offsetWidth; curtain.classList.add('cover');
    setTimeout(go, 460);
  }

`);

js.sub(`if(a && a.getAttribute('href') === location.hash){ closeMenu(); goPanel(0); }`, `if(a && a.getAttribute('href') === location.pathname){ closeMenu(); goPanel(0); }`);

js.sub(`  var form = document.getElementById('contactForm'), done = document.getElementById('formDone'), err = document.getElementById('formErr');
`, `  function setupForm(view){
  var form = view.querySelector('#contactForm'); if(!form) return;
  var done = view.querySelector('#formDone'), err = view.querySelector('#formErr');
`);
js.sub(`document.getElementById('f-name').focus(); });

  document.getElementById('yr')`, `document.getElementById('f-name').focus(); });
  }

  document.getElementById('yr')`);

js.sub(`  show((location.hash || '#home').slice(1));
`, `  window.VC = { page: page, closeMenu: closeMenu, cover: cover };
  page();
`);

for (const gone of ['views.', 'names.indexOf', ' show(', ' route(', 'hashchange']) {
  if (js.get().includes(gone)) throw new Error('left over in runtime: ' + gone);
}

// ---------- metadata ----------
const siteDescription = decode(/<meta name="description" content="([^"]+)"/.exec(s)[1]);
const labels = Object.fromEntries([...s.matchAll(/<a href="#(\w+)" style="--i:\d+"><span>\d+<\/span>([^<]+)<\/a>/g)].map((m) => [m[1], decode(m[2])]));
labels.legal = 'Legal';
const pages = views.map((v) => {
  const h1 = text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(v.inner)[1]);
  return {
    id: v.id,
    title: v.id === 'home' ? null : labels[v.id],
    description: v.id === 'home' ? siteDescription : h1,
  };
});
if (pages.some((p) => p.id !== 'home' && !p.title)) throw new Error('page without a title');

// ---------- write ----------
const w = (rel, data) => {
  const f = path.join(root, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};
for (const v of views) w(`content/pages/${v.id}.html`, rewrite(v.inner).trim() + '\n');
for (const [name, html] of Object.entries(chrome)) w(`content/chrome/${name}.html`, rewrite(html).trim() + '\n');
w('app/globals.css', css.get());
w('lib/site-runtime.js', js.get().trim() + '\n');
w('content/site.json', JSON.stringify({ siteDescription, pages }, null, 2) + '\n');
console.log('pages:', ids.join(', '));
for (const p of pages) console.log(`  ${p.id}: ${p.title ?? '(default)'} | ${p.description}`);
