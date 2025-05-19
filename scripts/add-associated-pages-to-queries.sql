-- Add associated_pages column to analysis_queries table
-- This column will store the page analyses data as JSONB array
ALTER TABLE analysis_queries 
ADD COLUMN IF NOT EXISTS associated_pages JSONB DEFAULT '[]'::JSONB;

-- Add index for better performance when querying
CREATE INDEX IF NOT EXISTS idx_analysis_queries_associated_pages 
ON analysis_queries USING gin(associated_pages);