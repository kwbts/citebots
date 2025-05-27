-- Fix timeout issues for long-running analysis operations

-- 1. Increase statement timeout for service role (used by Edge Functions)
-- This allows longer database operations for our analysis processing
ALTER ROLE service_role SET statement_timeout = '300s'; -- 5 minutes

-- 2. Create a dedicated role for long-running operations (optional)
-- This is safer than modifying the global service_role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analysis_processor') THEN
    CREATE ROLE analysis_processor;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO analysis_processor;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO analysis_processor;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO analysis_processor;
    
    -- Set longer timeout for this specific role
    ALTER ROLE analysis_processor SET statement_timeout = '600s'; -- 10 minutes
  END IF;
END $$;

-- 3. Optimize the claim_queue_batch function to be faster
-- Current function might be slow with large queue tables
CREATE OR REPLACE FUNCTION claim_queue_batch_optimized(
  p_batch_size INT DEFAULT 10,
  p_processor_id TEXT DEFAULT NULL
)
RETURNS SETOF analysis_queue
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use a more efficient query with better locking
  RETURN QUERY
  WITH claimed AS (
    SELECT q.id
    FROM analysis_queue q
    WHERE q.status = 'pending'
      AND q.attempts < q.max_attempts
      AND q.created_at > NOW() - INTERVAL '24 hours' -- Only process recent items
    ORDER BY q.priority DESC NULLS LAST, q.created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE analysis_queue q
  SET 
    status = 'processing',
    started_at = NOW(),
    attempts = q.attempts + 1,
    updated_at = NOW(),
    processor_id = COALESCE(p_processor_id, gen_random_uuid()::text)
  FROM claimed
  WHERE q.id = claimed.id
  RETURNING q.*;
END;
$$;

-- 4. Create function to reset stuck items (run this periodically)
CREATE OR REPLACE FUNCTION reset_stuck_queue_items()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  reset_count INT;
BEGIN
  -- Reset items stuck in processing for more than 5 minutes
  UPDATE analysis_queue
  SET 
    status = 'pending',
    processor_id = NULL,
    started_at = NULL,
    error_message = 'Reset due to timeout'
  WHERE status = 'processing'
    AND started_at < NOW() - INTERVAL '5 minutes'
    AND attempts < max_attempts;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$;

-- 5. Create indexes to speed up queue operations
CREATE INDEX IF NOT EXISTS idx_queue_processing_fast 
ON analysis_queue (status, created_at) 
WHERE status = 'pending' AND attempts < max_attempts;

CREATE INDEX IF NOT EXISTS idx_queue_stuck_items 
ON analysis_queue (status, started_at) 
WHERE status = 'processing';

-- 6. Set session timeout for immediate effect (run this in SQL editor)
SET statement_timeout = '300s';