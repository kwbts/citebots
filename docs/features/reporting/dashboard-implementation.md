# Dashboard Implementation Plan - Citebots Reports

## Overview

Implementation plan for creating comprehensive analytics dashboards within the existing reports system at `/pages/dashboard/reports/[id].vue`. The dashboard will feature a left navigation panel with multiple tabs and top-level filters for data exploration.

## Database Schema Validation

Based on `schema.json` analysis, the following data sources are available:

### Primary Tables:
- `analysis_queries` - Core query analysis data
- `page_analyses` - Page-level citation and SEO data  
- `competitors` - Competitor information
- `analysis_runs` - Analysis batch metadata
- `clients` - Client information

### Key Data Fields Available:
✅ `brand_mentioned`, `brand_sentiment`, `brand_mention_type`
✅ `competitor_mentioned_names`, `competitor_analysis`, `competitor_context`
✅ `query_intent`, `query_type`, `query_category`, `funnel_stage`
✅ `citation_count`, `citation_position`, `response_match`
✅ `technical_seo`, `content_quality`, `page_performance` (JSONB)
✅ `relevance_score`, `content_quality_score`

## Dashboard Architecture

### Layout Structure:
```
┌─────────────────────────────────────────────────────────┐
│ Report Title + Top Filters                              │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│ Left Panel  │          Main Content Area                │
│ Navigation  │                                           │
│             │                                           │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
```

### Top-Level Filters:
- **View Type**: Brand / Competitor / All (Default: All)
- **Platform**: ChatGPT / Perplexity (Multi-select)
- **Date Range**: Analysis run date picker
- **Query Intent**: Multi-select dropdown
- **Funnel Stage**: Multi-select dropdown

## Dashboard Tabs Implementation

### 1. Brand Performance

#### Query Metrics:
- **Mention Rate**: `COUNT(brand_mentioned=true) / COUNT(*)`
- **Number of Queries Mentioned**: `COUNT(brand_mentioned=true)`
- **Vs Competitor**: Side-by-side comparison with competitor mention rates
- **Average Brand Mentions**: `AVG(brand_mention_count)`
- **Brand Sentiment Score**: `AVG(brand_sentiment)`
- **Brand Mention Type Distribution**: Pie chart of `brand_mention_type`
- **Query Intent vs Brand Success**: Heatmap of `query_intent` vs `brand_mentioned`

#### Citation Metrics:
- **Citation Mention Rate**: `COUNT(is_client_domain=true) / COUNT(*)`
- **Citation Count**: `COUNT(page_analyses WHERE is_client_domain=true)`
- **Vs Competitor**: Citation rate comparison

#### Query Types Visualization:
- **Pie Chart**: Query intent distribution with brand presence
- **Query Explorer**: Filterable list on left side

**Data Sources**: `analysis_queries`, `page_analyses`

---

### 2. Competitor Comparison

#### Core Metrics:
- **Competitor Mentioned**: `competitor_mentioned_names` analysis
- **Query by Mention Type**: Cross-analysis of `brand_mention_type` vs competitors
- **Head-to-Head Analysis**: Direct comparison matrix

**Visualizations**:
- Competitor mention frequency bar chart
- Market share pie chart
- Head-to-head performance table

**Data Sources**: `analysis_queries.competitor_analysis`, `competitor_analysis_summary`

---

### 3. On-page SEO

#### Structured Data:
- **Client vs Average**: Structured data implementation rate
- **Query Performance**: SEO score vs query success correlation

#### Technical Metrics (from `technical_seo` JSONB):
- SSL Certificate presence
- Semantic HTML usage
- CDN Usage detection
- Hreflang implementation
- ARIA usage patterns

#### Content Analysis (from `content_quality` JSONB):
- **Word Count Distribution**: Histogram of content length
- **Readability Scores**: Average and distribution
- **HTML Elements**: Usage of tables, lists, headings

**Data Sources**: `page_analyses.technical_seo`, `page_analyses.content_quality`

---

### 4. Query Analysis

#### Mention Patterns:
- **By Query Type**: `query_type` vs mention success
- **By Query Intent**: `query_intent` performance breakdown
- **By Brand Mention Type**: Distribution analysis
- **Competitor Context**: `competitor_context` analysis
- **Funnel Stage**: Performance by `funnel_stage`
- **Response Match Success**: `response_match` by `query_type`
- **Citation Count Distribution**: Histogram by query type

**Visualizations**:
- Bar charts for categorical breakdowns
- Scatter plots for correlation analysis
- Distribution histograms

