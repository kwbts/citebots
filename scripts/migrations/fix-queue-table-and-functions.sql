-- Comprehensive fix for queue table and functions

-- 1. Fix the analysis_queue table - add missing columns
DO $$
BEGIN
    -- Add processor_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'analysis_queue' 
        AND column_name = 'processor_id'
    ) THEN
        ALTER TABLE analysis_queue ADD COLUMN processor_id TEXT;
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
END
$$;

-- 2. Drop the problematic functions
DROP FUNCTION IF EXISTS claim_queue_batch(INT, TEXT);
DROP FUNCTION IF EXISTS dequeue_analysis_items(INT);

-- 3. Create fixed claim_queue_batch function
CREATE OR REPLACE FUNCTION claim_queue_batch(
  p_batch_size INT DEFAULT 10,
  p_processor_id TEXT DEFAULT NULL
)
RETURNS SETOF analysis_queue
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atomically claim a batch of pending items
  RETURN QUERY
  WITH claimed AS (
    SELECT q.id
    FROM analysis_queue q
    WHERE q.status = 'pending'
      AND q.attempts < q.max_attempts
    ORDER BY q.created_at  -- Use only created_at, not priority
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE analysis_queue q
  SET 
    status = 'processing',
    started_at = NOW(),
    attempts = q.attempts + 1,  -- Properly qualify attempts column
    updated_at = NOW(),
    processor_id = p_processor_id  -- Track which worker claimed this item
  FROM claimed
  WHERE q.id = claimed.id
  RETURNING q.*;  -- Return all columns
END;
$$;

-- 4. Create dequeue_analysis_items function as an alias for claim_queue_batch
CREATE OR REPLACE FUNCTION dequeue_analysis_items(p_batch_size INT DEFAULT 10)
RETURNS SETOF analysis_queue
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM claim_queue_batch(p_batch_size, NULL);
END;
$$;