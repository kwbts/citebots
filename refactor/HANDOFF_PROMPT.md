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

**Phase**: [TO BE FILLED BY USER]
**Progress**: [TO BE FILLED BY USER]
**Last Validation**: [TO BE FILLED BY USER]
**Next Target**: [TO BE FILLED BY USER]

## USER INSTRUCTIONS PLACEHOLDER

[USER: Add specific instructions for this session here]

Example:
- "Ready to proceed with Phase 1: Root directory cleanup"
- "Continue with scripts directory consolidation"
- "Need to pause and reassess /extraction directory"

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