# Query-Only vs Comprehensive Analysis: Architecture & Implementation Plan

**Created**: 2025-01-04
**Status**: Planning Phase
**Purpose**: Add query-only analysis option alongside existing comprehensive analysis

---

## Executive Summary

### Current State: Comprehensive Analysis
The existing system performs **comprehensive LLM visibility analysis** that includes:
1. Query execution against LLMs (ChatGPT, Perplexity)
2. Citation extraction from responses
3. Web scraping of all cited URLs using ScrapingBee
4. AI-powered analysis of each scraped page (technical SEO, content quality, on-page SEO)
5. Storage of extensive page analysis data

**Problem**: This comprehensive approach:
- Takes hours to complete (web scraping bottleneck)
- Generates massive database storage requirements
- Limits the number of queries that can be analyzed
- Incurs high API costs (ScrapingBee + AI analysis)

### Proposed Solution: Dual Analysis Modes

Add a **Query-Only Analysis** mode that:
- Executes queries against LLMs
- Analyzes query responses and citation patterns
- **Skips all web scraping and page analysis**
- Completes in minutes instead of hours
- Allows 10-100x more queries per analysis
- Reduces cost by ~80-90%

**Key Principle**: Keep both modes available, let users choose based on their needs.

---

## Analysis Mode Comparison

| Feature | Query-Only Mode | Comprehensive Mode |
|---------|----------------|-------------------|
| **Query Execution** | ✅ Yes | ✅ Yes |
| **Citation Extraction** | ✅ Yes | ✅ Yes |
| **Citation Counting** | ✅ Yes | ✅ Yes |
| **Brand Mention Detection** | ✅ Yes | ✅ Yes |
| **Competitor Analysis** | ✅ Yes | ✅ Yes |
| **Web Scraping** | ❌ No | ✅ Yes |
| **Page SEO Analysis** | ❌ No | ✅ Yes |
| **Content Quality Metrics** | ❌ No | ✅ Yes |
| **Technical SEO Scores** | ❌ No | ✅ Yes |
| **Execution Time** | Minutes | Hours |
| **Query Capacity** | 100-1000+ | 10-50 |
| **Database Size** | Small | Large |
| **Cost per Query** | $0.01-0.05 | $0.50-2.00 |

---

## Database Schema Changes

### Option A: Add Analysis Type Flag (Recommended)

Add a single column to `analysis_runs` table to track the analysis type:

```sql
-- Migration: Add analysis_type column
ALTER TABLE analysis_runs
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'comprehensive';

-- Valid values: 'query-only' | 'comprehensive'
-- Add check constraint
ALTER TABLE analysis_runs
ADD CONSTRAINT analysis_runs_type_check
CHECK (analysis_type IN ('query-only', 'comprehensive'));

-- Create index for filtering
CREATE INDEX idx_analysis_runs_type ON analysis_runs(analysis_type);
```

**Impact**:
- Minimal schema change
- `page_analyses` table remains unchanged
- Query-only analyses simply won't have related `page_analyses` records
- Existing data remains valid (defaults to 'comprehensive')

### Option B: Separate Tables (Not Recommended)

Create separate `query_only_runs` and `query_only_analyses` tables.

**Why Not**:
- Duplicates schema
- Complicates reporting across both types
- More maintenance overhead
- Harder to compare results

### Schema Validation

**Before web scraping in queue worker**, check:
```sql
SELECT analysis_type FROM analysis_runs WHERE id = ?
```

If `analysis_type = 'query-only'`, skip all page analysis steps.

---

## System Architecture

### Phase 1: Query Execution (Shared by Both Modes)

**File**: `composables/useQueueAnalysis.ts`
**Function**: `runAnalysisWithQueue()`

