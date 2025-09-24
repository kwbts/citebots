# Frontend Cleanup Checklist

**Created**: September 24, 2025 (Session 007)
**Purpose**: Systematic review and cleanup opportunities for frontend code
**Approach**: Evidence-based decisions after thorough usage analysis

---

## 🎯 CLEANUP CATEGORIES

### Category 1: Unused Backup Files (SAFE TO REMOVE)
### Category 2: Potentially Unused Components (NEEDS VERIFICATION)
### Category 3: Duplication to Consolidate (REFACTORING)
### Category 4: Unclear Patterns (NEEDS CLARIFICATION)

---

## 📋 CATEGORY 1: UNUSED BACKUP FILES

### Analysis Index Backups
**Status**: ✅ VERIFIED - Not imported anywhere

```
[ ] /pages/dashboard/analysis/index-backup.vue
    - Risk: LOW
    - Evidence: No imports found in codebase
    - Recommendation: REMOVE (backup of previous implementation)

[ ] /pages/dashboard/analysis/index-with-queue.vue
    - Risk: LOW
    - Evidence: No imports found in codebase
    - Recommendation: REMOVE (alternative implementation not used)
```

**Action**: Remove after confirming current `/pages/dashboard/analysis/index.vue` is stable

---

## 📋 CATEGORY 2: POTENTIALLY UNUSED COMPONENTS

### Gauge Components
**Status**: ⚠️ NEEDS VERIFICATION - No imports found

```
[ ] /components/reports/components/PercentageGauge.vue
    - Risk: MEDIUM
    - Evidence: No direct imports found
    - Investigation needed: Check if dynamically imported

[ ] /components/reports/components/PercentageRingGauge.vue
    - Risk: MEDIUM
    - Evidence: No direct imports found
    - Investigation needed: Check if dynamically imported

[ ] /components/reports/components/SimplePercentageGauge.vue
    - Risk: MEDIUM
    - Evidence: No direct imports found
    - Investigation needed: Check if dynamically imported
```

**Action**:
1. Search for dynamic imports or component registry
2. If truly unused, remove all three
3. If used, consider consolidating into single configurable component

### Other Potentially Unused Components

```
[ ] Verify usage of all components in /reports/components/
    - Many small components that may have been replaced
    - Check each for imports and usage
```

---

## 📋 CATEGORY 3: DUPLICATION TO CONSOLIDATE

### Query Analysis Versions
**Status**: ✅ BOTH ACTIVELY USED - Keep for now

```
[x] QueryAnalysisComponent.vue (V1)
    - Used in: FullScreenDashboard, TestingDashboard
    - Status: Active

[x] QueryAnalysisV2.vue (V2)
    - Used in: QueryAnalysisDashboard, TestingDashboard
    - Status: Active, appears to be newer implementation
```

**Note**: TestingDashboard shows both versions, likely for comparison
**Future Action**: Once V2 is proven superior, migrate V1 usage and remove

### Top Navigation Variants
**Status**: 🔍 NEEDS INVESTIGATION

```
[ ] TopNavigation.vue vs SlimTopBar.vue
    - Purpose: Different contexts (desktop vs mobile?)
    - Investigation: When is each used?
    - Opportunity: Could they share a base component?
```

### Content Brief Viewers
**Status**: 🔍 COMPLEX PATTERN - Understand before changing

```
[ ] Multiple viewer implementations:
    - view-brief.vue (dedicated viewer)
    - view/[id].vue (dynamic route viewer)
    - view/simple.vue (simplified viewer)
    - view-redirect.vue (redirect handler)

    Investigation needed:
    - What's the user flow between these?
    - Can they be consolidated?
    - Is each serving a distinct purpose?
```

---

## 📋 CATEGORY 4: UNCLEAR PATTERNS TO CLARIFY

### Client Management Routes
**Status**: ✅ PATTERN UNDERSTOOD - Keep all

```
[x] /clients/provision
    - Purpose: Create NEW clients
    - Navigation: From clients list "New Client" button

[x] /clients/manage
    - Purpose: View ALL clients in table format
    - Navigation: From clients index "Manage" button

[x] /clients/edit-client-[id]
    - Purpose: Edit form for SPECIFIC client
    - Navigation: From manage table or client view

[x] /clients/[id]/manage
    - Purpose: Management view for SPECIFIC client
    - Navigation: Unknown - may be legacy?
```

**Investigation Needed**:
- Is `/clients/[id]/manage` still used or can it be removed?
- Should edit-client-[id] be renamed to /clients/[id]/edit for consistency?

### Debug/Testing Pages
**Status**: ✅ ACTIVELY USED - Keep but consider dev-only

