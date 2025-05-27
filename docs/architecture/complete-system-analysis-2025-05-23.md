# Complete System Analysis: Queue Processing Issues
**Date**: May 23, 2025  
**Status**: Critical Issues - System Partially Functional  
**Next Session**: Use this document for complete context

---

## Executive Summary

The Citebots analysis system has **multiple critical architectural issues** causing:
- Analysis runs stalling at ~50% completion (9-11 out of 24 queries)
- Duplicate analysis runs from single frontend requests
- Queue items getting stuck in "processing" status
- Data inconsistencies between queue tables and results tables
- Frontend not reflecting actual completion status

**Key Finding**: The `platform = 'both'` feature creates fundamental data consistency issues throughout the system.

---

## Current System Architecture

### Edge Functions Overview

| Function | Purpose | Status | Issues |
|----------|---------|--------|---------|
| `run-custom-analysis` | Orchestrates analysis runs, creates queue items | ⚠️ Working but creates duplicates | Multiple runs from single request |
| `process-queue-worker` | Processes queue items in batches | ⚠️ Partially working | Stalls after processing some items |
| `execute-query` | Executes individual queries against ChatGPT/Perplexity | ✅ Working | Cost optimized to gpt-4o-mini |
| `analyze-citation` | Analyzes web pages from citations | ✅ Working | Uses gpt-4o-mini |
| `enhance-client-with-ai` | AI enhancement of client profiles | ✅ Working | Uses gpt-4o-mini |
| `generate-queries` | Generates analysis queries | ✅ Working | Uses gpt-4o-mini |

### Database Schema

#### Core Tables

**analysis_runs** - Main orchestration table
```sql
id UUID PRIMARY KEY
batch_id TEXT (timestamp-based, should be unique but isn't)
status TEXT ('queued', 'running', 'completed', 'failed')
platform TEXT ('chatgpt', 'perplexity', 'both')
queries_total INTEGER
queries_completed INTEGER (synced via triggers)
queries_queued INTEGER (synced via triggers)
queries_processing INTEGER (synced via triggers)
queries_failed INTEGER (synced via triggers)
processing_method TEXT ('sync', 'queue')
created_by UUID
created_at TIMESTAMP
updated_at TIMESTAMP
completed_at TIMESTAMP
```

**analysis_queue** - Queue processing table
```sql
id UUID PRIMARY KEY
analysis_run_id UUID (references analysis_runs)
query_data JSONB (contains query_text, platform, client info)
status TEXT ('pending', 'processing', 'completed', 'failed')
attempts INTEGER DEFAULT 0
max_attempts INTEGER DEFAULT 3
processor_id TEXT (worker identifier)
created_at TIMESTAMP
started_at TIMESTAMP
completed_at TIMESTAMP
error_message TEXT
```

**analysis_queries** - Results table
```sql
id UUID PRIMARY KEY
analysis_run_id UUID (references analysis_runs)
query_text TEXT
query_keyword TEXT
query_intent TEXT
data_source TEXT ('chatgpt', 'perplexity')
model_response TEXT (AI response)
citation_count INTEGER
brand_mentioned BOOLEAN
brand_sentiment DOUBLE PRECISION
competitor_mentioned_names TEXT[]
status TEXT ('pending', 'completed', 'failed')
created_at TIMESTAMP
completed_at TIMESTAMP
[... many more analysis fields]
```

**page_analyses** - Citation analysis results
```sql
id UUID PRIMARY KEY
query_id UUID (references analysis_queries)
citation_url TEXT
citation_position INTEGER
domain_name TEXT
is_client_domain BOOLEAN
is_competitor_domain BOOLEAN
technical_seo JSONB
content_quality JSONB
[... extensive SEO/content analysis fields]
```

#### Supporting Tables

**clients** - Client information
```sql
id UUID PRIMARY KEY
name TEXT
domain TEXT
created_by UUID
[... extensive client profile fields]
```

**competitors** - Separate competitor table (not JSON in clients)
```sql
id UUID PRIMARY KEY
client_id UUID (references clients)
name TEXT
domain TEXT
```

---

## Critical Issues Identified

### 1. **Platform = 'both' Architecture Problem** ⚠️ **CRITICAL**

**Issue**: When `platform = 'both'` is selected:
- Creates **2 queue items** per query (one for ChatGPT, one for Perplexity)
- But only creates **1 analysis_queries record**
- Results in mismatched counts throughout the system