```typescript
// Current implementation - NO CHANGES NEEDED
const runAnalysisWithQueue = async (params: {
  client_id: string
  platforms: string[]
  queries: any[]
  report_name?: string
  analysis_type?: 'query-only' | 'comprehensive' // NEW parameter
}) => {
  // Call database function
  const result = await supabase.rpc('submit_analysis_to_queue', {
    p_client_id: params.client_id,
    p_platforms: params.platforms,
    p_queries: params.queries,
    p_report_name: params.report_name,
    p_analysis_type: params.analysis_type || 'comprehensive' // NEW
  })

  return result
}
```

**Changes Required**: Add `analysis_type` parameter

### Phase 2: Queue Submission (Database Function)

**File**: `scripts/create-queue-submission-function.sql`
**Function**: `submit_analysis_to_queue()`

```sql
CREATE OR REPLACE FUNCTION submit_analysis_to_queue(
  p_client_id UUID,
  p_platforms TEXT[],
  p_queries JSONB[],
  p_report_name TEXT DEFAULT NULL,
  p_analysis_type TEXT DEFAULT 'comprehensive' -- NEW parameter
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- ... existing declarations ...
BEGIN
  -- Create analysis run with analysis_type
  INSERT INTO analysis_runs (
    client_id,
    batch_id,
    platform,
    status,
    queries_total,
    queries_completed,
    created_by,
    processing_method,
    analysis_type  -- NEW column
  ) VALUES (
    p_client_id,
    v_batch_id,
    array_to_string(p_platforms, ','),
    'running',
    v_total_queue_items,
    0,
    auth.uid(),
    'queue',
    p_analysis_type  -- NEW value
  ) RETURNING * INTO v_analysis_run;

  -- Insert queue items with analysis_type in query_data
  FOR i IN 1..array_length(p_queries, 1) LOOP
    FOR j IN 1..array_length(p_platforms, 1) LOOP
      INSERT INTO analysis_queue (
        analysis_run_id,
        query_data,
        status
      ) VALUES (
        v_analysis_run.id,
        jsonb_build_object(
          'query_text', p_queries[i]->>'query_text',
          'keyword', p_queries[i]->>'keyword',
          'intent', p_queries[i]->>'intent',
          'platform', p_platforms[j],
          'client', v_client_data,
          'analysis_type', p_analysis_type  -- NEW field
        ),
        'pending'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'analysis_run_id', v_analysis_run.id,
    'analysis_type', p_analysis_type  -- NEW field
  );
END;
$$;
```

**Changes Required**:
1. Add `p_analysis_type` parameter
2. Store in `analysis_runs.analysis_type` column
3. Include in `query_data` JSONB for queue items
4. Return in response

### Phase 3: Queue Processing (Local Server)

**File**: `local-server/queue-worker.js` (or similar)
**Current Location**: Likely in local server implementation

The queue worker processes items from `analysis_queue` table. This is where the **critical branching** occurs.

```javascript
// Pseudo-code for queue worker logic
async function processQueueItem(queueItem) {
  const { query_data, analysis_run_id } = queueItem
  const { query_text, platform, client, analysis_type } = query_data

  // Step 1: Execute query against LLM (ALWAYS happens)
  const queryResult = await executeQuery(query_text, platform)

  // Step 2: Parse citations from response (ALWAYS happens)
  const citations = extractCitations(queryResult.response)

  // Step 3: Analyze brand mentions (ALWAYS happens)
  const brandAnalysis = analyzeBrandMentions(queryResult.response, client)

  // Step 4: Store query result in analysis_queries table (ALWAYS happens)
  const queryRecord = await storeQueryResult({
    analysis_run_id,
    query_text,
    data_source: platform,
    model_response: queryResult.response,
    citation_count: citations.length,
    brand_mentioned: brandAnalysis.mentioned,
    // ... other query-level fields
  })

  // Step 5: CONDITIONAL - Only scrape and analyze pages for comprehensive mode
  if (analysis_type === 'comprehensive') {
    for (const citation of citations) {
      // Scrape the page
      const scrapedContent = await scrapePage(citation.url)

      // Analyze the page with AI
      const pageAnalysis = await analyzePageWithAI(scrapedContent, client)

      // Store page analysis
      await storePageAnalysis({
        query_id: queryRecord.id,
        citation_url: citation.url,
        domain_name: citation.domain,
        technical_seo: pageAnalysis.technical_seo,
        content_quality: pageAnalysis.content_quality,
        on_page_seo: pageAnalysis.on_page_seo,
        // ... all page-level fields
      })
    }
  } else {
    // Query-only mode: Skip all page analysis
    console.log(`Skipping page analysis for query-only mode`)
  }

  // Step 6: Mark queue item as complete
  await markQueueItemComplete(queueItem.id)
}
```

