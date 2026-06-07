create table if not exists public.system_content (
  id text primary key,
  type text not null check (type in ('news', 'calendar')),
  title text not null,
  body text,
  date_label text,
  calendar_date date,
  priority text not null default 'ok',
  source_url text,
  published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update public.users
set role = 'admin'
where username = 'beeadmin' or email = 'beeadmin@pametnipanj.local';

alter table public.system_content enable row level security;

drop policy if exists "authenticated read system content" on public.system_content;
drop policy if exists "admins manage system content" on public.system_content;

create policy "authenticated read system content" on public.system_content
  for select using (auth.role() = 'authenticated' and published = true);

create policy "admins manage system content" on public.system_content
  for all using (public.is_admin()) with check (public.is_admin());