**Data Sources**: `analysis_queries`

---

### 5. Page Analytics

#### Page Performance:
- **Top Cited Pages**: Highest citation frequency by domain
- **Content Quality Score**: `content_quality_score` distribution
- **Page Relevance**: `relevance_score` analysis
- **Page Intent Alignment**: Query intent vs page performance
- **Content Format**: Analysis of content types
- **Brand Positioning**: `brand_positioning` breakdown
- **Competitor Presence**: Pages with competitor mentions
- **Content Recency**: Temporal analysis of cited content
- **Content Structure**: HTML structure analysis

**Data Sources**: `page_analyses`, `analysis_queries`

---

### 6. Content Gaps

#### Gap Analysis:
- **Competitor-Only Queries**: `competitor_mentioned=true AND brand_mentioned=false`
- **Content Type Analysis**: Missing content format opportunities
- **Content Classification**: Categorization gaps
- **Query Type Gaps**: Underperforming query types
- **Query Intent Gaps**: Intent categories needing attention
- **Response Outcome**: Poor outcome analysis
- **Relevance Score Gaps**: Low relevance identification

**Data Sources**: `analysis_queries`, `page_analyses`

---

### 7. Recommendations

#### Actionable Insights:
- **Query Competition Categories**:
  - Competitor Advantage
  - Competitive  
  - Defending
  - Opportunity
- **Brand Page Optimization**: List of cited pages with improvement suggestions
- **Content Recency**: Update priority recommendations
- **Content Priority Scoring**: Automated scoring algorithm
- **Query Intent Optimization**: Intent-specific recommendations
- **Technical SEO Issues**: Low-score technical fixes

**Data Sources**: All tables, computed metrics

## Implementation Phases

### Phase 1: Infrastructure (Week 1)
- [ ] Create dashboard layout with left panel navigation
- [ ] Implement top-level filters
- [ ] Set up data fetching composables
- [ ] Create reusable chart components

### Phase 2: Core Dashboards (Week 2-3)
- [ ] Brand Performance dashboard
- [ ] Query Analysis dashboard
- [ ] Page Analytics dashboard

### Phase 3: Advanced Analytics (Week 4)
- [ ] Competitor Comparison dashboard
- [ ] On-page SEO dashboard
- [ ] Content Gaps analysis

### Phase 4: AI Recommendations (Week 5)
- [ ] Recommendations engine
- [ ] Priority scoring algorithms
- [ ] Actionable insights generation

## Technical Requirements

### New Components Needed:
- `DashboardLayout.vue` - Main layout with left panel
- `FilterBar.vue` - Top-level filters
- `MetricCard.vue` - Reusable metric display
- `ComparisonChart.vue` - Brand vs competitor charts
- `DistributionChart.vue` - Pie/bar charts for distributions
- `DataTable.vue` - Sortable data tables
- `RecommendationCard.vue` - Actionable recommendations

### New Composables:
- `useDashboardData.ts` - Main data fetching logic
- `useDashboardFilters.ts` - Filter state management
- `useMetricCalculations.ts` - Metric computation utilities
- `useCompetitorComparison.ts` - Competitor analysis logic

### API Endpoints Needed:
- `GET /api/dashboard-data` - Aggregated dashboard data
- `GET /api/competitor-analysis` - Competitor comparison data
- `GET /api/recommendations` - AI-generated recommendations

## Data Processing Strategy

### Aggregation Queries:
```sql
-- Brand Performance Example
SELECT 
  COUNT(*) as total_queries,
  COUNT(CASE WHEN brand_mentioned THEN 1 END) as brand_mentions,
  AVG(brand_sentiment) as avg_sentiment,
  query_intent,
  brand_mention_type
FROM analysis_queries 
WHERE analysis_run_id = ? 
GROUP BY query_intent, brand_mention_type;
```

### Performance Considerations:
- Pre-calculate common aggregations
- Use database views for complex joins
- Implement caching for dashboard data
- Progressive loading for large datasets

## Next Steps

1. **Validate Data Availability**: Confirm all required fields exist in production
2. **Create Wireframes**: Design mockups for each dashboard
3. **Start with Brand Performance**: Most critical for client value
4. **Iterative Development**: Build and test each dashboard individually
5. **User Testing**: Validate with actual client data

## Success Metrics

- Dashboard load time < 2 seconds
- All metrics display real data
- Filters work smoothly
- Actionable insights generated
- Client engagement with reports increases