**Example**:
- 12 selected queries × 'both' platform = 24 queue items
- But system expects 12 analysis_queries records
- Counts never match up properly

**Evidence**:
```sql
-- Run 1ab40084 shows this clearly:
- analysis_runs: 24 queries_total, 9 queries_completed
- analysis_queue: 24 items (9 completed, 15 pending)
- analysis_queries: 11 records (10 completed, 1 pending)
```

### 2. **Queue Processing Stalls** ⚠️ **CRITICAL**

**Issue**: Queue worker processes some items then stops completely
- Processes 9-11 items out of 24
- Remaining items stay in "pending" status forever
- No continuation worker triggered

**Root Causes**:
- Edge Function timeouts (hitting 400-second limit)
- setTimeout() doesn't work reliably in Edge Functions
- Worker continuation logic fails

**Evidence**: Multiple analysis runs stall at exactly the same point

### 3. **Duplicate Analysis Runs** ⚠️ **HIGH**

**Issue**: Single frontend request creates multiple analysis runs
- Same batch_id pattern with different timestamps
- 2.5-minute intervals between duplicates
- Not caused by user clicking multiple times

**Evidence**:
```json
{
  "batch_id": "custom_both_1748041134121",
  "batch_id": "custom_both_1748040984094"
}
```

### 4. **Data Inconsistency** ⚠️ **HIGH**

**Issue**: Tables show different states for same analysis run
- analysis_runs.queries_completed ≠ actual completed analysis_queries
- Queue counts don't match reality
- Status doesn't reflect actual completion

**Evidence**: Run marked "running" with 9/24 complete, but has 11 actual results

### 5. **Frontend Synchronization** ⚠️ **MEDIUM**

**Issue**: Frontend doesn't reflect actual processing status
- Shows stalled processing when items are actually complete
- Doesn't update when runs should be marked complete
- Polling might be checking wrong data

---

## Attempted Fixes & Results

### Phase 1: Worker Continuation Logic
**Attempted**: Added setTimeout-based worker continuation
**Result**: ❌ Failed - setTimeout doesn't work in Edge Functions
**Files Changed**: `process-queue-worker/index.ts`

### Phase 2: Immediate Continuation
**Attempted**: Replaced setTimeout with immediate worker triggering
**Result**: ⚠️ Partial - Some improvement but still stalls
**Files Changed**: `process-queue-worker/index.ts`

### Phase 3: Timeout Increases
**Attempted**: 
- Increased statement_timeout to 300 seconds
- Modified Edge Function runtime limits
**Result**: ⚠️ Partial - Extended processing but didn't solve stalling
**SQL Applied**: `ALTER ROLE service_role SET statement_timeout = '300s'`

### Phase 4: Error Handling Improvements
**Attempted**: Better error handling for stuck "processing" items
**Result**: ⚠️ Partial - Prevents some stuck items but doesn't fix root cause
**Files Changed**: `process-queue-worker/index.ts`

### Phase 5: Cost Optimization
**Attempted**: Switched analysis calls from GPT-4 to gpt-4o-mini
**Result**: ✅ Success - Reduced costs by ~90%
**Files Changed**: All edge functions with OpenAI calls

### Phase 6: Optimized Queue Functions
**Attempted**: Created optimized SQL functions for batch claiming
**Result**: ⚠️ Minor improvement - Still fundamental issues remain
**SQL Applied**: `claim_queue_batch_optimized()`, `reset_stuck_queue_items()`

### Phase 7: Smaller Batches & Shorter Runtimes
**Attempted**: Reduced batch sizes (3→2) and runtime (120s→60s)
**Result**: ⚠️ Partial - More frequent processing but still stalls
**Files Changed**: `process-queue-worker/index.ts`

### Phase 8: Automatic Stuck Item Reset
**Attempted**: Reset stuck items before each worker run
**Result**: ⚠️ Partial - Helps with recovery but doesn't prevent stalling
**Files Changed**: `process-queue-worker/index.ts`

---

## Root Cause Analysis

### Primary Architectural Problems

#### 1. **Platform 'both' Multiplier Effect**
The core issue is that `platform = 'both'` creates a 2:1 ratio between queue items and expected results:
- Frontend selects 12 queries
- System creates 24 queue items (12 × 2 platforms)
- But analysis_runs.queries_total = 24
- Analysis expects 24 results, but only gets 12 unique queries
- Counts never align properly

