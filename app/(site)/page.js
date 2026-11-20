import { getRuntimeContent, getBodyHtml } from '../../lib/cms/content';
import { applyContent } from '../../lib/cms/registry.mjs';

// The approved page markup lives in content/body.html, unchanged. Text edited in the CMS (/adminvct) is
// swapped in by key when the page is built; with no edits the markup is served exactly as it is in the file.
// Its inline <script> tags and the scripts under public/assets/js run in the browser in the same order as in
// the static handoff.
export default async function Page() {
  const html = applyContent(getBodyHtml(), await getRuntimeContent());
  // suppressHydrationWarning: the page's own scripts (loader, cookie box, hero scene) change this markup
  // in the browser before React starts, and React leaves it alone. This only silences the dev-mode note.
  return <div style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
