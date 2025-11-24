-- Migration: Add analysis_type column to support query-only vs comprehensive analysis
-- Created: 2025-01-04
-- Purpose: Allow users to choose between fast query-only analysis or full comprehensive analysis with web scraping

-- Add analysis_type column
ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS analysis_type TEXT NOT NULL DEFAULT 'comprehensive';

-- Add check constraint to ensure only valid values
ALTER TABLE analysis_runs
DROP CONSTRAINT IF EXISTS analysis_runs_type_check;

ALTER TABLE analysis_runs
ADD CONSTRAINT analysis_runs_type_check
CHECK (analysis_type IN ('query-only', 'comprehensive'));

-- Create index for efficient filtering by analysis type
CREATE INDEX IF NOT EXISTS idx_analysis_runs_type ON analysis_runs(analysis_type);

-- Add cost tracking columns for financial analysis
ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_api_calls DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_scraping DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_total DECIMAL(10,2) DEFAULT 0.00;

-- Add comment to document the column
COMMENT ON COLUMN analysis_runs.analysis_type IS 'Type of analysis: query-only (fast, no web scraping) or comprehensive (full SEO analysis with page scraping)';
COMMENT ON COLUMN analysis_runs.cost_api_calls IS 'Cost of API calls (OpenAI, Perplexity, etc.) in USD';
COMMENT ON COLUMN analysis_runs.cost_scraping IS 'Cost of web scraping (ScrapingBee) in USD';
COMMENT ON COLUMN analysis_runs.cost_total IS 'Total cost of analysis in USD';

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'analysis_runs'
AND column_name IN ('analysis_type', 'cost_api_calls', 'cost_scraping', 'cost_total');
