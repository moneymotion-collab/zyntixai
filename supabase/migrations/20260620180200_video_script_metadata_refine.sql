-- Normalize schema if the earlier metadata migration was already applied with jsonb mascot / text hashtags.

alter table public.video_projects
  add column if not exists mascot_name text,
  add column if not exists mascot_description text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'video_projects'
      and column_name = 'mascot'
  ) then
    update public.video_projects
    set
      mascot_name = coalesce(mascot_name, mascot->>'name'),
      mascot_description = coalesce(mascot_description, mascot->>'description')
    where mascot is not null;

    alter table public.video_projects drop column mascot;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'video_projects'
      and column_name = 'hashtags'
      and udt_name = 'text'
  ) then
    alter table public.video_projects
      alter column hashtags type text[] using (
        case
          when hashtags is null then '{}'::text[]
          when hashtags = '' then '{}'::text[]
          else string_to_array(hashtags, ' ')
        end
      );

    alter table public.video_projects
      alter column hashtags set default '{}',
      alter column hashtags set not null;
  end if;
end $$;

update public.video_scenes
set visual = ''
where visual is null;

alter table public.video_scenes
  alter column visual set default '';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'video_scenes'
      and column_name = 'visual'
      and is_nullable = 'YES'
  ) then
    alter table public.video_scenes
      alter column visual set not null;
  end if;
end $$;
