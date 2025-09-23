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

**Phase**: Session 005 - Scripts & Server Directory Evaluation
**Progress**: Major cleanup completed - 132+ files removed, 2 large directories removed
**Last Validation**: All core functionality validated, hybrid local-server architecture preserved and cleaned
**Next Targets**: Scripts directory further consolidation + Server directory evaluation

## USER INSTRUCTIONS

**NEXT CLEANUP TARGETS IDENTIFIED:**

### 1. **Scripts Directory Further Consolidation**
The `/scripts` directory currently has ~70 files remaining after initial cleanup. Opportunities for further refinement:

**Analysis Required:**
- Review remaining SQL migration scripts for duplicates
- Identify one-time vs reusable scripts
- Check for additional diagnostic scripts that can be removed
- Consolidate related scripts into logical groups

### 2. **Server Directory Evaluation**
The `/server` directory contains Nuxt server-side code that should be evaluated:

**Analysis Required:**
- Review `/server/api/` endpoints for unused routes
- Check for development/test endpoints
- Identify any duplicate functionality with Supabase edge functions
- Evaluate middleware and utilities for necessity

### 3. **Additional Cleanup Opportunities**
Based on updated assessment after local-server cleanup:

**Potential Targets:**
- Documentation consolidation to `/docs/` structure
- Additional test artifacts in other directories
- Development configuration files
- Log files or cache files

**Required Analysis Process:**

1. **Scripts Directory Deep Dive**:
   - Categorize remaining 70 files by purpose and date
   - Identify clear duplicates or obsolete migrations
   - Check references in documentation and application code
   - Test that essential migrations are preserved

2. **Server Directory Assessment**:
   - Map all API routes and their usage
   - Compare with Supabase edge functions for overlap
   - Identify development vs production endpoints
   - Verify middleware necessity

3. **Conservative Approach**:
   - Continue human-in-the-loop approval for all removals
   - Batch by risk level (LOW/MEDIUM/HIGH)
   - Validate functionality after each batch
   - Document all decisions and reasoning

**SUCCESS CRITERIA for Session 005:**
- Further reduce repository clutter while preserving all functionality
- Maintain perfect safety record established in previous sessions
- Prepare clean foundation for future architectural improvements

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