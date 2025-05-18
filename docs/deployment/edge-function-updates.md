# Edge Function Updates - Competitor Analysis

## Overview
This deployment adds comprehensive competitor analysis capabilities to the Citebots analysis pipeline.

## Files Updated

### Edge Functions
1. `/supabase/functions/execute-query/index.ts`
   - Enhanced competitor detection in AI responses
   - Added brand positioning analysis
   - Improved mention type categorization

2. `/supabase/functions/process-query/index.ts`
   - Updated to pass competitor data through pipeline
   - Enhanced result storage with competitor metrics

3. `/supabase/functions/analyze-citation/index.ts`
   - Added competitor detection in crawled pages
   - Enhanced brand and competitor context analysis

### SQL Scripts
1. `/scripts/add-competitor-analysis-fields.sql`
   - Adds competitor analysis fields to analysis_queries table
   - Creates competitor analysis summary view
   - Adds performance tracking functions

2. `/scripts/update-page-analyses-competitor-fields.sql`
   - Adds competitor tracking to page analyses
   - Creates page competitor insights view

## Deployment Steps

### 1. Deploy SQL Updates
Run these SQL scripts in order:
```bash
# First, add fields to analysis_queries
psql $DATABASE_URL < scripts/add-competitor-analysis-fields.sql

# Then, update page_analyses
psql $DATABASE_URL < scripts/update-page-analyses-competitor-fields.sql
```

### 2. Deploy Edge Functions
Deploy the updated edge functions:
```bash
# Deploy execute-query
npx supabase functions deploy execute-query --project-ref trmaeodthlywcjwfzdka

# Deploy process-query
npx supabase functions deploy process-query --project-ref trmaeodthlywcjwfzdka

# Deploy analyze-citation
npx supabase functions deploy analyze-citation --project-ref trmaeodthlywcjwfzdka
```

### 3. Verify Deployment
Test the updated functions:
1. Run a test analysis with competitors defined
2. Check that competitor mentions are detected
3. Verify competitor analysis views are populated

## New Features

### Competitor Detection
- Identifies when competitors are mentioned in AI responses
- Categorizes mention types (recommendation, featured, mentioned)
- Tracks mention frequency and context

### Brand Positioning Analysis
- Analyzes relative positioning (strong, neutral, weak)
- Tracks competitive context (brand_dominant, equal_mention, competitor_dominant)
- Provides actionable insights for SEO strategy

### Enhanced Page Analysis
- Detects competitor mentions on crawled pages
- Provides competitor context for each citation
- Tracks brand vs competitor visibility

## Usage

### Running Analysis
When running analysis, ensure clients have competitors defined:
```javascript
{
  client: {
    name: "Brand Name",
    domain: "brand.com",
    competitors: [
      { name: "Competitor 1", domain: "competitor1.com" },
      { name: "Competitor 2", domain: "competitor2.com" }
    ]
  }
}
```

### Viewing Results
New data fields available in analysis results:
- `competitor_analysis`: Detailed breakdown of competitor mentions
- `brand_positioning`: Overall positioning assessment
- `competitor_context`: Competitive landscape context

### SQL Queries
Example queries to analyze competitor data:
```sql
-- Get competitor performance summary
SELECT * FROM get_competitor_performance('analysis_run_id');

-- View competitive insights
SELECT * FROM competitor_analysis_summary 
WHERE client_id = 'your_client_id';

-- Check page-level competitor presence
SELECT * FROM page_competitor_insights 
WHERE brand_mentioned = true AND competitor_mentioned = true;
```

## Monitoring

Monitor the following metrics:
1. Competitor detection accuracy
2. Brand positioning trends
3. Competitive visibility gaps
4. Citation quality by competitive context

## Rollback Plan

If issues arise:
1. Revert edge functions to previous versions
2. Remove new SQL fields (backup data first)
3. Restore previous functionality

## Next Steps

After deployment:
1. Test with real client data
2. Validate competitor detection accuracy
3. Build reporting dashboards
4. Train team on new features