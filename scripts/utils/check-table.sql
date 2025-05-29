-- Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there's data
SELECT * FROM profiles LIMIT 5;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Check current user permissions
SELECT has_table_privilege(current_user, 'public.profiles', 'SELECT') as can_select,
       has_table_privilege(current_user, 'public.profiles', 'INSERT') as can_insert,
       has_table_privilege(current_user, 'public.profiles', 'UPDATE') as can_update;

-- Check for any database functions that might be interfering
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition LIKE '%profiles%';