-- LilyGO full hive sensor package fields.
-- Main hive scale stays in weight_kg.
-- Feeder scale is stored separately so the app can distinguish hive weight from food stock.

alter table public.readings add column if not exists feed_weight_kg numeric;
alter table public.readings add column if not exists pressure_hpa numeric;
alter table public.readings add column if not exists microphone_status text;
alter table public.readings add column if not exists camera_status text;
