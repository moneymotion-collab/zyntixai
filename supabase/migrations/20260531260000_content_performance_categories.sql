-- Expand content_type to support full marketing content categories

alter table public.content_performance
  drop constraint if exists content_performance_content_type_check;

update public.content_performance
set content_type = 'Educational'
where content_type = 'educational';

update public.content_performance
set content_type = 'Promotion'
where content_type = 'promotional';

alter table public.content_performance
  add constraint content_performance_content_type_check
  check (
    content_type in (
      'Transformation',
      'Nutrition',
      'Workout',
      'Motivation',
      'Member Story',
      'Promotion',
      'Educational'
    )
  );