**Key Points**:
1. Query execution always happens (both modes)
2. Citation extraction always happens (both modes)
3. Page scraping/analysis only happens for `analysis_type === 'comprehensive'`
4. Queue item completes much faster for query-only mode

### Phase 4: Frontend Selection UI

**File**: `pages/dashboard/analysis/index.vue`
**Location**: Analysis setup page (before preview-queries)

Add analysis type selection to the initial analysis form:

```vue
<template>
  <div class="analysis-setup-form">
    <!-- Existing client selection -->

    <!-- NEW: Analysis Type Selection -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Analysis Type <span class="text-red-500">*</span>
      </label>

      <div class="space-y-4">
        <!-- Query-Only Option -->
        <label class="flex items-start cursor-pointer p-4 border-2 rounded-lg transition-all"
               :class="analysisType === 'query-only'
                 ? 'border-citebots-orange bg-orange-50 dark:bg-orange-900/20'
                 : 'border-gray-200 hover:border-gray-300'">
          <input
            type="radio"
            v-model="analysisType"
            value="query-only"
            class="mt-1 h-5 w-5 text-citebots-orange"
          />
          <div class="ml-4 flex-1">
            <div class="font-semibold text-gray-900 dark:text-white flex items-center">
              Query Analysis Only
              <span class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">FAST</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analyze LLM query responses and citation patterns without scraping cited pages.
              <strong>Completes in minutes.</strong> Best for high-volume query analysis.
            </p>
            <div class="mt-2 text-xs text-gray-500">
              ✅ Query execution • ✅ Citation tracking • ✅ Brand mentions • ✅ Competitor analysis<br/>
              ❌ Page SEO analysis • ❌ Content quality metrics • ❌ Technical SEO scores
            </div>
          </div>
        </label>

        <!-- Comprehensive Option -->
        <label class="flex items-start cursor-pointer p-4 border-2 rounded-lg transition-all"
               :class="analysisType === 'comprehensive'
                 ? 'border-citebots-orange bg-orange-50 dark:bg-orange-900/20'
                 : 'border-gray-200 hover:border-gray-300'">
          <input
            type="radio"
            v-model="analysisType"
            value="comprehensive"
            class="mt-1 h-5 w-5 text-citebots-orange"
          />
          <div class="ml-4 flex-1">
            <div class="font-semibold text-gray-900 dark:text-white flex items-center">
              Comprehensive Analysis
              <span class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">DEEP</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Full analysis including web scraping and AI-powered SEO analysis of all cited pages.
              <strong>Takes several hours.</strong> Best for detailed competitive intelligence.
            </p>
            <div class="mt-2 text-xs text-gray-500">
              ✅ Everything in Query Analysis • ✅ Page scraping • ✅ SEO analysis • ✅ Content quality • ✅ Technical SEO
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Existing keywords/queries input -->
  </div>
</template>

<script setup>
const analysisType = ref('query-only') // Default to faster option

// When navigating to preview-queries
const navigateToPreview = () => {
  router.push({
    path: '/dashboard/analysis/preview-queries',
    query: {
      client_id: clientId.value,
      analysis_type: analysisType.value, // NEW parameter
      // ... existing parameters
    }
  })
}
</script>
```

