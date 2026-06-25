SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'content_posts'
  AND column_name LIKE 'viral%'
ORDER BY column_name;
