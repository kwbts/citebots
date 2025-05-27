# QUEUE FIX GAMEPLAN - Next Coding Session
**Priority**: Critical system stability
**Goal**: Fix queue processing for small-scale reliable operation
**Approach**: 4 surgical fixes, no architectural changes

---

## THE PROBLEM (30 seconds to understand)

Your queue processing stalls because:
1. **Platform = 'both'** creates 2 queue items but expects 1 result (math never works)
2. **No unique batch_id** allows duplicate analysis runs 
3. **Items get stuck** in "processing" status with no recovery
4. **Large batches timeout** in Edge Functions (400s limit)

**Current evidence**: 33 items stuck in processing for 6+ hours from recent runs.

---

## THE SOLUTION (4 surgical fixes)

### **Fix 1: Block Platform 'Both'**
**Why**: Eliminates the 2:1 ratio problem immediately
**Time**: 5 minutes

### **Fix 2: Prevent Duplicate Runs** 
**Why**: Stops multiple runs from single frontend request
**Time**: 2 minutes

### **Fix 3: Auto-Recovery System**
**Why**: Automatically unsticks processing items every 2 minutes
**Time**: 3 minutes

### **Fix 4: Single-Item Processing**
**Why**: Avoids Edge Function timeouts, ensures completion
**Time**: 10 minutes

**Total time**: ~20 minutes of changes + testing

---

## ESSENTIAL FILES TO TOUCH

```
kb-citebots/
├── pages/dashboard/analysis/index.vue          # Fix 1: Block 'both' platform
├── supabase/functions/process-queue-worker/
│   └── index.ts                                # Fix 4: Single-item batches
└── [Database via Supabase Dashboard]          # Fix 2 & 3: SQL commands
```

**That's it. Only 2 code files + 2 SQL commands.**

---

## STEP-BY-STEP EXECUTION

### **STEP 1: Document Current Broken State (2 min)**

Run this in Supabase SQL Editor and save output:
```sql
SELECT 
  ar.id, ar.status, ar.platform, ar.queries_total, ar.queries_completed,
  COUNT(aq.id) FILTER (WHERE aq.status = 'processing') as stuck_items
FROM analysis_runs ar
LEFT JOIN analysis_queue aq ON ar.id = aq.analysis_run_id
WHERE ar.created_at > NOW() - INTERVAL '6 hours'
GROUP BY ar.id, ar.status, ar.platform, ar.queries_total, ar.queries_completed
ORDER BY ar.created_at DESC;
```

**Success**: See stuck_items > 0 and platform = 'both' (confirms the problem)

---

### **STEP 2: Fix Frontend - Block 'Both' Platform (5 min)**

**File**: `pages/dashboard/analysis/index.vue`

Find where platform selection happens and add this guard:
```typescript
// Add this validation before any analysis submission
const ALLOWED_PLATFORMS = ['chatgpt', 'perplexity']; // Remove 'both'

if (!ALLOWED_PLATFORMS.includes(selectedPlatform)) {
  alert('Multi-platform analysis temporarily disabled for system stability. Please select either ChatGPT or Perplexity.');
  return;
}
```

**Success**: Try to select 'both' in UI - should be blocked with alert

---

### **STEP 3: Fix Database - Prevent Duplicates (2 min)**

Run in Supabase SQL Editor:
```sql
-- Add unique constraint to prevent duplicate batch_ids
ALTER TABLE analysis_runs ADD CONSTRAINT unique_batch_id UNIQUE (batch_id);
```

**If it fails with duplicate error**, run this first:
```sql
-- Remove existing duplicates (keeps most recent)
DELETE FROM analysis_runs 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY batch_id ORDER BY created_at DESC) as rn
    FROM analysis_runs
  ) t WHERE rn > 1
);
```
Then retry the constraint.

**Success**: Constraint added without error

---

### **STEP 4: Fix Database - Auto-Recovery (3 min)**

Run in Supabase SQL Editor:
```sql
-- Set up automatic reset of stuck items every 2 minutes
SELECT cron.schedule('reset-stuck-queue', '*/2 * * * *', 'SELECT reset_stuck_queue_items()');
```

**Verify it worked**:
```sql
SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'reset-stuck-queue';
```

**Success**: Cron job appears in results

---

### **STEP 5: Fix Worker - Single Item Processing (10 min)**

**File**: `supabase/functions/process-queue-worker/index.ts`

Find these constants and change them:
```typescript
// Old values (probably 2-10 and 120-300)
const BATCH_SIZE = 1;           // Process 1 item at a time
const EDGE_TIMEOUT = 900;       // 15 minutes (Edge Function limit)
const PROCESSING_TIMEOUT = 60;  // 60 seconds per batch
```

**Deploy the updated function**:
```bash
npx supabase functions deploy process-queue-worker --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

**Success**: Deployment completes without errors

---

### **STEP 6: Test The Fix (5 min)**

**Create small test**: Run analysis with 3-5 queries, single platform

**Watch it process**: Run this every 30 seconds:
```sql
SELECT status, COUNT(*) 
FROM analysis_queue 
WHERE analysis_run_id = 'YOUR_TEST_RUN_ID'
GROUP BY status;
```

**Success**: All items move from pending → processing → completed (no stuck items)

---

### **STEP 7: Verify Complete Fix (2 min)**

Run the same query from Step 1:

**Success**: 
- No stuck_items > 0
- No platform = 'both' in new runs
- Test analysis completed successfully

---

## ROLLBACK (If Something Goes Wrong)

```sql
-- Remove cron job
SELECT cron.unschedule('reset-stuck-queue');

-- Remove unique constraint  
ALTER TABLE analysis_runs DROP CONSTRAINT unique_batch_id;
```

```typescript
// Revert frontend - remove the platform guard
// Revert worker - change BATCH_SIZE back to original value
```

---

## SUCCESS CRITERIA

✅ **No more stuck processing items** (auto-reset every 2 min)
✅ **No more duplicate runs** (unique constraint prevents)  
✅ **No more platform 'both'** (frontend blocks it)
✅ **Reliable small-scale processing** (1 item at a time, longer timeout)

---

## WHAT YOU'RE NOT DOING

❌ **No Redis/SQS** - PostgreSQL is fine for your scale
❌ **No schema migrations** - Only adding constraints  
❌ **No new infrastructure** - Using existing Supabase
❌ **No event sourcing** - Overkill for your needs
❌ **No complex architectures** - Keep it simple

---

## MONITORING (Post-Fix)

Run this daily for first week:
```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'processing' AND started_at < NOW() - INTERVAL '5 minutes') as stuck_count
FROM analysis_queue 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Healthy system**: stuck_count = 0

---

## WHY THIS WORKS

1. **Eliminates root cause** (platform 'both' math problem)
2. **Prevents new problems** (duplicate runs blocked)
3. **Self-healing** (auto-recovery every 2 min)  
4. **Avoids timeouts** (single items + longer Edge Function timeout)

**This gives you a boring, reliable system that just works.**

---

**Total time: ~30 minutes to implement + test**
**Risk level: Low (all changes are reversible)**
**Complexity: Minimal (4 small changes)**

**Ready to execute!**