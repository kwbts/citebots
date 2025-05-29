-- First, let's check what metadata we're actually getting
SELECT 
    id,
    query_text,
    query_category,
    query_topic,
    query_type,
    query_intent,
    funnel_stage,
    query_complexity,
    response_match,
    response_outcome,
    action_orientation,
    query_competition,
    created_at
FROM public.analysis_queries
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;

-- Check if we're getting any non-default values
SELECT 
    query_category,
    query_topic,
    COUNT(*) as count
FROM public.analysis_queries
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query_category, query_topic
ORDER BY count DESC;