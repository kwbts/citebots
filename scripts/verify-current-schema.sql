-- Comprehensive schema verification for all expected tables

-- 1. Check which tables actually exist
SELECT 
  table_name,
  table_type,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check for our specific expected tables
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'profiles', 'access_requests', 'clients', 'competitors', 
    'analysis_runs', 'analysis_queries', 'page_analyses', 
    'analysis_queue', 'benchmark_data', 'client_access'
  ]) as table_name
)
SELECT 
  et.table_name,
  CASE 
    WHEN t.table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM expected_tables et
LEFT JOIN information_schema.tables t 
  ON et.table_name = t.table_name 
  AND t.table_schema = 'public'
ORDER BY et.table_name;

-- 3. For existing tables, check column counts
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count,
  string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;

-- 4. Check for RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Check for foreign key constraints
SELECT
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;