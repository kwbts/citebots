# RLS Policy Cascade Incident - 2025-05-28

## Incident Summary

**Date:** May 28, 2025  
**Duration:** ~4 hours  
**Severity:** Critical (100% resource exhaustion)  
**Impact:** Complete Supabase database unavailability  

### What Happened

The implementation of complex multi-table RLS (Row Level Security) policies caused a cascading performance failure that exhausted all available database resources (CPU, Memory, Disk I/O) on our Supabase Free tier project.

## Root Cause Analysis

### Primary Cause: Complex RLS Policy Design

**Problematic Implementation:**
```sql
-- DANGEROUS: Complex multi-table JOIN policy
CREATE POLICY "Users can view page analyses for accessible clients"
  ON page_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_queries aq
      JOIN analysis_runs ar ON ar.id = aq.analysis_run_id
      JOIN client_access ca ON ca.client_id = ar.client_id
      WHERE aq.id = page_analyses.query_id
      AND ca.user_id = auth.uid()
    )
  );
```

**The Problem:**
- RLS policies execute on EVERY query to the table
- Complex JOINs in RLS create exponential query complexity
- Multiple nested EXISTS clauses with 3-4 table JOINs
- Each dashboard page load triggered dozens of these complex queries simultaneously

### Secondary Causes

1. **Cascading Table Dependencies:**
   ```
   page_analyses → analysis_queries → analysis_runs → clients → client_access
   ```

2. **Multiple Query Paths:**
   - Frontend dashboard: `pages/dashboard/reports/[id].vue`
   - Analysis page: `pages/dashboard/analysis/[id].vue` 
   - Server API: `server/api/analysis/validate.post.ts`

3. **High-Frequency Operations:**
   - Local server polling every 5 seconds
   - Dashboard auto-refresh mechanisms
   - Multiple concurrent user sessions

## Timeline of Events

### 13:00 - Initial Implementation
- Added `client_access` table for multi-tenancy
- Implemented complex RLS policies with multi-table JOINs
- Scripts: `add-client-access-table.sql`, `update-rls-policies-client-access.sql`

### 14:00 - Performance Degradation
- First timeout errors appeared
- Dashboard loading times increased dramatically
- 500 errors on `page_analyses` queries

### 14:15 - Resource Exhaustion
- Supabase project hit 100% CPU, Memory, and Disk I/O
- Connection timeouts and 522 errors
- Complete database unavailability

### 14:30 - Emergency Response
- Identified RLS policies as root cause
- Implemented emergency query bypasses in frontend
- Disabled problematic table RLS policies

### 15:00 - Recovery
- All resource-intensive queries eliminated
- Database resources began recovering
- Normal operations restored

## Emergency Fixes Applied

### 1. Frontend Query Bypasses

**Reports Dashboard (`pages/dashboard/reports/[id].vue`):**
```javascript
// EMERGENCY: Skip page analyses due to resource exhaustion
// TODO: Re-enable once RLS is properly fixed
let pagesData = []
console.log('Skipping page_analyses due to Supabase resource exhaustion')
```

**Analysis Dashboard (`pages/dashboard/analysis/[id].vue`):**
```javascript
// EMERGENCY: Skip page_analyses JOIN due to resource exhaustion
// TODO: Re-enable once RLS is properly fixed
const { data: queryData, error: queryError } = await supabase
  .from('analysis_queries')
  .select(`
    *,
    associated_pages
  `)
```

**Server API (`server/api/analysis/validate.post.ts`):**
```javascript
// EMERGENCY: Skip page_analyses JOIN due to resource exhaustion  
// TODO: Re-enable once RLS is properly fixed
const { data: queries, error: queryError } = await supabase
  .from('analysis_queries')
  .select('*')
```

### 2. Local Server Optimization

**Reduced Database Polling:**
```javascript
// Changed from 5 seconds to 1 hour
const pollInterval = parseInt(process.env.POLL_INTERVAL) || 3600000; // 1 hour default
```

