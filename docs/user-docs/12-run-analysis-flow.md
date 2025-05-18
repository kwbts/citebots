# Run Analysis Flow

## Overview
This document describes how users run citation analysis for their clients in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have generated queries
- User has reviewed and selected queries to run

## User Journey
1. User has generated queries on analysis page
2. User reviews and selects queries to include
3. User clicks "Run Analysis" button
4. System executes analysis across LLMs
5. User sees progress updates
6. Analysis completes and results are available

## Expected Behavior

### Visual Flow
1. Pre-analysis state:
   - List of selected queries
   - "Run Analysis" button
   - Estimated time shown

2. During analysis:
   - Progress bar/indicator
   - Current query being processed
   - LLM being queried (ChatGPT, Claude, etc.)
   - Percentage complete
   - "Cancel" option

3. Progress updates:
   - "Querying ChatGPT..." 
   - "Processing citations..."
   - "Analyzing competitors..."
   - Real-time status messages

4. On completion:
   - Success message
   - "View Results" button
   - Summary statistics
   - Redirect to results page

5. On error:
   - Error message
   - Option to retry failed queries
   - Partial results if available

## Database Changes in Supabase

### Analysis Run Created
```sql
INSERT INTO analysis_runs {
  id: UUID,
  client_id: "client-uuid",
  user_id: auth.uid(),
  status: "running",
  queries: ["query1", "query2"...],
  total_queries: 15,
  completed_queries: 0,
  created_at: timestamp,
  started_at: timestamp
}
```

### Progress Updates
```sql
UPDATE analysis_runs 
SET completed_queries = completed_queries + 1,
    status = 'running',
    updated_at = current_timestamp
WHERE id = 'run-uuid'
```

### Query Results
For each query:
```sql
INSERT INTO query_results {
  id: UUID,
  analysis_run_id: "run-uuid",
  query: "what is seo marketing",
  llm_provider: "openai",
  response: "...",
  citations: [...],
  created_at: timestamp
}
```

### Page Analyses
For each cited page:
```sql
INSERT INTO page_analyses {
  id: UUID,
  analysis_run_id: "run-uuid",
  client_id: "client-uuid",
  url: "https://example.com/page",
  domain: "example.com",
  title: "Page Title",
  meta_description: "...",
  citation_context: "...",
  metrics: {...},
  created_at: timestamp
}
```

## Test Scenarios

### Normal Run
1. Select 10 queries
2. Run analysis
3. Expected: Progress updates, completion

### Large Analysis
1. Select 50+ queries
2. Expected: Accurate time estimate
3. Progress bar updates smoothly

### Network Interruption
1. Start analysis
2. Disconnect network
3. Expected: Error handling, retry option

### Partial Completion
1. Some queries fail
2. Expected: Partial results saved
3. Option to retry failed queries

### Cancel Analysis
1. Start long analysis
2. Click cancel
3. Expected: Graceful stop, partial results

## Technical Details
- Edge function: run-analysis
- Parallel processing where possible
- Rate limiting per LLM provider
- Automatic retries for failures
- WebSocket or polling for progress
- Results saved incrementally