# Multi-Tenancy Implementation Plan

## Overview

This document provides a detailed, phased implementation plan for adding multi-tenancy to Citebots while avoiding the performance pitfalls identified in the 2025-05-28 RLS incident.

## Business Requirements Summary

### User Hierarchy
```
Super Admin (Platform Owner)
├── Partner (Agency/Reseller)
│   ├── Partner's Clients
│   └── Partner's Team Members
└── Direct Client (Platform Customer)
    └── Client's Team Members
```

### Role Definitions

#### Super Admin
- **Primary Function:** Platform management and oversight
- **Capabilities:**
  - Access, view, and modify all accounts
  - Create client accounts and partner accounts
  - Create users for own account
  - Set basic user roles
  - Create direct client accounts (MVP focus)

#### Partner
- **Primary Function:** Agency/reseller managing multiple clients
- **Capabilities:**
  - Act as admin for their account
  - Create clients under their account and grant access
  - Access to all app features except super admin functions
  - Manage their own team members

#### Client
- **Primary Function:** End customer using the platform
- **Capabilities:**
  - View dashboards and reports for their data only
  - No administrative functions
  - Read-only access to their assigned data

## Technical Architecture

### Phase 1: Simple Direct Client Access (MVP)

#### Goals
- Enable Super Admin to create direct client accounts
- Allow clients to see only their data
- Minimal performance impact
- Easy to understand and maintain

#### Database Schema Changes

```sql
-- 1. Add account_type to profiles for role clarity
ALTER TABLE profiles ADD COLUMN account_type TEXT DEFAULT 'super_admin' 
  CHECK (account_type IN ('super_admin', 'partner', 'client'));

-- 2. Add client_account_id for direct client assignment
ALTER TABLE profiles ADD COLUMN client_account_id UUID REFERENCES clients(id);

-- 3. Add indexes for performance
CREATE INDEX idx_profiles_account_type ON profiles(account_type);
CREATE INDEX idx_profiles_client_account_id ON profiles(client_account_id);

-- 4. Update existing data
UPDATE profiles SET account_type = 'super_admin' WHERE role = 'super_admin';
```

#### Simple RLS Policies (Performance-First)

```sql
-- Clients table: Super admins see all, clients see only their assigned client
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;

CREATE POLICY "Simple client access" ON clients
FOR SELECT USING (
  -- Super admins see everything
  (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Clients see only their assigned client
  (
    (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'client'
    AND id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Original ownership (backwards compatibility)
  created_by = auth.uid()
);

-- Analysis runs: Follow client access patterns
CREATE POLICY "Simple analysis runs access" ON analysis_runs
FOR SELECT USING (
  -- Super admins see everything
  (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Clients see only their client's analysis runs
  (
    (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'client'
    AND client_id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Original ownership (backwards compatibility)
  created_by = auth.uid()
);

-- Analysis queries: Simple single JOIN maximum
CREATE POLICY "Simple analysis queries access" ON analysis_queries
FOR SELECT USING (
  -- Super admins see everything
  (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Single JOIN to check client access via analysis_runs
  EXISTS (
    SELECT 1 FROM analysis_runs ar
    WHERE ar.id = analysis_queries.analysis_run_id
    AND (
      -- Client access
      (
        (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'client'
        AND ar.client_id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
      )
      OR
      -- Original ownership
      ar.created_by = auth.uid()
    )
  )
);
```

#### Frontend Changes

**1. User Creation Interface (`/pages/dashboard/admin/users.vue`):**
```vue
<template>
  <div class="user-management">
    <h1>User Management</h1>
    
    <!-- Super Admin Only -->
    <div v-if="isSuperAdmin" class="create-user-section">
      <h2>Create New User</h2>
      
      <form @submit="createUser">
        <div class="form-group">
          <label>Account Type</label>
          <select v-model="newUser.account_type">
            <option value="client">Client User</option>
            <option value="partner">Partner (Future)</option>
          </select>
        </div>
        
        <!-- Client Assignment (for client users) -->
        <div v-if="newUser.account_type === 'client'" class="form-group">
          <label>Assign to Client</label>
          <select v-model="newUser.client_account_id" required>
            <option value="">Select Client...</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input v-model="newUser.email" type="email" required>
        </div>
        
        <button type="submit">Create User</button>
      </form>
    </div>
  </div>
</template>

<script setup>
const { user } = useSupabaseUser()
const supabase = useSupabaseClient()

const isSuperAdmin = computed(() => user.value?.account_type === 'super_admin')

const newUser = ref({
  account_type: 'client',
  client_account_id: null,
  email: ''
})

const clients = ref([])

// Load clients for assignment
const loadClients = async () => {
  const { data } = await supabase
    .from('clients')
    .select('id, name')
    .order('name')
  
  clients.value = data || []
}

const createUser = async () => {
  // Call Netlify function to create user
  const response = await $fetch('/.netlify/functions/create-client-user', {
    method: 'POST',
    body: {
      email: newUser.value.email,
      account_type: newUser.value.account_type,
      client_account_id: newUser.value.client_account_id
    }
  })
  
  if (response.success) {
    // Show success message and reset form
    alert('User created successfully!')
    newUser.value = { account_type: 'client', client_account_id: null, email: '' }
  }
}

onMounted(() => {
  loadClients()
})
</script>
```

