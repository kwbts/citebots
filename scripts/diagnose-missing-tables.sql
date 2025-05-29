-- Diagnose missing tables in Supabase

-- 1. Check if tables exist at all
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if we're connected to the right database
SELECT current_database(), current_user, version();

-- 3. Check if tables exist but have no data
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public';

-- 4. Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
LIMIT 20;

-- 5. Check for any recent drops in logs (if accessible)
-- This might not work depending on permissions
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';