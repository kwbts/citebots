# Queue Processing Improvements

## Issues Addressed

1. **Multiple Analysis Runs** - Analysis with "both" platforms created duplicate runs instead of using a single run
2. **Processing Stalls** - Only 16 out of many queries would complete due to timeout and batch size constraints
3. **Slow Processing** - Default small batch sizes led to slow analysis completion

## Solutions Implemented

### 1. Consolidated Analysis Runs

Fixed the `run-custom-analysis` function to properly handle "both" platform queries by:
- Creating a single analysis run at the start
- Using that same analysis run ID for all queries, regardless of platform

This ensures a single analysis run for each user-initiated analysis.

### 2. Parallel Queue Processing

Improved the queue worker dispatch mechanism to:
- Launch 3 worker functions in parallel instead of just one
- Increase batch size from 3 to 10 items per worker
- Schedule automatic follow-up workers for any pending items

### 3. Auto-Resume Stuck Processing

Added intelligent monitoring to detect and resolve stuck processing:
- Frontend QueueProgress component detects lack of progress and triggers additional workers
- Added 20-second delayed follow-up worker for catching any remaining items
- Improved retry mechanism to launch multiple workers in parallel

### 4. Tracking and Feedback

Enhanced queue progress tracking with:
- More frequent polling interval (2 seconds instead of 3)
- Detection of stalled processing
- Automatic retry for stuck items

## Implementation Details

Modified files:
1. `/supabase/functions/run-custom-analysis/index-fixed-duplicate.ts` - Main function consolidation
2. `/components/analysis/QueueProgress.vue` - Progress tracking and auto-resume
3. `/supabase/functions/process-queue-worker/index.ts` - Improved queue processing (previous changes)

Key improvements:
- Sequential operation delays for ensuring database consistency
- Parallel worker execution for improved throughput
- Auto-resumption for stalled or interrupted processing
- Consolidated analysis run tracking

## Deployment Instructions

Files to update:
- Rename and deploy `/supabase/functions/run-custom-analysis/index-fixed-duplicate.ts` to replace the main function
- Deploy updated frontend components

Manual Deployment:
```bash
# Copy the fixed duplicate file to replace index.ts
cp /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index-fixed-duplicate.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index.ts

# Deploy the updated custom analysis function
npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

## Future Considerations

1. **Database Indexing** - If queue processing continues to be slow, consider adding indexes to the `analysis_queue` table on the `analysis_run_id` and `status` columns.

2. **Batched Database Operations** - Consider updating the process-queue-worker to use batch operations for updating multiple queries at once.

3. **Serverless Function Limits** - Consider splitting very large analyses into smaller chunks or implementing a more robust work-stealing queue if processing very large sets.