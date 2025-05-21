-- Add all missing columns to the analysis_queue table
DO $$
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;
    
    -- Add processor_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'processor_id'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN processor_id TEXT;
    END IF;
    
    -- Add completed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
    
    -- Add started_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'started_at'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN started_at TIMESTAMPTZ;
    END IF;
    
    -- Add error column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'error'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN error TEXT;
    END IF;
    
    -- Add error_details column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'error_details'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN error_details JSONB;
    END IF;
    
    -- Add result column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'result'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN result JSONB;
    END IF;
END
$$;