**Changes Required**:
1. Add analysis type radio buttons
2. Default to 'query-only' (faster, cheaper)
3. Pass `analysis_type` to preview-queries page

### Phase 5: Preview & Execution

**File**: `pages/dashboard/analysis/preview-queries.vue`

```vue
<script setup>
// Read analysis_type from route query
const analysisType = ref(route.query.analysis_type || 'query-only')

// Display in summary section
const runAnalysis = async () => {
  const result = await runAnalysisWithQueue({
    client_id: clientId.value,
    platforms: selectedPlatforms.value,
    queries: selectedQueries,
    report_name: reportName.value,
    analysis_type: analysisType.value // Pass through
  })

  // ... handle result
}
</script>

<template>
  <!-- Analysis Parameters Summary -->
  <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
    <div>
      <span class="text-gray-600">Client:</span>
      <span class="font-medium ml-2">{{ clientName }}</span>
    </div>
    <div>
      <span class="text-gray-600">Analysis Type:</span>
      <span class="font-medium ml-2">
        {{ analysisType === 'query-only' ? 'Query Analysis' : 'Comprehensive' }}
      </span>
    </div>
    <!-- ... other summary fields -->
  </div>
</template>
```

**Changes Required**:
1. Accept `analysis_type` from route query
2. Display in parameters summary
3. Pass to `runAnalysisWithQueue()`

### Phase 6: Report Display

**Files**:
- `pages/dashboard/reports/[id].vue`
- `components/reports/FullScreenDashboard.vue`
- All dashboard components

**Key Question**: How should we display query-only reports differently?

#### Option A: Unified Dashboard (Recommended)

Show the same dashboard for both types, but hide/disable page-level components when `page_analyses` is empty:

```vue
<script setup>
const analysisRun = ref(null)
const isQueryOnly = computed(() =>
  analysisRun.value?.analysis_type === 'query-only'
)

const pageAnalysesAvailable = computed(() =>
  filteredData.value?.page_analyses?.length > 0
)
</script>

<template>
  <!-- Analysis Type Badge -->
  <div class="mb-4" v-if="isQueryOnly">
    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      <svg class="w-4 h-4 mr-2"><!-- lightning icon --></svg>
      Query Analysis Only
    </span>
    <p class="text-sm text-gray-600 mt-2">
      This is a query-only analysis. Page-level SEO metrics are not available.
    </p>
  </div>

  <!-- Query-Level Metrics (Always Shown) -->
  <QueryAnalysisComponent :data="filteredData" />
  <CompetitorMetrics :data="filteredData" />
  <QueryPerformanceTable :queries="queries" />

  <!-- Page-Level Metrics (Only for Comprehensive) -->
  <div v-if="!isQueryOnly && pageAnalysesAvailable">
    <OnPageSEODashboard :data="filteredData" />
    <TechnicalSEOScores :data="filteredData" />
    <ContentQualityAnalysis :data="filteredData" />
  </div>

  <!-- Empty State for Query-Only -->
  <div v-if="isQueryOnly" class="card text-center py-12">
    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4">
      <!-- info icon -->
    </svg>
    <h3 class="text-lg font-semibold mb-2">Page Analysis Not Included</h3>
    <p class="text-gray-600 mb-4">
      This query-only analysis focuses on LLM responses and citation patterns.
      To see detailed page SEO analysis, run a comprehensive analysis.
    </p>
    <button @click="runComprehensiveAnalysis" class="btn-primary">
      Run Comprehensive Analysis
    </button>
  </div>
</template>
```

**Dashboard Component Changes**:
- Add `analysis_type` awareness to all components
- Gracefully handle missing `page_analyses` data
- Show informative empty states for query-only mode
- Offer "upgrade" to comprehensive analysis

#### Option B: Separate Dashboards (Not Recommended)

