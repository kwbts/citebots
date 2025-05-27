-- Debug timeout issues and database performance

-- 1. Check recent analysis runs and their timing
SELECT 
  ar.id,
  ar.batch_id,
  ar.status,
  ar.queries_total,
  ar.queries_completed,
  ar.created_at,
  ar.updated_at,
  EXTRACT(EPOCH FROM (ar.updated_at - ar.created_at)) / 60 as runtime_minutes,
  CASE 
    WHEN ar.status = 'running' AND ar.updated_at < NOW() - INTERVAL '5 minutes' 
    THEN 'STALLED' 
    ELSE 'ACTIVE' 
  END as health_status
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '1 hour'
ORDER BY ar.created_at DESC;

-- 2. Check for long-running or stuck queue items
SELECT 
  aq.id,
  aq.analysis_run_id,
  aq.status,
  aq.attempts,
  aq.processor_id,
  aq.created_at,
  aq.started_at,
  aq.completed_at,
  CASE 
    WHEN aq.status = 'processing' AND aq.started_at < NOW() - INTERVAL '3 minutes'
    THEN 'TIMEOUT_LIKELY'
    WHEN aq.status = 'pending' AND aq.created_at < NOW() - INTERVAL '10 minutes'
    THEN 'STUCK_PENDING'
    ELSE 'NORMAL'
  END as timeout_status,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(aq.started_at, aq.created_at))) / 60 as age_minutes
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '1 hour'
)
AND (
  aq.status IN ('processing', 'pending') 
  OR aq.completed_at > NOW() - INTERVAL '30 minutes'
)
ORDER BY aq.created_at DESC
LIMIT 20;

-- 3. Check current statement timeout settings
SELECT 
  name, 
  setting, 
  unit,
  source,
  context
FROM pg_settings 
WHERE name LIKE '%timeout%' 
   OR name LIKE '%statement%'
ORDER BY name;

-- Response 

[
  {
    "name": "archive_timeout",
    "setting": "0",
    "unit": "s",
    "source": "default",
    "context": "sighup"
  },
  {
    "name": "authentication_timeout",
    "setting": "60",
    "unit": "s",
    "source": "configuration file",
    "context": "sighup"
  },
  {
    "name": "auto_explain.log_nested_statements",
    "setting": "off",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "checkpoint_timeout",
    "setting": "300",
    "unit": "s",
    "source": "default",
    "context": "sighup"
  },
  {
    "name": "cron.log_statement",
    "setting": "on",
    "unit": null,
    "source": "default",
    "context": "postmaster"
  },
  {
    "name": "deadlock_timeout",
    "setting": "1000",
    "unit": "ms",
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "idle_in_transaction_session_timeout",
    "setting": "0",
    "unit": "ms",
    "source": "default",
    "context": "user"
  },
  {
    "name": "idle_session_timeout",
    "setting": "0",
    "unit": "ms",
    "source": "default",
    "context": "user"
  },
  {
    "name": "lock_timeout",
    "setting": "0",
    "unit": "ms",
    "source": "default",
    "context": "user"
  },
  {
    "name": "log_min_duration_statement",
    "setting": "-1",
    "unit": "ms",
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "log_min_error_statement",
    "setting": "error",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "log_statement",
    "setting": "ddl",
    "unit": null,
    "source": "configuration file",
    "context": "superuser"
  },
  {
    "name": "log_statement_sample_rate",
    "setting": "1",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "log_statement_stats",
    "setting": "off",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "pgaudit.log_statement",
    "setting": "on",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "pgaudit.log_statement_once",
    "setting": "off",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "pg_stat_statements.max",
    "setting": "5000",
    "unit": null,
    "source": "default",
    "context": "postmaster"
  },
  {
    "name": "pg_stat_statements.save",
    "setting": "on",
    "unit": null,
    "source": "default",
    "context": "sighup"
  },
  {
    "name": "pg_stat_statements.track",
    "setting": "top",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "pg_stat_statements.track_planning",
    "setting": "off",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "pg_stat_statements.track_utility",
    "setting": "on",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "plan_filter.statement_cost_limit",
    "setting": "0",
    "unit": null,
    "source": "default",
    "context": "superuser"
  },
  {
    "name": "statement_timeout",
    "setting": "120000",
    "unit": "ms",
    "source": "configuration file",
    "context": "user"
  },
  {
    "name": "tcp_user_timeout",
    "setting": "0",
    "unit": "ms",
    "source": "default",
    "context": "user"
  },
  {
    "name": "wal_receiver_timeout",
    "setting": "60000",
    "unit": "ms",
    "source": "default",
    "context": "sighup"
  },
  {
    "name": "wal_sender_timeout",
    "setting": "60000",
    "unit": "ms",
    "source": "default",
    "context": "user"
  }
]

-- 4. Check for any active long-running queries
SELECT 
  pid,
  state,
  query_start,
  EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds,
  left(query, 100) as query_preview
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND query_start < NOW() - INTERVAL '30 seconds'
ORDER BY query_start;