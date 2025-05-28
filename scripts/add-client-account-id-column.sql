-- Multi-tenancy Phase 1: Step 2 - Add client_account_id column
-- This adds the direct client assignment column - no RLS changes yet

-- Add client_account_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_account_id UUID REFERENCES clients(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_client_account_id ON profiles(client_account_id);

-- Verify the change
SELECT id, email, account_type, client_account_id FROM profiles LIMIT 5;

-- Check that foreign key constraint works
SELECT 
  p.id, 
  p.email, 
  p.account_type, 
  p.client_account_id,
  c.name as assigned_client_name
FROM profiles p
LEFT JOIN clients c ON c.id = p.client_account_id
LIMIT 5;