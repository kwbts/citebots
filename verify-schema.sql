-- Verify schema and essential tables
-- This will help identify if your database structure is intact

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if essential tables exist (adjust based on your application)
SELECT 
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
       THEN 'profiles table exists' ELSE 'profiles table MISSING' END,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') 
       THEN 'clients table exists' ELSE 'clients table MISSING' END,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'competitors') 
       THEN 'competitors table exists' ELSE 'competitors table MISSING' END,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analysis_runs') 
       THEN 'analysis_runs table exists' ELSE 'analysis_runs table MISSING' END,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analysis_queries') 
       THEN 'analysis_queries table exists' ELSE 'analysis_queries table MISSING' END,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_analyses') 
       THEN 'page_analyses table exists' ELSE 'page_analyses table MISSING' END;

-- Check if RLS is enabled on tables
SELECT
  table_name,
  CASE WHEN oid::regclass::text = table_name::text 
       THEN 'Table exists' ELSE 'Table not found' END AS table_status,
  CASE WHEN row_security_active(oid) 
       THEN 'RLS enabled' ELSE 'RLS disabled' END AS rls_status
FROM pg_class
WHERE relname IN ('profiles', 'clients', 'competitors', 'analysis_runs', 'analysis_queries', 'page_analyses')
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY table_name;

-- Check policies on critical tables
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for auth.users (if you have access)
SELECT count(*) as auth_users_count 
FROM auth.users;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;