**2. Navigation Updates (`/components/layout/SidebarIconBar.vue`):**
```vue
<script setup>
const { user } = useSupabaseUser()

const navigation = computed(() => {
  const baseNav = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' }
  ]
  
  // Client users: limited navigation
  if (user.value?.account_type === 'client') {
    return [
      ...baseNav,
      { name: 'Reports', href: '/dashboard/reports', icon: 'chart' }
    ]
  }
  
  // Super admin: full navigation
  if (user.value?.account_type === 'super_admin') {
    return [
      ...baseNav,
      { name: 'Clients', href: '/dashboard/clients', icon: 'users' },
      { name: 'Analysis', href: '/dashboard/analysis', icon: 'analysis' },
      { name: 'Reports', href: '/dashboard/reports', icon: 'chart' },
      { name: 'Admin', href: '/dashboard/admin', icon: 'settings' }
    ]
  }
  
  // Default navigation
  return baseNav
})
</script>
```

#### Backend Changes

**1. User Creation Function (`/netlify/functions/create-client-user.js`):**
```javascript
import { createClient } from '@supabase/supabase-js'

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { email, account_type, client_account_id } = await req.json()
    
    // Validate super admin permission
    const supabase = createClient(
      process.env.NUXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
    
    // Get requesting user
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user: requestingUser }, error: authError } = 
      await supabase.auth.getUser(token)
    
    if (authError || !requestingUser) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Check if requesting user is super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', requestingUser.id)
      .single()
    
    if (profile?.account_type !== 'super_admin') {
      return new Response('Forbidden', { status: 403 })
    }
    
    // Generate secure password
    const password = generateSecurePassword()
    
    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (createError) throw createError
    
    // Create profile with account type and client assignment
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email,
        account_type,
        client_account_id: account_type === 'client' ? client_account_id : null,
        created_by: requestingUser.id
      })
    
    if (profileError) throw profileError
    
    return new Response(JSON.stringify({
      success: true,
      user_id: newUser.user.id,
      temporary_password: password,
      message: 'User created successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error creating user:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => chars[b % chars.length])
    .join('')
}
```

### Phase 2: Partner Accounts (Future Enhancement)

#### Additional Schema Changes
```sql
-- Add partner_id for hierarchical structure
ALTER TABLE profiles ADD COLUMN partner_id UUID REFERENCES profiles(id);
ALTER TABLE clients ADD COLUMN partner_id UUID REFERENCES profiles(id);

-- Indexes for partner relationships
CREATE INDEX idx_profiles_partner_id ON profiles(partner_id);
CREATE INDEX idx_clients_partner_id ON clients(partner_id);
```

#### Enhanced RLS Policies
```sql
-- Partners can see their own clients and assigned users
CREATE POLICY "Partner account access" ON clients
FOR SELECT USING (
  -- Super admins see everything
  (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'super_admin'
  OR
  -- Partners see their own clients
  (
    (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'partner'
    AND partner_id = auth.uid()
  )
  OR
  -- Clients see only their assigned client
  (
    (SELECT account_type FROM profiles WHERE id = auth.uid()) = 'client'
    AND id = (SELECT client_account_id FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Original ownership
  created_by = auth.uid()
);
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema updates (profiles table)
- [ ] Simple RLS policies implementation
- [ ] Basic user creation function
- [ ] Update existing data migration

### Week 2: Frontend Integration
- [ ] User management interface
- [ ] Navigation updates based on account type
- [ ] Client dashboard restrictions
- [ ] Testing with real data

### Week 3: Testing & Refinement
- [ ] Performance testing with multiple client users
- [ ] Security testing and access control validation
- [ ] User experience testing
- [ ] Documentation updates

### Week 4: Production Deployment
- [ ] Staged rollout to production
- [ ] Monitoring and performance validation
- [ ] User training and documentation
- [ ] Bug fixes and refinements

## Performance Safeguards

### 1. RLS Policy Complexity Monitoring
```sql
-- Test query performance for each policy
EXPLAIN ANALYZE 
SELECT * FROM clients 
WHERE (SELECT account_type FROM profiles WHERE id = 'test-user-id') = 'client'
AND id = (SELECT client_account_id FROM profiles WHERE id = 'test-user-id');
```

### 2. Index Verification
```sql
-- Ensure proper indexes exist
\d+ profiles  -- Check for account_type and client_account_id indexes
\d+ clients   -- Check for partner_id index (future)
```

### 3. Performance Testing Framework
```javascript
// Automated performance tests
describe('Multi-Tenant Performance', () => {
  test('Client user dashboard loads in under 500ms', async () => {
    const clientUser = await createTestClientUser()
    const start = Date.now()
    
    const { data, error } = await clientSupabase
      .from('analysis_runs')
      .select('*')
      .limit(10)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(500)
    expect(error).toBeNull()
  })
  
  test('Multiple concurrent client users perform well', async () => {
    const clientUsers = await createTestClientUsers(10)
    
    const promises = clientUsers.map(user => {
      const userClient = createUserSupabaseClient(user)
      return userClient.from('clients').select('*')
    })
    
    const start = Date.now()
    const results = await Promise.all(promises)
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(2000) // 2 seconds for 10 concurrent users
    expect(results.every(r => !r.error)).toBe(true)
  })
})
```

## Security Considerations

### 1. Data Isolation Validation
```sql
-- Test that client users can only see their data
-- Should return 0 for proper isolation
SELECT COUNT(*) FROM clients 
WHERE id != (SELECT client_account_id FROM profiles WHERE id = 'client-user-id');
```

### 2. Access Control Testing
- [ ] Client users cannot access other clients' data
- [ ] Client users cannot access admin functions
- [ ] Super admins can access all data
- [ ] Authentication bypass attempts fail

### 3. API Endpoint Security
```javascript
// Middleware for API endpoint protection
export const requireSuperAdmin = async (req, res, next) => {
  const user = await getAuthenticatedUser(req)
  
  if (!user || user.account_type !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' })
  }
  
  next()
}
```

## Migration Strategy

### 1. Existing Data Migration
```sql
-- Migrate existing users to new structure
UPDATE profiles 
SET account_type = 'super_admin' 
WHERE role = 'super_admin';

