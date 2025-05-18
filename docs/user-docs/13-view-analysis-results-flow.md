# View Analysis Results Flow

## Overview
This document describes how users view and interpret analysis results in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have completed at least one analysis
- Analysis run must have results

## User Journey
1. User completes an analysis or navigates to results
2. User clicks "View Results" or selects from history
3. System loads comprehensive results page
4. User explores different views and metrics
5. User can export or share results

## Expected Behavior

### Visual Flow
1. Results overview shows:
   - Analysis summary card
   - Client name and date
   - Total queries analyzed
   - Key metrics highlights
   - Citation distribution chart

2. Detailed sections:
   - **Citations Overview**
     - Total citations found
     - Client vs competitor breakdown
     - Domain distribution pie chart
   
   - **Query Results**
     - List of all queries
     - Citations per query
     - LLM responses
     - Expand for full details
   
   - **Competitor Analysis**
     - Competitor ranking table
     - Citation comparison chart
     - Domain authority metrics
   
   - **Page Analysis**
     - Cited pages list
     - SEO metrics per page
     - Content quality scores
     - Technical SEO factors

3. Interactive elements:
   - Filter by query intent
   - Sort by various metrics
   - Search within results
   - Export options

## Database Queries in Supabase

### Load Analysis Run
```sql
SELECT * FROM analysis_runs 
WHERE id = 'run-uuid' 
  AND user_id = auth.uid()
```

### Load Query Results
```sql
SELECT * FROM query_results 
WHERE analysis_run_id = 'run-uuid'
ORDER BY created_at
```

### Load Page Analyses
```sql
SELECT * FROM page_analyses 
WHERE analysis_run_id = 'run-uuid'
ORDER BY citation_count DESC
```

### Citation Statistics
```sql
SELECT 
  domain,
  COUNT(*) as citation_count,
  AVG(metrics->>'authority_score') as avg_authority
FROM page_analyses
WHERE analysis_run_id = 'run-uuid'
GROUP BY domain
ORDER BY citation_count DESC
```

## Test Scenarios

### Normal View
1. Navigate to completed analysis
2. Expected: All data loads correctly
3. Charts render properly

### Large Result Set
1. Analysis with 100+ queries
2. Expected: Pagination or lazy loading
3. Smooth scrolling

### Export Function
1. Click export button
2. Choose format (CSV, PDF, JSON)
3. Expected: File downloads

### Filter Application
1. Filter by intent type
2. Filter by competitor
3. Expected: Results update instantly

### Share Link
1. Generate shareable link
2. Test in incognito
3. Expected: Read-only view

## Technical Details
- Charts use Chart.js or similar
- Real-time filtering on client
- Lazy loading for performance
- Export handled client-side
- Share links use UUID tokens
- Results cached for performance