-- App showcase scene assets (module screenshot key + URL).

alter table public.video_scenes
  add column if not exists asset_key text,
  add column if not exists asset_url text;

create index if not exists video_scenes_asset_key_idx
  on public.video_scenes (asset_key)
  where asset_key is not null;