-- All other existing users become super_admin for now
UPDATE profiles 
SET account_type = 'super_admin' 
WHERE account_type IS NULL;
```

### 2. Gradual Rollout Plan
1. **Week 1:** Deploy schema changes and RLS policies
2. **Week 2:** Enable client user creation (super admin only)
3. **Week 3:** Create first test client users
4. **Week 4:** Full production rollout

### 3. Rollback Procedures
```sql
-- Emergency rollback if needed
ALTER TABLE profiles DROP COLUMN IF EXISTS account_type;
ALTER TABLE profiles DROP COLUMN IF EXISTS client_account_id;

-- Restore original RLS policies
-- (Keep backup of original policies)
```

## Monitoring and Alerts

### 1. Performance Monitoring
```yaml
# Key metrics to monitor
database_performance:
  query_duration_p95: < 500ms
  rls_policy_execution_time: < 100ms
  concurrent_user_performance: < 2s for 10 users

user_experience:
  dashboard_load_time: < 2s
  login_success_rate: > 99%
  api_response_time: < 1s
```

### 2. Security Monitoring
```javascript
// Monitor for potential security issues
const securityChecks = {
  dataIsolationBreach: () => {
    // Check if client users can see other clients' data
  },
  unauthorizedAccess: () => {
    // Monitor for 403 errors and access attempts
  },
  rlsPolicyBypass: () => {
    // Verify RLS policies are working correctly
  }
}
```

## Success Criteria

### MVP Phase 1 Success Metrics
- [ ] Super admin can create client users in under 30 seconds
- [ ] Client users can only see their assigned client's data
- [ ] Dashboard loads for client users in under 2 seconds
- [ ] Zero data isolation breaches in security testing
- [ ] RLS policy execution time under 100ms
- [ ] No performance degradation for existing super admin users

### Future Phase 2 Success Metrics (Partners)
- [ ] Partners can manage their own client portfolio
- [ ] Partners cannot see other partners' data
- [ ] Hierarchical access control works correctly
- [ ] Performance remains stable with multiple partners

## Risk Mitigation

### High Risk: Performance Degradation
- **Mitigation:** Comprehensive performance testing before deployment
- **Monitoring:** Continuous database performance monitoring
- **Rollback:** Ready rollback procedures for RLS policies

### Medium Risk: Data Isolation Failures
- **Mitigation:** Extensive security testing and validation
- **Monitoring:** Automated data isolation checks
- **Response:** Immediate policy fixes and user notification

### Low Risk: User Experience Issues
- **Mitigation:** User testing and feedback collection
- **Monitoring:** Dashboard performance and error rates
- **Response:** UI/UX improvements and user training

## Conclusion

This implementation plan provides a safe, performant path to multi-tenancy by:

1. **Starting Simple:** MVP focuses on direct client access only
2. **Performance First:** Simple RLS policies with minimal JOINs
3. **Gradual Complexity:** Partner features added in Phase 2
4. **Comprehensive Testing:** Performance and security validation at each step
5. **Emergency Procedures:** Clear rollback and monitoring procedures

The approach learned from the 2025-05-28 incident ensures we avoid complex RLS cascades while providing the essential multi-tenant functionality needed for business growth.

---

**Next Steps:**
1. Review and approve this implementation plan
2. Set up development environment for testing
3. Begin Phase 1 implementation with schema changes
4. Implement comprehensive testing framework

**Related Documents:**
- [RLS Policy Cascade Incident Report](../fixes/rls-policy-cascade-incident-2025-05-28.md)
- [Multi-Tenancy Performance Guidelines](multi-tenancy-performance-guidelines.md)
- [Current Architecture](current-architecture.md)