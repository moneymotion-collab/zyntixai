-- =====================================================
-- Seed: realistic dev data
-- Idempotent: safe to re-run (uses ON CONFLICT DO NOTHING).
-- Uses deterministic UUIDs so cross-references stay stable.
-- =====================================================

-- ----- coaches -----
insert into public.coaches (id, full_name, email, bio) values
  ('11111111-0000-0000-0000-000000000001', 'Alex Pieters',  'alex@fitai.local',  'Strength & hypertrophy specialist, 8 years coaching.'),
  ('11111111-0000-0000-0000-000000000002', 'Jamie Lemmens', 'jamie@fitai.local', 'Conditioning and endurance coach. Marathon finisher.'),
  ('11111111-0000-0000-0000-000000000003', 'Mara Verheij',  'mara@fitai.local',  'Nutrition coach with sports dietetics background.')
on conflict (id) do nothing;

-- ----- members -----
insert into public.members (id, full_name, email, goal, plan, status, created_at) values
  ('22222222-0000-0000-0000-000000000001', 'John Doe',     'john@example.com',  'Weight Loss',   'Pro',   'Active',  '2025-11-12'),
  ('22222222-0000-0000-0000-000000000002', 'Sarah Miller', 'sarah@example.com', 'Muscle Gain',   'Elite', 'Active',  '2025-10-03'),
  ('22222222-0000-0000-0000-000000000003', 'David Brown',  'david@example.com', 'Conditioning',  'Basic', 'Pending', '2026-01-22'),
  ('22222222-0000-0000-0000-000000000004', 'Emma Wilson',  'emma@example.com',  'Strength',      'Pro',   'Active',  '2025-08-17'),
  ('22222222-0000-0000-0000-000000000005', 'Mike Johnson', 'mike@example.com',  'Hypertrophy',   'Elite', 'Active',  '2025-09-09'),
  ('22222222-0000-0000-0000-000000000006', 'Lara Khan',    'lara@example.com',  'Mobility',      'Basic', 'Paused',  '2026-02-04')
on conflict (id) do nothing;

-- ----- workout_plans -----
insert into public.workout_plans (id, title, goal, weeks, assigned_members) values
  ('33333333-0000-0000-0000-000000000001', 'Hypertrophy Foundations', 'Muscle Gain', 8,  2),
  ('33333333-0000-0000-0000-000000000002', 'Cut & Conditioning',      'Fat Loss',    6,  1),
  ('33333333-0000-0000-0000-000000000003', 'Powerlifting Peaking',    'Strength',    12, 1),
  ('33333333-0000-0000-0000-000000000004', 'Mobility Reset',          'Mobility',    4,  1)
on conflict (id) do nothing;

-- ----- nutrition_plans -----
insert into public.nutrition_plans (id, title, goal, calories, protein, carbs, assigned_members) values
  ('44444444-0000-0000-0000-000000000001', 'High-Protein Cut',  'Fat Loss',    2100, 200, 180, 1),
  ('44444444-0000-0000-0000-000000000002', 'Lean Bulk',         'Muscle Gain', 3000, 220, 340, 2),
  ('44444444-0000-0000-0000-000000000003', 'Performance Fuel',  'Endurance',   2600, 180, 320, 1),
  ('44444444-0000-0000-0000-000000000004', 'Maintenance Plate', 'Recomp',      2400, 160, 260, 1)
on conflict (id) do nothing;

-- ----- sessions -----
-- Mix of past, present, and future sessions for realistic timeline.
insert into public.sessions (id, member_id, coach, session_type, scheduled_date, scheduled_time, duration, status) values
  ('55555555-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'Alex Pieters',  'Personal Training',     current_date,                    '14:00', 60, 'Confirmed'),
  ('55555555-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Jamie Lemmens', 'Check-In Call',         current_date,                    '16:30', 20, 'Pending'),
  ('55555555-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Mara Verheij',  'Nutrition Coaching',    current_date + interval '1 day', '11:00', 45, 'Confirmed'),
  ('55555555-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'Alex Pieters',  'Transformation Review', current_date + interval '3 days','13:00', 30, 'Confirmed'),
  ('55555555-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', 'Mara Verheij',  'Mobility Session',      current_date - interval '2 days','18:00', 45, 'Completed'),
  ('55555555-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000005', 'Alex Pieters',  'Strength Block',        current_date - interval '5 days','09:00', 75, 'Completed')
on conflict (id) do nothing;

-- ----- member_workout_assignments -----
insert into public.member_workout_assignments (member_id, workout_plan_id) values
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002'),  -- John: Cut & Conditioning
  ('22222222-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001'),  -- Sarah: Hypertrophy
  ('22222222-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000003'),  -- Emma: Powerlifting
  ('22222222-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000001'),  -- Mike: Hypertrophy
  ('22222222-0000-0000-0000-000000000006', '33333333-0000-0000-0000-000000000004')   -- Lara: Mobility
on conflict do nothing;

-- ----- member_nutrition_assignments -----
insert into public.member_nutrition_assignments (member_id, nutrition_plan_id) values
  ('22222222-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001'),  -- John: High-Protein Cut
  ('22222222-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000002'),  -- Sarah: Lean Bulk
  ('22222222-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000004'),  -- David: Maintenance
  ('22222222-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000002'),  -- Emma: Lean Bulk
  ('22222222-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000003')   -- Mike: Performance Fuel
on conflict do nothing;

-- ----- progress_logs -----
-- Values are numeric in this schema (no unit column). Metric name includes the unit for clarity.
insert into public.progress_logs (id, member_id, metric, start_value, current_value, change_value, updated_at) values
  ('66666666-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Body Weight (kg)',    92.4, 87.1, -5.3, now() - interval '2 days'),
  ('66666666-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Bench Press 1RM (kg)',  55, 62.5,  7.5, now() - interval '1 day'),
  ('66666666-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', 'Back Squat 1RM (kg)',   80,   95,  15.0, now()),
  ('66666666-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000003', 'Resting HR (bpm)',      72,   64, -8.0, now() - interval '3 days'),
  ('66666666-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000005', 'Body Fat (%)',        18.5, 15.8, -2.7, now())
on conflict (id) do nothing;

-- ----- ai_coach_threads -----
insert into public.ai_coach_threads (id, member_id, topic, last_message, status, last_active) values
  ('77777777-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'Workout reminder',  'Hey Mike, dont forget your lower-body session at 18:00.',           'Suggestion sent', now() - interval '3 hours'),
  ('77777777-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Weekly motivation', 'Amazing progress this week - your bench is up 5kg!',                'Resolved',        now() - interval '1 hour'),
  ('77777777-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Macro adjustment',  'I bumped your carbs to 200g - let me know how energy feels.',       'Awaiting reply',  now() - interval '30 minutes'),
  ('77777777-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'Form check',        'Your squat depth looks great. Keep bracing the core on the way up.','Suggestion sent', now() - interval '15 minutes')
on conflict (id) do nothing;