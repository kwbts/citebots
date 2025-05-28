# Multi-Tenancy Performance Guidelines

## Overview

This document provides critical guidelines for implementing multi-tenant features in the Citebots platform while avoiding the performance pitfalls that caused the 2025-05-28 resource exhaustion incident.

## Core Principles

### 1. Performance-First Design
- **Simple > Complex:** Always choose simple solutions over complex ones
- **Test Early:** Performance test every RLS policy before production
- **Monitor Continuously:** Set up alerts for resource usage and query performance

### 2. RLS Policy Complexity Limits

#### ✅ SAFE RLS Patterns
```sql
-- Direct ownership check
CREATE POLICY "user_owns_resource" ON table_name
FOR SELECT USING (user_id = auth.uid());

-- Single JOIN maximum
CREATE POLICY "partner_access" ON table_name
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = table_name.partner_id 
    AND partners.user_id = auth.uid()
  )
);

-- Role-based with simple check
CREATE POLICY "role_based_access" ON table_name
FOR SELECT USING (
  user_id = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

#### ❌ DANGEROUS RLS Patterns
```sql
-- NEVER: Multi-table JOINs
CREATE POLICY "complex_cascade" ON table_name
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM table_a ta
    JOIN table_b tb ON ta.id = tb.table_a_id
    JOIN table_c tc ON tb.id = tc.table_b_id
    WHERE tc.user_id = auth.uid()
  )
);

-- NEVER: Nested subqueries
CREATE POLICY "nested_complexity" ON table_name
FOR SELECT USING (
  user_id IN (
    SELECT user_id FROM access_table 
    WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE active = true
    )
  )
);
```

## Multi-Tenancy Architecture Options

### Option 1: Partner-Based Ownership (Recommended for Citebots)

**Schema Design:**
```sql
-- Add partner context to main tables
ALTER TABLE clients ADD COLUMN partner_id UUID REFERENCES profiles(id);
ALTER TABLE analysis_runs ADD COLUMN partner_id UUID REFERENCES profiles(id);

