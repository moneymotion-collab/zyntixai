-- Prevent duplicate habit logs per member per day (habit_date = logged_at)

create unique index if not exists client_habits_member_date_unique
  on public.client_habits (member_id, logged_at);
