# Partner Access Implementation Plan

## Overview

This document outlines the comprehensive requirements and implementation plan for adding partner access functionality to the Citebots platform. Partners will be able to create and manage their own clients, run analyses, and generate reports within isolated sandboxes.

## Business Requirements

### Partner Role Definition
- **Primary Function**: Create and manage clients, run analyses, generate reports
- **Business Model**: Enable multiple partners to operate independently on the platform
- **Revenue Model**: Partners can service their own client base while using Citebots infrastructure
- **Isolation**: Partners cannot see or access other partners' data

### User Hierarchy
```
super_admin (full platform access)
├── partner (isolated client management)
├── analyst (read-only analysis access)
└── client (view-only access to their own data)
```

## Technical Requirements

### 1. Database Schema Changes

#### 1.1 Profiles Table (No Changes Required)
Current `profiles` table already supports partner role:
- `role` field includes: super_admin, partner, client, analyst
- No schema changes needed

#### 1.2 Clients Table Enhancement
**Required Changes:**
```sql
ALTER TABLE clients ADD COLUMN partner_id UUID REFERENCES profiles(id);
```

**Migration Strategy:**
- Add column as nullable initially
- Backfill existing clients with super_admin user ID
- Consider making NOT NULL after migration

#### 1.3 Analysis Tables Enhancement
**Required Changes:**
```sql
-- Add partner context to analysis_runs
ALTER TABLE analysis_runs ADD COLUMN partner_id UUID REFERENCES profiles(id);

-- Index for performance
CREATE INDEX idx_clients_partner_id ON clients(partner_id);
CREATE INDEX idx_analysis_runs_partner_id ON analysis_runs(partner_id);
```

### 2. Row Level Security (RLS) Policies

#### 2.1 Clients Table RLS
```sql
-- Partners can only see their own clients
CREATE POLICY "Partners can view own clients"
ON public.clients
FOR SELECT
USING (
  auth.uid() = partner_id OR
  auth.uid() = created_by OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Partners can only modify their own clients
CREATE POLICY "Partners can modify own clients"
ON public.clients
FOR ALL
USING (
  auth.uid() = partner_id OR
  auth.uid() = created_by OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

#### 2.2 Analysis Runs RLS
```sql
-- Partners can only see analysis runs for their clients
CREATE POLICY "Partners can view own analysis runs"
ON public.analysis_runs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = analysis_runs.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

#### 2.3 Competitors Table RLS
```sql
-- Partners can only manage competitors for their clients
CREATE POLICY "Partners can manage competitors for own clients"
ON public.competitors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = competitors.client_id 
    AND (clients.partner_id = auth.uid() OR clients.created_by = auth.uid())
  ) OR
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
```

### 3. Edge Function Updates

#### 3.1 Client Management Functions
**Files to Update:**
- `/supabase/functions/enhance-client-with-ai/index.ts`
- Any client CRUD functions

**Required Changes:**
- Add partner_id when creating clients
- Validate partner can only access their own clients
- Update queries to respect partner boundaries

#### 3.2 Analysis Functions
**Files to Update:**
- `/supabase/functions/run-custom-analysis/index.ts`
- `/supabase/functions/process-queue-worker/index.ts`
- `/supabase/functions/execute-query/index.ts`

**Required Changes:**
- Validate partner owns the client before running analysis
- Add partner context to analysis runs
- Filter results by partner ownership

### 4. Frontend Changes

#### 4.1 Navigation & Layout
**Partner-Specific Dashboard:**
- Remove admin sections (user management, access requests)
- Focus on client portfolio management
- Simplified navigation menu

**New Routes:**
```
/dashboard/partner
├── /clients (partner's client list)
├── /clients/new (create new client)
├── /clients/[id] (manage specific client)
├── /analysis (run analysis on partner's clients)
└── /reports (view reports for partner's clients)
```

#### 4.2 Client Management Interface
**Enhanced Client List:**
- Show only partner's clients
- Add bulk operations (select multiple clients)
- Quick stats per client (last analysis, total queries, etc.)

