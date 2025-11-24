# Dashboard Split Project: Query-Only vs Comprehensive Analysis

**Status**: Planning / In Progress
**Purpose**: Separate query-only and comprehensive analysis into distinct reporting experiences while maintaining shared UI/UX patterns

---

## The Problem

Currently, dashboards blend query-only and comprehensive analysis data. This creates:
- Confusion about what data is available in each analysis type
- Empty/missing metrics in query-only reports expecting page scraping data
- Cluttered UI showing irrelevant metrics for the analysis type
- Mixed messaging about what users should focus on

---

## The Goal

Two distinct reporting paths that feel cohesive but serve different purposes:

**Query-Only Reports**: Fast, citation-focused analysis
- Brand mentions in LLM responses
- Competitor presence in responses
- Citation extraction from LLM responses
- Sentiment analysis
- Query-level metrics (intent, competition, outcomes)
- Response-level metrics (match quality, action orientation)

**Comprehensive Reports**: Full SEO + citation analysis
- Everything from query-only, PLUS:
- Technical SEO scores (scraped pages)
- On-page SEO metrics
- Page performance data
- Domain authority
- E-E-A-T signals
- Content quality analysis

---

## Architectural Decisions

### 1. Separate Dashboard Components
- Create `QueryOnlyDashboard.vue` as primary component for query-only reports
- Keep `FullScreenDashboard.vue` for comprehensive reports
- Share components where overlap exists (to be determined through audit)
- Clone and modify components where divergence is needed

### 2. Routing Strategy
- Single route: `/dashboard/reports/[id]`
- Check `analysis_runs.analysis_type` field in database
- Conditionally render `QueryOnlyDashboard` or `FullScreenDashboard` based on type
- Keep URL structure simple (no separate paths needed)

### 3. Visual Indicators
- Analysis list (`/dashboard/reports/index.vue`): Badge/tag showing "Query-Only" or "Comprehensive"
- Within reports: Subtle indicator in header showing analysis type
- Consistent styling across both types (same color palette, typography, spacing)

### 4. Component Reuse Strategy
**To Be Determined Through Audit**:
- Review each tab/component in existing dashboards
- Identify which work as-is for query-only
- Identify which need modification
- Identify which are comprehensive-only
- Document findings below as we progress

---

## Data Availability Matrix

### Query-Only Analysis Has:
- ✅ Query metadata (text, keyword, category, topic, type, intent, complexity, funnel stage)
- ✅ Response characteristics (match, outcome, action orientation, competition)
- ✅ Brand mentions (count, type, sentiment)
- ✅ Competitor mentions (names, count, context)
- ✅ Citation data (count, position, URLs extracted from LLM response)
- ✅ Basic page data (domain, URL from citation)

### Query-Only Analysis Lacks:
- ❌ Technical SEO scores (requires scraping)
- ❌ On-page SEO metrics (requires scraping)
- ❌ Page performance data (requires scraping)
- ❌ Domain authority (requires external API + scraping)
- ❌ E-E-A-T signals (requires content analysis)
- ❌ Deep content quality metrics (requires full page analysis)

### Comprehensive Analysis Has:
- ✅ Everything from query-only
- ✅ All page scraping data
- ✅ Full SEO analysis suite

---

## Implementation Approach (MVC-Aligned)

**Note**: This is an ad hoc, iterative process. We're building and refining as we go, leveraging months of experience with this application. Confidence over rigid planning.

### Phase 1: ~~Audit & Document~~ → Skip (doing it live)
We're not pre-auditing. We'll discover what works/doesn't as we build and test with real data.

### Phase 2: Build Query-Only Dashboard ✅ Complete
1. ✅ Clone `FullScreenDashboard.vue` → `QueryOnlyDashboard.vue`
2. ✅ Keep these tabs initially:
   - Overview
   - Brand Performance
   - Query Analysis
   - Query Explorer
   - Raw Data
   - Testing
3. ✅ Remove these tabs (comprehensive-only):
   - Competitor Comparison (removed)
   - Page Analytics (removed)
   - Technical SEO (removed)
4. 🔄 Refine components as we test with real query-only data (ongoing/ad hoc)

### Phase 3: Routing & Indicators ✅ Complete
1. ✅ Update `/dashboard/reports/[id].vue` to check `analysis_type`
   - Added `isQueryOnlyAnalysis` computed property
   - Checks `analysisRun.analysis_type === 'query-only'`
