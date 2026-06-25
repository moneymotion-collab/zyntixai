-- =====================================================
-- Add dev-mode SELECT policies to existing tables
-- These tables have RLS enabled but no policies, so anon
-- gets 0 rows back. Adds read access for anon + authenticated.
-- TODO: replace with proper per-user policies once auth is added.
-- =====================================================

drop policy if exists "dev: public read clients"          on public.clients;
create policy "dev: public read clients"
  on public.clients for select to anon, authenticated using (true);

drop policy if exists "dev: public read members"          on public.members;
create policy "dev: public read members"
  on public.members for select to anon, authenticated using (true);

drop policy if exists "dev: public read sessions"         on public.sessions;
create policy "dev: public read sessions"
  on public.sessions for select to anon, authenticated using (true);

drop policy if exists "dev: public read workout_plans"    on public.workout_plans;
create policy "dev: public read workout_plans"
  on public.workout_plans for select to anon, authenticated using (true);

drop policy if exists "dev: public read nutrition_plans"  on public.nutrition_plans;
create policy "dev: public read nutrition_plans"
  on public.nutrition_plans for select to anon, authenticated using (true);

drop policy if exists "dev: public read progress_logs"    on public.progress_logs;
create policy "dev: public read progress_logs"
  on public.progress_logs for select to anon, authenticated using (true);