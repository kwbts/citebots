-- Add the associated_pages column to analysis_queries table
-- This column will store the page analysis data as a JSONB array

ALTER TABLE public.analysis_queries 
ADD COLUMN IF NOT EXISTS associated_pages JSONB DEFAULT '[]'::JSONB;

-- Add an index for better query performance on associated_pages
CREATE INDEX IF NOT EXISTS idx_analysis_queries_associated_pages 
ON public.analysis_queries USING GIN (associated_pages);

-- Add a comment to document what this column is for
COMMENT ON COLUMN public.analysis_queries.associated_pages IS 'Array of page analysis objects linked to this query';

-- Verify the column was added
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analysis_queries'
AND column_name = 'associated_pages';