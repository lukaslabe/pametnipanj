create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique,
  full_name text,
  role text not null default 'beekeeper',
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists username text;
alter table public.users add column if not exists role text not null default 'beekeeper';
create unique index if not exists users_username_idx on public.users(username) where username is not null;

create table if not exists public.hives (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  location text,
  queen text,
  status text not null default 'ok',
  status_text text not null default 'Mirno',
  weight_kg numeric not null default 0,
  weekly_delta_kg numeric not null default 0,
  food_liters numeric not null default 0, -- Legacy column name; value is stored and displayed as kilograms.
  food_days integer not null default 0,
  temperature_c numeric not null default 0,
  humidity_pct integer not null default 0,
  battery_pct integer not null default 100,
  signal text not null default 'Rocno',
  last_seen text not null default 'pravkar',
  qr_code text,
  device_id text,
  device_api_key text,
  latitude numeric,
  longitude numeric,
  location_name text,
  data_source text not null default 'sensor',
  frame_count integer not null default 10,
  frames_occupied integer not null default 10,
  colony_strength text not null default 'normal',
  last_feeding_date date,
  hive_type text not null default 'AŽ panj',
  forage jsonb not null default '[]'::jsonb,
  hive_color text not null default '#E8A020',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hives add column if not exists device_id text;
alter table public.hives add column if not exists device_api_key text;
alter table public.hives add column if not exists latitude numeric;
alter table public.hives add column if not exists longitude numeric;
alter table public.hives add column if not exists location_name text;
alter table public.hives add column if not exists data_source text not null default 'sensor';
alter table public.hives add column if not exists frame_count integer not null default 10;
alter table public.hives add column if not exists frames_occupied integer not null default 10;
alter table public.hives add column if not exists colony_strength text not null default 'normal';
alter table public.hives add column if not exists last_feeding_date date;
alter table public.hives add column if not exists hive_type text not null default 'AŽ panj';
alter table public.hives add column if not exists forage jsonb not null default '[]'::jsonb;
alter table public.hives add column if not exists hive_color text not null default '#E8A020';

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  device_id text,
  recorded_at timestamptz not null default now(),
  time_label text,
  weight_kg numeric,
  temp_c numeric,
  humidity_pct integer,
  inside_temp_c numeric,
  inside_humidity_pct integer,
  outside_temp_c numeric,
  outside_humidity_pct integer,
  feed_weight_kg numeric,
  pressure_hpa numeric,
  microphone_status text,
  camera_status text,
  sound_hz integer,
  battery_pct integer,
  battery_v numeric,
  solar_v numeric,
  rssi_dbm integer,
  created_at timestamptz not null default now()
);

alter table public.readings add column if not exists inside_temp_c numeric;
alter table public.readings add column if not exists inside_humidity_pct integer;
alter table public.readings add column if not exists outside_temp_c numeric;
alter table public.readings add column if not exists outside_humidity_pct integer;
alter table public.readings add column if not exists feed_weight_kg numeric;
alter table public.readings add column if not exists pressure_hpa numeric;
alter table public.readings add column if not exists microphone_status text;
alter table public.readings add column if not exists camera_status text;
alter table public.readings add column if not exists battery_v numeric;
alter table public.readings add column if not exists solar_v numeric;
alter table public.readings add column if not exists rssi_dbm integer;
alter table public.readings add column if not exists device_id text;

create table if not exists public.notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  type text not null default 'manual',
  title text not null,
  text text not null,
  photo_url text,
  photo_name text,
  photo_size_mb numeric,
  photo_quality jsonb not null default '{}'::jsonb,
  ai_analysis text,
  date_label text,
  duration text,
  created_at timestamptz not null default now()
);

alter table public.notes add column if not exists photo_url text;
alter table public.notes add column if not exists photo_name text;
alter table public.notes add column if not exists photo_size_mb numeric;
alter table public.notes add column if not exists photo_quality jsonb not null default '{}'::jsonb;
alter table public.notes add column if not exists ai_analysis text;

create table if not exists public.voice_actions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  type text not null,
  transcript text not null,
  fields jsonb not null default '{}'::jsonb,
  amount numeric,
  unit text,
  note text,
  date_label text,
  consistency text,
  consistency_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.feeding_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  date_label text,
  amount_liters numeric not null default 0,
  feed_type text not null default 'sirup',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.extraction_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  date_label text,
  honey_type text not null default 'med',
  frames integer not null default 0,
  gross_kg numeric not null default 0,
  empty_kg numeric not null default 0,
  net_kg numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text references public.hives(id) on delete cascade,
  title text not null,
  date_label text,
  time_label text,
  category text,
  priority text not null default 'ok',
  created_at timestamptz not null default now()
);

