-- Drop complex policies
DROP POLICY IF EXISTS "Users can view analysis queries for accessible clients" ON analysis_queries;
DROP POLICY IF EXISTS "Users can view page analyses for accessible clients" ON page_analyses;
DROP POLICY IF EXISTS "Users can view analysis runs for accessible clients" ON analysis_runs;
DROP POLICY IF EXISTS "Users can view clients they have access to" ON clients;