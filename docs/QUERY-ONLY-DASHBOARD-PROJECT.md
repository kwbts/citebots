# Query-Only Dashboard Project

**Project Status**: Active Development
**Last Updated**: 2025-01-18
**Purpose**: Create distinct dashboard experiences for query-only vs comprehensive analysis types

---

## Overview

This project partitions the Citebots reporting system into two distinct dashboard types based on analysis mode:

1. **Query-Only Dashboard** - Fast, lightweight analysis focused on LLM query responses only
2. **Comprehensive Dashboard** - Full analysis including web scraping, page analysis, and SEO metrics

### Why This Matters

- **Speed**: Query-only completes in minutes vs hours for comprehensive
- **Cost**: Query-only is 90-95% cheaper (no web scraping/page analysis)
- **Use Cases**: Different analysis needs require different toolsets
- **User Experience**: Tailored interfaces for each analysis type

---

## Architecture

### Routing & Conditional Rendering

**Entry Point**: `pages/dashboard/reports/[id].vue`

The page automatically detects analysis type and renders the appropriate dashboard:

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

**Detection Logic**:
```js
const isQueryOnlyAnalysis = computed(() => {
  return analysisRun.value?.analysis_type === 'query-only'
})
```

### Database Schema

**Analysis Type Column**:
```sql
ALTER TABLE analysis_runs
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'comprehensive'
CHECK (analysis_type IN ('query-only', 'comprehensive'));
```

---

## Dashboard Components

### Query-Only Dashboard
**File**: `components/reports/QueryOnlyDashboard.vue`

**Tabs** (5 total):
1. **Overview** - Core brand metrics, competitor mentions, query performance
2. **Brand Performance** - Sentiment analysis, brand mention breakdown
3. **Query Explorer** - Filterable query table with advanced search
4. **Competitors** - Competitor mention patterns and analysis
5. **Raw Data** - JSON data view for debugging

**Key Components Used**:
- `QueryAnalysisComponent` - Brand mention & citation metrics
- `CompetitorMentionRate` - Competitor mention analysis
- `BrandMentionByOutcome` - Query outcome visualization
- `QueryPerformanceTable` - Detailed query table
- `QueryExplorerDashboard` - Query filtering & exploration
- `CompetitorComparisonDashboard` - Competitor comparison
- `RawDataView` - Raw JSON data

### Comprehensive Dashboard
**File**: `components/reports/FullScreenDashboard.vue`

**Tabs** (8 total):
1. **Overview** - Core brand metrics (same as query-only)
2. **Brand Performance** - Same as query-only
3. **Query Analysis** - Advanced query analysis (comprehensive-only)
4. **Query Explorer** - Same as query-only
5. **Technical SEO** - On-page SEO metrics (requires page data)
6. **Page Analytics** - Page performance analysis (requires page data)
7. **Competitors** - Same as query-only
8. **Raw Data** - Same as query-only

**Additional Components**:
- `QueryAnalysisDashboard` - Comprehensive-only advanced analysis
- `OnPageSEODashboard` - Technical SEO metrics (page-dependent)
- `PageAnalyticsDashboard` - Page analytics (page-dependent)
- `CompetitorMetrics` - Includes citation-based metrics

---

## Navigation System

### Sidebar Component
**File**: `components/layout/SidebarContextPanel.vue`

The sidebar dynamically shows/hides tabs based on analysis type using the `isQueryOnly` computed property:

```js
const isQueryOnly = computed(() => analysisType.value === 'query-only')
```

**Conditional Tab Rendering**:
```vue
<!-- Shows only in comprehensive -->
<NuxtLink v-if="!isQueryOnly" :to="...?tab=query-analysis">
  Query Analysis
</NuxtLink>

<!-- Shows only in comprehensive -->
<NuxtLink v-if="!isQueryOnly" :to="...?tab=technical-seo">
  Technical SEO
</NuxtLink>

<!-- Shows only in comprehensive -->
<NuxtLink v-if="!isQueryOnly" :to="...?tab=page-analytics">
  Page Analytics
</NuxtLink>

<!-- Shows in both -->
<NuxtLink :to="...?tab=overview">
  Overview
</NuxtLink>
```

---

## Data Requirements

### Query-Only Analysis Needs

