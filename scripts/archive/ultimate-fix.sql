-- ULTIMATE FIX FOR PROFILES TABLE
-- Run this entire script in Supabase SQL Editor

-- 1. Drop ALL policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Make sure your profile exists
INSERT INTO public.profiles (id, email, first_name, last_name, company, role, is_active)
VALUES (
  '492541a8-daf0-42a3-885a-8a3788718d0b',
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

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create ONLY these simple policies
CREATE POLICY "Enable read for authenticated users own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable all for service role" 
ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role');

-- 6. Verify it worked
SELECT * FROM public.profiles WHERE email = 'jon@knowbots.ca';

-- 7. Check policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';