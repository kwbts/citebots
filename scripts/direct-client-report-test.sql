-- Direct test query for client user report access
-- Copy and paste this into the Supabase SQL Editor

-- Show client user and their assigned client
SELECT 
  p.email, 
  p.role, 
  p.account_type, 
  p.client_account_id, 
  c.name as client_name
FROM 
  profiles p
LEFT JOIN 
  clients c ON p.client_account_id = c.id
WHERE 
  p.email = 'REPLACE_WITH_CLIENT_USER_EMAIL'; -- Replace with actual client user email

-- Show available reports for the client user's assigned client
WITH client_user AS (
  SELECT 
    client_account_id
  FROM 
    profiles
  WHERE 
    email = 'REPLACE_WITH_CLIENT_USER_EMAIL' -- Replace with actual client user email
)
SELECT 
  ar.id,
  ar.client_id,
  c.name as client_name,
  ar.platform,
  ar.status,
  ar.created_at
FROM 
  analysis_runs ar
JOIN 
  clients c ON ar.client_id = c.id
WHERE 
  ar.client_id = (SELECT client_account_id FROM client_user)
ORDER BY 
  ar.created_at DESC;

-- If no results, you need to assign the client user to a client that has reports
-- Run this update statement (replace placeholder values first):
/*
UPDATE profiles
SET 
  client_account_id = 'REPLACE_WITH_CLIENT_ID', -- Replace with a client ID that has reports
  role = 'client',
  account_type = 'client'
WHERE 
  email = 'REPLACE_WITH_CLIENT_USER_EMAIL'; -- Replace with actual client user email
*/