#### 2. **Queue Item Lifecycle Mismatch**
```
Queue Item → Analysis Query → Results
1:1 ratio   1:1 ratio        1:many ratio
```
But with 'both' platform:
```
Queue Items → Analysis Query → Results
2:1 ratio     1:1 ratio        1:many ratio
```

#### 3. **Trigger Logic Assumes 1:1 Mapping**
Database triggers that update analysis_runs counts assume:
- 1 queue item = 1 analysis query = 1 expected result
- This breaks with 'both' platform

### Secondary Issues

#### 1. **Edge Function Resource Limits**
- 400-second timeout is insufficient for large batches
- Memory constraints with concurrent processing
- Cold start issues causing 503 errors

#### 2. **Database Statement Timeouts**
- 2-minute limit too short for complex operations
- Multiple sequential API calls per item
- Citation analysis adds significant time

#### 3. **Error Recovery Insufficient**
- No automatic recovery from partial failures
- Stuck items require manual intervention
- No dead letter queue for failed items

---

## Recommended Architectural Changes

### Option 1: Eliminate 'both' Platform (Recommended)
**Change**: Force users to choose either ChatGPT OR Perplexity
**Pros**: 
- Eliminates the 2:1 ratio problem
- Simplifies all counting logic
- Reduces API costs and processing time
**Cons**: 
- Reduces feature richness
- Users need to run separate analyses

### Option 2: Redesign Platform Handling
**Change**: Treat 'both' as two separate analysis runs
**Implementation**:
```sql
-- Instead of platform = 'both'
-- Create two separate analysis_runs:
INSERT INTO analysis_runs (platform) VALUES ('chatgpt');
INSERT INTO analysis_runs (platform) VALUES ('perplexity');
```
**Pros**: Maintains feature, fixes counting
**Cons**: More complex frontend logic

### Option 3: Redesign Queue Schema
**Change**: Make platform part of the primary analysis structure
**Implementation**:
```sql
-- New table: analysis_platforms
id UUID PRIMARY KEY
analysis_run_id UUID
platform TEXT ('chatgpt', 'perplexity')
queries_total INTEGER
queries_completed INTEGER

-- analysis_queue references analysis_platforms
analysis_platform_id UUID REFERENCES analysis_platforms(id)
```
**Pros**: Clean separation, accurate counting
**Cons**: Major schema changes required

### Option 4: Simplify to Single Platform Analysis
**Change**: Remove multi-platform feature entirely
**Implementation**: Always use ChatGPT, remove Perplexity integration
**Pros**: Massive simplification, cost reduction
**Cons**: Less comprehensive analysis

---

## Database Schema Issues

### Current Problems
1. **analysis_runs.queries_total ambiguous** - Does this mean selected queries or total queue items?
2. **No clear mapping** between queue items and expected results
3. **Trigger logic assumes 1:1** which breaks with 'both' platform
4. **batch_id not actually unique** allowing duplicate runs
5. **Status updates inconsistent** between tables

### Recommended Schema Changes

#### 1. Add Platform Multiplier Tracking
```sql
ALTER TABLE analysis_runs ADD COLUMN platform_multiplier INTEGER DEFAULT 1;
-- For 'both' platform, set to 2
-- Update counting logic accordingly
```

#### 2. Add Unique Constraint on batch_id
```sql
ALTER TABLE analysis_runs ADD CONSTRAINT unique_batch_id UNIQUE (batch_id);
-- Prevent duplicate analysis runs
```

#### 3. Add Expected Results Count
```sql
ALTER TABLE analysis_runs ADD COLUMN expected_results INTEGER;
-- queries_total = total queue items
-- expected_results = actual unique queries expected
```

