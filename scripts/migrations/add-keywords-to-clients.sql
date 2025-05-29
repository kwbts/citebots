-- Add keywords field to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Update existing records to have empty keywords array if null
UPDATE public.clients 
SET keywords = '{}' 
WHERE keywords IS NULL;