```
[x] /content-brief/debug.vue
    - Status: Accessible via route (production)
    - Recommendation: Move to dev-only or remove from production builds

[x] /content-brief/debug-view.vue
    - Status: Accessible via route (production)
    - Recommendation: Move to dev-only or remove from production builds

[x] TestingDashboard.vue
    - Status: ACTIVELY USED in reports/[id].vue
    - Purpose: Testing/comparing V1 vs V2 implementations
    - Recommendation: Keep for now, remove after V2 migration complete

[x] /reports/analysis-journey-demo.vue
    - Status: Route exists (demo/testing)
    - Recommendation: Verify if needed in production
```

---

## 🔍 DETAILED INVESTIGATION TASKS

### Task 1: Component Usage Audit
**Priority**: HIGH
**Time**: 2-3 hours

```
[ ] Create script to check all component imports
[ ] Identify components with zero imports
[ ] Check for dynamic component loading patterns
[ ] Verify each "unused" component before removal
```

### Task 2: Route Flow Mapping
**Priority**: MEDIUM
**Time**: 1-2 hours

```
[ ] Map user flows for client management
[ ] Document content brief viewing pattern
[ ] Identify redundant navigation paths
[ ] Propose route consolidation if applicable
```

### Task 3: Component Consolidation Analysis
**Priority**: MEDIUM
**Time**: 2-3 hours

```
[ ] Compare 3 gauge components for differences
[ ] Analyze TopNavigation vs SlimTopBar usage contexts
[ ] Review QueryAnalysis V1 vs V2 feature parity
[ ] Propose consolidation strategies with props/slots
```

### Task 4: Production vs Dev Cleanup
**Priority**: LOW
**Time**: 1 hour

```
[ ] Move debug pages to dev-only routes
[ ] Configure build to exclude debug components in production
[ ] Add environment checks for testing dashboards
[ ] Document development-only features
```

---

## 📊 ESTIMATED CLEANUP IMPACT

### Immediate Removals (Low Risk)
- **2 backup files** (analysis index variants)
- Potential: **3 gauge components** (if verified unused)
- **Impact**: 5 files, minimal testing needed

### After Investigation (Medium Risk)
- **Debug/testing pages** (4 files) - move to dev-only
- **Unused report components** (estimate 3-5 files)
- **Impact**: 7-9 files, requires usage verification

### Refactoring Opportunities (Higher Effort)
- **Gauge consolidation**: 3 → 1 component with variants
- **Query Analysis migration**: Remove V1 after V2 proven
- **Content brief viewers**: Potential consolidation
- **Impact**: Better maintainability, reduced duplication

---

## ✅ VALIDATION CHECKLIST

Before removing ANY frontend file:

```
[ ] Verify no imports in entire codebase
[ ] Check for dynamic imports or component registry
[ ] Search for route references in navigation
[ ] Test affected user flows manually
[ ] Ensure no console errors after removal
[ ] Verify build succeeds
[ ] Check for any computed imports (e.g., `~/components/${name}`)
```

---

## 🎯 RECOMMENDED CLEANUP SEQUENCE

### Phase 1: Safe Removals (Session 008)
1. Remove analysis backup files (after current index verified)
2. Verify and remove unused gauge components
3. Move debug pages to dev-only (if applicable to build system)

### Phase 2: Pattern Clarification (Session 009)
1. Document client management flow
2. Document content brief viewing pattern
3. Identify truly redundant routes
4. Remove deprecated patterns

### Phase 3: Consolidation (Future Session)
1. Migrate QueryAnalysis V1 → V2
2. Consolidate gauge components
3. Review navigation component variants
4. Optimize component hierarchy

---

## 🔗 RELATED DOCUMENTS

- **Architecture Analysis**: `/refactor/session-notes/session-007-frontend-diagnostics.md`
- **Original Cleanup Checklist**: `/refactor/cleanup-checklist.md`
- **Project Principles**: `/refactor/REFACTORING_PROTOCOL.md`

---

## 📝 NOTES FOR FUTURE SESSIONS

### Component Organization Ideas
- Consider creating `components/shared/` for truly shared components (TagInput)
- Group gauge variants under `components/charts/` or `components/visualizations/`
- Separate production from debug components clearly

### Naming Conventions
- Use consistent patterns: [id] for dynamic routes
- Consider: `/clients/[id]/edit` instead of `/clients/edit-client-[id]`
- Align with RESTful patterns where applicable

### Documentation Needs
- Document when to use each client management route
- Create user flow diagrams for complex features
- Add comments explaining multi-viewer patterns

---

*Status: ANALYSIS COMPLETE - Ready for cleanup execution in future sessions*