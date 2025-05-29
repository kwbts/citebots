-- First, let's check what columns exist in the clients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients';

-- Add the competitors column if it doesn't exist
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;

-- Now let's see the current structure
SELECT * FROM public.clients LIMIT 1;

-- If there's a different column name for competitors (like competitor_list or competitors_array), 
-- we can migrate that data. For now, let's just ensure the column exists with proper defaults
UPDATE public.clients
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Create a proper constraint for the structure
ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS check_competitors_structure;

ALTER TABLE public.clients 
ADD CONSTRAINT check_competitors_structure 
CHECK (
  competitors IS NOT NULL AND 
  jsonb_typeof(competitors) = 'array'
);

-- Let's also check if there's any competitor data in other formats
SELECT 
    id, 
    name,
    CASE 
        WHEN competitor_domains IS NOT NULL THEN 'has competitor_domains'
        WHEN competitor_names IS NOT NULL THEN 'has competitor_names'
        ELSE 'no competitor data'
    END as competitor_data_status
FROM public.clients
LIMIT 10;