import fs from 'node:fs';
import path from 'node:path';

// The approved page markup lives in content/body.html, unchanged. It is rendered as-is so the
// design and copy stay exactly as signed off. Its inline <script> tags and the scripts under
// public/assets/js run in the browser in the same order as in the static handoff.
const html = fs.readFileSync(path.join(process.cwd(), 'content', 'body.html'), 'utf8');

export default function Page() {
  // suppressHydrationWarning: the page's own scripts (loader, cookie box, hero scene) change this markup
  // in the browser before React starts, and React leaves it alone. This only silences the dev-mode note.
  return <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
