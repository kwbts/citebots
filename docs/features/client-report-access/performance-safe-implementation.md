# Client Report Access: Performance-Safe Implementation Plan

## Overview

This document outlines the strategy for enabling client users to access reports for their assigned client organization while avoiding the performance issues that caused the 2025-05-28 resource exhaustion incident.

## Critical Context

### Database Relationship Chain
```
User Login → profiles.client_account_id → clients.id → analysis_runs.client_id → analysis_queries → page_analyses
```

### Performance Constraints from 2025-05-28 Incident
- ❌ **NEVER**: Multi-table JOINs in RLS policies
- ❌ **NEVER**: `page_analyses` table JOINs (caused 100% resource exhaustion)
- ❌ **NEVER**: Complex `EXISTS` clauses with 3+ table references
- ❌ **NEVER**: Cascading RLS policies across related tables

### Current Emergency State
- `page_analyses` queries are bypassed in all dashboards
- Complex JOINs removed from APIs
- System stable but feature-limited

## Goal

Enable client users to see reports only for their assigned client organization without compromising database performance.

## Implementation Options Analysis

### Option 1: Application-Level Filtering (Recommended Start)

**Strategy**: Handle access control in frontend/API layer, not database RLS.

**Implementation**:
```javascript
// Step 1: Get user's assigned client
const userProfile = await supabase
  .from('profiles')
  .select('client_account_id')
  .eq('id', user.id)
  .single()

const assignedClientId = userProfile.data.client_account_id

// Step 2: Filter all queries by client_id (no RLS complexity)
const reports = await supabase
  .from('analysis_runs')
  .select('*')
  .eq('client_id', assignedClientId)

const queries = await supabase
  .from('analysis_queries')
  .select('*')
  .eq('analysis_run_id', selectedRunId)  // Already filtered by client

// Step 3: Skip page_analyses (keep emergency bypasses active)
// Use analysis_queries.associated_pages column instead
```

**Pros**:
- ✅ Zero RLS complexity
- ✅ No multi-table JOINs
- ✅ Simple, predictable database queries
- ✅ Easy to debug and monitor
- ✅ No risk of resource exhaustion
- ✅ Can implement immediately

**Cons**:
- ⚠️ Requires frontend logic in every query
- ⚠️ Not enforced at database level (relies on application)

**Risk Level**: 🟢 **MINIMAL** - No database policy changes

### Option 2: Simple RLS on Core Tables Only

**Strategy**: Add minimal RLS only to `analysis_runs` table.

**Implementation**:
```sql
-- SAFE: Single subquery, no JOINs
CREATE POLICY "Client users see own client runs" ON analysis_runs
FOR SELECT USING (
  client_id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
);
```

**Pros**:
- ✅ Database-level enforcement
- ✅ Single subquery only
- ✅ Direct column reference
- ✅ No table JOINs

**Cons**:
- ⚠️ Adds RLS complexity
- ⚠️ Requires extensive performance testing
- ⚠️ Could impact query performance

**Risk Level**: 🟡 **MODERATE** - Simple RLS but needs testing

### Option 3: Hybrid Approach (Recommended Long-term)

**Strategy**: Combine application-level and minimal RLS.

**Phase 1**: Application-level filtering only
**Phase 2**: Add simple RLS to `analysis_runs` if performance allows
**Phase 3**: Keep `page_analyses` bypassed permanently

**Risk Level**: 🟢 **MINIMAL** - Start safe, expand carefully

## Recommended Implementation Plan

### Phase 1: Application-Level Only (Immediate - Zero Risk)

#### Frontend Changes Required:
1. **User Profile Enhancement**:
   ```javascript
   // Add client context to user session
   const getUserClientContext = async () => {
     const { data: profile } = await supabase
       .from('profiles')
       .select('client_account_id, account_type')
       .eq('id', user.id)
       .single()
     
     return profile
   }
   ```

2. **Reports Page Updates**:
   ```javascript
   // Filter reports by user's assigned client
   if (userProfile.account_type === 'client') {
     query = query.eq('client_id', userProfile.client_account_id)
   }
   ```

3. **Navigation Restrictions**:
   ```javascript
   // Hide non-relevant navigation for client users
   const allowedRoutes = userProfile.account_type === 'client' 
     ? ['/dashboard', '/dashboard/reports']
     : getAllRoutes()
   ```

#### Backend Changes Required:
```javascript
// Add client context validation to API endpoints
export const validateClientAccess = (userProfile, requestedClientId) => {
  if (userProfile.account_type === 'super_admin') return true
  if (userProfile.account_type === 'client') {
    return userProfile.client_account_id === requestedClientId
  }
  return false
}
```

#### Files to Modify:
- `/pages/dashboard/reports/index.vue` - Add client filtering
- `/pages/dashboard/reports/[id].vue` - Add access validation  
- `/composables/useClientAccess.ts` - New composable for access logic
- `/middleware/client-access.ts` - New middleware for route protection

### Phase 2: Optional RLS Enhancement (Only if Phase 1 succeeds)

**Prerequisites**:
- Phase 1 working perfectly for 2+ weeks
- No performance issues observed
- Full performance testing completed

**Implementation**:
```sql
-- Test this extensively before deployment
CREATE POLICY "Client users access own client data" ON analysis_runs
FOR SELECT USING (
  (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'super_admin'
  OR 
  client_id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
);
```

### Phase 3: Permanent Architecture

**Keep Forever**:
- `page_analyses` queries bypassed (use `associated_pages` column)
- Application-level filtering as primary security
- Simple RLS as secondary enforcement only
- Complex multi-table policies permanently banned

