-- Remote client_profiles may exist without a unique constraint on member_id.
-- This enables safe upserts and one profile per member.
create unique index if not exists client_profiles_member_id_key
  on public.client_profiles (member_id);
