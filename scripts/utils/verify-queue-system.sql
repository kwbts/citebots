-- Queue System Verification Queries

-- 1. Check if queue table exists and has data
SELECT COUNT(*) as queue_items,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM analysis_queue;

-- 2. Check recent analysis runs with queue method
SELECT id, 
       client_id,
       platform,
       processing_method,
       status,
       queries_total,
       queries_completed,
       queries_queued,
       created_at
FROM analysis_runs
WHERE processing_method = 'queue'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check queue status view
SELECT * FROM queue_status
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check for any failed queue items
SELECT id,
       analysis_run_id,
       status,
       attempts,
       error_message,
       created_at
FROM analysis_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;