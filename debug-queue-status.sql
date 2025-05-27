-- Debug Queue Processing Issue
-- Run these queries to understand why processing stopped at 50

-- 1. Check recent analysis runs and their status
SELECT 
  ar.id,
  ar.client_id,
  ar.batch_id,
  ar.status,
  ar.platform,
  ar.processing_method,
  ar.queries_total,
  ar.queries_completed,
  ar.queries_queued,
  ar.queries_processing,
  ar.queries_failed,
  ar.created_at,
  ar.updated_at
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '2 hours'
ORDER BY ar.created_at DESC
LIMIT 5;

-- 2. Check queue items for the most recent analysis run
-- (Replace the analysis_run_id with your actual run ID from query above)
SELECT 
  aq.id,
  aq.status,
  aq.attempts,
  aq.max_attempts,
  aq.error_message,
  aq.created_at,
  aq.started_at,
  aq.completed_at,
  aq.processor_id,
  (aq.query_data->>'query_text')::text as query_text,
  (aq.query_data->>'platform')::text as platform
FROM analysis_queue aq
WHERE aq.analysis_run_id = 'YOUR_ANALYSIS_RUN_ID_HERE'
ORDER BY aq.created_at;

-- 3. Summary of queue status by analysis run
SELECT 
  aq.analysis_run_id,
  aq.status,
  COUNT(*) as count,
  MIN(aq.created_at) as first_item,
  MAX(aq.completed_at) as last_completed
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '2 hours'
)
GROUP BY aq.analysis_run_id, aq.status
ORDER BY aq.analysis_run_id, aq.status;

-- 4. Check for items that hit max attempts
SELECT 
  aq.id,
  aq.analysis_run_id,
  aq.attempts,
  aq.max_attempts,
  aq.status,
  aq.error_message,
  (aq.query_data->>'query_text')::text as query_text
FROM analysis_queue aq
WHERE aq.attempts >= aq.max_attempts
  AND aq.analysis_run_id IN (
    SELECT ar.id FROM analysis_runs ar 
    WHERE ar.created_at > NOW() - INTERVAL '2 hours'
  )
ORDER BY aq.created_at;

-- 5. Check error patterns
SELECT 
  aq.error_message,
  COUNT(*) as error_count,
  MAX(aq.updated_at) as last_occurrence
FROM analysis_queue aq
WHERE aq.error_message IS NOT NULL
  AND aq.created_at > NOW() - INTERVAL '2 hours'
GROUP BY aq.error_message
ORDER BY error_count DESC;