**Client Creation Flow:**
- Automatically assign partner_id to new clients
- Streamlined form for partner use case
- Bulk import capabilities

#### 4.3 Analysis Interface
**Partner-Scoped Analysis:**
- Client selector shows only partner's clients
- Batch analysis across multiple clients
- Progress tracking for multiple concurrent analyses

### 5. Access Control & Permissions

#### 5.1 Composables Updates
**File:** `/composables/useAuth.ts` (if exists)
```typescript
export function usePartnerAuth() {
  const isPartner = computed(() => user.value?.role === 'partner')
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')
  const canAccessClient = (clientId: string) => {
    // Check if partner owns this client
  }
}
```

#### 5.2 Middleware Updates
**File:** `/middleware/partner.ts`
```typescript
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  
  if (user.value?.role !== 'partner' && user.value?.role !== 'super_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Partner access required'
    })
  }
})
```

## Implementation Phases

### Phase 1: Database Foundation (2-3 hours)
**Deliverables:**
- [ ] Add partner_id column to clients table
- [ ] Add partner_id column to analysis_runs table
- [ ] Create database migration scripts
- [ ] Update RLS policies for partner isolation
- [ ] Test data isolation with sample data

**Acceptance Criteria:**
- Partners can only see their own clients in database queries
- Super admin can see all clients
- Analysis runs are properly scoped to partner's clients

### Phase 2: Backend API Updates (4-6 hours)
**Deliverables:**
- [ ] Update edge functions for partner context
- [ ] Modify client CRUD operations
- [ ] Update analysis functions
- [ ] Add partner validation logic
- [ ] Test edge function isolation

**Acceptance Criteria:**
- Partner can create clients (assigned to their partner_id)
- Partner can only run analysis on their own clients
- Partner cannot access other partners' data via API

### Phase 3: Frontend Partner Dashboard (6-8 hours)
**Deliverables:**
- [ ] Create partner-specific dashboard layout
- [ ] Implement partner client management interface
- [ ] Update navigation for partner role
- [ ] Add partner-scoped analysis interface
- [ ] Implement partner middleware and guards

**Acceptance Criteria:**
- Partner sees only their own clients in UI
- Partner can create and manage clients
- Partner can run analyses on their clients
- Partner cannot access admin functions

### Phase 4: Enhanced Features (4-6 hours)
**Deliverables:**
- [ ] Bulk client operations
- [ ] Partner onboarding flow
- [ ] Enhanced analytics for partners
- [ ] Partner-specific reporting features
- [ ] Performance optimizations

**Acceptance Criteria:**
- Partners can efficiently manage multiple clients
- Smooth onboarding experience for new partners
- Performance is maintained with multiple partners

## Data Migration Strategy

### Existing Data Handling
1. **Backup Current Data**
   ```sql
   -- Create backup tables
   CREATE TABLE clients_backup AS SELECT * FROM clients;
   CREATE TABLE analysis_runs_backup AS SELECT * FROM analysis_runs;
   ```

2. **Add Columns**
   ```sql
   -- Add partner_id columns
   ALTER TABLE clients ADD COLUMN partner_id UUID REFERENCES profiles(id);
   ALTER TABLE analysis_runs ADD COLUMN partner_id UUID REFERENCES profiles(id);
   ```

3. **Backfill Data**
   ```sql
   -- Assign existing clients to super admin
   UPDATE clients 
   SET partner_id = (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1)
   WHERE partner_id IS NULL;
   
   -- Assign existing analysis runs
   UPDATE analysis_runs 
   SET partner_id = (SELECT partner_id FROM clients WHERE clients.id = analysis_runs.client_id)
   WHERE partner_id IS NULL;
   ```

## Security Considerations

### 1. Data Isolation
- **RLS Policies**: Ensure complete data isolation between partners
- **Edge Function Validation**: Double-check partner ownership at API level
- **Frontend Guards**: Prevent UI access to unauthorized data

