-- Add flat fields to analysis_queue table for direct access
-- This script adds the flat fields needed by the updated process-queue-worker
-- while maintaining backward compatibility

DO $$
BEGIN
    -- Add query_text column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'query_text'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN query_text TEXT;
        RAISE NOTICE 'Added query_text column';
    END IF;
    
    -- Add platform column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'platform'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN platform TEXT;
        RAISE NOTICE 'Added platform column';
    END IF;
    
    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'client_id'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN client_id UUID;
        RAISE NOTICE 'Added client_id column';
    END IF;
    
    -- Add client_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'client_name'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN client_name TEXT;
        RAISE NOTICE 'Added client_name column';
    END IF;
    
    -- Add client_domain column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'client_domain'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN client_domain TEXT;
        RAISE NOTICE 'Added client_domain column';
    END IF;
    
    -- Add competitors column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'competitors'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN competitors JSONB;
        RAISE NOTICE 'Added competitors column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
    
    -- Add processor_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'processor_id'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN processor_id TEXT;
        RAISE NOTICE 'Added processor_id column';
    END IF;
END
$$;

-- Populate flat fields from query_data for existing queue items
UPDATE analysis_queue
SET 
  query_text = query_data->>'query_text',
  platform = query_data->>'platform',
  client_id = (query_data->'client'->>'id')::UUID,
  client_name = query_data->'client'->>'name',
  client_domain = query_data->'client'->>'domain',
  competitors = query_data->'client'->'competitors'
WHERE 
  query_text IS NULL 
  AND query_data IS NOT NULL
  AND query_data ? 'query_text';

-- Add an index on the commonly queried status field
CREATE INDEX IF NOT EXISTS idx_queue_status_processing ON analysis_queue(status) WHERE status = 'processing';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Queue table updates completed successfully';
END
$$;