## Performance Testing Requirements

### Before ANY Implementation:

#### 1. Baseline Measurements
```sql
-- Record current performance
EXPLAIN ANALYZE SELECT * FROM analysis_runs LIMIT 10;
EXPLAIN ANALYZE SELECT * FROM analysis_queries LIMIT 10;
```

#### 2. Load Testing
- Create 1000+ analysis_runs across 10+ clients
- Create 10+ client users
- Test 5+ concurrent client users querying reports
- Monitor CPU/Memory during tests

#### 3. Performance Thresholds
- **Query Time**: <100ms per query
- **CPU Usage**: <50% during normal operations
- **Memory Usage**: <50% during normal operations
- **Dashboard Load**: <2 seconds for client users
- **Concurrent Users**: 10+ users without degradation

### Monitoring Requirements

#### Critical Metrics
```yaml
database_performance:
  query_duration_p95: <500ms
  cpu_usage_max: <60%
  memory_usage_max: <60%
  connection_count: <80

application_performance:
  dashboard_load_time: <2s
  api_response_time: <1s
  error_rate: <1%
```

#### Alert Thresholds
| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Query Duration | 500ms | 1s | Investigate/Rollback |
| CPU Usage | 60% | 80% | Scale/Disable Features |
| Memory Usage | 60% | 80% | Scale/Clear Cache |
| Error Rate | 2% | 5% | Immediate Investigation |

## Emergency Procedures

### Immediate Response (0-5 minutes)
```sql
-- If performance issues occur, disable new policies immediately
DROP POLICY IF EXISTS "Client users access own client data" ON analysis_runs;
```

### Frontend Emergency Bypasses
```javascript
// Add emergency mode flag
const EMERGENCY_MODE = process.env.EMERGENCY_CLIENT_ACCESS === 'true'

if (EMERGENCY_MODE) {
  // Skip client filtering, show generic message
  console.warn('Emergency mode: Client access temporarily disabled')
  return { data: [], message: 'Reports temporarily unavailable' }
}
```

### Recovery Steps
1. **Disable problematic policies** (if any)
2. **Monitor resource recovery** (15-30 minutes)
3. **Investigate root cause** while system recovers
4. **Implement fixes** in development environment first
5. **Re-test thoroughly** before re-deployment

## File Structure for Implementation

```
docs/features/client-report-access/
├── performance-safe-implementation.md (this file)
├── testing-checklist.md (create next)
├── emergency-procedures.md (create next)
└── phase-1-implementation-guide.md (create next)

composables/
├── useClientAccess.ts (create)
└── useUserProfile.ts (enhance existing)

middleware/
├── client-access.ts (create)
└── auth.ts (enhance existing)

pages/dashboard/
├── reports/
│   ├── index.vue (modify for client filtering)
│   └── [id].vue (modify for access validation)
└── clients/
    └── (hide from client users)
```

## Security Considerations

### Data Isolation Validation
```sql
-- Test query to ensure client users only see their data
-- Should return 0 for proper isolation
SELECT COUNT(*) FROM analysis_runs 
WHERE client_id != (SELECT client_account_id FROM profiles WHERE id = 'client-user-id');
```

### Access Control Testing
- [ ] Client users cannot access other clients' reports
- [ ] Client users cannot access admin functions
- [ ] Super admins can access all reports
- [ ] Navigation properly restricted for client users
- [ ] Direct URL access properly blocked

## Success Criteria

### Phase 1 Success Metrics
- [ ] Client users can view their assigned client's reports
- [ ] Client users cannot access other clients' data
- [ ] Dashboard loads for client users in <2 seconds
- [ ] Zero performance degradation for super admin users
- [ ] No database resource usage increase
- [ ] Zero security bypasses in testing

### Performance Benchmarks
- [ ] All report queries execute in <200ms
- [ ] CPU usage remains <40% during normal operations
- [ ] Memory usage remains <40% during normal operations
- [ ] 10+ concurrent client users perform acceptably

## Risk Assessment

### High Risk Scenarios (Avoid)
- Adding RLS policies without extensive testing
- Enabling `page_analyses` queries before performance validation
- Implementing complex multi-table access patterns

### Medium Risk Scenarios (Proceed with Caution)
- Adding simple RLS to `analysis_runs` table
- Modifying existing query patterns
- Changing navigation logic

### Low Risk Scenarios (Safe to Implement)
- Application-level client filtering
- Frontend navigation restrictions
- Adding client context to user sessions

## Related Documentation

- [RLS Policy Cascade Incident Report](../../fixes/rls-policy-cascade-incident-2025-05-28.md)
- [Multi-Tenancy Performance Guidelines](../../architecture/multi-tenancy-performance-guidelines.md)
- [Multi-Tenancy Implementation Plan](../../architecture/multi-tenancy-implementation-plan.md)
- [Current Data Model](../../architecture/current-data-model.md)

## Approval Requirements

### Before Phase 1 Implementation
- [ ] Performance baseline recorded
- [ ] Testing plan approved
- [ ] Emergency procedures documented
- [ ] Monitoring setup confirmed

### Before Phase 2 Implementation (RLS)
- [ ] Phase 1 running successfully for 2+ weeks
- [ ] Load testing completed successfully
- [ ] Performance monitoring shows no degradation
- [ ] Emergency rollback procedures tested

---

**Last Updated**: 2025-05-28  
**Status**: Planning Phase  
**Next Review**: After Phase 1 implementation  
**Owner**: Development Team