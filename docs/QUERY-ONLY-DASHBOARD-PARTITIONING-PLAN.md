# Query-Only Dashboard Partitioning Plan

**Created**: 2025-01-18
**Status**: Planning Phase
**Goal**: Partition query-only and comprehensive dashboards to provide distinct, optimized experiences

---

## Current Architecture

### Routing (Already Implemented ✅)

**File**: `pages/dashboard/reports/[id].vue`

```vue
<!-- Query-Only Dashboard -->
<QueryOnlyDashboard
  v-if="isQueryOnlyAnalysis"
  :data="reportData"
  :client="client"
  :analysis-run="analysisRun"
  :activeTab="activeTab"
/>

<!-- Comprehensive Dashboard -->
<FullScreenDashboard
  v-else
  :data="reportData"
  :client="client"
  :analysis-run="analysisRun"
  :activeTab="activeTab"
/>
```

**Conditional Logic**:
```js
const isQueryOnlyAnalysis = computed(() => {
  return analysisRun.value?.analysis_type === 'query-only'
})
```

### Current Dashboard Files

**Query-Only** (QueryOnlyDashboard.vue):
- ✅ Overview tab (with QueryAnalysisComponent, BrandMentionByOutcome, CompetitorMentionRate, QueryPerformanceTable)
- ❌ Missing additional tabs

**Comprehensive** (FullScreenDashboard.vue):
- ✅ Overview
- ✅ Brand Performance
- ✅ Query Analysis
- ✅ Query Explorer
- ✅ Technical SEO (page-dependent)
- ✅ Page Analytics (page-dependent)
- ✅ Competitor Comparison

---

## Component Classification

### Category 1: **Shared Components** (Work with Query-Only Data)

These components only need `analysis_queries` data:

| Component | Location | Used In | Status |
|-----------|----------|---------|--------|
| QueryAnalysisComponent | `components/reports/components/` | Both | ✅ Shared |
| QueryPerformanceTable | `components/reports/components/` | Both | ✅ Shared |
| BrandMentionByOutcome | `components/reports/components/` | Query-Only | ✅ Shared |
| CompetitorMentionRate | `components/reports/components/` | Query-Only | ✅ Shared |
| QueryExplorerDashboard | `components/reports/` | Both | ✅ Shared |
| BrandPerformanceDashboard | `components/reports/` | Both | ⚠️ Needs audit |
| All Metric Components | `components/reports/components/*Metric.vue` | Both | ✅ Shared |

### Category 2: **Comprehensive-Only Components** (Require Page Data)