### 2. Partner Verification
- **Account Creation**: Only super admin can approve partner accounts
- **Role Assignment**: Strict role validation in all operations
- **Audit Trail**: Log partner actions for compliance

### 3. Performance Impact
- **Indexing**: Add appropriate indexes for partner_id columns
- **Query Optimization**: Ensure partner-scoped queries are efficient
- **Caching Strategy**: Consider partner-specific caching if needed

## Testing Strategy

### 1. Unit Tests
- Database RLS policy tests
- Edge function authorization tests
- Frontend component access control tests

### 2. Integration Tests
- End-to-end partner workflow tests
- Data isolation verification tests
- Performance tests with multiple partners

### 3. Manual Testing Scenarios
- [ ] Partner creates account and gets approved
- [ ] Partner creates multiple clients
- [ ] Partner runs analysis on their clients
- [ ] Partner cannot see other partners' data
- [ ] Super admin can see all partner data
- [ ] Data integrity maintained during operations

## Risk Assessment

### High Risk
- **Data Isolation Failure**: Partner sees other partners' data
  - **Mitigation**: Comprehensive RLS testing, edge function validation
- **Performance Degradation**: Partner queries slow down system
  - **Mitigation**: Proper indexing, query optimization

### Medium Risk
- **Migration Issues**: Data loss during partner_id backfill
  - **Mitigation**: Thorough backup and testing strategy
- **UI/UX Confusion**: Partners confused by new interface
  - **Mitigation**: Clear documentation and onboarding flow

### Low Risk
- **Edge Function Deployment**: Functions fail to deploy
  - **Mitigation**: Test deployment process, have rollback plan

## Success Metrics

### Technical Metrics
- [ ] 100% data isolation between partners (verified by automated tests)
- [ ] Partner dashboard loads within 2 seconds
- [ ] Analysis functions maintain current performance levels
- [ ] Zero security vulnerabilities in partner access

### Business Metrics
- [ ] Partners can create clients within 5 minutes of approval
- [ ] Partners can run first analysis within 10 minutes
- [ ] Partner satisfaction score > 8/10 in initial feedback
- [ ] Platform can support 10+ concurrent partners without performance issues

## Future Considerations

### Potential Enhancements
1. **Partner Analytics**: Dashboard showing partner performance metrics
2. **White-label Options**: Custom branding for partner portals
3. **API Access**: Partner-specific API keys for direct integration
4. **Billing Integration**: Usage-based billing per partner
5. **Partner Collaboration**: Shared clients between partners (with permissions)

### Scalability Planning
- **Multi-region Support**: Partner data in different regions
- **Advanced Permissions**: Granular permissions within partner organizations
- **Partner Hierarchies**: Sub-partners or team structures

## Appendix

### Database Schema Diagrams
```
profiles (existing)
├── id (UUID, PK)
├── email (TEXT)
├── role (TEXT) [super_admin, partner, analyst, client]
└── ...

clients (enhanced)
├── id (UUID, PK)
├── name (TEXT)
├── domain (TEXT)
├── created_by (UUID, FK to profiles)
├── partner_id (UUID, FK to profiles) [NEW]
└── ...

analysis_runs (enhanced)
├── id (UUID, PK)
├── client_id (UUID, FK to clients)
├── created_by (UUID, FK to profiles)
├── partner_id (UUID, FK to profiles) [NEW]
└── ...
```

### API Endpoint Changes
```
GET /api/clients
- Before: Returns all clients (for super_admin)
- After: Returns partner's clients (for partner role)

POST /api/clients
- Before: Creates client with created_by = user_id
- After: Creates client with partner_id = user_id (if partner)

GET /api/analysis-runs
- Before: Returns all analysis runs (for super_admin)
- After: Returns partner's analysis runs (for partner role)
```

This document serves as the comprehensive guide for implementing partner access functionality. Each section should be reviewed and approved before implementation begins.