```typescript
{
  analysis_run: {
    id: UUID
    name: string
    analysis_type: 'query-only'
    created_at: timestamp
    status: 'completed' | 'running' | 'failed'
  },

  analysis_queries: [
    {
      id: UUID
      query_text: string
      data_source: 'chatgpt' | 'perplexity'
      brand_mentioned: boolean
      brand_mention_type: string
      competitor_mentioned_names: string[]
      competitor_count: number
      query_intent: string
      query_type: string
      query_competition: string
      response_match: string
      response_outcome: string
      model_response: string
      sentiment_score: number
      ...
    }
  ],

  competitors: [
    { id: UUID, name: string, domain: string }
  ],

  client: {
    id: UUID, name: string, domain: string
  }
}
```

### Comprehensive Analysis Adds

```typescript
{
  page_analyses: [
    {
      id: UUID
      query_id: UUID
      citation_url: string
      domain_name: string
      is_client_domain: boolean
      is_competitor_domain: boolean
      content_quality: object
      technical_seo: object
      page_performance: object
      ...
    }
  ]
}
```

---

## Component Dependency Matrix

| Component | Queries | Pages | Competitors | Query-Only | Comprehensive |
|-----------|---------|-------|-------------|------------|---------------|
| QueryAnalysisComponent | ✅ | ❌ | ✅ | ✅ | ✅ |
| QueryPerformanceTable | ✅ | ❌ | ❌ | ✅ | ✅ |
| BrandPerformanceDashboard | ✅ | ❌ | ✅ | ✅ | ✅ |
| QueryExplorerDashboard | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| CompetitorComparisonDashboard | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| RawDataView | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| QueryAnalysisDashboard | ✅ | ⚠️ | ✅ | ❌ | ✅ |
| OnPageSEODashboard | ❌ | ✅ | ❌ | ❌ | ✅ |
| PageAnalyticsDashboard | ❌ | ✅ | ❌ | ❌ | ✅ |

**Legend**:
- ✅ Required
- ❌ Not needed
- ⚠️ Optional/Conditional

---

## File Structure

```
kb-citebots/
├── pages/
│   └── dashboard/
│       └── reports/
│           └── [id].vue                          # Entry point, conditional rendering
│
├── components/
│   ├── layout/
│   │   └── SidebarContextPanel.vue               # Navigation with tab filtering
│   │
│   └── reports/
│       ├── QueryOnlyDashboard.vue                # Query-only dashboard (5 tabs)
│       ├── FullScreenDashboard.vue               # Comprehensive dashboard (8 tabs)
│       │
│       ├── BrandPerformanceDashboard.vue         # Shared
│       ├── QueryExplorerDashboard.vue            # Shared
│       ├── CompetitorComparisonDashboard.vue     # Shared
│       ├── RawDataView.vue                       # Shared
│       │
│       ├── QueryAnalysisDashboard.vue            # Comprehensive-only
│       ├── OnPageSEODashboard.vue                # Comprehensive-only
│       ├── PageAnalyticsDashboard.vue            # Comprehensive-only
│       │
│       └── components/
│           ├── QueryAnalysisComponent.vue        # Shared
│           ├── QueryPerformanceTable.vue         # Shared
│           ├── QueryAnalysisTable.vue            # Shared
│           ├── CompetitorMentionRate.vue         # Query-only specific
│           ├── BrandMentionByOutcome.vue         # Query-only specific
│           ├── CompetitorMetrics.vue             # Comprehensive (includes citations)
│           ├── BrandQueryPerformanceCard.vue     # Shared
│           ├── SentimentAnalysis.vue             # Shared
│           ├── BrandMentionBreakdown.vue         # Shared
│           ├── QueryCompetitivenessAnalysis.vue  # Shared
│           └── *Metric.vue                       # Various metric components
│
├── composables/
│   └── useQueueAnalysis.ts                       # Handles analysis_type parameter
│
├── scripts/
│   └── create-queue-submission-function.sql      # DB function accepts analysis_type
│
└── docs/
    ├── QUERY-ONLY-DASHBOARD-PROJECT.md          # This file
    ├── QUERY-ONLY-DASHBOARD-PARTITIONING-PLAN.md
    ├── PHASE-2-COMPLETION-SUMMARY.md
    └── DEPLOYMENT-QUERY-ONLY-FEATURE.md
```

---

## Key Files Reference

### Core Dashboard Files
- `pages/dashboard/reports/[id].vue` - Entry point with conditional rendering
- `components/reports/QueryOnlyDashboard.vue` - Query-only dashboard implementation
- `components/reports/FullScreenDashboard.vue` - Comprehensive dashboard implementation
- `components/layout/SidebarContextPanel.vue` - Navigation with tab filtering

