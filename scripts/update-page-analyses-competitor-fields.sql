-- First, ensure the brand_mentioned column exists
ALTER TABLE public.page_analyses 
ADD COLUMN IF NOT EXISTS brand_mentioned boolean DEFAULT false;

-- Add competitor analysis fields to page_analyses table
ALTER TABLE public.page_analyses 
ADD COLUMN IF NOT EXISTS competitor_analysis jsonb,
ADD COLUMN IF NOT EXISTS competitor_names text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_context text,
ADD COLUMN IF NOT EXISTS competitor_context text;

-- Add indexes for competitor queries
CREATE INDEX IF NOT EXISTS idx_page_analyses_competitor_names 
ON public.page_analyses USING GIN (competitor_names);

CREATE INDEX IF NOT EXISTS idx_page_analyses_brand_mentioned 
ON public.page_analyses(brand_mentioned);

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.page_competitor_insights CASCADE;

-- Create a view for page competitor insights
CREATE VIEW public.page_competitor_insights AS
SELECT 
    pa.query_id,
    pa.citation_url,
    pa.page_title,
    pa.brand_mentioned,
    pa.brand_mention_count,
    pa.brand_in_title,
    pa.competitor_mentioned,
    pa.competitor_names,
    pa.competitor_analysis,
    pa.brand_context,
    pa.competitor_context,
    pa.relevance_score,
    pa.content_quality_score,
    aq.query_text,
    aq.query_keyword,
    aq.query_intent
FROM 
    public.page_analyses pa
    JOIN public.analysis_queries aq ON pa.query_id = aq.id
WHERE 
    pa.competitor_mentioned = true OR pa.brand_mentioned = true;

-- Grant permissions
ALTER VIEW public.page_competitor_insights OWNER TO postgres;
GRANT SELECT ON public.page_competitor_insights TO authenticated;
GRANT SELECT ON public.page_competitor_insights TO anon;