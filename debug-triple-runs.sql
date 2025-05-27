-- Debug why multiple analysis runs are being created

-- 1. Check the most recent runs (last 30 minutes)
SELECT 
  ar.id,
  ar.batch_id,
  ar.status,
  ar.queries_total,
  ar.queries_completed,
  ar.created_at,
  ar.processing_method,
  EXTRACT(EPOCH FROM (ar.created_at - LAG(ar.created_at) OVER (ORDER BY ar.created_at))) as seconds_since_previous
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '30 minutes'
ORDER BY ar.created_at DESC;

-- 2. Check for duplicate batch_ids (indicates duplicate submissions)
SELECT 
  batch_id,
  COUNT(*) as run_count,
  array_agg(id ORDER BY created_at) as run_ids,
  array_agg(created_at ORDER BY created_at) as created_times,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as time_span_seconds
FROM analysis_runs 
WHERE created_at > NOW() - INTERVAL '30 minutes'
GROUP BY batch_id
ORDER BY created_at DESC;

-- 3. Check queue status for recent runs
SELECT 
  aq.analysis_run_id,
  aq.status,
  COUNT(*) as count,
  MIN(aq.created_at) as first_item,
  MAX(aq.updated_at) as last_updated,
  MAX(aq.attempts) as max_attempts_used
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '30 minutes'
)
GROUP BY aq.analysis_run_id, aq.status
ORDER BY aq.analysis_run_id, aq.status;

-- 4. Check if queue worker is even claiming items
SELECT 
  aq.id,
  aq.analysis_run_id,
  aq.status,
  aq.attempts,
  aq.processor_id,
  aq.created_at,
  aq.started_at,
  aq.error_message,
  EXTRACT(EPOCH FROM (NOW() - aq.created_at)) as age_seconds
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '30 minutes'
)
AND aq.status = 'pending'
ORDER BY aq.created_at
LIMIT 10;