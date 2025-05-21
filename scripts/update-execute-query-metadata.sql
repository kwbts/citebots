-- Add new columns to analysis_queries table for enhanced metadata
ALTER TABLE public.analysis_queries 
ADD COLUMN IF NOT EXISTS content_depth TEXT,
ADD COLUMN IF NOT EXISTS commercial_intent TEXT,
ADD COLUMN IF NOT EXISTS brand_relevance TEXT,
ADD COLUMN IF NOT EXISTS user_sophistication TEXT,
ADD COLUMN IF NOT EXISTS urgency_level TEXT,
ADD COLUMN IF NOT EXISTS solution_focus TEXT,
ADD COLUMN IF NOT EXISTS industry_specificity TEXT,
ADD COLUMN IF NOT EXISTS geographic_relevance TEXT,
ADD COLUMN IF NOT EXISTS temporal_context TEXT,
ADD COLUMN IF NOT EXISTS overall_competitive_landscape TEXT,
ADD COLUMN IF NOT EXISTS recommendation_strength TEXT,
ADD COLUMN IF NOT EXISTS market_positioning TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_analysis_queries_content_depth ON public.analysis_queries(content_depth);
CREATE INDEX IF NOT EXISTS idx_analysis_queries_commercial_intent ON public.analysis_queries(commercial_intent);
CREATE INDEX IF NOT EXISTS idx_analysis_queries_brand_relevance ON public.analysis_queries(brand_relevance);

-- Add comments to document the new fields
COMMENT ON COLUMN public.analysis_queries.content_depth IS 'Depth of content analysis: surface/moderate/deep/expert';
COMMENT ON COLUMN public.analysis_queries.commercial_intent IS 'Commercial intent level: none/low/medium/high/immediate';
COMMENT ON COLUMN public.analysis_queries.brand_relevance IS 'Brand relevance in response: central/mentioned/tangential/absent';
COMMENT ON COLUMN public.analysis_queries.user_sophistication IS 'User sophistication level: novice/intermediate/advanced/expert';
COMMENT ON COLUMN public.analysis_queries.urgency_level IS 'Query urgency: none/low/medium/high/critical';
COMMENT ON COLUMN public.analysis_queries.solution_focus IS 'Solution focus: problem/solution/comparison/education';
COMMENT ON COLUMN public.analysis_queries.industry_specificity IS 'Industry specificity: general/industry-specific/niche';
COMMENT ON COLUMN public.analysis_queries.geographic_relevance IS 'Geographic relevance: global/regional/local/none';
COMMENT ON COLUMN public.analysis_queries.temporal_context IS 'Temporal context: current/trending/evergreen/historical';
COMMENT ON COLUMN public.analysis_queries.overall_competitive_landscape IS 'Competitive landscape: brand-favorable/competitor-favorable/neutral/mixed';
COMMENT ON COLUMN public.analysis_queries.recommendation_strength IS 'Recommendation strength: strong/moderate/weak/none';
COMMENT ON COLUMN public.analysis_queries.market_positioning IS 'Market positioning: leader/challenger/niche/unclear';