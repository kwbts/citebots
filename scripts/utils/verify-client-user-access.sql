-- Script to verify client user access to specific tables
-- Run this script as the client user (using their auth token) to debug permission issues

-- Get current user ID
SELECT auth.uid() as current_user_id;

-- Check user profile to verify client assignment
SELECT 
  id, 
  email, 
  role, 
  account_type, 
  client_account_id 
FROM 
  profiles 
WHERE 
  id = auth.uid();

-- Try to fetch analysis_runs for the user's assigned client
WITH user_profile AS (
  SELECT client_account_id FROM profiles WHERE id = auth.uid()
)
SELECT 
  COUNT(*) as runs_accessible 
FROM 
  analysis_runs 
WHERE 
  client_id = (SELECT client_account_id FROM user_profile);

-- Try to fetch analysis_queries for a specific analysis run
-- Replace 'your-analysis-run-id' with an actual run ID the client should have access to
WITH user_profile AS (
  SELECT client_account_id FROM profiles WHERE id = auth.uid()
),
client_runs AS (
  SELECT id FROM analysis_runs WHERE client_id = (SELECT client_account_id FROM user_profile)
)
SELECT 
  COUNT(*) as queries_accessible 
FROM 
  analysis_queries 
WHERE 
  analysis_run_id IN (SELECT id FROM client_runs);

-- Verify permissions on all tables for current user
SELECT
  schemaname,
  tablename,
  has_table_privilege(auth.uid()::text, quote_ident(schemaname) || '.' || quote_ident(tablename), 'SELECT') as can_select,
  has_table_privilege(auth.uid()::text, quote_ident(schemaname) || '.' || quote_ident(tablename), 'INSERT') as can_insert,
  has_table_privilege(auth.uid()::text, quote_ident(schemaname) || '.' || quote_ident(tablename), 'UPDATE') as can_update,
  has_table_privilege(auth.uid()::text, quote_ident(schemaname) || '.' || quote_ident(tablename), 'DELETE') as can_delete
FROM
  pg_tables
WHERE
  schemaname = 'public' AND
  tablename IN ('analysis_runs', 'analysis_queries', 'page_analyses', 'clients', 'competitors', 'profiles');