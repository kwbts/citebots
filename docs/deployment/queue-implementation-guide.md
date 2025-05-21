# Queue Implementation Deployment Guide

This guide provides step-by-step instructions for deploying the queue-based architecture that has been implemented for the Citebots analysis system.

## Overview

The queue-based architecture significantly improves the reliability of the analysis system by:

1. Moving long-running operations to background processing
2. Preventing timeout errors in edge functions
3. Improving error handling and resilience
4. Supporting larger batches of queries

## Files Modified/Created

### 1. Database Infrastructure
- **File**: `/scripts/create-queue-infrastructure.sql`
- **Purpose**: Creates analysis_queue table, indexes, and database functions
- **Status**: ✅ Implemented

### 2. Edge Functions
- **New**: `/supabase/functions/process-queue-worker/index.ts`
  - Background worker that processes queue items
  - **Status**: ✅ Implemented

- **Modified**: `/supabase/functions/run-custom-analysis/index.ts`
  - Added queue support with feature flags
  - **Status**: ✅ Implemented

- **Modified**: `/supabase/functions/analyze-citation/index.ts`
  - Enhanced error handling and schema validation
  - **Status**: ✅ Implemented

### 3. Schema Updates
- **File**: `/scripts/add-crawl-columns.sql`
- **Purpose**: Adds missing columns to page_analyses table
- **Status**: ✅ Implemented

### 4. Frontend Components (Pending)
- `/components/analysis/QueueProgress.vue`
  - Real-time progress monitoring component
  - **Status**: Draft created

- `/composables/useQueueAnalysis.ts`
  - Composable for queue functionality
  - **Status**: Draft created

## Deployment Instructions

### 1. Database Setup

Deploy the queue infrastructure to your Supabase database:

```bash
# Connect to your Supabase database using your preferred method
psql -h db.trmaeodthlywcjwfzdka.supabase.co -U postgres

# Run the queue infrastructure script
\i scripts/create-queue-infrastructure.sql

# Add missing columns to page_analyses (if not already present)
\i scripts/add-crawl-columns.sql

# Verify the table was created
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'analysis_queue';
```

### 2. Edge Function Deployment

Deploy each updated edge function to Supabase:

```bash
# Deploy the worker function first
npx supabase functions deploy process-queue-worker --project-ref trmaeodthlywcjwfzdka --no-verify-jwt

# Deploy the updated analysis functions
npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
npx supabase functions deploy analyze-citation --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
npx supabase functions deploy process-query --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
npx supabase functions deploy execute-query --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

### 3. Frontend Integration

To enable queue processing in the frontend, update your API calls to include the queue header:

```javascript
// In your analysis component (e.g., pages/dashboard/analysis/index.vue)
async function runAnalysis() {
  try {
    const response = await fetch('/api/run-custom-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Use-Queue': 'true'  // Enable queue processing
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    // Handle queue-based response
    if (data.queued) {
      // Start polling for progress
      analysisRunId.value = data.analysis_run_id
      startProgressPolling(data.analysis_run_id)
    } else {
      // Handle direct processing response
      handleDirectResults(data)
    }
  } catch (error) {
    console.error('Analysis error:', error)
    // Handle error state
  }
}

// Add a polling function to check analysis status
function startProgressPolling(runId) {
  // Show progress UI
  isProcessing.value = true

  // Start polling
  pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/check-analysis-status?id=${runId}`)
      const status = await response.json()

      // Update progress
      progress.value = status.progress || 0

      // Check if complete
      if (status.complete) {
        clearInterval(pollInterval)
        isProcessing.value = false
        // Fetch and display results
        await fetchAndDisplayResults(runId)
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 3000) // Poll every 3 seconds
}
```

## Queue Worker Activation

The queue worker needs to be triggered to process items. You can use one of these approaches:

### 1. Cron Job (Recommended)

Set up a cron job to trigger the worker every minute:

```bash
# Example cron job (add to your server's crontab)
* * * * * curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker
```

### 2. Manual Testing

For testing, you can manually invoke the worker:

```bash
# Manual worker invocation
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/process-queue-worker
```

## Monitoring Queue Status

### Database Queries for Monitoring

```sql
-- View overall queue status
SELECT status, COUNT(*) FROM analysis_queue GROUP BY status;

-- View pending items by age
SELECT
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_item,
  MAX(created_at) as newest_item,
  NOW() - MIN(created_at) as max_age
FROM analysis_queue
WHERE status = 'pending';

-- Check progress of a specific analysis run
SELECT
  ar.id,
  ar.status,
  COUNT(aq.id) as total_queries,
  SUM(CASE WHEN aq.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN aq.status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN aq.status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN aq.status = 'processing' THEN 1 ELSE 0 END) as processing,
  ROUND(
    SUM(CASE WHEN aq.status = 'completed' THEN 1 ELSE 0 END)::numeric /
    COUNT(aq.id) * 100
  ) as progress_percent
FROM analysis_runs ar
LEFT JOIN analysis_queue aq ON ar.id = aq.analysis_run_id
WHERE ar.id = 'YOUR_RUN_ID'
GROUP BY ar.id, ar.status;

-- View failed items with errors
SELECT
  id,
  query_text,
  client_name,
  error,
  attempts,
  error_details,
  created_at
FROM analysis_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Worker Logs

Monitor worker activity using the Supabase function logs:

```bash
npx supabase functions logs process-queue-worker --project-ref trmaeodthlywcjwfzdka
```

## Feature Flags

The system supports these feature flag options:

1. **Explicit opt-in**: `X-Use-Queue: true` header
2. **Automatic detection**: Query batches larger than the configured threshold
3. **Fallback**: Direct processing with fallback to queue if it fails

## Rollback Plan

If issues occur, you can temporarily disable the queue system:

1. **Disable Queue in Frontend**:
   - Remove the `X-Use-Queue` header from API calls
   - The system will fall back to direct processing for small batches

2. **Restore Previous Function Version** (if needed):
   ```bash
   # If you backed up the original function
   cp supabase/functions/run-custom-analysis/index.ts.backup supabase/functions/run-custom-analysis/index.ts
   npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
   ```

3. **Keep Database Changes**:
   - The queue tables are isolated and won't affect existing functionality
   - They can remain in place for future use

## Troubleshooting

### Common Issues

1. **Worker not processing items**
   - Check if the worker function is being triggered
   - Verify database functions are working correctly
   - Check for permission issues in RLS policies

2. **Timeouts still occurring**
   - Verify the `X-Use-Queue` header is being sent
   - Check that the queue fallback is working properly

3. **Missing results**
   - Check for errors in the error column of the queue table
   - Verify that completed items have their results stored properly

## Performance Tuning

- **Batch Size**: Adjust the batch size in the worker (default: 5)
- **Worker Frequency**: Change cron job timing for faster/slower processing
- **Retry Strategy**: Modify max_attempts in the queue table (default: 3)
- **Timeout Settings**: Adjust timeout settings in ScrapingBee calls

## Next Steps

1. ✅ Deploy database infrastructure
2. ✅ Deploy updated edge functions
3. ✅ Basic testing of queue functionality
4. ⏳ Implement frontend polling components
5. ⏳ Set up regular worker invocation
6. ⏳ Add monitoring dashboard
7. ⏳ Fine-tune performance parameters

## Conclusion

The queue-based architecture significantly improves the reliability and scalability of the analysis system. This implementation allows for processing large batches of queries without timeouts, while maintaining a good user experience with progress updates.