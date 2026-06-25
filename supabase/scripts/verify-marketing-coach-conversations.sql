-- Verification checklist for marketing_coach_conversations
-- Run in Supabase SQL Editor after applying the repair migration.

-- 1. Table exists
select
  case
    when to_regclass('public.marketing_coach_conversations') is not null then 'PASS: table exists'
    else 'FAIL: table missing'
  end as table_check;

-- 2. Expected columns
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'marketing_coach_conversations'
order by ordinal_position;

-- 3. Indexes
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'marketing_coach_conversations'
order by indexname;

-- 4. RLS enabled
select
  relname,
  relrowsecurity as rls_enabled
from pg_class
where relname = 'marketing_coach_conversations';

-- 5. Policies (expect: select, insert, delete — no update)
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'marketing_coach_conversations'
order by policyname;

-- 6. FK to profiles
select
  conname as constraint_name,
  confrelid::regclass as references_table
from pg_constraint
where conrelid = 'public.marketing_coach_conversations'::regclass
  and contype = 'f';

-- 7. Grants for authenticated
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'marketing_coach_conversations'
  and grantee = 'authenticated'
order by privilege_type;
