# Query-Only Analysis Feature - Deployment Instructions

**Created**: 2025-01-04
**Feature**: Add query-only analysis mode alongside comprehensive analysis

---

## Summary

This update adds a new "Query-Only" analysis mode that skips web scraping and page analysis, completing in minutes instead of hours. Users can now choose between:

- **Query-Only**: Fast analysis focusing on LLM responses and citations (recommended default)
- **Comprehensive**: Full analysis with web scraping and SEO metrics (existing functionality)

---

## Files Modified

### Database
1. `scripts/migrations/add-analysis-type-column.sql` - NEW file

### Backend
2. `scripts/create-queue-submission-function.sql` - Updated
3. `local-server/server.js` - Updated (lines 346-428)

### Frontend
4. `pages/dashboard/analysis/index.vue` - Updated (add analysis type selection)
5. `pages/dashboard/analysis/preview-queries.vue` - Updated (pass analysis_type)
6. `composables/useQueueAnalysis.ts` - Updated (handle analysis_type parameter)

---

## Deployment Steps

### Step 1: Database Migration (5 minutes)

Run the SQL migration to add the `analysis_type` column:

```bash
# Navigate to project directory
cd /Users/jontaylor/Documents/kb-citebots

# Run the migration SQL
psql -h db.trmaeodthlywcjwfzdka.supabase.co -U postgres -d postgres -f scripts/migrations/add-analysis-type-column.sql
```

**Or manually in Supabase SQL Editor:**

```sql
-- Add analysis_type column
ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS analysis_type TEXT NOT NULL DEFAULT 'comprehensive';

-- Add check constraint
ALTER TABLE analysis_runs
DROP CONSTRAINT IF EXISTS analysis_runs_type_check;

ALTER TABLE analysis_runs
ADD CONSTRAINT analysis_runs_type_check
CHECK (analysis_type IN ('query-only', 'comprehensive'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_analysis_runs_type ON analysis_runs(analysis_type);

-- Add cost tracking columns
ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_api_calls DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_scraping DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE analysis_runs
ADD COLUMN IF NOT EXISTS cost_total DECIMAL(10,2) DEFAULT 0.00;
```

**Verify the migration:**

```sql
-- Check that columns exist
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'analysis_runs'
AND column_name IN ('analysis_type', 'cost_api_calls', 'cost_scraping', 'cost_total');

-- Should return 4 rows showing the new columns
```

---

### Step 2: Update Database Function (5 minutes)

Update the `submit_analysis_to_queue` function. Copy the entire contents of:

```
scripts/create-queue-submission-function.sql
```

**Run in Supabase SQL Editor** or via psql:

```bash
psql -h db.trmaeodthlywcjwfzdka.supabase.co -U postgres -d postgres -f scripts/create-queue-submission-function.sql
```

**Verify the function:**

```sql
-- Check function signatures
SELECT proname, proargnames
FROM pg_proc
WHERE proname = 'submit_analysis_to_queue';

-- Should show multiple signatures with analysis_type parameter
```

**Test the function:**

```sql
-- Test with query-only mode (won't actually run, just tests the function signature)
SELECT submit_analysis_to_queue(
  'your-client-uuid'::UUID,
  ARRAY['chatgpt'],
  ARRAY['{"query_text": "test query", "keyword": "test", "intent": "informational"}'::jsonb],
  'Test Query-Only Analysis',
  'query-only'
);

-- Should return success: true and analysis_type: 'query-only'
```

---

### Step 3: Restart Local Server (2 minutes)

The local queue worker needs to be restarted to pick up the changes in `server.js`:

```bash
# Stop the current local server (if running)
# Press Ctrl+C in the terminal where it's running

# Or kill the process
killall node  # Be careful with this if you have other Node processes

# Navigate to local-server directory
cd /Users/jontaylor/Documents/kb-citebots/local-server

# Restart the server
npm start

# Or with nodemon for auto-restart:
npm run dev
```

**Verify the server is running:**

```bash
# Check status
curl http://localhost:3002/status

# Should return: {"status":"online","processing":false,...}
```

---

### Step 4: Frontend Deployment (Optional - if using production build)

If deploying to Netlify or production:

```bash
# Build the Nuxt app
npm run build

# Deploy (if using Netlify CLI)
netlify deploy --prod

# Or push to GitHub (if auto-deploy is configured)
git add .
git commit -m "feat: Add query-only analysis mode"
git push origin main
```