Create `QueryOnlyDashboard.vue` and route based on `analysis_type`.

**Why Not**: More code duplication, harder to maintain

---

## Implementation Phases

### Phase 1: Database Changes (15 minutes)

**Files to Modify**:
1. Create new migration: `scripts/add-analysis-type-column.sql`

**SQL to Run**:
```sql
-- Add column
ALTER TABLE analysis_runs
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'comprehensive';

-- Add constraint
ALTER TABLE analysis_runs
ADD CONSTRAINT analysis_runs_type_check
CHECK (analysis_type IN ('query-only', 'comprehensive'));

-- Create index
CREATE INDEX idx_analysis_runs_type ON analysis_runs(analysis_type);
```

**Validation**:
```sql
-- Verify column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'analysis_runs'
AND column_name = 'analysis_type';

-- Verify constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'analysis_runs_type_check';
```

### Phase 2: Database Function Update (20 minutes)

**Files to Modify**:
1. `scripts/create-queue-submission-function.sql`

**Changes**:
- Add `p_analysis_type` parameter (default 'comprehensive')
- Store in `analysis_runs.analysis_type`
- Include in `query_data` JSONB
- Return in result object

**Testing**:
```sql
-- Test query-only mode
SELECT submit_analysis_to_queue(
  'client-uuid',
  ARRAY['chatgpt'],
  ARRAY['{"query_text": "test", "keyword": "test", "intent": "test"}'::jsonb],
  'Test Query-Only',
  'query-only'
);

-- Verify analysis_type was stored
SELECT id, analysis_type, processing_method
FROM analysis_runs
ORDER BY created_at DESC
LIMIT 1;
```

### Phase 3: Frontend UI - Analysis Setup (30 minutes)

**Files to Modify**:
1. `pages/dashboard/analysis/index.vue`

**Changes**:
- Add `analysisType` ref
- Add radio button UI for type selection
- Pass `analysis_type` to preview-queries route

**Testing**:
- Select each analysis type
- Verify it's passed to next page
- Check URL query parameters

### Phase 4: Frontend UI - Preview & Execute (20 minutes)

**Files to Modify**:
1. `pages/dashboard/analysis/preview-queries.vue`
2. `composables/useQueueAnalysis.ts`

**Changes**:
- Accept `analysis_type` from route
- Display in parameters summary
- Pass to `runAnalysisWithQueue()`
- Add `analysis_type` parameter to composable

**Testing**:
- Create query-only analysis
- Create comprehensive analysis
- Verify both are created with correct type in database

### Phase 5: Queue Worker Logic (45 minutes)

**Files to Modify**:
1. `local-server/queue-worker.js` (or equivalent)

**Changes**:
- Check `analysis_type` from `query_data`
- Add conditional branching before web scraping
- Skip page analysis for query-only mode
- Update logging/progress tracking

**Pseudo-code**:
```javascript
// After storing query result
if (query_data.analysis_type === 'comprehensive') {
  console.log(`[COMPREHENSIVE] Analyzing ${citations.length} pages`)
  await analyzePages(citations, queryId, client)
} else {
  console.log(`[QUERY-ONLY] Skipping page analysis for ${citations.length} citations`)
}
```

**Testing**:
- Run query-only analysis through queue
- Verify no page_analyses records created
- Verify queries complete much faster
- Check analysis_runs status updates correctly

### Phase 6: Report Display Updates (60 minutes)

**Files to Modify**:
1. `pages/dashboard/reports/[id].vue`
2. `components/reports/FullScreenDashboard.vue`
3. All dashboard sub-components that rely on `page_analyses`

**Changes**:
- Fetch `analysis_type` with report data
- Add computed for `isQueryOnly`
- Show type badge in report header
- Conditionally render page-level components
- Add empty state for query-only reports
- Add "Run Comprehensive Analysis" CTA

