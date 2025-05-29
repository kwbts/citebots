-- Multi-tenancy Phase 1: Step 4 - Simple RLS policy test
-- This adds ONE simple policy to test our new account_type column

-- First, let's see current policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Add a simple SELECT policy that uses account_type
-- This is SAFE - no JOINs, just a simple column check
CREATE POLICY "Account type based access" ON profiles
FOR SELECT USING (
  -- Super admins can see all profiles
  account_type = 'super_admin' OR
  -- Users can see their own profile
  id = auth.uid()
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Account type based access';

-- Test the policy with a simple query (should work for super admin)
SELECT id, email, account_type, client_account_id FROM profiles LIMIT 3;