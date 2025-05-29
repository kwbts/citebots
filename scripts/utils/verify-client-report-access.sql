-- Script to verify client report access and data in database
-- Run with: supabase sql 'scripts/verify-client-report-access.sql'

-- 1. Check if there are any client users with client_account_id assigned
SELECT 
  COUNT(*) as client_users_with_assignment
FROM 
  public.profiles
WHERE 
  (role = 'client' OR account_type = 'client')
  AND client_account_id IS NOT NULL;

-- 2. List all client users and their assigned clients
SELECT 
  p.id as user_id,
  p.email as user_email,
  p.client_account_id,
  c.name as assigned_client_name,
  c.domain as assigned_client_domain
FROM 
  public.profiles p
LEFT JOIN
  public.clients c ON p.client_account_id = c.id
WHERE 
  (p.role = 'client' OR p.account_type = 'client');

-- 3. Check if assigned clients have any reports
WITH client_users AS (
  SELECT 
    p.id as user_id,
    p.email as user_email,
    p.client_account_id
  FROM 
    public.profiles p
  WHERE 
    (p.role = 'client' OR p.account_type = 'client')
    AND p.client_account_id IS NOT NULL
)
SELECT 
  cu.user_email,
  cu.client_account_id,
  c.name as client_name,
  COUNT(ar.id) as report_count
FROM 
  client_users cu
JOIN
  public.clients c ON cu.client_account_id = c.id
LEFT JOIN
  public.analysis_runs ar ON c.id = ar.client_id
GROUP BY
  cu.user_email, cu.client_account_id, c.name;

-- 4. Sample report data for the first client user's assigned client
WITH client_user_client AS (
  SELECT 
    client_account_id
  FROM 
    public.profiles
  WHERE 
    (role = 'client' OR account_type = 'client')
    AND client_account_id IS NOT NULL
  LIMIT 1
)
SELECT 
  ar.id,
  ar.created_at,
  ar.status,
  ar.platform,
  ar.queries_total,
  ar.queries_completed
FROM 
  public.analysis_runs ar
WHERE 
  ar.client_id = (SELECT client_account_id FROM client_user_client)
ORDER BY
  ar.created_at DESC
LIMIT 5;

-- 5. Create a test report for a client if none exists
-- Uncomment to create a test report
/*
WITH client_without_reports AS (
  SELECT 
    c.id as client_id,
    c.name as client_name
  FROM 
    public.clients c
  LEFT JOIN
    public.analysis_runs ar ON c.id = ar.client_id
  WHERE
    ar.id IS NULL
    AND c.id IN (
      SELECT client_account_id 
      FROM public.profiles 
      WHERE (role = 'client' OR account_type = 'client')
    )
  LIMIT 1
)
INSERT INTO public.analysis_runs (
  client_id, 
  platform, 
  status, 
  queries_total, 
  queries_completed
)
SELECT 
  client_id,
  'chatgpt',
  'completed',
  5,
  5
FROM 
  client_without_reports
RETURNING id, client_id, platform, status;
*/