### 3. RLS Policy Simplification

**Disabled Complex Policies:**
```sql
-- Disabled problematic tables temporarily
ALTER TABLE page_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queries DISABLE ROW LEVEL SECURITY;
```

## Lessons Learned

### Critical Design Principles for RLS Policies

1. **Keep RLS Policies Simple**
   - Avoid multi-table JOINs in RLS policies
   - Limit to single table ownership checks when possible
   - Use direct foreign key relationships only

2. **Performance-First Policy Design**
   ```sql
   -- GOOD: Simple ownership check
   CREATE POLICY "Users can view their own data"
     ON table_name FOR SELECT
     USING (user_id = auth.uid());
   
   -- BAD: Complex multi-table JOIN
   CREATE POLICY "Complex multi-table policy"
     ON table_name FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM table_a ta
         JOIN table_b tb ON ta.id = tb.table_a_id
         JOIN table_c tc ON tb.id = tc.table_b_id
         WHERE tc.user_id = auth.uid()
       )
     );
   ```

3. **Test RLS Policies Under Load**
   - Use `EXPLAIN ANALYZE` on RLS policy queries
   - Test with realistic data volumes
   - Monitor resource usage during testing

4. **Graduated Complexity Approach**
   - Start with simple ownership models
   - Add complexity incrementally with performance testing
   - Always have rollback plans for RLS changes

## Multi-Tenancy Implementation Guidelines

### Recommended Architecture

#### Option 1: Simple Partner Ownership (Recommended)
```sql
-- Add partner_id to main tables
ALTER TABLE clients ADD COLUMN partner_id UUID REFERENCES profiles(id);
ALTER TABLE analysis_runs ADD COLUMN partner_id UUID REFERENCES profiles(id);

-- Simple RLS policies
CREATE POLICY "Partners can view their own clients"
  ON clients FOR SELECT
  USING (
    partner_id = auth.uid() OR
    created_by = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );
```

#### Option 2: Separate Multi-Tenant Tables
```sql
-- Create separate tenant-scoped tables instead of complex JOINs
CREATE TABLE tenant_user_access (
  tenant_id UUID,
  user_id UUID,
  access_level TEXT,
  PRIMARY KEY (tenant_id, user_id)
);

-- Single JOIN maximum in RLS
CREATE POLICY "Tenant access control"
  ON protected_table FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_access
      WHERE tenant_id = protected_table.tenant_id
      AND user_id = auth.uid()
    )
  );
```

### Performance Requirements

1. **RLS Policy Complexity Limits:**
   - Maximum 1 JOIN per RLS policy
   - No nested subqueries
   - Avoid `EXISTS` with multiple table references

2. **Indexing Strategy:**
   ```sql
   -- Essential indexes for RLS performance
   CREATE INDEX idx_table_user_id ON table_name(user_id);
   CREATE INDEX idx_table_partner_id ON table_name(partner_id);
   CREATE INDEX idx_table_tenant_id ON table_name(tenant_id);
   ```

3. **Query Pattern Analysis:**
   - Monitor slow query logs
   - Use query performance insights
   - Set up resource usage alerts

### Implementation Checklist

#### Before Implementing Multi-Tenancy RLS:

- [ ] **Design Review:** RLS policies reviewed for complexity
- [ ] **Performance Testing:** Policies tested with realistic data volumes
- [ ] **Index Planning:** All necessary indexes created
- [ ] **Monitoring Setup:** Resource usage alerts configured
- [ ] **Rollback Plan:** Emergency disable procedures documented
- [ ] **Graduated Rollout:** Test with single tenant first

#### During Implementation:

- [ ] **Resource Monitoring:** Continuous CPU/Memory/IO monitoring
- [ ] **Query Performance:** Monitor query execution times
- [ ] **Error Tracking:** Watch for timeout errors
- [ ] **User Impact:** Monitor dashboard load times

#### After Implementation:

