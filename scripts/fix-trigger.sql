-- Drop the trigger that's causing the conflict
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function too
DROP FUNCTION IF EXISTS public.handle_new_user();