**Testing**:
- View query-only report
- Verify page-level sections hidden
- View comprehensive report
- Verify all sections shown
- Test empty states

### Phase 7: Integration Testing (30 minutes)

**Test Cases**:
1. Create query-only analysis with 50 queries
2. Verify completion time (should be < 10 minutes)
3. Verify no page_analyses records created
4. View report, verify correct display
5. Create comprehensive analysis with same queries
6. Verify page_analyses records created
7. View report, verify all sections shown
8. Test platform selection (ChatGPT, Perplexity, both)
9. Test with custom queries
10. Test with keyword-generated queries

---

## File Reference Guide

### Files That Need Changes

| File | Purpose | Changes Required | Complexity |
|------|---------|-----------------|-----------|
| `scripts/add-analysis-type-column.sql` | Database schema | NEW FILE - Add column | Low |
| `scripts/create-queue-submission-function.sql` | Queue submission | Add parameter, store type | Medium |
| `pages/dashboard/analysis/index.vue` | Analysis setup | Add type selection UI | Medium |
| `pages/dashboard/analysis/preview-queries.vue` | Preview & execute | Pass analysis_type | Low |
| `composables/useQueueAnalysis.ts` | Queue composable | Add type parameter | Low |
| `local-server/queue-worker.js` | Queue processing | Add conditional logic | High |
| `pages/dashboard/reports/[id].vue` | Report page | Fetch analysis_type | Low |
| `components/reports/FullScreenDashboard.vue` | Main dashboard | Conditional rendering | Medium |

### Files That Don't Need Changes

| File | Reason |
|------|--------|
| `scripts/schema/create-analysis-tables.sql` | Original schema, not modified |
| `server/api/query-chatgpt.post.ts` | Query execution unchanged |
| `server/api/query-perplexity.post.ts` | Query execution unchanged |
| `components/analysis/QueueProgress.vue` | Progress tracking unchanged |
| Database tables: `analysis_queries`, `page_analyses` | Schema unchanged |

---

## Data Flow Diagrams

### Query-Only Mode Flow

```
[User Selects Query-Only]
         ↓
[Analysis Setup Page]
  - analysis_type = 'query-only'
         ↓
[Preview Queries Page]
  - Displays type in summary
         ↓
[Run Analysis Button]
         ↓
[useQueueAnalysis.runAnalysisWithQueue()]
  - Passes analysis_type: 'query-only'
         ↓
[submit_analysis_to_queue() DB Function]
  - Creates analysis_runs with analysis_type='query-only'
  - Creates queue items with analysis_type in query_data
         ↓
[Local Queue Worker]
  - Processes each queue item:
    1. Execute query → ✅
    2. Extract citations → ✅
    3. Analyze brand mentions → ✅
    4. Store in analysis_queries → ✅
    5. Check analysis_type → 'query-only'
    6. SKIP web scraping → ❌
    7. SKIP page analysis → ❌
    8. Mark complete → ✅
         ↓
[Report Display]
  - Shows query-level metrics
  - Hides page-level sections
  - Shows "Query Analysis Only" badge
```

### Comprehensive Mode Flow

```
[User Selects Comprehensive]
         ↓
[Analysis Setup Page]
  - analysis_type = 'comprehensive'
         ↓
[Preview Queries Page]
  - Displays type in summary
         ↓
[Run Analysis Button]
         ↓
[useQueueAnalysis.runAnalysisWithQueue()]
  - Passes analysis_type: 'comprehensive'
         ↓
[submit_analysis_to_queue() DB Function]
  - Creates analysis_runs with analysis_type='comprehensive'
  - Creates queue items with analysis_type in query_data
         ↓
[Local Queue Worker]
  - Processes each queue item:
    1. Execute query → ✅
    2. Extract citations → ✅
    3. Analyze brand mentions → ✅
    4. Store in analysis_queries → ✅
    5. Check analysis_type → 'comprehensive'
    6. FOR EACH citation:
       - Scrape page with ScrapingBee → ✅
       - Analyze with AI → ✅
       - Store in page_analyses → ✅
    7. Mark complete → ✅
         ↓
[Report Display]
  - Shows all metrics
  - Query-level components
  - Page-level components
  - SEO analysis
  - Content quality
```

