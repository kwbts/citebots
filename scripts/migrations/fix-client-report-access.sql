-- Script to enable client report access
-- Run with: supabase sql 'scripts/fix-client-report-access.sql'

-- 1. Check if RLS is enabled for analysis_runs
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM 
  pg_class
WHERE 
  oid = 'public.analysis_runs'::regclass;

-- 2. Update client user assignment
-- Replace 'USER_EMAIL_HERE' with the actual email of your client user
-- Replace 'CLIENT_ID_HERE' with the actual client ID that has reports
UPDATE 
  public.profiles 
SET 
  client_account_id = 'CLIENT_ID_HERE'::uuid,
  role = 'client',
  account_type = 'client'
WHERE 
  email = 'USER_EMAIL_HERE';

-- 3. Check if analysis_runs has enough permissions
-- This is for our application-level filtering approach (avoid complex RLS)
DO $$
BEGIN
  -- Enable RLS on analysis_runs if it's not already enabled
  ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
  
  -- Create a simple policy that allows all authenticated users to read reports
  -- Our application code will filter by client_account_id
  DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.analysis_runs;
  
  CREATE POLICY "Enable read access for all authenticated users" 
  ON public.analysis_runs
  FOR SELECT
  USING (auth.role() = 'authenticated');
  
  RAISE NOTICE 'Created simple RLS policy for analysis_runs';
END $$;

-- 4. Verify client user and report connection
SELECT
  p.email as client_user_email,
  p.client_account_id,
  c.name as client_name,
  COUNT(ar.id) as report_count
FROM
  public.profiles p
JOIN
  public.clients c ON p.client_account_id = c.id
LEFT JOIN
  public.analysis_runs ar ON c.id = ar.client_id
WHERE
  (p.role = 'client' OR p.account_type = 'client')
GROUP BY
  p.email, p.client_account_id, c.name;

-- 5. Sample report data for debugging
SELECT
  id,
  client_id,
  platform,
  status,
  queries_total,
  queries_completed
FROM
  public.analysis_runs
LIMIT 5;