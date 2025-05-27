-- Debug frontend synchronization issues

-- 1. Check actual current status vs what frontend might be showing
SELECT 
  ar.id,
  ar.batch_id,
  ar.status as run_status,
  ar.queries_total,
  ar.queries_completed,
  ar.queries_queued,
  ar.queries_processing,
  ar.queries_failed,
  ar.updated_at,
  CASE 
    WHEN ar.queries_completed = ar.queries_total THEN 'SHOULD_BE_COMPLETE'
    WHEN ar.queries_completed + ar.queries_failed = ar.queries_total THEN 'SHOULD_BE_COMPLETE_WITH_FAILURES'
    WHEN ar.queries_processing = 0 AND ar.queries_queued = 0 AND ar.queries_completed < ar.queries_total THEN 'STALLED'
    ELSE 'PROCESSING'
  END as actual_status
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '3 hours'
ORDER BY ar.created_at DESC;

-- response

[
  {
    "id": "8ba19de6-40c2-41f4-ae08-6cc2e4472af9",
    "batch_id": "custom_both_1748041811020",
    "run_status": "queued",
    "queries_total": 12,
    "queries_completed": 0,
    "queries_queued": 0,
    "queries_processing": 0,
    "queries_failed": 0,
    "updated_at": "2025-05-23 23:10:12.009273+00",
    "actual_status": "STALLED"
  },
  {
    "id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "batch_id": "custom_both_1748041134121",
    "run_status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "queries_queued": 15,
    "queries_processing": 0,
    "queries_failed": 0,
    "updated_at": "2025-05-23 23:07:59.131108+00",
    "actual_status": "PROCESSING"
  },
  {
    "id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "batch_id": "custom_both_1748040984094",
    "run_status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "queries_queued": 15,
    "queries_processing": 0,
    "queries_failed": 0,
    "updated_at": "2025-05-23 23:07:59.131108+00",
    "actual_status": "PROCESSING"
  }
]

-- 2. Check if queue counts match reality
SELECT 
  aq.analysis_run_id,
  COUNT(*) as total_queue_items,
  COUNT(CASE WHEN aq.status = 'completed' THEN 1 END) as actual_completed,
  COUNT(CASE WHEN aq.status = 'processing' THEN 1 END) as actual_processing,
  COUNT(CASE WHEN aq.status = 'pending' THEN 1 END) as actual_pending,
  COUNT(CASE WHEN aq.status = 'failed' THEN 1 END) as actual_failed,
  -- Compare with analysis_runs table
  ar.queries_completed as reported_completed,
  ar.queries_processing as reported_processing,
  ar.queries_queued as reported_pending,
  ar.queries_failed as reported_failed
FROM analysis_queue aq
JOIN analysis_runs ar ON aq.analysis_run_id = ar.id
WHERE ar.created_at > NOW() - INTERVAL '3 hours'
GROUP BY aq.analysis_run_id, ar.queries_completed, ar.queries_processing, ar.queries_queued, ar.queries_failed
ORDER BY aq.analysis_run_id;

-- response

[
  {
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "total_queue_items": 24,
    "actual_completed": 9,
    "actual_processing": 0,
    "actual_pending": 15,
    "actual_failed": 0,
    "reported_completed": 9,
    "reported_processing": 0,
    "reported_pending": 15,
    "reported_failed": 0
  },
  {
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "total_queue_items": 24,
    "actual_completed": 9,
    "actual_processing": 0,
    "actual_pending": 15,
    "actual_failed": 0,
    "reported_completed": 9,
    "reported_processing": 0,
    "reported_pending": 15,
    "reported_failed": 0
  },
  {
    "analysis_run_id": "8ba19de6-40c2-41f4-ae08-6cc2e4472af9",
    "total_queue_items": 12,
    "actual_completed": 0,
    "actual_processing": 0,
    "actual_pending": 12,
    "actual_failed": 0,
    "reported_completed": 0,
    "reported_processing": 0,
    "reported_pending": 0,
    "reported_failed": 0
  }
]

-- 3. Check for completed analysis_queries (the main results table)
SELECT 
  aq.analysis_run_id,
  COUNT(*) as total_analysis_queries,
  COUNT(CASE WHEN aq.status = 'completed' THEN 1 END) as completed_queries,
  COUNT(CASE WHEN aq.status = 'failed' THEN 1 END) as failed_queries,
  COUNT(CASE WHEN aq.status = 'pending' THEN 1 END) as pending_queries,
  MIN(aq.created_at) as first_query,
  MAX(aq.completed_at) as last_completed
FROM analysis_queries aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '3 hours'
)
GROUP BY aq.analysis_run_id
ORDER BY aq.analysis_run_id;

-- response

