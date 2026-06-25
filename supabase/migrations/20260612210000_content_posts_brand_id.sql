-- Link generated posts to brand profiles and store the source topic

alter table public.content_posts
  add column if not exists brand_id uuid references public.brand_profiles (id) on delete set null,
  add column if not exists topic text not null default '';

create index if not exists content_posts_brand_id_idx
  on public.content_posts (brand_id);
