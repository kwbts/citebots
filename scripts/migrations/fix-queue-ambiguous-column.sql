-- Fix for ambiguous 'attempts' column reference in dequeue_analysis_items function
CREATE OR REPLACE FUNCTION dequeue_analysis_items(p_batch_size INT DEFAULT 10)
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
    ORDER BY q.created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE analysis_queue q
  SET 
    status = 'processing',
    started_at = NOW(),
    attempts = q.attempts + 1  -- Fix: Properly qualify 'attempts' column with table alias
  FROM claimed
  WHERE q.id = claimed.id
  RETURNING q.*;  -- Return all columns for clarity
END;
$$;