[
  {
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "total_analysis_queries": 11,
    "completed_queries": 11,
    "failed_queries": 0,
    "pending_queries": 0,
    "first_query": "2025-05-23 22:56:26.518574+00",
    "last_completed": "2025-05-23 22:59:29.817+00"
  },
  {
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "total_analysis_queries": 11,
    "completed_queries": 10,
    "failed_queries": 0,
    "pending_queries": 1,
    "first_query": "2025-05-23 22:58:56.333764+00",
    "last_completed": "2025-05-23 23:02:14.061+00"
  }
]

-- 4. Check if analysis_runs status needs to be updated
SELECT 
  ar.id,
  ar.status as current_status,
  COUNT(aq_queue.id) as queue_items,
  COUNT(CASE WHEN aq_queue.status = 'completed' THEN 1 END) as queue_completed,
  COUNT(CASE WHEN aq_queue.status = 'failed' THEN 1 END) as queue_failed,
  COUNT(aq_results.id) as result_items,
  COUNT(CASE WHEN aq_results.status = 'completed' THEN 1 END) as results_completed,
  CASE 
    WHEN COUNT(CASE WHEN aq_queue.status = 'completed' THEN 1 END) + 
         COUNT(CASE WHEN aq_queue.status = 'failed' THEN 1 END) = 
         COUNT(aq_queue.id) AND ar.status != 'completed'
    THEN 'NEEDS_STATUS_UPDATE'
    ELSE 'STATUS_OK'
  END as status_check
FROM analysis_runs ar
LEFT JOIN analysis_queue aq_queue ON ar.id = aq_queue.analysis_run_id
LEFT JOIN analysis_queries aq_results ON ar.id = aq_results.analysis_run_id
WHERE ar.created_at > NOW() - INTERVAL '3 hours'
GROUP BY ar.id, ar.status
ORDER BY ar.created_at DESC;

-- response 

[
  {
    "id": "8ba19de6-40c2-41f4-ae08-6cc2e4472af9",
    "current_status": "queued",
    "queue_items": 12,
    "queue_completed": 0,
    "queue_failed": 0,
    "result_items": 0,
    "results_completed": 0,
    "status_check": "STATUS_OK"
  },
  {
    "id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "current_status": "running",
    "queue_items": 264,
    "queue_completed": 99,
    "queue_failed": 0,
    "result_items": 264,
    "results_completed": 240,
    "status_check": "STATUS_OK"
  },
  {
    "id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "current_status": "running",
    "queue_items": 264,
    "queue_completed": 99,
    "queue_failed": 0,
    "result_items": 264,
    "results_completed": 264,
    "status_check": "STATUS_OK"
  }
]

-- 5. Fix any runs that should be marked complete
UPDATE analysis_runs 
SET 
  status = 'completed',
  completed_at = NOW(),
  updated_at = NOW()
WHERE id IN (
  SELECT ar.id 
  FROM analysis_runs ar
  JOIN (
    SELECT 
      aq.analysis_run_id,
      COUNT(*) as total,
      COUNT(CASE WHEN aq.status IN ('completed', 'failed') THEN 1 END) as finished
    FROM analysis_queue aq
    GROUP BY aq.analysis_run_id
  ) queue_summary ON ar.id = queue_summary.analysis_run_id
  WHERE ar.status != 'completed'
    AND queue_summary.finished = queue_summary.total
    AND ar.created_at > NOW() - INTERVAL '3 hours'
);

-- 6. Check what the frontend query would see
-- This simulates what the frontend dashboard query might be returning
SELECT 
  ar.id,
  ar.status,
  ar.queries_total,
  ar.queries_completed,
  ar.created_at,
  ar.updated_at,
  -- Check if there are any actual results to display
  COUNT(aq.id) as analysis_results_count,
  COUNT(CASE WHEN aq.status = 'completed' THEN 1 END) as completed_results
FROM analysis_runs ar
LEFT JOIN analysis_queries aq ON ar.id = aq.analysis_run_id
WHERE ar.created_at > NOW() - INTERVAL '3 hours'
GROUP BY ar.id, ar.status, ar.queries_total, ar.queries_completed, ar.created_at, ar.updated_at
ORDER BY ar.created_at DESC;

-- response 

[
  {
    "id": "8ba19de6-40c2-41f4-ae08-6cc2e4472af9",
    "status": "queued",
    "queries_total": 12,
    "queries_completed": 0,
    "created_at": "2025-05-23 23:10:11.058842+00",
    "updated_at": "2025-05-23 23:10:12.009273+00",
    "analysis_results_count": 0,
    "completed_results": 0
  },
  {
    "id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "created_at": "2025-05-23 22:58:54.157054+00",
    "updated_at": "2025-05-23 23:07:59.131108+00",
    "analysis_results_count": 11,
    "completed_results": 10
  },
  {
    "id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "created_at": "2025-05-23 22:56:24.218782+00",
    "updated_at": "2025-05-23 23:07:59.131108+00",
    "analysis_results_count": 11,
    "completed_results": 11
  }
]