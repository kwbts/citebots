-- Add processor_id column to analysis_queue table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'analysis_queue'
          AND column_name = 'processor_id'
    ) THEN
        -- Add the column
        ALTER TABLE analysis_queue ADD COLUMN processor_id TEXT;
        
        -- Comment to explain the purpose
        COMMENT ON COLUMN analysis_queue.processor_id IS 'ID of the worker process that claimed this queue item';
    END IF;
END
$$;