-- Script to fix analysis_queries access issues
-- Run with: supabase sql 'scripts/fix-analysis-queries-access.sql'

-- 1. Check if analysis_queries has RLS enabled
SELECT 
  tablename,
  relrowsecurity as rls_enabled
FROM 
  pg_tables
JOIN
  pg_class ON pg_tables.tablename = pg_class.relname
WHERE 
  pg_tables.schemaname = 'public'
  AND pg_tables.tablename = 'analysis_queries';

-- 2. Enable RLS on analysis_queries
ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

-- 3. Check existing policies
SELECT
  policyname,
  permissive,
  cmd,
  qual
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename = 'analysis_queries';

-- 4. Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.analysis_queries;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.analysis_queries;

-- 5. Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.analysis_queries
FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. Verify data exists for the report
WITH test_report AS (
  SELECT
    id
  FROM
    public.analysis_runs
  LIMIT 1
)
SELECT
  COUNT(*) as query_count
FROM
  public.analysis_queries
WHERE
  analysis_run_id = (SELECT id FROM test_report);

-- 7. Check some sample data (first 5 queries)
WITH test_report AS (
  SELECT
    id
  FROM
    public.analysis_runs
  LIMIT 1
)
SELECT
  id,
  analysis_run_id,
  query_text,
  platform,
  status
FROM
  public.analysis_queries
WHERE
  analysis_run_id = (SELECT id FROM test_report)
LIMIT 5;