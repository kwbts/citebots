-- Script to add client_account_id column to profiles if it doesn't exist
-- Run with: supabase sql 'scripts/add-client-account-id-column.sql'

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'client_account_id'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN client_account_id UUID REFERENCES public.clients(id);
    
    RAISE NOTICE 'Added client_account_id column to profiles table';
  ELSE
    RAISE NOTICE 'client_account_id column already exists in profiles table';
  END IF;
END $$;

-- Update a test user profile to have client_account_id (FOR TESTING ONLY)
-- Uncomment and adjust the user ID and client ID as needed
/*
WITH client_data AS (
  SELECT id FROM public.clients LIMIT 1
)
UPDATE public.profiles
SET 
  client_account_id = (SELECT id FROM client_data),
  account_type = 'client',
  role = 'client'
WHERE 
  email = 'test@example.com'  -- Replace with actual user email
RETURNING id, email, role, account_type, client_account_id;
*/

-- Comment on the column to document its purpose
COMMENT ON COLUMN public.profiles.client_account_id IS 
'References the client that this user account is associated with. Used for multi-tenant access control.';
EOF < /dev/null