# Citebots Refactoring Protocol

## Core Philosophy

**HUMAN-IN-THE-LOOP IS MANDATORY.** Every file deletion requires explicit approval before execution.

**MICRO-STEP EXECUTION IS REQUIRED.** Remove files in small batches with validation after each batch.

**VALIDATION BEFORE COMMIT.** Test functionality after each cleanup phase before git commit.

**BACKUP VERIFICATION FIRST.** Confirm backup exists before any destructive operations.

## Refactoring Process

### 1. Pre-Flight Checklist ✅
Before ANY file removal:
```
[ ] Confirm backup exists and is accessible
[ ] Review files marked for deletion
[ ] Get explicit approval for batch
[ ] Note any concerns or dependencies
```

### 2. Execution Protocol

#### Step 1: Review Batch
```bash
# Show files to be removed (DO NOT DELETE YET)
ls -la [files-to-remove]

# Ask: "Ready to remove these X files? [List them]"
# Wait for: "Yes, proceed" or corrections
```

#### Step 2: Execute Removal
```bash
# Only after approval
rm [approved-files]

# Immediately verify
git status
```

#### Step 3: Validate Functionality
```bash
# Critical validation points
npm run dev          # Does app start?
# Check: Authentication works?
# Check: Dashboard loads?
# Check: Core features intact?

npm run build        # Does build succeed?
```

#### Step 4: Commit Checkpoint
```bash
# Only if validation passes
git add -A
git commit -m "refactor: [specific description of what was removed]"
```

### 3. Rollback Protocol
If ANYTHING breaks:
```bash
git reset --hard HEAD  # Immediate rollback
# Document issue in changelog
# Adjust approach
```

## Risk Assessment Framework

### 🟢 LOW RISK (Safe to batch)
- SQL debug/diagnostic scripts
- Test artifacts (.js test files)
- Session notes in root
- Outdated documentation

**Batch Size**: Up to 10 files
**Approval**: Single confirmation

### 🟡 MEDIUM RISK (Careful review)
- Documentation that might be referenced
- Scripts that might be reusable
- Example/template directories

**Batch Size**: 3-5 files max
**Approval**: Review each file's purpose

### 🔴 HIGH RISK (Individual review)
- Any file imported/required by code
- Configuration files
- Directories with unclear purpose

**Batch Size**: One at a time
**Approval**: Detailed discussion first

## Validation Checkpoints

### After Each Batch ✓
```bash
# Quick smoke test
npm run dev
# Navigate to http://localhost:3000
# Login works?
# Dashboard displays?
```

### After Each Phase ✓✓
```bash
# Full validation
npm run dev
npm run build
npm run generate

# Manual testing
- [ ] Login/logout
- [ ] Client management
- [ ] Run analysis
- [ ] View reports
```

### Before Major Commit ✓✓✓
```bash
# Complete validation suite
npm test (if tests exist)
npm run build
npm run generate
netlify deploy --dry-run

# Full feature check
- [ ] All authentication flows
- [ ] All CRUD operations
- [ ] All dashboard views
- [ ] Edge function connectivity
```

## Communication Protocol

### Required Confirmations

1. **Before Starting Session**
   - "Backup verified at [location]?"
   - "Ready to proceed with Phase [X]?"

2. **Before Each Deletion**
   - "These files will be removed: [list]"
   - "Risk level: [LOW/MEDIUM/HIGH]"
   - "Proceed? (yes/no/review)"

3. **After Each Validation**
   - "Validation passed: [checklist]"
   - "Any issues observed?"
   - "Continue or commit?"

### Progress Reporting

After each batch:
```
✅ Removed: [X files]
✅ Validation: Passed
✅ App Status: Running normally
📊 Progress: X/Y files in phase
```

## Decision Trees

### File Removal Decision
```
Is file imported anywhere?
├─ YES → DON'T REMOVE (High Risk)
└─ NO → Continue
    │
    Is it a one-time script?
    ├─ YES → Safe to remove (Low Risk)
    └─ NO → Continue
        │
        Is it documentation?
        ├─ YES → Should be in /docs? (Medium Risk)
        └─ NO → Review carefully (High Risk)
```

### Validation Failure Response
```
Did validation fail?
├─ YES → Immediate rollback
│   ├─ Document issue
│   ├─ Adjust approach
│   └─ Retry with smaller batch
└─ NO → Proceed to next batch
```

## Anti-Patterns to Avoid

❌ **Batch deletions without review** - Always list files first
❌ **Skipping validation** - Test after every batch
❌ **Assuming dependencies** - Check imports explicitly
❌ **Committing broken state** - Rollback if validation fails
❌ **Losing track** - Update tracking docs continuously

## Success Metrics

✅ **Zero functionality regression** - App works exactly as before
✅ **Clear audit trail** - Every change documented
✅ **Incremental progress** - Small, safe steps
✅ **Human confidence** - You understand every change
✅ **Clean repository** - 40-60% file reduction

## The Prime Directive

**Working app > Clean codebase.** If there's ANY doubt about a file's importance, keep it. We can always remove it in a future session. The goal is systematic cleanup without breaking anything.

---
*This protocol ensures safe, systematic refactoring with human oversight at every step.*