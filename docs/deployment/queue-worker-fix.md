# Queue Worker Fix Deployment Instructions

This guide provides step-by-step instructions for fixing the queue-based processing system that was previously working but has stopped analyzing queries and page citations.

## Problem Identified

The queue system was failing because:

1. **Data Structure Mismatch**: The worker expects direct properties on queue items, but data is nested in a `query_data` field
2. **Field Extraction**: The worker can't properly access fields needed to process queries and citations
3. **Schema Differences**: The database table may be missing columns needed by the updated worker

## Fix Implementation

### Step 1: Update Database Schema

Run the SQL script to add missing columns to the queue table while maintaining backward compatibility:

```sql
-- Connect to your Supabase database using your preferred method
psql -h db.trmaeodthlywcjwfzdka.supabase.co -U postgres

-- Run the queue field additions script
\i scripts/add-queue-flat-fields.sql
```

This script:
- Adds direct property columns to the queue table (`query_text`, `platform`, etc.)
- Populates these columns for existing queue items from the nested data
- Adds an index for better performance
- Is safe to run multiple times (idempotent)

### Step 2: Deploy Updated Process Queue Worker

Deploy the improved queue worker function with these features:
- Better handling of both nested and direct properties
- More verbose logging for troubleshooting
- Improved error handling
- Consistent data access patterns

```bash
# Make sure the file has the correct path
cp supabase/functions/process-queue-worker/index-updated.ts supabase/functions/process-queue-worker/index.ts

# Deploy the function
npx supabase functions deploy process-queue-worker --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

### Step 3: Update Run Custom Analysis (Optional)

To ensure future queue items include both direct properties and the nested structure:

```bash
# Create a backup of the original file
cp supabase/functions/run-custom-analysis/index.ts supabase/functions/run-custom-analysis/index.ts.backup

# Update only the queueQuery function (you can manually edit this)
# or use the index-updated.ts as a reference for the changes

# Deploy the function
npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

### Step 4: Test the Queue Worker

1. Check for pending queue items:

```sql
SELECT COUNT(*) FROM analysis_queue WHERE status = 'pending';
```

2. Manually trigger the worker:

```bash
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"batch_size": 3}'
```

3. Monitor progress:

```sql
SELECT status, COUNT(*) FROM analysis_queue GROUP BY status;
```

## Verification Steps

After deploying the fixes:

1. **Check Queue Status**: Verify items are being processed
```sql
SELECT status, COUNT(*) FROM analysis_queue GROUP BY status;
```

2. **Inspect Logs**: Check for any errors in Supabase function logs
```bash
npx supabase functions logs process-queue-worker --project-ref trmaeodthlywcjwfzdka
```

3. **Monitor Analysis Runs**: Verify completion status is updating
```sql
SELECT id, status, queries_completed, queries_total, queries_failed
FROM analysis_runs
ORDER BY created_at DESC
LIMIT 5;
```

4. **Check Query Results**: Verify analysis queries are completing
```sql
SELECT id, status, associated_pages_count
FROM analysis_queries
WHERE analysis_run_id = 'YOUR_RUN_ID'
LIMIT 10;
```

## Troubleshooting

If issues persist:

1. **Reset Failed Items**: Reset any failed queue items to pending
```sql
UPDATE analysis_queue
SET status = 'pending', attempts = 0, error_message = NULL
WHERE status = 'failed';
```

2. **Force Queue Worker Execution**: Manually trigger the worker with increased logging
```bash
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"batch_size": 1, "max_runtime": 30000}'
```

3. **Check Citation Processing**: Ensure analyze-citation function is working
```bash
npx supabase functions logs analyze-citation --project-ref trmaeodthlywcjwfzdka
```

## Future Improvements

Consider these enhancements for better reliability:

1. **Add a periodic trigger**: Set up a cron job to trigger the worker every minute
2. **Add monitoring dashboard**: Implement a UI to monitor queue status
3. **Add error notifications**: Set up alerts for failed queue items