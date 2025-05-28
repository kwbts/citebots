-- Multi-tenancy Phase 1: Step 1 - Add account_type column
-- This is the minimal first step - just adds the column, no RLS changes

-- Add account_type column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'super_admin' 
  CHECK (account_type IN ('super_admin', 'partner', 'client'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);

-- Update existing users to super_admin (safe default)
UPDATE profiles SET account_type = 'super_admin' WHERE account_type IS NULL;

-- Verify the change
SELECT id, email, role, account_type FROM profiles LIMIT 5;