---

## Edge Cases & Considerations

### 1. Migrating Existing Analysis Runs

**Problem**: Existing `analysis_runs` records don't have `analysis_type` set.

**Solution**: Default value of 'comprehensive' in schema handles this:
```sql
ALTER TABLE analysis_runs
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'comprehensive';
```

All existing records automatically get 'comprehensive' type, which is correct since they were created before query-only mode existed.

### 2. Mixed Mode in Single Run?

**Question**: Can user run some queries query-only and others comprehensive in one analysis?

**Answer**: No. Analysis type is set at the `analysis_runs` level, not per-query.

**Rationale**:
- Simpler implementation
- Clearer reporting
- User can run separate analyses if needed

### 3. Converting Query-Only to Comprehensive

**Question**: User runs query-only, then wants to add page analysis later?

**Potential Feature** (Future):
- "Upgrade Analysis" button in report
- Creates new analysis_run linked to original
- Reuses existing query data
- Only runs page analysis phase

**Initial Implementation**: Not included. User must run new comprehensive analysis.

### 4. Reporting Metrics Impact

**Challenge**: Some metrics depend on page_analyses data.

**Solution**: Make metrics gracefully handle missing data:

```typescript
// Example: Citation Rate metric
const citationRate = computed(() => {
  if (isQueryOnly.value) {
    // Only show citations mentioned in queries
    return brandCitations.value / totalQueries.value
  } else {
    // Include page-level citation analysis
    return brandPageCitations.value / totalPages.value
  }
})
```

### 5. Benchmark Data

**Question**: Should query-only analyses contribute to `benchmark_data` table?

**Answer**: Yes, but with NULL for page-level metrics:
- `citation_count` ✅
- `response_match` ✅
- `domain_authority_stats` ❌ (NULL)
- `content_quality_metrics` ❌ (NULL)
- `technical_seo_metrics` ❌ (NULL)

### 6. Cost Tracking

**Recommendation**: Add cost tracking columns to `analysis_runs`:
```sql
ALTER TABLE analysis_runs ADD COLUMN cost_api_calls DECIMAL(10,2);
ALTER TABLE analysis_runs ADD COLUMN cost_scraping DECIMAL(10,2);
ALTER TABLE analysis_runs ADD COLUMN cost_total DECIMAL(10,2);
```

This will help quantify the savings of query-only mode.

---

## Testing Checklist

### Database Layer
- [ ] Add `analysis_type` column successfully
- [ ] Constraint allows only valid values
- [ ] Index created successfully
- [ ] Existing records default to 'comprehensive'
- [ ] Database function accepts new parameter
- [ ] Database function stores type correctly
- [ ] Queue items include type in query_data

### Frontend - Setup
- [ ] Analysis type selection renders correctly
- [ ] Radio buttons work correctly
- [ ] Default selection is 'query-only'
- [ ] Type is passed to preview page
- [ ] URL parameters include analysis_type

### Frontend - Preview
- [ ] Type displays in parameters summary
- [ ] Type is passed to composable
- [ ] Composable passes type to DB function

### Queue Worker
- [ ] Worker reads analysis_type from query_data
- [ ] Query-only mode skips web scraping
- [ ] Comprehensive mode runs web scraping
- [ ] Progress tracking works for both modes
- [ ] Error handling works for both modes

### Reports
- [ ] Query-only badge displays correctly
- [ ] Page-level sections hidden for query-only
- [ ] All sections shown for comprehensive
- [ ] Empty states render correctly
- [ ] Metrics calculate correctly for both modes