-- Create indexes for performance
CREATE INDEX idx_clients_partner_id ON clients(partner_id);
CREATE INDEX idx_analysis_runs_partner_id ON analysis_runs(partner_id);
```

**RLS Policies:**
```sql
-- Simple, performant policies
CREATE POLICY "partners_own_clients" ON clients
FOR ALL USING (
  partner_id = auth.uid() OR
  created_by = auth.uid() OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "partners_own_analysis_runs" ON analysis_runs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = analysis_runs.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

**Benefits:**
- ✅ Simple ownership model
- ✅ Maximum 1 JOIN per RLS policy
- ✅ Clear data boundaries
- ✅ Easy to understand and maintain

### Option 2: Dedicated Tenant Tables

**Schema Design:**
```sql
-- Separate tenant access control
CREATE TABLE tenant_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  access_level TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Add tenant context to data tables
ALTER TABLE clients ADD COLUMN tenant_id UUID;
ALTER TABLE analysis_runs ADD COLUMN tenant_id UUID;

-- Performance indexes
CREATE INDEX idx_tenant_access_user_id ON tenant_access(user_id);
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
```

**RLS Policies:**
```sql
-- Single JOIN for tenant access
CREATE POLICY "tenant_member_access" ON clients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tenant_access 
    WHERE tenant_id = clients.tenant_id 
    AND user_id = auth.uid()
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

### Option 3: Application-Level Multi-Tenancy (For Complex Cases)

**When to Use:**
- Need for complex permission hierarchies
- Performance requirements exceed RLS capabilities
- Advanced tenant isolation requirements

**Implementation:**
```javascript
// Handle multi-tenancy in application layer
export function useMultiTenant() {
  const { user } = useAuth()
  
  const getUserTenants = async () => {
    // Single query to get user's tenant access
    const { data } = await supabase
      .from('tenant_access')
      .select('tenant_id, access_level')
      .eq('user_id', user.value.id)
    
    return data
  }
  
  const getTenantscopedQuery = (tableName, tenantId) => {
    // Build tenant-scoped queries without RLS complexity
    return supabase
      .from(tableName)
      .select('*')
      .eq('tenant_id', tenantId)
  }
}
```

## Performance Testing Framework

### 1. RLS Policy Performance Tests

```javascript
// Test file: tests/rls-performance.test.js
describe('RLS Policy Performance', () => {
  beforeEach(async () => {
    // Set up test data with realistic volumes
    await createTestUsers(100)
    await createTestClients(1000)
    await createTestAnalysisRuns(10000)
  })
  
  test('Client query performance under load', async () => {
    const startTime = Date.now()
    
    // Simulate multiple concurrent users
    const promises = Array(20).fill().map(async (_, i) => {
      const testUser = await getTestUser(i)
      const userSupabase = createUserClient(testUser)
      
      return userSupabase
        .from('clients')
        .select('*')
        .limit(10)
    })
    
    const results = await Promise.all(promises)
    const duration = Date.now() - startTime
    
    // Performance assertions
    expect(duration).toBeLessThan(2000) // 2 seconds max
    expect(results.every(r => !r.error)).toBe(true)
  })
  
  test('RLS policy query execution time', async () => {
    const { data, error } = await supabase.rpc('explain_analyze_query', {
      query: `
        SELECT * FROM clients 
        WHERE (RLS_POLICY_CONDITIONS) 
        LIMIT 10
      `
    })
    
    expect(error).toBeNull()
    
    // Parse execution time from EXPLAIN ANALYZE
    const executionTime = parseExecutionTime(data)
    expect(executionTime).toBeLessThan(50) // 50ms max
  })
})
```

### 2. Resource Usage Monitoring

```javascript
// Resource monitoring utility
export class ResourceMonitor {
  static async checkSupabaseHealth() {
    const metrics = await this.getSupabaseMetrics()
    
    return {
      cpu: metrics.cpu_usage < 80,
      memory: metrics.memory_usage < 80,
      connections: metrics.active_connections < 100,
      slowQueries: metrics.slow_queries_count < 10
    }
  }
  
  static async validateRLSPerformance(tableName, userId) {
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    const queryTime = Date.now() - startTime
    
    return {
      success: !error,
      queryTime,
      performant: queryTime < 100 // 100ms threshold
    }
  }
}
```

## Implementation Checklist

### Pre-Implementation Phase
- [ ] **Architecture Review:** Multi-tenancy approach selected and documented
- [ ] **Performance Baseline:** Current system performance metrics captured
- [ ] **Test Data Setup:** Realistic test data volumes prepared
- [ ] **Monitoring Setup:** Resource usage alerts configured

### Design Phase
- [ ] **Schema Design:** Database schema changes planned and reviewed
- [ ] **RLS Policy Design:** All policies follow complexity guidelines
- [ ] **Index Strategy:** Performance indexes planned for all foreign keys
- [ ] **Query Pattern Analysis:** All application queries reviewed for RLS impact

### Testing Phase
- [ ] **Unit Tests:** RLS policies tested in isolation
- [ ] **Performance Tests:** Load testing with realistic data volumes
- [ ] **Integration Tests:** End-to-end testing with multi-tenant scenarios
- [ ] **Resource Monitoring:** Continuous monitoring during testing

### Deployment Phase
- [ ] **Graduated Rollout:** Deploy to single tenant first
- [ ] **Real-time Monitoring:** Active monitoring during initial deployment
- [ ] **Performance Validation:** Confirm normal resource usage patterns
- [ ] **Rollback Readiness:** Emergency rollback procedures tested

## Monitoring and Alerting

### Critical Metrics to Monitor

1. **Database Performance:**
   ```yaml
   cpu_usage:
     threshold: 70%
     action: alert_team
   
   memory_usage:
     threshold: 70%
     action: alert_team
   
   query_duration:
     threshold: 1000ms
     action: log_slow_query
   
   connection_count:
     threshold: 80
     action: alert_team
   ```

2. **Application Performance:**
   ```javascript
   // Dashboard load time monitoring
   const monitorDashboardPerformance = () => {
     const startTime = Date.now()
     
     // Track critical user journeys
     return {
       clientListLoad: () => trackMetric('client_list_load_time'),
       analysisLoad: () => trackMetric('analysis_load_time'),
       reportGeneration: () => trackMetric('report_generation_time')
     }
   }
   ```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU Usage | 70% | 85% | Scale up / Disable complex queries |
| Memory Usage | 70% | 85% | Scale up / Clear cache |
| Query Duration | 1s | 5s | Optimize query / Disable feature |
| Error Rate | 5% | 10% | Investigate / Rollback |
| Connection Pool | 80% | 95% | Scale connections / Optimize queries |

## Emergency Procedures

### Resource Exhaustion Response

1. **Immediate Response (0-5 minutes):**
   ```sql
   -- Disable RLS on problematic tables
   ALTER TABLE page_analyses DISABLE ROW LEVEL SECURITY;
   ALTER TABLE analysis_queries DISABLE ROW LEVEL SECURITY;
   ```

2. **Frontend Bypasses (5-15 minutes):**
   ```javascript
   // Add emergency query bypasses
   const EMERGENCY_MODE = process.env.EMERGENCY_MODE === 'true'
   
   if (EMERGENCY_MODE) {
     // Skip complex queries
     console.warn('Emergency mode: Skipping complex database operations')
     return mockData
   }
   ```

3. **Resource Recovery (15-60 minutes):**
   - Monitor Supabase dashboard for resource recovery
   - Gradually re-enable features as resources stabilize
   - Investigate root cause while system recovers

### Rollback Procedures

```sql
-- Template for emergency RLS rollback
-- 1. Disable new policies
DROP POLICY IF EXISTS "new_complex_policy" ON table_name;

-- 2. Restore simple policies
CREATE POLICY "simple_ownership" ON table_name
FOR SELECT USING (user_id = auth.uid());

-- 3. Re-enable RLS with simple policies
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Best Practices Summary

### DO ✅
- Keep RLS policies simple (max 1 JOIN)
- Test performance with realistic data volumes
- Monitor resource usage continuously
- Have emergency rollback procedures ready
- Use proper indexing for all foreign keys
- Start with simple multi-tenancy and evolve

### DON'T ❌
- Create complex multi-table JOINs in RLS policies
- Deploy RLS changes without performance testing
- Ignore resource usage metrics
- Implement complex multi-tenancy without testing
- Use nested subqueries in RLS policies
- Deploy without rollback procedures

### Remember the 2025-05-28 Incident
- Complex RLS policies can cause exponential resource usage
- Always test RLS changes under realistic load
- Monitor continuously and have emergency procedures ready
- Performance must be prioritized over feature complexity

---

**Next Steps:**
1. Review this document with the development team
2. Implement performance testing framework
3. Set up monitoring and alerting
4. Plan multi-tenancy implementation with these guidelines

**Related Documents:**
- [RLS Policy Cascade Incident Report](../fixes/rls-policy-cascade-incident-2025-05-28.md)
- [Multi-Tenant Philosophy](multi-tenant-philosophy.md)
- [Current Architecture](current-architecture.md)