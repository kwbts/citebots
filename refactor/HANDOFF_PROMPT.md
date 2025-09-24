# Citebots Refactoring - Claude Code Handoff Prompt

## Session Context

I'm continuing a systematic refactoring of the Citebots application. This is **cleanup-focused refactoring** - removing unnecessary files without modifying core functionality.

## Essential Reading (Required)

**FIRST**: Read these files to understand the project:
1. `/refactor/README.md` - Project overview and principles
2. `/refactor/cleanup-checklist.md` - Detailed files to review
3. `/refactor/REFACTORING_PROTOCOL.md` - Safety procedures
4. `/refactor/changelog.md` - Progress tracking

**THEN**: Check the latest session notes in `/refactor/session-notes/` to see current status.

## Current Status

**Phase**: Session 005 ✅ COMPLETE - Massive Cleanup Achieved
**Progress**: **288+ files removed** across 5 sessions with perfect safety record
**Last Validation**: All core functionality validated, build successful (29 routes)
**Next Targets**: Brief-generator session docs (5 files) + Server directory evaluation

## SESSION 005 ACHIEVEMENTS ✅

### **Scripts Directory - AGGRESSIVE CLEANUP (137 files removed)**
**Production-focused approach**: Removed all legacy migrations, diagnostics, and historical scripts

- Removed entire `migrations/` directory (43 files) - historical migrations already applied
- Removed entire `rls/` directory (13 files) - RLS policies already in database
- Removed entire `utils/` directory (14 files) - diagnostic scripts not needed for production
- Removed entire `archive/` and `_archived-edge-function-scripts/` (6 files)
- Removed root level files (8 files) - deployment scripts, diagnostic docs, SQL files

**Result**: Scripts reduced from 148 → 4 files (96% reduction!)
**Kept**: Only `schema/` directory (3 reference files) + README.md

### **Local-Server Cleanup (19 files removed)**
**Streamlined to production essentials**:
- Removed all test-*.js files (6 files) from root
- Removed 13 development utilities from brief-generator (check-*.js, view-*.js, verify, run, cli utilities)

**Result**: Local-server focused on production servers and core libraries only

### **Cumulative Totals**
- **Sessions 001-004**: 132 files removed
- **Session 005**: 156 files removed
- **GRAND TOTAL**: **288+ files removed**

## USER INSTRUCTIONS - NEXT TARGETS

### 1. **Brief-Generator Session Documentation (5 files)**
Location: `/local-server/brief-generator/*.md`

**Files to remove**:
- `BRIEF-GENERATOR-FIX-SUMMARY.md`
- `BRIEF-GENERATOR-IMPROVEMENTS.md`
- `BRIEF-VIEWER-FIX.md`
- `CONTENT-BRIEF-IMPROVEMENTS.md`
- `MODULAR_ASSEMBLY_DESIGN.md`

**Rationale**: Historical fix/improvement session notes, not needed for production

### 2. **Server Directory Evaluation**
The `/server` directory contains Nuxt server-side code that should be evaluated:

**Analysis Required:**
- Review `/server/api/` endpoints for unused routes
- Check for development/test endpoints
- Identify any duplicate functionality with Supabase edge functions
- Evaluate middleware and utilities for necessity

### 3. **Docs Directory Consolidation (Optional)**
- `/docs/fixes/` (120KB) - Many historical fix documents
- `/docs/archive/` (112KB) - Already archived docs

**SUCCESS CRITERIA for Session 006:**
- Complete brief-generator docs cleanup
- Evaluate server directory for production vs development code
- Maintain perfect safety record
- Final validation before Round 2 architectural work

## Required Protocol

### 1. MANDATORY Human-in-the-Loop
- **NEVER** delete files without explicit approval
- **ALWAYS** list files before removal and wait for "yes/proceed"
- **IMMEDIATELY** stop if any validation fails

### 2. Validation After Every Batch
```bash
npm run dev     # Must start successfully
# Test: Login, dashboard, core features
npm run build   # Must build successfully
```

### 3. Tracking Requirements
- Update `/refactor/changelog.md` after each significant step
- Create session notes in `/refactor/session-notes/session-XXX.md`
- Commit frequently with descriptive messages

### 4. Risk Management
Use this decision framework:
- 🟢 **LOW RISK**: Debug SQL files, test artifacts (batch up to 10)
- 🟡 **MEDIUM RISK**: Documentation, reusable scripts (batch 3-5)
- 🔴 **HIGH RISK**: Imported files, config files (one by one)

## File Removal Template

For each batch:
```
📋 REVIEW REQUEST
Files to remove: [list exact files]
Risk level: [LOW/MEDIUM/HIGH]
Reason: [why these files are safe to remove]

Ready to proceed? (waiting for approval)
```

## Validation Template

After each batch:
```
✅ VALIDATION RESULTS
Removed: [X files]
App Status: [npm run dev result]
Build Status: [npm run build result]
Manual Test: [login/dashboard check]

Status: [PASS/FAIL] - [next action]
```

## Backup Verification

**CRITICAL**: Before starting ANY deletion:
```bash
# Verify backup exists
ls -la /path/to/backup/

# Confirm with user
"Backup verified at [location]. Ready to proceed?"
```

## Success Criteria

- ✅ Application functions exactly as before
- ✅ 40-60% reduction in repository clutter
- ✅ All changes tracked and documented
- ✅ Clean foundation for future architectural work

## Anti-Patterns

❌ Don't modify any .vue, .ts, .js files in core directories
❌ Don't remove files without human approval
❌ Don't skip validation steps
❌ Don't batch high-risk files
❌ Don't proceed if validation fails

## Emergency Protocol

If ANYTHING breaks:
```bash
git reset --hard HEAD  # Immediate rollback
# Update changelog with issue
# Report to user
# Adjust approach
```

---

## Ready to Begin

Reply with:
1. "I've read all refactoring documentation"
2. Current status from changelog
3. Request for user instructions to proceed

**Remember**: This is cleanup-only. No core functionality changes until "Round 2" architectural work.