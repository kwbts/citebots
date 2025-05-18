-- First, let's see all columns in the clients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients'
ORDER BY ordinal_position;

-- Add the competitors column if it doesn't exist
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;

-- Let's see a sample of the data
SELECT id, name, domain
FROM public.clients 
LIMIT 5;

-- Initialize all null competitors as empty arrays
UPDATE public.clients
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Show the result
SELECT id, name, domain, competitors
FROM public.clients 
LIMIT 5;