# Edge Function Cleanup and Architecture

## Edge Function Cleanup

We've streamlined the edge functions by removing non-essential ones. The following functions were archived:

1. `run-analysis-simple` - Simplified version of run-custom-analysis that was used during development
2. `run-analysis` - Older implementation now replaced by run-custom-analysis
3. `enhance-client-with-ai` - Optional AI enhancement functionality

These functions are archived in `supabase/functions-archive/` and can be restored if needed.

## Current Edge Function Architecture

The current edge function architecture consists of the following essential components:

### Core Functions

1. **generate-queries**
   - Called directly from frontend
   - Generates natural language queries based on keywords
   - Used in the query preview page

2. **run-custom-analysis**
   - Central function for starting analysis runs
   - Supports both direct processing and queue-based processing
   - Creates analysis run records in the database
   - Called by useQueueAnalysis composable

3. **process-queue-worker**
   - Background worker that processes queued analysis items
   - Dequeues and processes batches of items
   - Provides fault tolerance and automatic retries
   - Called by run-custom-analysis when using queue mode

### Processing Chain

4. **process-query**
   - Processes a single query
   - Calls execute-query to get responses from AI platforms
   - Extracts citations and calls analyze-citation for each
   - Called by run-custom-analysis and process-queue-worker

5. **execute-query**
   - Makes API calls to AI platforms (ChatGPT, Perplexity)
   - Extracts initial citation information
   - Returns responses for further processing
   - Called by process-query

6. **analyze-citation**
   - Analyzes a single citation URL
   - Uses ScrapingBee to fetch content
   - Determines brand mentions and relevance
   - Called by process-query

### Shared Components

7. **_shared**
   - Contains utilities and shared code used by multiple functions
   - Includes CORS headers, error handling, etc.

## Data Flow

1. User selects keywords and generates queries
2. User selects queries and runs analysis
3. Analysis is either processed directly or added to queue
4. For queued items, process-queue-worker handles processing
5. Each query is processed by calling process-query
6. process-query calls execute-query to get AI responses
7. Citations from responses are processed by analyze-citation
8. Results are stored in analysis_queries and page_analyses tables

## Queue-Based Architecture Benefits

- Handles large batches of queries (100s or 1000s)
- Prevents edge function timeouts
- Provides fault tolerance with automatic retries
- Allows background processing with progress tracking
- Improves overall system reliability