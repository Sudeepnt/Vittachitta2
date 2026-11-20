-- VitthaChittha CMS: run once in the Supabase SQL editor.
-- One row holds all edited text. The public site reads it with the anon key; only the service-role key
-- (used by the admin on the server, never sent to the browser) can write.

create table if not exists public.cms_settings (
  id           int primary key check (id = 1),
  data         jsonb not null default '{}'::jsonb,   -- the saved edits ({ meta, texts })
  default_data jsonb,                                -- snapshot of the bundled default when the row was created
  site_backup  jsonb,                                -- the version before the last save (one-step undo)
  updated_at   timestamptz not null default now()    -- used to stop two editors overwriting each other
);

alter table public.cms_settings enable row level security;

drop policy if exists "cms_settings public read" on public.cms_settings;
create policy "cms_settings public read" on public.cms_settings
  for select to anon, authenticated using (true);

-- No insert/update/delete policies on purpose: the service role bypasses RLS, everyone else cannot write.
revoke insert, update, delete on public.cms_settings from anon, authenticated;
