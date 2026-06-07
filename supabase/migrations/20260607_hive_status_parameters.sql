alter table public.hives add column if not exists frames_occupied integer not null default 10;
alter table public.hives add column if not exists colony_strength text not null default 'normal';
alter table public.hives add column if not exists last_feeding_date date;

update public.hives
set frames_occupied = coalesce(frames_occupied, frame_count, 10),
    colony_strength = coalesce(nullif(colony_strength, ''), 'normal');
