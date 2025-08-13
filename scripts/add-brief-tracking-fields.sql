-- Add tracking fields to content_briefs table
-- This script adds new fields for monitoring brief generation performance and quality

-- Check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_briefs') THEN
    RAISE EXCEPTION 'Table content_briefs does not exist';
  END IF;
END
$$;

-- 1. Processing metrics for tracking timing and resource usage
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS processing_metrics JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.processing_metrics IS 
'Tracks performance metrics like timing and resource usage during brief generation:
{
  "total_processing_time_ms": 120000,
  "query_generation_time_ms": 5000,
  "llm_research_time_ms": 45000,
  "web_scraping_time_ms": 30000,
  "content_analysis_time_ms": 25000,
  "brief_assembly_time_ms": 15000,
  "urls_processed": 25,
  "total_tokens_used": 15000
}';

-- 2. Source attribution to track where information comes from
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS source_attribution JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.source_attribution IS 
'Tracks the sources of information used in the brief:
{
  "chatgpt_citations": 12,
  "perplexity_citations": 8,
  "google_search_results": 15,
  "primary_urls": 10,
  "secondary_urls": 15,
  "competitor_urls": 5,
  "citation_domains": ["example.com", "competitor.com", "research.org"]
}';

-- 3. AI model usage to track which models contributed
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS ai_models_used JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.ai_models_used IS 
'Tracks AI models used during brief generation:
{
  "claude": {
    "model_version": "claude-sonnet-4-20250514",
    "usage": "insight_generation",
    "tokens_used": 5000
  },
  "gpt": {
    "model_version": "gpt-4o",
    "usage": "content_analysis",
    "tokens_used": 8000
  },
  "perplexity": {
    "model_version": "llama-3-70b-online",
    "usage": "research",
    "tokens_used": 2000
  }
}';

-- 4. Quality metrics to assess brief output quality
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.quality_metrics IS 
'Metrics to assess the quality of the generated brief:
{
  "statistics_count": 15,
  "expert_quotes_count": 5,
  "citation_count": 20,
  "competitor_insight_count": 8,
  "toc_sections_count": 6,
  "research_links_count": 12,
  "word_count": 2500,
  "claude_enhanced": true
}';

-- 5. Enhanced client context tracking
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS client_context JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.client_context IS 
'Enhanced client data used for brief generation:
{
  "market_position": "leader|challenger|niche",
  "differentiators": ["unique technology", "industry expertise"],
  "competitors_analyzed": ["competitor1.com", "competitor2.com"],
  "industry_context": "specific industry insights used"
}';

-- Index for faster queries on these new JSONB fields
CREATE INDEX IF NOT EXISTS idx_content_briefs_quality_metrics ON content_briefs USING GIN (quality_metrics);
CREATE INDEX IF NOT EXISTS idx_content_briefs_ai_models_used ON content_briefs USING GIN (ai_models_used);

-- Output confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added tracking fields to content_briefs table';
END
$$;