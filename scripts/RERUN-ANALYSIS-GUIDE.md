# Rerun Analysis Guide

## Overview

The `rerun-analysis.mjs` script allows you to re-execute queries from previous analysis runs without manually re-entering them. This is useful for:

- Re-running the same queries with updated data
- Converting comprehensive analyses to query-only mode (saves API costs)
- Testing improvements to the analysis system

## Quick Start

### Rerun All 4 CrashPlan Analyses (Query-Only Mode)

```bash
node scripts/rerun-analysis.mjs --crashplan
```

This will:
1. Fetch all queries from the 4 CrashPlan analysis runs
2. Submit them as new query-only analyses (no web scraping, no API costs)
3. Create new analysis runs with `[RERUN]` prefix in the name
4. Automatically trigger the local server to process the queue

**Total queries:** 176 (48 + 44 + 44 + 40)

### Rerun with Comprehensive Analysis (⚠️ Costs Money!)

```bash
node scripts/rerun-analysis.mjs --crashplan --comprehensive
```

This will scrape and analyze each citation page with AI (uses ScrapingBee + OpenAI APIs).

### Rerun a Single Analysis

```bash
node scripts/rerun-analysis.mjs 202a6de4-777d-4692-afd3-b0f5409cc558
```

### Rerun Multiple Specific Analyses

```bash
node scripts/rerun-analysis.mjs run-id-1 run-id-2 run-id-3
```

## The 4 CrashPlan Analysis Runs

1. **Comparison & Buying Prompts** (48 queries)
   - ID: `202a6de4-777d-4692-afd3-b0f5409cc558`
   - Focus: Competitive comparison and buying decision queries

2. **Feature-Oriented Prompts** (44 queries)
   - ID: `26354a9e-ef6c-417a-bcbd-138affa0f3ff`
   - Focus: Specific feature inquiries

3. **Category / Industry Prompts** (44 queries)
   - ID: `9f3fa69f-8c67-451c-b70d-8ed01571807c`
   - Focus: Industry and category-specific queries

4. **Problem-Oriented Prompts** (40 queries)
   - ID: `80b06e92-f04f-4f98-bb0f-6fb17b6d7631`
   - Focus: Problem-solving queries

## What Happens

1. **Fetch**: Script retrieves all queries from the specified analysis run(s)
2. **Format**: Extracts key fields (query_text, keyword, intent, platform)
3. **Submit**: Creates new analysis run(s) using `submit_analysis_to_queue` function
4. **Queue**: Queries are added to `analysis_queue` table for processing
5. **Process**: Local server processes the queue (if running)

## Query Format

Each query is resubmitted with:
```javascript
{
  query_text: "What are the best backup solutions for Mac?",
  keyword: "mac backup",
  intent: "informational",
  platform: "chatgpt",  // or "perplexity"
  is_custom: false
}
```

## Analysis Types

### Query-Only (Default, Recommended)
- **Fast**: Processes queries without web scraping
- **Free**: No API costs
- **Data**: Gets query response, brand mentions, citations
- **Skip**: Web scraping and page analysis

### Comprehensive (⚠️ Costs Money!)
- **Slow**: Scrapes every citation page
- **Costly**: Uses ScrapingBee + OpenAI APIs
- **Complete**: Full page analysis with SEO metrics
- **Use**: Only when you need detailed page insights

## Processing

After submission, the local server will automatically process the queue:

1. **Start Local Server** (if not running):
   ```bash
   npm run queue:start
   # or
   cd local-server && npm start
   ```

2. **Monitor Progress**:
   - Check local server logs for real-time progress
   - View in dashboard at `/dashboard/reports`
   - Check queue status at `http://localhost:3002/status`

## Troubleshooting

### Local Server Not Running

If you see:
```
⚠️  Local server not available at http://localhost:3002
   Start it with: npm run queue:start
```

Start the local server:
```bash
npm run queue:start
```

### Supabase Connection Error

Make sure your `.env` has:
```
SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>
```

### Permission Errors

The script uses the service key to bypass RLS policies. Make sure your `.env` file has the correct `SUPABASE_SERVICE_KEY`.

## Example Output

```
============================================================
🔄 RERUN ANALYSIS SCRIPT
============================================================

⚡ Using QUERY-ONLY analysis type (fast, no API costs)

📊 Total runs to process: 4

📊 Fetching queries for analysis run: 202a6de4-777d-4692-afd3-b0f5409cc558
   ✓ Found run: "CrashPlan Analysis - Comparison & Buying Prompts"
   ✓ Client ID: a7bfc73a-6b88-4a36-bf58-e085a7427fd9
   ✓ Platform: chatgpt,perplexity
   ✓ Total queries: 48
   ✓ Retrieved 48 queries

🚀 Submitting new analysis to queue...
   - Client ID: a7bfc73a-6b88-4a36-bf58-e085a7427fd9
   - Platforms: chatgpt, perplexity
   - Queries: 48
   - Analysis Type: query-only
   - Report Name: [RERUN] CrashPlan Analysis - Comparison & Buying Prompts
   ✅ Success! Analysis run ID: <new-uuid>
   ✅ Queued 96 queries for processing

⏱️  Waiting 2 seconds before next submission...

[... continues for each run ...]

============================================================
📊 SUMMARY
============================================================
Total runs processed: 4
Successful: 4
Failed: 0

📋 Results:
  1. ✅ 202a6de4-777d-4692-afd3-b0f5409cc558 → <new-uuid-1>
  2. ✅ 26354a9e-ef6c-417a-bcbd-138affa0f3ff → <new-uuid-2>
  3. ✅ 9f3fa69f-8c67-451c-b70d-8ed01571807c → <new-uuid-3>
  4. ✅ 80b06e92-f04f-4f98-bb0f-6fb17b6d7631 → <new-uuid-4>

============================================================
✅ DONE!
============================================================

🔄 Triggering local server to process queue...
✅ Local server triggered: Processing started
```

## Cost Comparison

### Query-Only Mode (Recommended)
- **176 queries × 2 platforms = 352 total queries**
- **Cost**: $0 (no API calls)
- **Time**: ~20 minutes (depends on rate limits)

### Comprehensive Mode (⚠️)
- **352 queries + page scraping for each citation**
- **Estimated cost**: $50-150 (depends on citations per query)
- **Time**: 4-8 hours

## Tips

1. **Use Query-Only First**: Run in query-only mode to see which queries are most interesting, then run comprehensive analysis on specific queries if needed.

2. **Monitor the Queue**: Watch the local server logs to track progress and catch any errors early.

3. **Check Results**: New reports appear in `/dashboard/reports` with `[RERUN]` prefix.

4. **Rate Limits**: The script adds 2-second delays between submissions to avoid overwhelming the system.
