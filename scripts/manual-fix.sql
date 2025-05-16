-- Manual fix for profiles table
-- Run this in Supabase SQL Editor

-- 1. First, disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create the profile for the super admin manually
-- Replace the UUID with your actual user ID from auth.users
INSERT INTO profiles (id, email, first_name, last_name, company, role, is_active)
VALUES (
  '492541a8-daf0-42a3-885a-8a3788718d0b', -- Your user ID
  'jon@knowbots.ca',
  'Jon',
  'Taylor',
  'Knowbots',
  'super_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 3. Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;

-- 4. Create new, simpler policies
CREATE POLICY "Allow authenticated users to read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 5. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verify the profile exists
SELECT * FROM profiles WHERE email = 'jon@knowbots.ca';