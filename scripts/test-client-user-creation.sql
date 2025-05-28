-- SQL script to check and create a test client user
-- Run with: supabase sql 'scripts/test-client-user-creation.sql'

-- Check for existing client
WITH client_check AS (
  SELECT id, name, domain FROM public.clients 
  LIMIT 1
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'No clients found. Create a client first.'
    ELSE 'Client found: ' || name || ' (ID: ' || id || ')'
  END as client_status,
  COALESCE(id::text, '') as client_id
FROM client_check;

-- Check for existing test client user
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'No test client user found.'
    ELSE 'Test client user exists: ' || email || ' (ID: ' || id || ', client_account_id: ' || COALESCE(client_account_id::text, 'NULL') || ')'
  END as client_user_status
FROM public.profiles
WHERE email = 'testclient@example.com';

-- Output current client_account_id values for all profiles
SELECT id, email, role, account_type, client_account_id
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- Create test client user if not exists
-- IMPORTANT: This doesn't create an auth user, just the profile for testing
-- Uncomment to create test client user:
/*
WITH client_data AS (
  SELECT id FROM public.clients LIMIT 1
)
INSERT INTO public.profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  company,
  role,
  account_type,
  client_account_id
)
SELECT 
  '00000000-0000-0000-0000-000000000000', -- Test ID that needs to be replaced with actual auth user ID
  'testclient@example.com',
  'Test', 
  'Client',
  'Test Company',
  'client',
  'client',
  id
FROM client_data
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  client_account_id = EXCLUDED.client_account_id
RETURNING id, email, client_account_id;
*/

-- Count clients with at least one analysis_run
SELECT
  'Clients with reports: ' || COUNT(DISTINCT client_id) || ' out of ' || total_clients || ' total clients' as report_status
FROM
  public.analysis_runs,
  (SELECT COUNT(*) as total_clients FROM public.clients) as client_count
GROUP BY total_clients;

-- Show client report counts 
SELECT
  c.id as client_id,
  c.name as client_name,
  COUNT(ar.id) as report_count
FROM
  public.clients c
LEFT JOIN
  public.analysis_runs ar ON c.id = ar.client_id
GROUP BY
  c.id, c.name
ORDER BY
  report_count DESC
LIMIT 10;