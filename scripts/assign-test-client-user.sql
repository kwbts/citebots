-- Script to assign a client user to a client for testing
-- Run with: supabase sql 'scripts/assign-test-client-user.sql'

-- First, show available clients to pick from
SELECT id, name, domain
FROM public.clients
ORDER BY name
LIMIT 10;

-- Show existing users that could be client users
SELECT id, email, role, account_type, client_account_id
FROM public.profiles
WHERE client_account_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Update a user to be a client user assigned to a specific client
-- IMPORTANT: Replace the placeholders with actual values before running
/*
UPDATE public.profiles
SET 
  client_account_id = 'REPLACE_WITH_CLIENT_ID',  -- Replace with actual client UUID
  account_type = 'client',
  role = 'client'
WHERE 
  email = 'REPLACE_WITH_USER_EMAIL'  -- Replace with actual user email
RETURNING id, email, role, account_type, client_account_id;
*/

-- Verify assignment after updating
-- SELECT id, email, role, account_type, client_account_id
-- FROM public.profiles
-- WHERE email = 'REPLACE_WITH_USER_EMAIL';
EOF < /dev/null