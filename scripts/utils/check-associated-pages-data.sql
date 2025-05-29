-- Check recent queries with associated pages
SELECT 
    id,
    query_text,
    status,
    citation_count,
    associated_pages_count,
    json_array_length(associated_pages) as actual_pages_count,
    associated_pages::text as pages_preview
FROM public.analysis_queries
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 5;

-- Check a specific recent query's associated pages structure
SELECT 
    id,
    query_text,
    jsonb_pretty(associated_pages) as pages_formatted
FROM public.analysis_queries
WHERE associated_pages IS NOT NULL 
    AND jsonb_array_length(associated_pages) > 0
ORDER BY created_at DESC
LIMIT 1;