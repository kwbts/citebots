-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS claim_queue_batch(INT, TEXT);

-- Add claim_queue_batch function to match what the worker expects
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
    ORDER BY q.priority DESC, q.created_at
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