### Shared Components (Work with Both)
- `components/reports/BrandPerformanceDashboard.vue`
- `components/reports/QueryExplorerDashboard.vue`
- `components/reports/CompetitorComparisonDashboard.vue`
- `components/reports/RawDataView.vue`
- `components/reports/components/QueryAnalysisComponent.vue`
- `components/reports/components/QueryPerformanceTable.vue`
- `components/reports/components/QueryAnalysisTable.vue`
- `components/reports/components/BrandQueryPerformanceCard.vue`
- `components/reports/components/SentimentAnalysis.vue`

### Query-Only Specific
- `components/reports/components/CompetitorMentionRate.vue`
- `components/reports/components/BrandMentionByOutcome.vue`

### Comprehensive-Only
- `components/reports/QueryAnalysisDashboard.vue`
- `components/reports/OnPageSEODashboard.vue`
- `components/reports/PageAnalyticsDashboard.vue`
- `components/reports/components/CompetitorMetrics.vue` (includes citation data)

### Backend/Data
- `composables/useQueueAnalysis.ts` - Analysis submission with type parameter
- `scripts/create-queue-submission-function.sql` - DB function
- `scripts/migrations/add-analysis-type-column.sql` - Schema migration

---

## Development Workflow

### Adding a New Tab

1. **Determine if it's shared or exclusive**
   - Query-only: Only needs `analysis_queries` data
   - Comprehensive-only: Needs `page_analyses` data
   - Shared: Works with either

2. **Create the component**
   ```bash
   # Example: New query-only tab
   touch components/reports/QueryInsightsDashboard.vue
   ```

3. **Add to appropriate dashboard(s)**
   ```vue
   <!-- In QueryOnlyDashboard.vue -->
   <QueryInsightsDashboard
     v-else-if="activeTab === 'query-insights'"
     :data="filteredData"
     :client="client"
   />
   ```

4. **Update sidebar navigation**
   ```vue
   <!-- In SidebarContextPanel.vue -->
   <NuxtLink :to="`${getCurrentReportPath()}?tab=query-insights`">
     Query Insights
   </NuxtLink>
   ```

5. **Import the component**
   ```js
   import QueryInsightsDashboard from './QueryInsightsDashboard.vue'
   ```

### Adding Tab Conditionally

For comprehensive-only tabs:
```vue
<NuxtLink v-if="!isQueryOnly" :to="...?tab=technical-seo">
  Technical SEO
</NuxtLink>
```

For query-only tabs (future):
```vue
<NuxtLink v-if="isQueryOnly" :to="...?tab=query-insights">
  Query Insights
</NuxtLink>
```

---

## Testing Checklist

### Query-Only Dashboard
- [ ] Navigate to query-only report
- [ ] Verify 5 tabs visible: Overview, Brand Performance, Query Explorer, Competitors, Raw Data
- [ ] Verify Query Analysis tab is NOT visible
- [ ] Verify Technical SEO tab is NOT visible
- [ ] Verify Page Analytics tab is NOT visible
- [ ] Test each tab loads without errors
- [ ] Verify no console errors about missing page data
- [ ] Test platform filtering works
- [ ] Test query table expansion works
- [ ] Verify competitor data displays correctly

### Comprehensive Dashboard
- [ ] Navigate to comprehensive report
- [ ] Verify 8 tabs visible (all tabs including Query Analysis, Technical SEO, Page Analytics)
- [ ] Test each tab loads without errors
- [ ] Verify page-dependent tabs show page data
- [ ] Test citation analysis features
- [ ] Test SEO scoring displays

### Cross-Dashboard
- [ ] Verify sidebar updates correctly for each type
- [ ] Test tab navigation preserves URL parameters
- [ ] Test report title editing works in both
- [ ] Test export functionality (if applicable)
- [ ] Test with zero competitors
- [ ] Test with empty query results

---

## Known Limitations & Future Work

### Current Limitations
1. No visual badge/indicator showing analysis type
2. Some components (e.g., CompetitorComparisonDashboard) may have page-dependent features that gracefully degrade
3. No "upgrade" path from query-only to comprehensive post-analysis

### Future Enhancements
1. **Phase 3**: Create query-only specific dashboards
   - Query Insights Dashboard (topic clustering, sentiment trends)
   - Competitor Landscape Dashboard (detailed competitor patterns)
   - Content Opportunities Dashboard (content gaps, recommendations)

2. **Phase 4**: Visual differentiation
   - Add analysis type badge to report header
   - Use different color accents (blue for query-only, orange for comprehensive)
   - Add tooltips explaining differences