2. ✅ Conditionally render appropriate dashboard component
   - `QueryOnlyDashboard` for query-only analysis
   - `FullScreenDashboard` for comprehensive (default)
3. ✅ Add badges to analysis list view (`/dashboard/reports/index.vue`)
   - Purple badge for "Query-Only"
   - Amber badge for "Comprehensive"
   - Added filter dropdown for analysis type
4. ✅ Update sidebar navigation (`/components/layout/SidebarContextPanel.vue`)
   - Added `fetchAnalysisType()` function to query database
   - Added `isQueryOnly` computed property
   - Added `v-if="!isQueryOnly"` to hide comprehensive-only tabs:
     - Technical SEO
     - Page Analytics
     - Competitors
   - Query-only reports now show only: Overview, Brand Performance, Query Analysis, Query Explorer, Raw Data, Testing

### Phase 4: Test & Refine ✅ In Progress
1. 🔄 Test query-only reports with real data (ongoing)
2. ✅ Replace citation-based metrics with query-only metrics
   - Created `BrandMentionByOutcome.vue` component
   - Replaces "Brand Citation Rate" with "Brand Mention Rate by Outcome"
   - Shows brand mention % for each response outcome type (answer, recommendation, comparison, etc.)
   - Styled to match existing metric card design
   - Uses only query data (no page scraping required)
3. Verify no missing data errors
4. Confirm UI consistency across both types
5. Remove unused code

## Component Changes

### New Components Created
- `BrandMentionByOutcome.vue` - Query-only metric showing brand mention rate by outcome type

### Modified Components
- `QueryOnlyDashboard.vue` - Overview tab now uses query-only specific metrics:
  - Replaced `CompetitorMetrics` parent component with custom two-column grid
  - Left column: `CompetitorMentionRate` (query mentions)
  - Right column: `BrandMentionByOutcome` (NEW - replaces citation rate)
  - Removed citation-based data dependencies

---

## Component Audit (In Progress)

### Current Tabs in FullScreenDashboard.vue:
- [ ] **Overview** - TBD (likely needs split)
- [ ] **Brand Performance** - TBD (likely works with modifications)
- [ ] **Query Explorer** - TBD (likely works as-is for query-only)
- [ ] **Competitor Comparison** - TBD (depends on metrics used)
- [ ] **Page Analytics** - Comprehensive-only (full page scraping required)
- [ ] **On-Page SEO** - Comprehensive-only (requires scraped page data)
- [ ] **Testing** - TBD (data inspection tool)

### Existing Query-Related Components:
- `QueryAnalysisV2.vue` (77KB - complex table)
- `QueryAnalysisComponent.vue`
- `QueryExplorerComponent.vue`
- `QueryCompetitivenessAnalysis.vue`
- `QueryPerformanceTable.vue`

**Next Step**: Review these components to determine query-only compatibility

---

## Fresh Reports to Reference

User mentions there are "some fresh reports in there" with new visualizations/styles to review. These should inform the query-only dashboard design.

**Action**: Identify and review these reports before proceeding with implementation.

---

## Open Questions

1. Which specific components are the "fresh reports" with new visualizations?
2. Do we need sub-tabs within QueryOnlyDashboard, or flatter structure?
3. Should comprehensive reports still show the query-only metrics in separate sections?
4. Any metrics we're unsure about (could work for query-only with LLM response parsing)?

---

## Success Criteria

- [ ] Clear visual distinction between query-only and comprehensive reports
- [ ] No "empty metrics" or missing data errors in query-only reports
- [ ] Consistent UI/UX across both report types
- [ ] Users understand what they're looking at (analysis type is clear)
- [ ] Code is cleaner (no conditional logic mixing concerns in wrong places)
- [ ] Future maintenance is easier (clear separation of concerns)

---

## MVC Checkpoint

**Is this serving the Golden Path?**
- ✅ Solves real problem (mixed data causing confusion)
- ✅ Creates clarity (right metrics for right analysis type)
- ✅ Maintains focus (users see what matters for their analysis type)
- ✅ Reduces complexity (separate components for separate purposes)

**Are we adding unnecessary features?**
- ❌ Not building new metrics
- ❌ Not changing analysis logic
- ❌ Not adding configuration options
- ✅ Just organizing existing functionality correctly

Stay on the Path.
