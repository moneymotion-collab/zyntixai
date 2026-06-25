-- Repair workout_templates RLS (prior fix migration predates table creation).

drop policy if exists "workout_templates: insert own" on public.workout_templates;
drop policy if exists "workout_templates: insert coach or admin" on public.workout_templates;
create policy "workout_templates: insert coach or admin"
  on public.workout_templates
  for insert
  to authenticated
  with check (
    (created_by is null or created_by = auth.uid())
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
  );

drop policy if exists "workout_templates: update own" on public.workout_templates;
drop policy if exists "workout_templates: update own or admin" on public.workout_templates;
create policy "workout_templates: update own or admin"
  on public.workout_templates
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "workout_templates: delete own" on public.workout_templates;
drop policy if exists "workout_templates: delete own or admin" on public.workout_templates;
create policy "workout_templates: delete own or admin"
  on public.workout_templates
  for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "workout_template_exercises: insert via own template" on public.workout_template_exercises;
drop policy if exists "workout_template_exercises: insert via own template or admin" on public.workout_template_exercises;
create policy "workout_template_exercises: insert via own template or admin"
  on public.workout_template_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'coach')
    )
    and exists (
      select 1
      from public.workout_templates wt
      where wt.id = workout_template_exercises.template_id
        and (
          wt.created_by = auth.uid()
          or exists (
            select 1
            from public.profiles p
            where p.id = auth.uid()
              and p.role = 'admin'
          )
        )
    )
  );
