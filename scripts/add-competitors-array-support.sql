-- Update clients table to support proper competitor structure
-- Add a temporary column for migration if needed
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS competitors_new jsonb DEFAULT '[]';

-- If you have existing competitors data, migrate it with pattern field
UPDATE public.clients
SET competitors_new = 
  CASE 
    WHEN competitors IS NOT NULL THEN
      (SELECT json_agg(
        json_build_object(
          'name', comp->>'name',
          'domain', comp->>'domain', 
          'pattern', COALESCE(comp->>'pattern', comp->>'domain')
        )
      )
      FROM jsonb_array_elements(competitors) AS comp)
    ELSE '[]'::jsonb
  END
WHERE competitors IS NOT NULL;

-- Set all clients to have empty array if null
UPDATE public.clients
SET competitors = '[]'::jsonb
WHERE competitors IS NULL;

-- Drop the temporary column
ALTER TABLE public.clients DROP COLUMN IF EXISTS competitors_new;

-- Example of proper competitor structure
COMMENT ON COLUMN public.clients.competitors IS 'Array of competitor objects: [{name: "Jasper", domain: "jasper.ai", pattern: "jasper.ai"}, ...]';