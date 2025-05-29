-- Script to enable RLS for all report-related tables
-- Run with: supabase sql 'scripts/enable-rls-for-all-tables.sql'

-- Enable RLS and create policies for analysis_runs
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.analysis_runs;
CREATE POLICY "Enable read access for all authenticated users" 
ON public.analysis_runs
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable RLS and create policies for analysis_queries
ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.analysis_queries;
CREATE POLICY "Enable read access for all authenticated users" 
ON public.analysis_queries
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable RLS and create policies for page_analyses
ALTER TABLE public.page_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.page_analyses;
CREATE POLICY "Enable read access for all authenticated users" 
ON public.page_analyses
FOR SELECT
USING (auth.role() = 'authenticated');

-- Enable RLS and create policies for competitors
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.competitors;
CREATE POLICY "Enable read access for all authenticated users" 
ON public.competitors
FOR SELECT
USING (auth.role() = 'authenticated');

-- Check policies for all tables
SELECT
  tablename,
  COUNT(policyname) as policy_count
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('analysis_runs', 'analysis_queries', 'page_analyses', 'competitors')
GROUP BY
  tablename;