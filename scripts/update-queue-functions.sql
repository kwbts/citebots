-- First drop the existing functions
DROP FUNCTION IF EXISTS claim_queue_batch(INT, TEXT);
DROP FUNCTION IF EXISTS dequeue_analysis_items(INT);

-- Create improved claim_queue_batch function
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
      AND (q.attempts < q.max_attempts OR q.attempts IS NULL)
    ORDER BY q.created_at
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE analysis_queue q
  SET 
    status = 'processing',
    started_at = NOW(),
    attempts = COALESCE(q.attempts, 0) + 1,
    updated_at = NOW(),
    processor_id = p_processor_id
  FROM claimed
  WHERE q.id = claimed.id
  RETURNING q.*;
END;
$$;

-- Create dequeue_analysis_items function as an alias for claim_queue_batch
CREATE OR REPLACE FUNCTION dequeue_analysis_items(p_batch_size INT DEFAULT 10)
RETURNS SETOF analysis_queue
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM claim_queue_batch(p_batch_size, NULL);
END;
$$;

-- Create or replace handle_queue_failure function 
CREATE OR REPLACE FUNCTION handle_queue_failure(
  p_queue_id UUID,
  p_error_message TEXT,
  p_error_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_attempts INT;
  v_max_attempts INT;
BEGIN
  -- Get current attempts and max_attempts
  SELECT COALESCE(attempts, 0), COALESCE(max_attempts, 3)
  INTO v_attempts, v_max_attempts
  FROM analysis_queue
  WHERE id = p_queue_id;
  
  -- Update the record
  UPDATE analysis_queue
  SET
    status = CASE
      WHEN v_attempts >= v_max_attempts THEN 'failed'
      ELSE 'pending'
    END,
    error = p_error_message,
    error_details = p_error_details,
    updated_at = NOW()
  WHERE id = p_queue_id;
END;
$$;