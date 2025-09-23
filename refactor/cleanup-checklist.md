# Citebots Refactoring Cleanup Checklist

## Overview
Systematic cleanup checklist organized by directory. Each item should be reviewed and marked as KEEP, REMOVE, or CONSOLIDATE.

---

## 🚨 HIGH PRIORITY CLEANUP TARGETS

### Root Directory - SQL/Debug Files
**Impact: High | Risk: Low**
```
[ ] check-briefs.js
[ ] check-db-health.sql
[ ] check_page_analyses.sql
[ ] comprehensive-diagnosis.sql
[ ] confirm-emergency-fixes.js
[ ] debug-current-state.sql
[ ] debug-frontend-sync.sql
[ ] debug-queue-status.sql
[ ] debug-timeout-analysis.sql
[ ] debug-triple-runs.sql
[ ] emergency-fix.js
[ ] fix-timeout-issues.sql
[ ] minimal-test.js
[ ] test-current-setup.js
[ ] test-supabase-connection.js
[ ] verify-schema.sql
```
**Recommendation: REMOVE most, consolidate useful queries into /docs/development/**

### Root Directory - Documentation Files
**Impact: Medium | Risk: Low**
```
[ ] BRIEF-GENERATOR-COMPREHENSIVE-GUIDE.md
[ ] BRIEF-VIEWER-DEBUG.md
[ ] CITEBOTS_V2_DEVELOPMENT_GUIDE.md
[ ] CITEBOTS_V2_MIGRATION_GUIDE.md
[ ] DASHBOARD_IMPROVEMENT_SESSION.md
[ ] ESSENTIAL_FILES_MIGRATION_GUIDE.md
[ ] PRINCIPLES.md
[ ] REFACTOR_LOG.md
[ ] REFACTOR_PLAN.md
[ ] ROLLBACK_GUIDE.md
[ ] TESTING_CHECKLIST.md
[ ] test-manual-trigger.md
```
**Recommendation: Move relevant content to /docs/, remove outdated guides**

### Scripts Directory (109+ files)
**Impact: Very High | Risk: Low**
```
[ ] Review all SQL migration scripts
[ ] Identify which are one-time vs reusable
[ ] Consolidate into logical groups
[ ] Remove debug/diagnostic scripts
[ ] Keep only essential migration scripts
```
**Recommendation: Reduce from 109+ files to <20 essential scripts**

---

## 📁 DIRECTORY-BY-DIRECTORY ANALYSIS

### /app (Nuxt 3 Core)
**Status: KEEP - Core application structure**
```
[ ] Review for any test/debug components
[ ] Check for unused imports
```

### /assets
**Status: KEEP - Static assets**
```
[ ] Verify all images/styles are used
[ ] Remove any unused assets
```

### /components
**Status: KEEP - Core UI components**
```
[ ] Check for duplicate components
[ ] Remove any debug/test components
```

### /composables
**Status: KEEP - Vue composables**
```
[ ] Review for unused composables
[ ] Check for debugging code
```

### /dashboard-template
**Status: EVALUATE - Unclear purpose**
```
[ ] Determine if this is actively used
[ ] If not core functionality, consider removal
[ ] If template/example code, move to /docs/examples/
```

### /docs
**Status: KEEP - Essential documentation**
```
[ ] Already well-organized
[ ] Consolidate root-level docs into here
[ ] Remove outdated documentation
```

### /examples
**Status: EVALUATE**
```
[ ] Determine if examples are current
[ ] Remove outdated examples
[ ] Keep useful reference examples
```

### /extraction
**Status: EVALUATE - Possible V2 preparation**
```
[ ] Contains 18 subdirectories
[ ] Appears to be V2 architecture work
[ ] Consider moving to /docs/archive/ or separate repo
[ ] May not be needed for current production app
```

### /layouts
**Status: KEEP - Essential Nuxt layouts**

### /lib
**Status: KEEP - Utility libraries**

### /local-server
**Status: EVALUATE - Development artifact**
```
[ ] Contains 24 files including .env and analysis results
[ ] Appears to be local development/testing setup
[ ] Consider removal if not essential for production
[ ] Contains brief-generator with 53 files
```

### /middleware
**Status: KEEP - Nuxt middleware**

### /netlify
**Status: KEEP - Deployment functions**

### /pages
**Status: KEEP - Core application pages**

### /plugins
**Status: KEEP - Nuxt plugins**

### /public
**Status: KEEP - Static public assets**

### /server
**Status: KEEP - Nuxt server functionality**

### /services
**Status: KEEP - Business logic services**

### /stores
**Status: KEEP - State management**

### /supabase
**Status: KEEP - Database and edge functions**
```
[ ] Review edge functions for unused functions
[ ] Check for archived/backup functions
```

---

## 🎯 CLEANUP PRIORITIES

### Phase 1: Root Directory Cleanup
**Estimated Impact: 80% of clutter removal**
1. Remove debug SQL files
2. Consolidate/move documentation files
3. Remove test JavaScript files
4. Clean up build artifacts

### Phase 2: Scripts Directory Consolidation
**Estimated Impact: Major organization improvement**
1. Group SQL scripts by purpose (migrations, fixes, utilities)
2. Remove one-time diagnostic scripts
3. Keep only reusable/essential scripts
4. Create organized subdirectories

### Phase 3: Evaluate Secondary Directories
**Estimated Impact: Repository organization**
1. /extraction - Archive or separate
2. /local-server - Remove if not essential
3. /dashboard-template - Evaluate necessity
4. /examples - Keep only current examples

### Phase 4: Fine-tuning
**Estimated Impact: Polish and optimization**
1. Unused imports cleanup
2. Dead code removal
3. Asset optimization
4. Documentation consolidation

---

## 📊 ESTIMATED CLEANUP IMPACT

**Files to Remove**: ~120-150 files
**Directories to Consolidate**: 3-4 directories
**Repository Size Reduction**: ~40-60%
**Organization Improvement**: Significant

**Risk Level**: Low (backup saved, no core functionality modified)

---

## ✅ VALIDATION CHECKLIST

### After Each Batch (Micro-validation)
```
[ ] npm run dev starts without errors
[ ] Navigate to http://localhost:3000
[ ] Login page displays correctly
[ ] Can authenticate successfully
```

### After Each Phase (Full validation)
```
[ ] Application starts successfully (npm run dev)
[ ] Authentication flows work
[ ] Dashboard loads and displays data
[ ] Core functionality intact:
    [ ] Client management works
    [ ] Analysis features work
    [ ] Reports display correctly
[ ] Build process works (npm run build)
[ ] No console errors in browser
[ ] Git commit with descriptive message
```

### Before Major Commit (Complete validation)
```
[ ] All micro and full validations pass
[ ] Test edge function connectivity
[ ] Verify database operations work
[ ] Check Netlify deployment readiness
[ ] Documentation updated appropriately
```

---

## 📝 SESSION TRACKING

**Session 1 (Current)**: Setup and analysis
**Session 2**: Root directory cleanup
**Session 3**: Scripts directory consolidation
**Session 4**: Secondary directories evaluation
**Session 5**: Final polish and documentation

---

*Last Updated: [Current Date]*
*Status: Ready for Phase 1 execution*