For local development, no build needed - Nuxt hot-reloads automatically.

---

## Verification & Testing

### Test 1: Database Changes

```sql
-- Verify analysis_type column exists and has correct constraint
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'analysis_runs'
  AND column_name = 'analysis_type';

-- Expected: analysis_type | text | 'comprehensive'::text
```

### Test 2: Function Update

```sql
-- Test that function accepts new parameter
SELECT submit_analysis_to_queue(
  p_client_id => 'test-uuid'::UUID,
  p_platforms => ARRAY['chatgpt'],
  p_queries => ARRAY['{"query_text":"test","keyword":"test","intent":"test"}'::jsonb],
  p_report_name => 'Test',
  p_analysis_type => 'query-only'
);

-- Should return JSON with analysis_type: 'query-only'
```

### Test 3: Frontend UI

1. **Navigate to Analysis Setup**:
   ```
   http://localhost:3000/dashboard/analysis
   ```

2. **Verify UI Elements**:
   - Select a client
   - Check that "Analysis Type" section appears
   - Verify "Query Analysis Only" is selected by default
   - Verify both options (Query-Only and Comprehensive) are visible

3. **Test Navigation**:
   - Enter some keywords
   - Click "Continue to Preview"
   - Verify URL includes `analysis_type=query-only`
   - Verify summary shows correct analysis type badge

### Test 4: End-to-End Query-Only Analysis

1. **Start an Analysis**:
   - Select a client
   - Keep "Query Analysis Only" selected
   - Enter 2-3 test keywords
   - Select platform (ChatGPT)
   - Run analysis

2. **Monitor Queue Processing**:
   ```bash
   # Watch local server logs
   tail -f /path/to/local-server/logs
   ```

3. **Expected Log Output**:
   ```
   📊 ANALYSIS TYPE: query-only
   ⚡ QUERY-ONLY MODE: Skipping web scraping and page analysis for X citations
   💰 COST SAVINGS: Skipping ScrapingBee API calls and AI page analysis
   ⏱️ TIME SAVINGS: Analysis will complete much faster
   ```

4. **Verify Results**:
   - Analysis should complete in <5 minutes (vs hours for comprehensive)
   - Check database:
     ```sql
     SELECT id, analysis_type, status, queries_total, queries_completed
     FROM analysis_runs
     ORDER BY created_at DESC
     LIMIT 1;
     ```
   - Verify `analysis_type = 'query-only'`
   - Check no page_analyses records were created:
     ```sql
     SELECT COUNT(*)
     FROM page_analyses pa
     JOIN analysis_queries aq ON pa.query_id = aq.id
     WHERE aq.analysis_run_id = 'your-run-id';

     -- Should return 0 for query-only mode
     ```

### Test 5: Comprehensive Mode Still Works

1. **Run Comprehensive Analysis**:
   - Select a client
   - Choose "Comprehensive Analysis"
   - Enter 1-2 test keywords (keep it small!)
   - Run analysis

2. **Verify**:
   - Should see page scraping logs in local server
   - Should take longer (minutes to hours depending on citations)
   - Should create `page_analyses` records:
     ```sql
     SELECT COUNT(*)
     FROM page_analyses pa
     JOIN analysis_queries aq ON pa.query_id = aq.id
     WHERE aq.analysis_run_id = 'your-run-id';

     -- Should return > 0 for comprehensive mode
     ```

---

## Rollback Plan

If you need to rollback this feature:

### Option A: Revert to Previous Git Commit

```bash
# Find the commit before this feature
git log --oneline

# Revert to that commit
git revert <commit-hash>
git push origin main

# Restart local server
cd local-server && npm start
```

### Option B: Keep Database Changes, Disable Frontend

If database changes are already deployed and you just want to disable the UI:

1. Edit `pages/dashboard/analysis/index.vue`:
   ```javascript
   // Force analysis type to comprehensive
   const analysisType = ref('comprehensive')
   ```

2. Hide the analysis type selection section:
   ```vue
   <!-- Comment out or add v-if="false" -->
   <div v-if="false && selectedClient" class="mb-8">
     <!-- Analysis Type Selection -->
   </div>
   ```

3. Restart dev server or redeploy

### Option C: Database Rollback (Not Recommended)

