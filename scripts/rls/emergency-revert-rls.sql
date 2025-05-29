-- EMERGENCY: Revert all recent RLS changes that are causing timeouts
-- Run this immediately when connection is available

-- 1. Drop all the new complex policies first
DROP POLICY IF EXISTS "Users can view clients they have access to" ON clients;
DROP POLICY IF EXISTS "Users can view analysis runs for accessible clients" ON analysis_runs; 
DROP POLICY IF EXISTS "Users can view analysis queries for accessible clients" ON analysis_queries;
DROP POLICY IF EXISTS "Users can view page analyses for accessible clients" ON page_analyses;
DROP POLICY IF EXISTS "Users can view competitors for accessible clients" ON competitors;

-- 2. Completely disable RLS on problematic tables
ALTER TABLE analysis_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_analyses DISABLE ROW LEVEL SECURITY;

-- 3. Restore the original simple policies that were working
CREATE POLICY "Users can view their own clients" ON clients
FOR SELECT USING (
  created_by = auth.uid() OR 
  user_id = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Users can view their own analysis runs" ON analysis_runs  
FOR SELECT USING (
  created_by = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 4. Drop the client_access table temporarily (it's causing the complex joins)
DROP TABLE IF EXISTS client_access CASCADE;