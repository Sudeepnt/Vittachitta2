// Runs after `next build`, static export only. Writes the CSS and the page runtime
// into each HTML file, so the first paint needs nothing but the HTML itself.
//
// Done here rather than in React because anything React renders inline is sent
// twice (HTML plus React payload) and again on every page change.
//
// - CSS: goes in a <style>. The original <link> stays, because React adopts it on
//   load and would otherwise re-add it, but with media="print" it no longer blocks
//   rendering.
// - Runtime: goes at the end of <body>, after React's own tree. A script React
//   expects but finds changed makes it discard the page and rebuild it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.env.STATIC_EXPORT) process.exit(0);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'out');
const { src } = JSON.parse(fs.readFileSync(path.join(root, 'content/runtime.json'), 'utf8'));
const js = fs.readFileSync(path.join(out, src)).toString('utf8').replace(/<\/script/gi, '<\\/script');

let done = 0;
for (const entry of fs.readdirSync(out, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const file = path.join(entry.parentPath, entry.name);
  let html = fs.readFileSync(file, 'utf8');

  let sheets = 0;
  html = html.replace(/<link rel="stylesheet" href="(\/_next\/static\/[^"]+\.css)([^"]*)"([^>]*)\/?>/g, (tag, href, query, attrs) => {
    sheets++;
    // Relative font URLs resolve against the page once the CSS is inline, so make them absolute.
    const css = fs.readFileSync(path.join(out, href), 'utf8')
      .replace(/url\((['"]?)(\.{1,2}\/[^'")]+)\1\)/g, (m, q, rel) => `url(${q}${new URL(rel, `http://x${href}`).pathname}${q})`)
      .replace(/<\/style/gi, '<\\/style');
    return `<style>${css}</style><link rel="stylesheet" href="${href}${query}"${attrs.replace(/\/$/, '')} media="print"/>`;
  });
  if (sheets !== 1) throw new Error(`expected one stylesheet in ${file}, found ${sheets}`);

  const at = html.lastIndexOf('</body>');
  if (at < 0) throw new Error(`no </body> in ${file}`);
  fs.writeFileSync(file, `${html.slice(0, at)}<script>${js}</script>${html.slice(at)}`);
  done++;
}
if (!done) throw new Error('no HTML files found in out/');
console.log(`css and runtime added to ${done} pages`);
