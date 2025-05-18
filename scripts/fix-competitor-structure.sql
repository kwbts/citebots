-- Fix competitor structure for existing clients
-- This script ensures all competitors have the pattern field

-- First, let's see the current structure
SELECT id, name, competitors 
FROM public.clients 
WHERE competitors IS NOT NULL 
AND jsonb_array_length(competitors) > 0
LIMIT 5;

-- Update competitors to ensure they have the pattern field
UPDATE public.clients
SET competitors = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', comp->>'name',
      'domain', comp->>'domain',
      'pattern', COALESCE(comp->>'pattern', comp->>'domain')
    )
  )
  FROM jsonb_array_elements(competitors) AS comp
)
WHERE competitors IS NOT NULL
AND jsonb_array_length(competitors) > 0;

-- Ensure all null competitors are empty arrays
UPDATE public.clients
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Add a check constraint to ensure proper structure going forward
ALTER TABLE public.clients 
ADD CONSTRAINT check_competitors_structure 
CHECK (
  competitors IS NOT NULL AND 
  (jsonb_array_length(competitors) = 0 OR 
   (SELECT bool_and(
     comp ? 'name' AND 
     comp ? 'domain' AND 
     comp ? 'pattern'
   ) 
   FROM jsonb_array_elements(competitors) AS comp))
);

-- Show the updated structure
SELECT id, name, 
       jsonb_pretty(competitors) as competitors_formatted
FROM public.clients 
WHERE jsonb_array_length(competitors) > 0
LIMIT 3;