- [ ] **Performance Validation:** Confirm normal resource usage
- [ ] **Load Testing:** Test with multiple concurrent users
- [ ] **Documentation Update:** Update architecture docs
- [ ] **Team Training:** Educate team on RLS best practices

## Prevention Strategies

### 1. Development Environment Safeguards

```sql
-- Set conservative timeouts in development
SET statement_timeout = '30s';
SET idle_in_transaction_session_timeout = '60s';
```

### 2. Monitoring and Alerting

```yaml
# Recommended Supabase alerts
cpu_usage:
  threshold: 80%
  action: notify_team

memory_usage:
  threshold: 80%
  action: notify_team

query_duration:
  threshold: 5000ms
  action: log_slow_query
```

### 3. Code Review Requirements

- [ ] All RLS policy changes require peer review
- [ ] Performance impact assessment required for complex policies
- [ ] Database index strategy must be documented
- [ ] Emergency rollback procedures must be tested

### 4. Testing Requirements

```javascript
// Required RLS policy tests
describe('RLS Policy Performance', () => {
  it('should execute in under 100ms', async () => {
    const start = Date.now()
    await supabase.from('table_name').select('*').limit(10)
    const duration = Date.now() - start
    expect(duration).toBeLessThan(100)
  })
  
  it('should not cause resource exhaustion', async () => {
    // Simulate concurrent requests
    const promises = Array(50).fill().map(() => 
      supabase.from('table_name').select('*').limit(10)
    )
    await Promise.all(promises)
    // Should complete without timeouts
  })
})
```

## Recovery Procedures

### Emergency RLS Disable Protocol

1. **Immediate Response:**
   ```sql
   -- Disable RLS on affected tables
   ALTER TABLE problematic_table DISABLE ROW LEVEL SECURITY;
   ```

2. **Frontend Bypasses:**
   ```javascript
   // Add emergency query bypasses
   // Skip problematic JOINs and complex queries
   ```

3. **Resource Monitoring:**
   - Monitor Supabase usage dashboard
   - Wait for resource recovery (30-60 minutes)
   - Gradually re-enable features

### Long-term Recovery

1. **Policy Redesign:**
   - Simplify RLS policies
   - Remove complex JOINs
   - Add proper indexing

2. **Architecture Review:**
   - Consider alternative multi-tenancy approaches
   - Evaluate table structure changes
   - Plan performance testing strategy

3. **System Hardening:**
   - Implement monitoring and alerting
   - Create automated testing for RLS changes
   - Document emergency procedures

## Technical Debt Created

### Short-term (Fix in next sprint)
- [ ] Re-enable page_analyses queries with simple RLS
- [ ] Implement basic client access without complex JOINs
- [ ] Add proper error handling for resource exhaustion

### Medium-term (Fix in next month)
- [ ] Design performant multi-tenancy architecture
- [ ] Implement comprehensive RLS testing framework
- [ ] Add resource usage monitoring and alerting

### Long-term (Architectural improvements)
- [ ] Consider moving to dedicated database for scale
- [ ] Evaluate alternative multi-tenancy patterns
- [ ] Implement automated performance regression testing

## Conclusion

This incident demonstrates the critical importance of performance-first design when implementing RLS policies in PostgreSQL. Complex multi-table JOINs in RLS policies can create exponential query complexity that rapidly exhausts database resources.

**Key Takeaway:** Multi-tenancy implementation must prioritize performance and simplicity over feature completeness. Start simple, test thoroughly, and add complexity incrementally with continuous performance monitoring.

The emergency response successfully restored service, but highlighted the need for better safeguards, testing procedures, and architectural planning for multi-tenant features.

---

**Status:** Resolved ✅  
**Follow-up Required:** Multi-tenancy architecture redesign  
**Emergency Contacts:** Development team, Supabase support  
**Related Documentation:** [Multi-tenant Philosophy](../architecture/multi-tenant-philosophy.md)