#### 4. Redesign Queue Status Tracking
```sql
-- Add run-level status tracking
CREATE TABLE analysis_run_status (
  analysis_run_id UUID PRIMARY KEY,
  total_items INTEGER,
  pending_items INTEGER,
  processing_items INTEGER,
  completed_items INTEGER,
  failed_items INTEGER,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## Current File States

### Edge Functions (supabase/functions/)

#### process-queue-worker/index.ts
**Status**: Modified with multiple attempted fixes
**Key Changes**:
- Immediate worker continuation (no setTimeout)
- Smaller batch sizes (2 items)
- Shorter runtime (60 seconds)
- Automatic stuck item reset
- Better error handling

**Current Issues**: Still stalls after processing some items

#### run-custom-analysis/index.ts
**Status**: Working but creating duplicate runs
**Key Changes**: 
- Queue-based processing for all runs
- Worker triggering logic
- Competitor handling from separate table

**Current Issues**: Multiple runs from single request

#### execute-query/index.ts
**Status**: Working well
**Key Changes**:
- Cost optimization (gpt-4o-mini for analysis)
- Maintained gpt-4 for main ChatGPT queries
- Reduced token limits

**Current Issues**: None identified

### Database Functions

#### claim_queue_batch_optimized()
**Status**: Created but may not be used
**Purpose**: Faster batch claiming with better indexing

#### reset_stuck_queue_items()
**Status**: Working
**Purpose**: Reset items stuck in processing for >5 minutes

### Configuration Changes

#### Database Timeouts
```sql
-- Applied:
ALTER ROLE service_role SET statement_timeout = '300s';
```

#### Indexes
```sql
-- Applied:
CREATE INDEX idx_queue_processing_fast ON analysis_queue (status, created_at);
CREATE INDEX idx_queue_stuck_items ON analysis_queue (status, started_at);
```

---

## Debugging Queries & Tools

### Check System Health
```sql
-- Current status of all recent runs
SELECT 
  ar.id,
  ar.status,
  ar.queries_total,
  ar.queries_completed,
  COUNT(aq.id) as actual_results
FROM analysis_runs ar
LEFT JOIN analysis_queries aq ON ar.id = aq.analysis_run_id
WHERE ar.created_at > NOW() - INTERVAL '3 hours'
GROUP BY ar.id, ar.status, ar.queries_total, ar.queries_completed;
```

### Check Queue Health
```sql
-- Queue status by run
SELECT 
  analysis_run_id,
  status,
  COUNT(*) as count
FROM analysis_queue
WHERE analysis_run_id IN (SELECT id FROM analysis_runs WHERE created_at > NOW() - INTERVAL '3 hours')
GROUP BY analysis_run_id, status
ORDER BY analysis_run_id, status;
```

### Reset Stuck Items
```sql
-- Reset items stuck in processing
UPDATE analysis_queue 
SET status = 'pending', processor_id = NULL, started_at = NULL
WHERE status = 'processing' AND started_at < NOW() - INTERVAL '5 minutes';
```

---

## Cost Analysis

### Before Optimization
- **Per query**: ~$0.15 (gpt-4 + analysis calls)
- **Per 20-query batch**: $30-50
- **With retries/failures**: $50-100+ per batch

### After Optimization
- **Per query**: ~$0.02 (gpt-4 main query + gpt-4o-mini analysis)
- **Per 20-query batch**: $3-5
- **Savings**: ~90% cost reduction

---

## Immediate Recommendations for Next Session

### Priority 1: Decide on Platform Architecture
1. **Eliminate 'both' platform** (recommended for quick fix)
2. OR implement Option 2 (separate runs for each platform)
3. OR implement Option 3 (redesigned schema)

### Priority 2: Fix Duplicate Run Creation
1. Add unique constraint on batch_id
2. Investigate frontend submission logic
3. Add rate limiting to prevent multiple submissions

### Priority 3: Fix Queue Stalling
1. With platform fix, queue processing should improve
2. If still stalling, consider external queue service (Redis/SQS)
3. Add comprehensive monitoring and alerting

### Priority 4: Data Consistency
1. Fix counting logic based on platform decision
2. Add data validation checks
3. Create reconciliation procedures

---

## Testing Strategy

### Test Cases Needed
1. **Single platform analysis** (12 queries, ChatGPT only)
2. **Large batch analysis** (50+ queries)
3. **Error recovery** (simulate API failures)
4. **Concurrent analyses** (multiple users)
5. **Frontend synchronization** (real-time updates)

### Success Criteria
1. **100% completion rate** for queued analyses
2. **No duplicate runs** from single request
3. **Accurate counts** across all tables
4. **Real-time frontend updates**
5. **Cost per query** under $0.05

---

## Files for Next Session Review

### Critical Files
1. `/supabase/functions/run-custom-analysis/index.ts` - Run creation
2. `/supabase/functions/process-queue-worker/index.ts` - Queue processing
3. `/docs/api/supabase-tables/schema.json` - Database schema
4. This analysis document

### Database
1. Recent analysis_runs (last 3 hours)
2. Queue status and stuck items
3. Data consistency between tables

### Frontend (if needed)
1. Analysis submission component
2. Results polling logic
3. Progress display logic

---

**END OF ANALYSIS**

**Recommendation**: Start with eliminating the 'both' platform feature to solve the 2:1 ratio problem, then address queue stalling and duplicate runs.