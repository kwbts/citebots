-- Script to check and fix RLS policies for analysis_runs
-- Run with: supabase sql 'scripts/check-analysis-runs-rls.sql'

-- Check if RLS is enabled for analysis_runs
SELECT
  CASE 
    WHEN rls_enabled THEN 'RLS is ENABLED for analysis_runs ✅'
    ELSE 'RLS is DISABLED for analysis_runs ❌'
  END as rls_status
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND tablename = 'analysis_runs';

-- List existing policies for analysis_runs
SELECT
  policyname, 
  permissive,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename = 'analysis_runs';

-- Check if policy exists for client users
SELECT
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'analysis_runs'
      AND policyname LIKE '%client%'
    ) THEN 'Client policy exists for analysis_runs ✅'
    ELSE 'No client-specific policy for analysis_runs ❌'
  END as client_policy_check;

-- Create performance-safe policy for client users if needed
-- Uncomment to create the policy
/*
DO $$
BEGIN
  -- Drop existing client policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Allow client users to view their assigned client's reports" ON public.analysis_runs;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No existing client policy to drop';
  END;

  -- Create new client policy
  CREATE POLICY "Allow client users to view their assigned client's reports" 
  ON public.analysis_runs
  FOR SELECT
  USING (
    -- Performance-safe approach: check if client_id matches user's client_account_id
    client_id = (
      SELECT client_account_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
    -- Only apply this check for client users
    AND EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'client' OR account_type = 'client')
    )
  );
  
  RAISE NOTICE 'Created performance-safe RLS policy for client users';
END $$;
*/

-- Make sure clients table has proper policies
SELECT
  policyname, 
  permissive,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename = 'clients';

-- Test the policy with example query
EXPLAIN ANALYZE
SELECT *
FROM public.analysis_runs
WHERE client_id = (
  SELECT client_account_id 
  FROM public.profiles 
  WHERE email = 'testclient@example.com'
)
LIMIT 5;

-- Verify sample report data exists for client
SELECT
  ar.id,
  ar.client_id,
  c.name as client_name,
  ar.platform,
  ar.status,
  ar.created_at
FROM
  public.analysis_runs ar
JOIN
  public.clients c ON ar.client_id = c.id
WHERE
  ar.client_id = (
    SELECT client_account_id 
    FROM public.profiles 
    WHERE (role = 'client' OR account_type = 'client')
    LIMIT 1
  )
LIMIT 5;