alter table public.reminders alter column hive_id drop not null;

create table if not exists public.qr_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  linked_hive_id text references public.hives(id) on delete set null,
  linked_to text,
  last_scan text,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text not null references public.hives(id) on delete cascade,
  reading_id uuid references public.readings(id) on delete cascade,
  severity text not null,
  category text not null,
  title text not null,
  message text not null,
  value text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text references public.hives(id) on delete set null,
  type text not null,
  date_label text,
  source text not null,
  status text not null default 'confirmed',
  original_text text,
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pollen_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text references public.hives(id) on delete set null,
  amount_kg numeric not null default 0,
  source text not null default 'manual',
  date_label text,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  quantity numeric not null default 0,
  unit text,
  shelf text,
  low_stock_at numeric not null default 0,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text references public.inventory_items(id) on delete set null,
  hive_id text references public.hives(id) on delete set null,
  quantity numeric not null default 0,
  unit text,
  source text not null default 'manual',
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text references public.hives(id) on delete set null,
  device_uid text,
  type text not null,
  name text not null,
  status text not null default 'simulated',
  battery_pct integer,
  api_key_hash text,
  firmware_version text,
  last_seen timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.devices add column if not exists hive_id text references public.hives(id) on delete set null;
alter table public.devices add column if not exists device_uid text;
alter table public.devices add column if not exists api_key_hash text;
alter table public.devices add column if not exists firmware_version text;
alter table public.devices add column if not exists last_seen timestamptz;
alter table public.devices add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.devices add column if not exists updated_at timestamptz not null default now();

