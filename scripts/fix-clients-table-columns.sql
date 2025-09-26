-- Emergency fix: Add missing user_id column to clients table
-- The RLS policies expect c.user_id but table only has created_by

-- Add user_id column and populate it from created_by
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);

-- Copy existing created_by values to user_id for backwards compatibility
UPDATE public.clients
SET user_id = created_by
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);