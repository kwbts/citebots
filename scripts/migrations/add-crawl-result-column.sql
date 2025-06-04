-- Add crawl_result JSONB column to page_analyses table

-- First check if the column already exists to make it idempotent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'page_analyses' 
        AND column_name = 'crawl_result'
    ) THEN
        -- Add the crawl_result column
        ALTER TABLE page_analyses 
        ADD COLUMN crawl_result JSONB;
        
        RAISE NOTICE 'Added crawl_result column to page_analyses table';
    ELSE
        RAISE NOTICE 'crawl_result column already exists in page_analyses table';
    END IF;
END $$;

-- Add comment to the column for documentation
COMMENT ON COLUMN page_analyses.crawl_result IS 'Contains HTTP status code, success flag, and other data about the crawl operation';

-- Make sure crawl_result is included in RLS policies
-- Verify that page_analyses table has RLS enabled
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE tablename = 'page_analyses' 
        AND rowsecurity = true
    ) THEN
        -- Re-create any policies to ensure they cover the new column
        -- This assumes the existing policy is for enabling read access to the right users
        -- You may need to adjust this based on your actual RLS policies
        RAISE NOTICE 'The page_analyses table has RLS enabled. Please ensure policies include the new crawl_result column.';
    END IF;
END $$;

-- Output success message
SELECT 'Successfully added crawl_result column to page_analyses table' as result;