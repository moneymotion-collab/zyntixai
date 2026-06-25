-- Repair: some environments have content_posts without updated_at (e.g. legacy social_posts rename).

alter table public.content_posts
  add column if not exists updated_at timestamptz;

update public.content_posts
  set updated_at = coalesce(created_at, now())
  where updated_at is null;

alter table public.content_posts
  alter column updated_at set default now(),
  alter column updated_at set not null;

drop trigger if exists content_posts_updated_at on public.content_posts;
create trigger content_posts_updated_at
  before update on public.content_posts
  for each row execute function public.set_updated_at();
