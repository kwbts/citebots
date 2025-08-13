-- Check database health and connectivity
-- Run this in the Supabase SQL Editor when available

-- Check if database is responsive
SELECT current_timestamp as server_time;

-- Check for active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity;

-- Check for any locking issues
SELECT relation::regclass, mode, locktype, granted
FROM pg_locks
JOIN pg_database d ON d.oid = database
WHERE d.datname = current_database()
AND NOT granted;

-- Check for long-running queries
SELECT pid, age(clock_timestamp(), query_start) as query_age, 
       usename, query
FROM pg_stat_activity
WHERE state != 'idle' 
AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY query_age DESC
LIMIT 10;

-- Check for table sizes
SELECT 
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- Check for database statistics
SELECT 
  datname as database_name, 
  numbackends as connections, 
  xact_commit as commits,
  xact_rollback as rollbacks,
  blks_read as blocks_read,
  blks_hit as blocks_hit,
  tup_returned as rows_returned,
  tup_fetched as rows_fetched,
  tup_inserted as rows_inserted,
  tup_updated as rows_updated,
  tup_deleted as rows_deleted
FROM pg_stat_database
WHERE datname = current_database();

-- Check for table-level statistics
SELECT 
  relname as table_name,
  seq_scan as sequential_scans,
  seq_tup_read as sequential_rows_read,
  idx_scan as index_scans,
  idx_tup_fetch as index_rows_fetched,
  n_tup_ins as rows_inserted,
  n_tup_upd as rows_updated,
  n_tup_del as rows_deleted,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC
LIMIT 10;

-- Check for any recent errors in PostgreSQL logs (if available)
-- Note: This might not work depending on your access level
SELECT 
  log_time,
  user_name,
  database_name,
  process_id,
  message
FROM pg_logs
WHERE log_time > current_timestamp - interval '1 hour'
AND error_severity IN ('ERROR', 'FATAL', 'PANIC')
ORDER BY log_time DESC
LIMIT 20;