3. **Phase 5**: Advanced features
   - Allow upgrading query-only analysis to comprehensive
   - Historical comparison across analysis types
   - Smart recommendations for which analysis type to use

---

## Troubleshooting

### Issue: Tab Shows Empty/No Data
**Cause**: Component expects page data that doesn't exist in query-only mode
**Fix**: Ensure component is wrapped in `v-if="!isQueryOnly"` in sidebar, or add conditional rendering within component

### Issue: Sidebar Shows Wrong Tabs
**Cause**: `analysisType` not being passed correctly or `isQueryOnly` computed not working
**Fix**: Check that `analysisRun.analysis_type` is set correctly in database and passed to sidebar

### Issue: Query Analysis Tab Still Visible in Query-Only
**Cause**: Missing `v-if="!isQueryOnly"` in SidebarContextPanel.vue
**Fix**: Add conditional to Query Analysis link (line ~160 in SidebarContextPanel.vue)

### Issue: Component Errors About Missing Page Data
**Cause**: Comprehensive-only component being rendered in query-only mode
**Fix**: Ensure component is not imported/rendered in QueryOnlyDashboard.vue

---

## Performance Considerations

### Query-Only Advantages
- **Load Time**: ~2-5 seconds (vs 10-30 seconds for comprehensive)
- **Data Payload**: ~50-200 KB (vs 500-2000 KB for comprehensive)
- **Analysis Time**: Minutes (vs hours for comprehensive)
- **API Cost**: $0.02-0.05 per query (vs $0.50-2.00 per query)

### Optimization Tips
1. Lazy load tab components (future enhancement)
2. Virtualize large query tables (>100 rows)
3. Memoize expensive computations in computed properties
4. Use pagination for query tables
5. Cache competitor data

---

## Changelog

### 2025-01-18 - Phase 2 Complete
**Added**:
- Query-only dashboard now has 5 tabs (was 1):
  - Overview
  - Brand Performance
  - Query Explorer
  - Competitors
  - Raw Data

**Changed**:
- Removed Query Analysis tab from query-only dashboard sidebar
- Made Competitors tab visible in both dashboard types
- Removed Testing tab from both dashboards
- Added RawDataView back to query-only dashboard

**Fixed**:
- Query Analysis tab no longer appears in query-only sidebar navigation
- Sidebar now correctly filters tabs based on `isQueryOnly` computed property
- QueryAnalysisTable component fixed horizontal overflow issues
- Model response content now wraps properly

**Files Modified**:
- `components/layout/SidebarContextPanel.vue`
- `components/reports/QueryOnlyDashboard.vue`
- `components/reports/components/QueryAnalysisTable.vue`

### 2025-01-18 - Query Explorer Table Optimization
**Changed**:
- Removed Intent, Competitors, and Response columns from QueryAnalysisTable
- Moved removed fields to expanded query details section
- Added "Full Query" box above model response in expanded view
- Table now has 5 columns instead of 8 (Query, Platform, Type, Brand, Competition)

**Files Modified**:
- `components/reports/components/QueryAnalysisTable.vue`

### 2025-01-04 - Initial Query-Only Feature
**Added**:
- `analysis_type` column to `analysis_runs` table
- Query-only analysis mode support in backend
- Conditional dashboard rendering in `pages/dashboard/reports/[id].vue`
- QueryOnlyDashboard.vue component

**Documentation**:
- Created DEPLOYMENT-QUERY-ONLY-FEATURE.md
- Created query-analysis-split-spec.md

---

## Support & Resources

### Documentation
- [Main Partitioning Plan](./QUERY-ONLY-DASHBOARD-PARTITIONING-PLAN.md)
- [Phase 2 Completion Summary](./PHASE-2-COMPLETION-SUMMARY.md)
- [Deployment Guide](./DEPLOYMENT-QUERY-ONLY-FEATURE.md)
- [Feature Spec](./features/query-analysis-split-spec.md)

### Database
- Schema migration: `scripts/migrations/add-analysis-type-column.sql`
- Queue function: `scripts/create-queue-submission-function.sql`

### Key Patterns
- Conditional rendering based on `analysis_type`
- Sidebar navigation filtering with `isQueryOnly` computed
- Shared components work with query-only data
- Page-dependent components only in comprehensive dashboard

---

**Last Updated**: 2025-01-18
**Status**: Active Development - Phase 2 Complete, Phase 3 Planned
**Maintainer**: Development Team
