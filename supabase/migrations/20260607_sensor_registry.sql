-- Device registry used by today's simulator and future LilyGO/ESP32 devices.

alter table public.devices add column if not exists hive_id text references public.hives(id) on delete set null;
alter table public.devices add column if not exists device_uid text;
alter table public.devices add column if not exists api_key_hash text;
alter table public.devices add column if not exists firmware_version text;
alter table public.devices add column if not exists last_seen timestamptz;
alter table public.devices add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.devices add column if not exists updated_at timestamptz not null default now();
alter table public.readings add column if not exists device_id text;

create unique index if not exists devices_device_uid_idx
  on public.devices(device_uid) where device_uid is not null;
create index if not exists devices_hive_idx on public.devices(hive_id);
create index if not exists readings_device_idx on public.readings(device_id, recorded_at desc);

alter table public.devices enable row level security;

drop policy if exists "admins manage devices" on public.devices;
create policy "admins manage devices" on public.devices
  for all using (public.is_admin()) with check (public.is_admin());
