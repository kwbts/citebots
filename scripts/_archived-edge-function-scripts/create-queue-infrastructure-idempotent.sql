-- Queue Infrastructure for Large-Scale Analysis Processing (Idempotent version)
-- This migration adds queue-based processing capabilities while maintaining backward compatibility
-- Safe to run multiple times without errors

-- 1. Create the analysis queue table
CREATE TABLE IF NOT EXISTS analysis_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE CASCADE,
  query_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'idx_queue_status_created' AND conrelid = 'analysis_queue'::regclass
  ) THEN
    ALTER TABLE analysis_queue
    ADD CONSTRAINT idx_queue_status_created UNIQUE (status, created_at, id);
  END IF;
END
$$;

-- Create indexes for efficient queue operations
CREATE INDEX IF NOT EXISTS idx_queue_analysis_run ON analysis_queue(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON analysis_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON analysis_queue(created_at);

-- 2. Add processing method to analysis_runs
ALTER TABLE analysis_runs 
ADD COLUMN IF NOT EXISTS processing_method TEXT DEFAULT 'sync';

-- Add constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'analysis_runs_processing_method_check' AND conrelid = 'analysis_runs'::regclass
  ) THEN
    ALTER TABLE analysis_runs 
    ADD CONSTRAINT analysis_runs_processing_method_check CHECK (processing_method IN ('sync', 'queue'));
  END IF;
END
$$;

-- Add queue progress tracking columns
ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS queries_queued INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS queries_processing INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS queries_failed INT DEFAULT 0;

-- 3. Create RPC function for claiming queue batches atomically
CREATE OR REPLACE FUNCTION claim_queue_batch(
  p_batch_size INT DEFAULT 5,
  p_processor_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  analysis_run_id UUID,
  query_data JSONB,
  attempts INT
)
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
    attempts = attempts + 1
  FROM claimed
  WHERE q.id = claimed.id
  RETURNING q.id, q.analysis_run_id, q.query_data, q.attempts;
END;
$$;

-- 4. Create function to handle failed queue items
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
  v_new_status TEXT;
BEGIN
  -- Get current attempt count
  SELECT attempts, max_attempts
  INTO v_attempts, v_max_attempts
  FROM analysis_queue
  WHERE id = p_queue_id;
  
  -- Determine new status
  IF v_attempts >= v_max_attempts THEN
    v_new_status := 'failed';
  ELSE
    v_new_status := 'pending'; -- Will be retried
  END IF;
  
  -- Update queue item
  UPDATE analysis_queue
  SET 
    status = v_new_status,
    error_message = p_error_message,
    error_details = p_error_details,
    completed_at = CASE WHEN v_new_status = 'failed' THEN NOW() ELSE NULL END
  WHERE id = p_queue_id;
  
  -- Update analysis run failed count if final failure
  IF v_new_status = 'failed' THEN
    UPDATE analysis_runs
    SET queries_failed = queries_failed + 1
    WHERE id = (SELECT analysis_run_id FROM analysis_queue WHERE id = p_queue_id);
  END IF;
END;
$$;

-- 5. Create function to update queue progress
CREATE OR REPLACE FUNCTION update_queue_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update counts based on status change
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE analysis_runs
    SET 
      queries_queued = (
        SELECT COUNT(*) FROM analysis_queue 
        WHERE analysis_run_id = NEW.analysis_run_id AND status = 'pending'
      ),
      queries_processing = (
        SELECT COUNT(*) FROM analysis_queue 
        WHERE analysis_run_id = NEW.analysis_run_id AND status = 'processing'
      ),
      queries_failed = (
        SELECT COUNT(*) FROM analysis_queue 
        WHERE analysis_run_id = NEW.analysis_run_id AND status = 'failed'
      ),
      queries_completed = (
        SELECT COUNT(*) FROM analysis_queue 
        WHERE analysis_run_id = NEW.analysis_run_id AND status = 'completed'
      )
    WHERE id = NEW.analysis_run_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_queue_progress_trigger ON analysis_queue;
CREATE TRIGGER update_queue_progress_trigger
AFTER UPDATE OF status ON analysis_queue
FOR EACH ROW
EXECUTE FUNCTION update_queue_progress();

-- 6. Create view for queue monitoring
CREATE OR REPLACE VIEW queue_status AS
SELECT 
  ar.id as analysis_run_id,
  ar.client_id,
  ar.platform,
  ar.processing_method,
  ar.queries_total,
  ar.queries_completed,
  ar.queries_queued,
  ar.queries_processing,
  ar.queries_failed,
  ar.created_at,
  CASE 
    WHEN ar.queries_total > 0 THEN 
      ROUND((ar.queries_completed::NUMERIC / ar.queries_total) * 100, 2)
    ELSE 0 
  END as progress_percentage,
  COUNT(DISTINCT aq.id) FILTER (WHERE aq.status = 'pending') as pending_count,
  COUNT(DISTINCT aq.id) FILTER (WHERE aq.status = 'processing') as processing_count,
  COUNT(DISTINCT aq.id) FILTER (WHERE aq.status = 'completed') as completed_count,
  COUNT(DISTINCT aq.id) FILTER (WHERE aq.status = 'failed') as failed_count,
  MIN(aq.created_at) FILTER (WHERE aq.status = 'pending') as oldest_pending_at,
  MAX(aq.completed_at) FILTER (WHERE aq.status = 'completed') as latest_completed_at
FROM analysis_runs ar
LEFT JOIN analysis_queue aq ON ar.id = aq.analysis_run_id
WHERE ar.processing_method = 'queue'
GROUP BY ar.id;

-- 7. Add RLS policies for queue table - only if they don't exist
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_queue' AND policyname = 'Service role has full access to queue'
  ) THEN
    CREATE POLICY "Service role has full access to queue"
    ON analysis_queue
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END
$$;

-- Authenticated users can view their own queue items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_queue' AND policyname = 'Users can view their own queue items'
  ) THEN
    CREATE POLICY "Users can view their own queue items"
    ON analysis_queue
    FOR SELECT
    TO authenticated
    USING (
      analysis_run_id IN (
        SELECT id FROM analysis_runs 
        WHERE created_by = auth.uid()
      )
    );
  END IF;
END
$$;

-- Add helpful comments
COMMENT ON TABLE analysis_queue IS 'Queue for processing analysis queries asynchronously';
COMMENT ON COLUMN analysis_queue.query_data IS 'JSONB containing query_text, keyword, intent, platform, client data';
COMMENT ON COLUMN analysis_queue.status IS 'Queue item status: pending, processing, completed, failed, cancelled';
COMMENT ON FUNCTION claim_queue_batch IS 'Atomically claim a batch of queue items for processing';
COMMENT ON VIEW queue_status IS 'Real-time view of queue processing status by analysis run';