### Integration
- [ ] End-to-end query-only flow completes
- [ ] End-to-end comprehensive flow completes
- [ ] Both types can run simultaneously
- [ ] Queue processes both types correctly
- [ ] Reports display correctly for both types

### Performance
- [ ] Query-only completes in <10 min for 50 queries
- [ ] Comprehensive still works as before
- [ ] Database queries performant
- [ ] No N+1 query issues

---

## Rollout Strategy

### Step 1: Database Migration (Low Risk)
- Deploy schema changes
- No immediate impact on existing functionality
- Backwards compatible

### Step 2: Backend Functions (Low Risk)
- Update `submit_analysis_to_queue()`
- Defaults to 'comprehensive' if not specified
- Existing code continues to work

### Step 3: Queue Worker (Medium Risk)
- Add conditional logic
- Test thoroughly in development
- Deploy to production queue worker

### Step 4: Frontend UI (Low Risk)
- Add analysis type selection
- Users can choose between modes
- Default to query-only (better UX)

### Step 5: Report Updates (Low Risk)
- Add type-aware rendering
- Graceful degradation for missing data
- Works with both old and new reports

### Rollback Plan

If issues arise:
1. Set analysis_type default to 'comprehensive' in UI
2. Revert queue worker to always run page analysis
3. Keep schema changes (no harm)
4. Investigate and fix issues
5. Re-deploy when stable

---

## Future Enhancements

### 1. Hybrid Mode
Allow users to select specific queries for comprehensive analysis:
- Most queries: query-only
- Important queries: comprehensive
- Saves time and money while getting depth where needed

### 2. Upgrade Analysis
Add "Convert to Comprehensive" button:
- Reuses existing query data
- Only runs page analysis phase
- Links analyses together

### 3. Cost Estimates
Show estimated cost before running:
- Query-only: "$5 for 100 queries"
- Comprehensive: "$45 for 100 queries with page analysis"

### 4. Smart Recommendations
AI suggests analysis type based on:
- Number of queries
- Previous analysis patterns
- Client budget

### 5. Scheduled Analysis
Run query-only daily, comprehensive weekly:
- Track trends with lightweight analyses
- Deep dives on schedule

---

## Questions for User

Before proceeding with implementation:

1. **Default Mode**: Should query-only or comprehensive be the default?
   - Recommendation: Query-only (faster, cheaper, better first experience)

2. **UI Placement**: Where should analysis type selection appear?
   - Option A: On initial analysis setup page (before keywords/queries)
   - Option B: On preview-queries page (after generating queries)
   - Recommendation: Option A (earlier decision = better UX)

3. **Naming**: What should we call these modes in the UI?
   - Option A: "Query Analysis Only" vs "Comprehensive Analysis"
   - Option B: "Quick Analysis" vs "Deep Analysis"
   - Option C: "Citation Analysis" vs "Full SEO Analysis"
   - Recommendation: Option A (most descriptive)

4. **Cost Tracking**: Should we add cost tracking columns now or later?
   - Recommendation: Add now (easy to add, hard to retrofit)

5. **Local Server**: Where is the queue worker code located?
   - Need to find this file to implement conditional logic
   - Likely in `/local-server/` or similar directory

---

## Summary

This architecture document provides a complete roadmap for adding query-only analysis mode to the Citebots platform. The implementation is **backwards compatible**, **low risk**, and provides **immediate value** by:

1. Reducing analysis time from hours to minutes
2. Allowing 10-100x more queries per analysis
3. Cutting costs by 80-90%
4. Maintaining all existing comprehensive analysis functionality

The phased approach ensures each step can be validated independently, with clear rollback options if issues arise.

**Estimated Total Implementation Time**: 3-4 hours

**Next Steps**:
1. Review and approve this architecture
2. Locate queue worker code
3. Begin Phase 1 (database changes)
4. Proceed through phases sequentially with validation at each step
