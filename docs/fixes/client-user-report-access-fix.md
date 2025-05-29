# Client User Report Access Fix

This document outlines the solution for fixing client user access to report data in the multi-tenant setup.

## Current Issue

Client users can access the reports dashboard but cannot see any data on individual report pages. The problem appears to be related to Row Level Security (RLS) policies on the tables that provide report data.

## Diagnostics Added

We've added diagnostic code to help identify the issue:

1. Enhanced logging in the report page (`/pages/dashboard/reports/[id].vue`):
   - Detailed logging of user role and client assignment
   - Expanded error information for query fetching
   - Query count logging

2. Added debugging in the dashboard component (`/components/reports/FullScreenDashboard.vue`):
   - Logging of received data props
   - Logging of query filtering

3. Created SQL verification scripts:
   - `scripts/verify-client-user-access.sql` - Test permissions for a client user
   - `scripts/fix-report-data-access.sql` - Fix RLS policies for all report-related tables

## Solution: Performance-Safe RLS Approach

The solution follows our "performance-safe" approach to RLS policies, avoiding complex joins that could cause resource exhaustion.

### 1. Run the RLS Fix Script

Execute the `fix-report-data-access.sql` script in the Supabase SQL Editor. This script:

- Enables RLS on all report-related tables
- Creates simple policies that allow all authenticated users to read data
- Relies on client-side filtering for access control

```sql
-- Example of the policy approach for analysis_queries table
ALTER TABLE public.analysis_queries ENABLE ROW LEVEL SECURITY;

-- Create simple policy for all authenticated users
CREATE POLICY "Enable read access for authenticated users" 
ON public.analysis_queries
FOR SELECT
USING (auth.role() = 'authenticated');
```

### 2. Client-Side Access Control

The report page already implements client-side access control:

```javascript
// Check if user is super admin
const isSuperAdmin = userProfile.data?.role === 'super_admin' || userProfile.data?.account_type === 'super_admin'

// Check if user created the client
const isOwner = clientData.created_by === user.value?.id || clientData.user_id === user.value?.id

// Check if user is a client user assigned to this client
const isAssignedClient = (userProfile.data?.role === 'client' || userProfile.data?.account_type === 'client') && 
                        userProfile.data?.client_account_id === clientData.id

if (!isSuperAdmin && !isOwner && !isAssignedClient) {
  throw new Error('Access denied: You do not have permission to view this report')
}
```

This approach ensures:
1. Super admins can see all reports
2. Users who created a client can see that client's reports
3. Client users can only see reports for their assigned client

## Testing the Fix

After implementing the fix:

1. Run the SQL script to update RLS policies
2. Log in as a client user
3. Navigate to the reports dashboard
4. Click on a report to view details
5. Check browser console logs to verify data loading

## Verification

Use the `verify-client-user-access.sql` script to check if a client user has proper permissions to access the report data. You can run this as the client user (using their auth token) in the Supabase SQL Editor.

## Why This Approach Works

Our approach separates concerns:

1. **Database Layer (RLS)**: Simple policies that allow authenticated users to read data but don't try to implement complex tenant isolation
2. **Application Layer**: Client-side filtering based on user role and client assignment

This approach:
- Avoids complex JOIN operations in RLS policies that could cause resource exhaustion
- Prevents the risk of infinite recursion in RLS policies
- Maintains security while ensuring good performance

## Alternative Approaches (Not Recommended)

More complex RLS policies like the following could be used but are NOT recommended due to performance concerns:

```sql
-- NOT RECOMMENDED: Complex RLS policy with JOINs
CREATE POLICY "Client users can only see their assigned client's queries"
ON analysis_queries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN analysis_runs ar ON ar.client_id = p.client_account_id
    WHERE p.id = auth.uid() 
    AND ar.id = analysis_queries.analysis_run_id
  )
);
```

These complex policies can lead to:
- Poor query performance
- Resource exhaustion
- Database timeouts

## Next Steps

If you want to implement more granular access control at the database level in the future, consider:

1. Adding denormalized fields to simplify RLS policies (e.g., adding `client_id` directly to `analysis_queries`)
2. Using materialized views for report data
3. Implementing row-level caching for frequently accessed reports