create table if not exists public.scale_measurements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  hive_id text references public.hives(id) on delete set null,
  type text not null,
  gross_kg numeric not null default 0,
  tare_kg numeric not null default 0,
  net_kg numeric not null default 0,
  source text not null default 'bluetooth_scale',
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.honey_batches (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  honey_type text,
  total_kg numeric not null default 0,
  remaining_kg numeric not null default 0,
  shelf text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jar_filling_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  batch_id text references public.honey_batches(id) on delete set null,
  jar_size_kg numeric not null default 0,
  jar_count integer not null default 0,
  used_kg numeric not null default 0,
  remaining_kg numeric not null default 0,
  shelf text,
  status text not null default 'confirmed',
  date_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when lower(new.email) = 'beeadmin@pametnipanj.local'
        or lower(coalesce(new.raw_user_meta_data->>'username', '')) = 'beeadmin'
      then 'admin'
      else 'beekeeper'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    username = excluded.username,
    full_name = excluded.full_name,
    role = case
      when lower(excluded.email) = 'beeadmin@pametnipanj.local'
        or lower(coalesce(excluded.username, '')) = 'beeadmin'
      then 'admin'
      else public.users.role
    end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.users (id, email, username, full_name, role)
select
  auth_user.id,
  auth_user.email,
  coalesce(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
  coalesce(auth_user.raw_user_meta_data->>'full_name', ''),
  case
    when lower(auth_user.email) = 'beeadmin@pametnipanj.local'
      or lower(coalesce(auth_user.raw_user_meta_data->>'username', '')) = 'beeadmin'
    then 'admin'
    else 'beekeeper'
  end
from auth.users auth_user
on conflict (id) do update set
  email = excluded.email,
  username = excluded.username,
  full_name = excluded.full_name,
  role = case
    when lower(excluded.email) = 'beeadmin@pametnipanj.local'
      or lower(coalesce(excluded.username, '')) = 'beeadmin'
    then 'admin'
    else public.users.role
  end;

alter table public.users enable row level security;
alter table public.hives enable row level security;
alter table public.readings enable row level security;
alter table public.notes enable row level security;
alter table public.voice_actions enable row level security;
alter table public.feeding_events enable row level security;
alter table public.extraction_events enable row level security;
alter table public.reminders enable row level security;
alter table public.qr_items enable row level security;
alter table public.alerts enable row level security;
alter table public.events enable row level security;
alter table public.pollen_events enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.devices enable row level security;
alter table public.scale_measurements enable row level security;
alter table public.honey_batches enable row level security;
alter table public.jar_filling_events enable row level security;
alter table public.system_content enable row level security;

drop policy if exists "users own profile" on public.users;
drop policy if exists "users read own profile" on public.users;
drop policy if exists "admins read profiles" on public.users;
drop policy if exists "users own hives" on public.hives;
drop policy if exists "admins manage hives" on public.hives;
drop policy if exists "users own readings" on public.readings;
drop policy if exists "admins manage readings" on public.readings;
drop policy if exists "users own notes" on public.notes;
drop policy if exists "users own voice actions" on public.voice_actions;
drop policy if exists "users own feeding events" on public.feeding_events;
drop policy if exists "users own extraction events" on public.extraction_events;
drop policy if exists "users own reminders" on public.reminders;
drop policy if exists "users own qr items" on public.qr_items;
drop policy if exists "users own alerts" on public.alerts;
drop policy if exists "admins manage alerts" on public.alerts;
drop policy if exists "admins manage devices" on public.devices;
drop policy if exists "users own events" on public.events;
drop policy if exists "users own pollen events" on public.pollen_events;
drop policy if exists "users own inventory items" on public.inventory_items;
drop policy if exists "users own inventory transactions" on public.inventory_transactions;
drop policy if exists "users own devices" on public.devices;
drop policy if exists "users own scale measurements" on public.scale_measurements;
drop policy if exists "users own honey batches" on public.honey_batches;
drop policy if exists "users own jar filling events" on public.jar_filling_events;
drop policy if exists "authenticated read system content" on public.system_content;
drop policy if exists "admins manage system content" on public.system_content;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt()->>'email', '')) = 'beeadmin@pametnipanj.local'
    or exists(select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create policy "users read own profile" on public.users
  for select using (auth.uid() = id);

create policy "admins read profiles" on public.users
  for select using (public.is_admin());

create policy "users own hives" on public.hives
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admins manage hives" on public.hives
  for all using (public.is_admin()) with check (public.is_admin());

create policy "users own readings" on public.readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admins manage readings" on public.readings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "users own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own voice actions" on public.voice_actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own feeding events" on public.feeding_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own extraction events" on public.extraction_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own qr items" on public.qr_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own alerts" on public.alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admins manage alerts" on public.alerts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage devices" on public.devices
  for all using (public.is_admin()) with check (public.is_admin());

update public.users
set role = 'admin'
where username = 'beeadmin' or email = 'beeadmin@pametnipanj.local';

create policy "users own events" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own pollen events" on public.pollen_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own inventory items" on public.inventory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own inventory transactions" on public.inventory_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own devices" on public.devices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own scale measurements" on public.scale_measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own honey batches" on public.honey_batches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own jar filling events" on public.jar_filling_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "authenticated read system content" on public.system_content
  for select using (auth.role() = 'authenticated' and published = true);
create policy "admins manage system content" on public.system_content
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists hives_user_id_idx on public.hives(user_id);
create index if not exists readings_user_hive_idx on public.readings(user_id, hive_id);
create index if not exists readings_device_idx on public.readings(device_id, recorded_at desc);
create index if not exists notes_user_hive_idx on public.notes(user_id, hive_id);
create index if not exists voice_actions_user_hive_idx on public.voice_actions(user_id, hive_id);
create index if not exists feeding_user_hive_idx on public.feeding_events(user_id, hive_id);
create index if not exists extraction_user_hive_idx on public.extraction_events(user_id, hive_id);
create index if not exists reminders_user_hive_idx on public.reminders(user_id, hive_id);
create index if not exists qr_items_user_idx on public.qr_items(user_id);
create unique index if not exists hives_device_id_idx on public.hives(device_id) where device_id is not null;
create index if not exists alerts_user_hive_idx on public.alerts(user_id, hive_id);
create index if not exists alerts_unresolved_idx on public.alerts(user_id, resolved, created_at desc);
create index if not exists events_user_hive_idx on public.events(user_id, hive_id);
create index if not exists pollen_user_hive_idx on public.pollen_events(user_id, hive_id);
create index if not exists inventory_user_idx on public.inventory_items(user_id);
create index if not exists devices_user_idx on public.devices(user_id);
create unique index if not exists devices_device_uid_idx on public.devices(device_uid) where device_uid is not null;
create index if not exists devices_hive_idx on public.devices(hive_id);
create index if not exists scale_user_hive_idx on public.scale_measurements(user_id, hive_id);
create index if not exists batches_user_idx on public.honey_batches(user_id);
create index if not exists filling_user_idx on public.jar_filling_events(user_id);
