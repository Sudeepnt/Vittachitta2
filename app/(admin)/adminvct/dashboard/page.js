import { requireAdminPage } from '../../../../lib/cms/auth';
import { getBodyHtml, DEFAULT_CONTENT } from '../../../../lib/cms/content';
import { readRow } from '../../../../lib/cms/store';
import { entryList, unusedKeys } from '../../../../lib/cms/registry.mjs';
import Dashboard from './Dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAdminPage();
  const html = getBodyHtml();
  const { entries, sections, tabs } = entryList(html);
  let row, loadError = null;
  try {
    row = await readRow();
  } catch (e) {
    loadError = 'Could not read the saved content from Supabase. ' + String(e.message).slice(0, 160);
    row = { configured: false, content: DEFAULT_CONTENT, updatedAt: null, hasBackup: false };
  }
  const slim = entries.map(({ key, tab, section, label, attr, default: def, multiline, group }) => ({ key, tab, section, label, attr, def, multiline, group }));
  return (
    <Dashboard
      tabs={tabs}
      sections={sections}
      entries={slim}
      defaultMeta={DEFAULT_CONTENT.meta}
      initial={{ meta: row.content.meta, texts: row.content.texts || {}, socials: row.content.socials || [] }}
      updatedAt={row.updatedAt}
      hasBackup={row.hasBackup}
      canSave={row.configured}
      loadError={loadError}
      unused={unusedKeys(html, row.content).length}
    />
  );
}
