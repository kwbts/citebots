-- add-eeat-analysis-column.sql
-- Adds the eeat_analysis column to the page_analyses table
-- This column stores the detailed EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) analysis

-- First check if the column already exists to make this script idempotent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'page_analyses'
        AND column_name = 'eeat_analysis'
    ) THEN
        -- Add the eeat_analysis column as a JSONB type to store the structured EEAT analysis data
        ALTER TABLE page_analyses 
        ADD COLUMN eeat_analysis JSONB;
        
        -- Add a comment to the column to document its purpose
        COMMENT ON COLUMN page_analyses.eeat_analysis IS 
        'Detailed analysis of Experience, Expertise, Authoritativeness, and Trustworthiness signals';
        
        RAISE NOTICE 'Added eeat_analysis column to page_analyses table';
    ELSE
        RAISE NOTICE 'eeat_analysis column already exists in page_analyses table';
    END IF;
END
$$;

-- Add the eeat_score column if it doesn't exist (for easy querying)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'page_analyses'
        AND column_name = 'eeat_score'
    ) THEN
        -- Add the eeat_score column as a numeric type for direct querying
        ALTER TABLE page_analyses 
        ADD COLUMN eeat_score NUMERIC;
        
        -- Add a comment to the column to document its purpose
        COMMENT ON COLUMN page_analyses.eeat_score IS 
        'Overall EEAT score (1-10) summarizing Experience, Expertise, Authoritativeness, and Trustworthiness';
        
        RAISE NOTICE 'Added eeat_score column to page_analyses table';
    ELSE
        RAISE NOTICE 'eeat_score column already exists in page_analyses table';
    END IF;
END
$$;