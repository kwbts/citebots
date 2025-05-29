-- Script to fix report data access for client users
-- This script enables proper RLS policies for all tables that provide report data

-- Fix for analysis_queries table
ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.analysis_queries;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.analysis_queries
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix for page_analyses table
ALTER TABLE public.page_analyses ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.page_analyses;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.page_analyses
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix for analysis_runs table
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.analysis_runs;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.analysis_runs
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clients;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.clients
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix for competitors table
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.competitors;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.competitors
FOR SELECT
USING (auth.role() = 'authenticated');

-- Verify RLS is enabled on all relevant tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public' AND 
  tablename IN ('analysis_queries', 'page_analyses', 'analysis_runs', 'clients', 'competitors');