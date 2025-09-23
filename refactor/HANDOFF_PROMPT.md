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

**Phase**: Phase 3 - Directory-by-directory final cleanup
**Progress**: Major cleanup completed - 69+ files removed, 2 large directories removed
**Last Validation**: All core functionality validated, application running normally
**Next Target**: Thorough evaluation of /examples directory before potential removal

## USER INSTRUCTIONS

**CRITICAL TASK: Thoroughly review /examples directory before any removal**

The /examples directory contains ~40 files including Vue components and backend analysis scripts. Initial analysis suggests these may be duplicates/unused, but we need CONCRETE EVIDENCE before removal.

**Required Analysis Process:**

1. **Deep Component Analysis**:
   - Compare each component in `/examples/frontend/reports/` with `/components/reports/`
   - Check for any subtle differences that might indicate active use
   - Verify imports and dependencies thoroughly

2. **Backend Script Evaluation**:
   - Review `/examples/backend/analysis-script/essential-scripts/`
   - Determine if this is legacy code or has active dependencies
   - Check if local-server references any of these files

3. **Comprehensive Search**:
   - Search entire codebase for any imports from `/examples/`
   - Check for dynamic imports or indirect references
   - Verify no build processes depend on examples

4. **Validation Strategy**:
   - Test application extensively before any removal
   - Check all reports pages, components, and functionality
   - Verify no broken imports or missing components

**DO NOT REMOVE ANYTHING until we have concrete evidence that:**
- No production code imports from `/examples/`
- All components in `/examples/` are true duplicates
- Backend scripts are not referenced by local-server or other systems
- Application functions normally without any `/examples/` dependencies

This is our final major cleanup target - let's be thorough and safe.

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