These components need `page_analyses` data (won't work for query-only):

| Component | Requirement | Reason |
|-----------|-------------|--------|
| OnPageSEODashboard | `page_analyses` | Technical SEO scores, meta tags |
| PageAnalyticsDashboard | `page_analyses` | Page performance metrics |
| CompetitorMetrics (citation part) | `page_analyses` | Citation rates, domain analysis |
| TechnicalSEOScores | `page_analyses` | Page-level SEO scores |
| TechnicalSEOImplementation | `page_analyses` | SEO implementation details |

### Category 3: **New Query-Only Components to Create**

These are unique to query-only analysis:

| Component | Purpose | Data Source | Priority |
|-----------|---------|-------------|----------|
| QueryInsightsDashboard | Topic clustering, sentiment trends | `analysis_queries` | High |
| CompetitorLandscapeDashboard | Competitor mention patterns | `analysis_queries.competitor_mentioned_names` | Medium |
| ContentOpportunitiesDashboard | Content gaps, keyword opportunities | `analysis_queries` | Medium |
| PerformanceTrendsDashboard | Historical query performance | Multiple `analysis_runs` | Low |

---

## Tab Structure Design

### Query-Only Dashboard Tabs

```
1. Overview (Current) ✅
   - QueryAnalysisComponent (brand metrics)
   - CompetitorMentionRate
   - BrandMentionByOutcome
   - QueryPerformanceTable

2. Brand Performance 🆕
   - BrandQueryPerformanceCard
   - SentimentAnalysis
   - BrandMentionBreakdown
   - QueryCompetitivenessAnalysis

3. Query Explorer (Reuse) ✅
   - QueryExplorerDashboard

4. Query Insights 🆕
   - Sentiment trends over queries
   - Topic clustering
   - Intent distribution
   - Query type breakdown

5. Competitor Landscape 🆕
   - Competitor mention frequency
   - Platform-wise competitor analysis
   - Head-to-head comparisons
   - Competitive gaps

6. Content Opportunities 🆕
   - Content gap queries
   - Defensive queries
   - Opportunity queries
   - Recommended actions
```

### Comprehensive Dashboard Tabs (Keep Current)

```
1. Overview ✅
2. Brand Performance ✅
3. Query Analysis ✅
4. Query Explorer ✅
5. Technical SEO ✅ (page-dependent)
6. Page Analytics ✅ (page-dependent)
7. Competitor Comparison ✅
```

---

## Implementation Phases

### **Phase 1: Audit & Adapt Existing Components** (2-3 hours)

**Goal**: Ensure shared components work with both dashboard types

**Tasks**:
1. ✅ Audit `BrandPerformanceDashboard.vue`
   - Check if it depends on `page_analyses`
   - If yes, create query-only variant or make conditional

2. ✅ Audit `CompetitorComparisonDashboard.vue`
   - Ensure it works with query-level competitor data
   - Hide citation-based metrics for query-only

3. ✅ Create conditional rendering helpers
   ```js
   const hasPageData = computed(() => {
     return data.value?.page_analyses?.length > 0
   })
   ```

**Deliverables**:
- Document which components need adaptation
- List of components that are truly shared
- List of components that need variants

---

### **Phase 2: Add Existing Tabs to Query-Only Dashboard** (1-2 hours)

**Goal**: Enable shared tabs in QueryOnlyDashboard

**File**: `components/reports/QueryOnlyDashboard.vue`

**Current**:
```vue
<div v-if="activeTab === 'overview'" class="brand-dashboard">
  <!-- Overview content -->
</div>
```

**Add**:
```vue
<!-- Brand Performance Dashboard -->
<BrandPerformanceDashboard
  v-else-if="activeTab === 'brand-performance'"
  :data="filteredData"
  :client="client"
  :competitors="competitors"
/>

<!-- Query Explorer Dashboard -->
<QueryExplorerDashboard
  v-else-if="activeTab === 'query-explorer'"
  :data="filteredData"
  :client="client"
/>
```

**Tasks**:
1. Add tab rendering to QueryOnlyDashboard
2. Update sidebar navigation for query-only reports
3. Test each tab with query-only data

**Deliverables**:
- Query-only dashboard with 3 tabs: Overview, Brand Performance, Query Explorer

---

### **Phase 3: Create New Query-Only Components** (4-6 hours)

**Priority Order**:

#### 3A. Query Insights Dashboard (High Priority)

**File**: `components/reports/QueryInsightsDashboard.vue`

**Sections**:
- Intent distribution (pie chart)
- Sentiment breakdown (sentiment scores)
- Platform comparison
- Query type analysis
- Topic word cloud (if we have topic data)

**Metrics**:
- % Informational vs Commercial vs Transactional
- Average sentiment score
- Most common query patterns

#### 3B. Competitor Landscape Dashboard (Medium Priority)

**File**: `components/reports/CompetitorLandscapeDashboard.vue`

**Sections**:
- Competitor mention frequency (bar chart)
- Platform-wise competitor presence
- Co-occurrence analysis (which competitors appear together)
- Competitor sentiment analysis

**Metrics**:
- Top 5 competitors by mention count
- Competitor mention rate by platform
- Competitive intensity score

#### 3C. Content Opportunities Dashboard (Medium Priority)

**File**: `components/reports/ContentOpportunitiesDashboard.vue`

**Sections**:
- Content gap queries (brand not mentioned, competitors mentioned)
- Defensive queries (brand mentioned, competitors also mentioned)
- Opportunity queries (brand mentioned, competitors not mentioned)
- Recommended actions

**Metrics**:
- Content gap count & percentage
- Defensive query count
- Win rate (queries where brand wins)

---

### **Phase 4: Update Navigation** (1 hour)

**Goal**: Update sidebar to show appropriate tabs for each dashboard type

**File**: `components/layout/SidebarContextPanel.vue`

**Current Approach**:
- Sidebar likely has hardcoded tab list

**New Approach**:
- Pass `analysisType` to sidebar
- Conditionally render tabs based on type

**Query-Only Tabs**:
```js
const queryOnlyTabs = [
  { id: 'overview', label: 'Overview', icon: 'chart-bar' },
  { id: 'brand-performance', label: 'Brand Performance', icon: 'trending-up' },
  { id: 'query-explorer', label: 'Query Explorer', icon: 'search' },
  { id: 'query-insights', label: 'Query Insights', icon: 'lightbulb' },
  { id: 'competitor-landscape', label: 'Competitors', icon: 'users' },
  { id: 'content-opportunities', label: 'Opportunities', icon: 'target' }
]
```

**Comprehensive Tabs**:
```js
const comprehensiveTabs = [
  { id: 'overview', label: 'Overview', icon: 'chart-bar' },
  { id: 'brand-performance', label: 'Brand Performance', icon: 'trending-up' },
  { id: 'query-analysis', label: 'Query Analysis', icon: 'clipboard-list' },
  { id: 'query-explorer', label: 'Query Explorer', icon: 'search' },
  { id: 'technical-seo', label: 'Technical SEO', icon: 'code' },
  { id: 'page-analytics', label: 'Page Analytics', icon: 'document-text' },
  { id: 'competitors', label: 'Competitor Comparison', icon: 'users' }
]
```

---

### **Phase 5: Visual Differentiation** (Optional, 30 min)

**Goal**: Help users distinguish dashboard types at a glance

**Ideas**:
1. Add badge to report title
   ```vue
   <span class="badge">Query-Only Analysis</span>
   ```

2. Different color accent
   - Query-Only: Blue accent
   - Comprehensive: Orange accent

3. Info tooltip explaining the difference

---

## Data Requirements

### Query-Only Dashboard Needs:
```js
{
  analysis_run: { id, name, analysis_type: 'query-only', ... },
  analysis_queries: [
    {
      id,
      query_text,
      data_source,
      brand_mentioned,
      brand_mention_type,
      competitor_mentioned_names,
      competitor_count,
      query_intent,
      query_type,
      query_competition,
      response_match,
      response_outcome,
      model_response,
      sentiment_score,
      ...
    }
  ],
  competitors: [{ id, name, domain }],
  client: { id, name, domain }
}
```

### Comprehensive Dashboard Needs:
All of above PLUS:
```js
{
  page_analyses: [
    {
      id,
      query_id,
      citation_url,
      domain_name,
      is_client_domain,
      is_competitor_domain,
      content_quality,
      technical_seo,
      page_performance,
      ...
    }
  ]
}
```

---

## Migration Strategy

### For Existing Analyses

**Question**: What happens to existing analyses without `analysis_type` set?

**Options**:
1. Default to 'comprehensive' for backward compatibility
2. Infer from data (if page_analyses exist → comprehensive)
3. Migration script to set `analysis_type`

**Recommendation**:
```sql
-- Set analysis_type for existing runs
UPDATE analysis_runs
SET analysis_type = 'comprehensive'
WHERE analysis_type IS NULL;
```

---

## Testing Checklist

### Query-Only Dashboard Tests

- [ ] Overview tab displays correctly
- [ ] Brand Performance tab works without page data
- [ ] Query Explorer tab functions properly
- [ ] All metrics calculate correctly
- [ ] Platform filtering works
- [ ] No console errors about missing page data
- [ ] Export/screenshot functionality works
- [ ] Title editing works
- [ ] Navigation between tabs works

### Comprehensive Dashboard Tests

- [ ] All existing tabs still work
- [ ] Page-dependent tabs display correctly
- [ ] No regression in functionality
- [ ] Correct tab list shows in sidebar

### Edge Cases

- [ ] Empty query results
- [ ] No competitors defined
- [ ] Mixed platform data
- [ ] Very large datasets (100+ queries)

---

## Performance Considerations

### Query-Only Advantages:
- Faster load times (no page data to fetch)
- Smaller data payload
- Quicker rendering

### Optimization Tips:
1. Lazy load tab components
2. Virtualize large query tables
3. Memoize expensive computations
4. Consider pagination for >50 queries

---

## Documentation Needs

### User-Facing:
1. Help article: "Query-Only vs Comprehensive Analysis"
2. Tab tooltips explaining each section
3. FAQ section on when to use each type

### Developer-Facing:
1. Component prop documentation
2. Data structure schemas
3. Adding new tabs guide
4. Creating custom metrics guide

---

## Open Questions

1. **Historical Comparison**: Should query-only analyses be comparable to comprehensive analyses?
2. **Upgrade Path**: Can users "upgrade" a query-only analysis to comprehensive later?
3. **Hybrid Mode**: Should there be a "query-only with selective page scraping" mode?
4. **Shared Tabs**: Should some tabs be identical or slightly different between types?
5. **Export Format**: Should exports differ between dashboard types?

---

## Success Metrics

### Product Metrics:
- % of analyses that are query-only vs comprehensive
- Average time spent on each dashboard type
- Tab engagement by analysis type
- User satisfaction scores

### Technical Metrics:
- Dashboard load time comparison
- Data payload size comparison
- Error rates by dashboard type

---

## Timeline Estimate

| Phase | Duration | Parallel Work Possible |
|-------|----------|----------------------|
| Phase 1: Audit | 2-3 hours | No |
| Phase 2: Add Tabs | 1-2 hours | No |
| Phase 3A: Query Insights | 2 hours | Yes |
| Phase 3B: Competitor Landscape | 2 hours | Yes |
| Phase 3C: Content Opportunities | 2 hours | Yes |
| Phase 4: Navigation | 1 hour | No |
| Phase 5: Visual Differentiation | 30 min | Yes |
| **Total** | **10-12 hours** | **6-8 hours with parallel work** |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Decide on phase priority** (all at once vs iterative)
3. **Choose first component** to build (recommendation: Phase 2 first for quick win)
4. **Set up development branch** for dashboard partitioning work
5. **Create component templates** for new dashboards

---

## Appendix: Component Dependency Matrix

| Component | Needs Queries | Needs Pages | Needs Competitors | Can Share |
|-----------|--------------|-------------|-------------------|-----------|
| QueryAnalysisComponent | ✅ | ❌ | ✅ | ✅ Yes |
| QueryPerformanceTable | ✅ | ❌ | ❌ | ✅ Yes |
| BrandPerformanceDashboard | ✅ | ⚠️ Optional | ✅ | ⚠️ Maybe |
| QueryExplorerDashboard | ✅ | ⚠️ Optional | ❌ | ✅ Yes |
| OnPageSEODashboard | ❌ | ✅ | ❌ | ❌ No |
| PageAnalyticsDashboard | ❌ | ✅ | ❌ | ❌ No |
| CompetitorComparisonDashboard | ✅ | ⚠️ Optional | ✅ | ⚠️ Maybe |

Legend:
- ✅ Required
- ❌ Not needed
- ⚠️ Optional/Conditional

---

**End of Plan**
