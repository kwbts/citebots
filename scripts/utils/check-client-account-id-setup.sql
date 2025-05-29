-- SQL script to check multi-tenancy setup
-- Run with: supabase sql 'scripts/check-client-account-id-setup.sql'

-- Check if client_account_id column exists in profiles table
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'client_account_id'
    ) THEN 'client_account_id column exists in profiles table ✅'
    ELSE 'client_account_id column MISSING in profiles table ❌'
  END as client_account_id_check;

-- Get the column type to verify it's a UUID
SELECT 
  column_name, 
  data_type,
  CASE 
    WHEN data_type = 'uuid' THEN 'Type is correct (uuid) ✅'
    ELSE 'Wrong type: ' || data_type || ' (should be uuid) ❌'
  END as type_check
FROM 
  information_schema.columns 
WHERE 
  table_name = 'profiles' AND column_name = 'client_account_id';

-- Check client user type in profiles table
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'client' OR account_type = 'client' THEN 1 END) as client_users,
  COUNT(CASE WHEN client_account_id IS NOT NULL THEN 1 END) as users_with_client_assignment
FROM profiles;

-- Show profiles with client_account_id that might be client users
SELECT 
  id, 
  email, 
  role, 
  account_type, 
  client_account_id,
  CASE 
    WHEN (role = 'client' OR account_type = 'client') AND client_account_id IS NOT NULL THEN 'Complete client setup ✅'
    WHEN (role = 'client' OR account_type = 'client') AND client_account_id IS NULL THEN 'Client user WITHOUT assignment ❌'
    WHEN (role != 'client' AND account_type != 'client') AND client_account_id IS NOT NULL THEN 'Non-client WITH assignment ⚠️'
    ELSE 'Non-client user (normal) ✓'
  END as status
FROM 
  profiles 
ORDER BY 
  created_at DESC 
LIMIT 10;

-- Check for foreign key constraint
SELECT
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'profiles' 
      AND ccu.column_name = 'id'
      AND ccu.table_name = 'clients'
    ) THEN 'Foreign key constraint exists ✅'
    ELSE 'Foreign key constraint MISSING ❌'
  END as foreign_key_check;

-- Check client table structure (for reference)
SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns 
WHERE 
  table_name = 'clients'
ORDER BY ordinal_position;