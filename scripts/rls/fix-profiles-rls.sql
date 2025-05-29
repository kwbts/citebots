-- First, disable RLS temporarily to fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies without recursion
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.email = 'jon@knowbots.ca'
      AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update all profiles" ON profiles
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.email = 'jon@knowbots.ca'
      AND p.role = 'super_admin'
    )
  );

-- Create a policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a policy to allow super admin to insert any profile
CREATE POLICY "Super admin can insert profiles" ON profiles
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.email = 'jon@knowbots.ca'
      AND p.role = 'super_admin'
    )
    OR auth.uid() = id
  );

-- Create a policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;