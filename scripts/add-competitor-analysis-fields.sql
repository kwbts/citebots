-- Add competitor analysis fields to analysis_queries table
ALTER TABLE public.analysis_queries 
ADD COLUMN IF NOT EXISTS brand_mention_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS competitor_analysis jsonb,
ADD COLUMN IF NOT EXISTS brand_positioning text,
ADD COLUMN IF NOT EXISTS total_competitor_mentions integer DEFAULT 0;

-- Add index for competitor analysis queries
CREATE INDEX IF NOT EXISTS idx_analysis_queries_competitor_context 
ON public.analysis_queries(competitor_context);

CREATE INDEX IF NOT EXISTS idx_analysis_queries_brand_positioning 
ON public.analysis_queries(brand_positioning);

-- Update existing queries to have default values
UPDATE public.analysis_queries 
SET brand_mention_count = 0 
WHERE brand_mention_count IS NULL;

UPDATE public.analysis_queries 
SET total_competitor_mentions = 0 
WHERE total_competitor_mentions IS NULL;

-- Drop existing view if it exists (in case of permission issues)
DROP VIEW IF EXISTS public.competitor_analysis_summary CASCADE;

-- Create a view for competitor analysis summary (fixed version)
-- Note: This view should be owned by the postgres user or service role
CREATE VIEW public.competitor_analysis_summary AS
WITH competitor_names_expanded AS (
    SELECT 
        aq.analysis_run_id,
        ar.client_id,
        c.name as client_name,
        aq.id as query_id,
        aq.brand_mentioned,
        aq.brand_mention_count,
        aq.total_competitor_mentions,
        aq.brand_positioning,
        aq.competitor_context,
        aq.competitor_count,
        unnest(COALESCE(aq.competitor_mentioned_names, '{}')) as competitor_name
    FROM 
        public.analysis_queries aq
        JOIN public.analysis_runs ar ON aq.analysis_run_id = ar.id
        JOIN public.clients c ON ar.client_id = c.id
),
aggregated_competitors AS (
    SELECT 
        analysis_run_id,
        ARRAY_AGG(DISTINCT competitor_name) as all_mentioned_competitors
    FROM 
        competitor_names_expanded
    WHERE 
        competitor_name IS NOT NULL
    GROUP BY 
        analysis_run_id
)
SELECT 
    cne.analysis_run_id,
    cne.client_id,
    cne.client_name,
    COUNT(DISTINCT cne.query_id) as total_queries,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.brand_mentioned = true) as queries_with_brand,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.competitor_count > 0) as queries_with_competitors,
    AVG(cne.brand_mention_count) as avg_brand_mentions,
    AVG(cne.total_competitor_mentions) as avg_competitor_mentions,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.brand_positioning = 'strong') as strong_positioning_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.brand_positioning = 'neutral') as neutral_positioning_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.brand_positioning = 'weak') as weak_positioning_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.competitor_context = 'brand_dominant') as brand_dominant_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.competitor_context = 'equal_mention') as equal_mention_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.competitor_context = 'competitor_dominant') as competitor_dominant_count,
    COUNT(DISTINCT cne.query_id) FILTER (WHERE cne.competitor_context = 'only_competitors') as only_competitors_count,
    COALESCE(ac.all_mentioned_competitors, '{}') as all_mentioned_competitors
FROM 
    competitor_names_expanded cne
    LEFT JOIN aggregated_competitors ac ON cne.analysis_run_id = ac.analysis_run_id
GROUP BY 
    cne.analysis_run_id, cne.client_id, cne.client_name, ac.all_mentioned_competitors;

-- Grant permissions (use proper owner and permissions)
ALTER VIEW public.competitor_analysis_summary OWNER TO postgres;
GRANT SELECT ON public.competitor_analysis_summary TO authenticated;
GRANT SELECT ON public.competitor_analysis_summary TO anon;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_competitor_performance(uuid);

-- Create a function to get competitor performance
CREATE FUNCTION public.get_competitor_performance(p_analysis_run_id uuid)
RETURNS TABLE (
    competitor_name text,
    total_mentions bigint,
    recommendation_mentions bigint,
    featured_mentions bigint,
    mentioned_only bigint,
    avg_sentiment numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH competitor_data AS (
        SELECT 
            jsonb_array_elements(competitor_analysis) as comp_data
        FROM 
            public.analysis_queries
        WHERE 
            analysis_run_id = p_analysis_run_id
            AND competitor_analysis IS NOT NULL
    ),
    expanded_data AS (
        SELECT 
            comp_data->>'name' as competitor_name,
            (comp_data->>'mentions')::integer as mentions,
            comp_data->>'type' as mention_type,
            COALESCE((comp_data->>'sentiment')::numeric, 0) as sentiment
        FROM 
            competitor_data
    )
    SELECT 
        expanded_data.competitor_name,
        COUNT(*) as total_mentions,
        COUNT(*) FILTER (WHERE mention_type = 'recommendation') as recommendation_mentions,
        COUNT(*) FILTER (WHERE mention_type = 'featured') as featured_mentions,
        COUNT(*) FILTER (WHERE mention_type = 'mentioned') as mentioned_only,
        AVG(sentiment) as avg_sentiment
    FROM 
        expanded_data
    GROUP BY 
        expanded_data.competitor_name
    ORDER BY 
        total_mentions DESC;
END;
$$;

-- Grant execute permission
ALTER FUNCTION public.get_competitor_performance(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_competitor_performance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_competitor_performance(uuid) TO anon;