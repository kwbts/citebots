# Core Analysis System Fix

## Problem Analysis

The analysis system is currently broken due to multiple issues:

1. **Response Structure Mismatch**: The `run-custom-analysis` function returns data in a format that doesn't match what the frontend expects
2. **Integration Issues**: The addition of queue tables has changed the expected flow
3. **Function Chain**: The original workflow chain is broken

## Simplified Solution

We've created a simplified version of `run-custom-analysis` that:

1. Maintains the original API response format (`analysis_run_id` as expected by preview-queries.vue)
2. Keeps the synchronous processing flow
3. Directly calls process-query for each combination
4. Is backward compatible with the frontend

## Deployment Steps

### 1. Replace the run-custom-analysis function

```bash
cp /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index-simplified.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index.ts
```

### 2. Deploy the fixed function

```bash
npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

## Testing the Fix

1. Go to the dashboard: `/dashboard`
2. Select "Run Analysis"
3. Select a client and platform
4. Choose "Preview Queries" option
5. Wait for queries to generate
6. Select some queries and click "Run Analysis"
7. Verify it creates a new analysis run in the database
8. Check that process-query is being called for each query

## Queue Implementation Plan (After Core Fixes)

Once the core system is working again, we can implement the queue-based approach by:

1. Adding a "Use Queue Processing" option for large batches
2. Adding the queue header to API calls
3. Implementing a progress polling component

The key is to keep both approaches working together, with the queue as an optional enhancement for large batches.