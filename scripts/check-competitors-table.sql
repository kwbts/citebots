-- Check the competitors table structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'competitors'
ORDER BY ordinal_position;

-- View some sample data
SELECT * 
FROM public.competitors 
LIMIT 5;

-- See which clients have competitors
SELECT 
    c.id,
    c.name as client_name,
    c.domain,
    COUNT(comp.id) as competitor_count
FROM public.clients c
LEFT JOIN public.competitors comp ON c.id = comp.client_id
GROUP BY c.id, c.name, c.domain
ORDER BY competitor_count DESC
LIMIT 10;