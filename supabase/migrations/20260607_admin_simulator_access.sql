-- Repair admin access for the simulator and backfill profiles that were
-- created before the public.users trigger was installed.

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

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt()->>'email', '')) = 'beeadmin@pametnipanj.local'
    or exists (
      select 1
      from public.users
      where id = auth.uid() and role = 'admin'
    );
$$;

drop policy if exists "users own profile" on public.users;
drop policy if exists "users read own profile" on public.users;
drop policy if exists "admins read profiles" on public.users;
drop policy if exists "admins manage hives" on public.hives;
drop policy if exists "admins manage readings" on public.readings;
drop policy if exists "admins manage alerts" on public.alerts;

create policy "users read own profile" on public.users
  for select using (auth.uid() = id);

create policy "admins read profiles" on public.users
  for select using (public.is_admin());

create policy "admins manage hives" on public.hives
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage readings" on public.readings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins manage alerts" on public.alerts
  for all using (public.is_admin()) with check (public.is_admin());