Only if absolutely necessary:

```sql
-- Remove analysis_type column (will lose data!)
ALTER TABLE analysis_runs DROP COLUMN IF EXISTS analysis_type;
ALTER TABLE analysis_runs DROP COLUMN IF EXISTS cost_api_calls;
ALTER TABLE analysis_runs DROP COLUMN IF EXISTS cost_scraping;
ALTER TABLE analysis_runs DROP COLUMN IF EXISTS cost_total;

-- Drop index
DROP INDEX IF EXISTS idx_analysis_runs_type;
```

---

## Troubleshooting

### Issue: "Column analysis_type does not exist"

**Cause**: Database migration not run

**Fix**:
```sql
ALTER TABLE analysis_runs
ADD COLUMN analysis_type TEXT NOT NULL DEFAULT 'comprehensive';
```

### Issue: "Function submit_analysis_to_queue does not accept parameter p_analysis_type"

**Cause**: Database function not updated

**Fix**: Re-run Step 2 above

### Issue: Local server not skipping web scraping

**Cause**: Local server not restarted after code changes

**Fix**:
```bash
cd local-server
killall node  # Or Ctrl+C in server terminal
npm start
```

### Issue: Analysis stuck in "running" status

**Cause**: Local server not running or crashed

**Fix**:
```bash
# Check if server is running
curl http://localhost:3002/status

# If not running, start it
cd local-server && npm start

# Manually trigger queue processing
curl -X POST http://localhost:3002/trigger
```

### Issue: Frontend not showing analysis type selection

**Cause**: Browser cache or dev server not restarted

**Fix**:
```bash
# Clear browser cache (Cmd+Shift+R on Mac)
# Or restart Nuxt dev server
npm run dev
```

---

## Cost Savings Estimation

Based on typical analysis runs:

### Query-Only Mode:
- **API Calls**: $0.01-0.05 per query (OpenAI/Perplexity)
- **Web Scraping**: $0 (skipped)
- **AI Analysis**: $0 (skipped)
- **Total**: ~$0.02-0.05 per query

### Comprehensive Mode:
- **API Calls**: $0.01-0.05 per query
- **Web Scraping**: $0.20-0.50 per page (ScrapingBee)
- **AI Analysis**: $0.10-0.30 per page (OpenAI)
- **Total**: ~$0.50-2.00 per query (with avg 3-5 citations)

**Savings**: 90-95% cost reduction with query-only mode

---

## Monitoring

After deployment, monitor:

1. **Analysis Completion Times**:
   ```sql
   SELECT
     analysis_type,
     AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds,
     COUNT(*) as total_runs
   FROM analysis_runs
   WHERE status = 'completed'
     AND completed_at IS NOT NULL
   GROUP BY analysis_type;
   ```

2. **Mode Usage**:
   ```sql
   SELECT
     analysis_type,
     COUNT(*) as count,
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM analysis_runs
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY analysis_type;
   ```

3. **Error Rates**:
   ```sql
   SELECT
     analysis_type,
     status,
     COUNT(*) as count
   FROM analysis_runs
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY analysis_type, status
   ORDER BY analysis_type, status;
   ```

---

## Success Criteria

✅ Database migration successful (columns added, no errors)
✅ Function accepts `analysis_type` parameter
✅ Local server shows "QUERY-ONLY MODE" logs
✅ Frontend displays analysis type selection
✅ Query-only analysis completes in <10 minutes for 50 queries
✅ Comprehensive analysis still works as before
✅ No `page_analyses` records for query-only mode
✅ Reports display correctly for both modes

---

## Support

If you encounter issues:

1. Check this document's Troubleshooting section
2. Review local server logs
3. Check Supabase logs in dashboard
4. Verify database changes with SQL queries above
5. Test with minimal data (1-2 queries) first

---

## Next Steps (Future Enhancements)

1. **Report Display Updates**: Add analysis type badges to report pages
2. **Cost Tracking**: Populate cost_* columns with actual API costs
3. **Upgrade Feature**: Allow converting query-only to comprehensive post-analysis
4. **Analytics Dashboard**: Show cost savings and mode adoption metrics
5. **Smart Recommendations**: AI suggests analysis type based on query count

---

**Deployment Complete!** 🎉

Your users can now choose between fast query-only analysis and comprehensive deep-dive analysis.
