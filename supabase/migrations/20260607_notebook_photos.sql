-- Persist compressed notebook photos and Smart Bee analysis with each note.

alter table public.notes add column if not exists photo_url text;
alter table public.notes add column if not exists photo_name text;
alter table public.notes add column if not exists photo_size_mb numeric;
alter table public.notes add column if not exists photo_quality jsonb not null default '{}'::jsonb;
alter table public.notes add column if not exists ai_analysis text;
