# Delete Client Flow

## Overview
This document describes how users delete client profiles in the Citebots application.

## Pre-requisites
- User must be logged in
- User must own the client
- Client must exist in the system

## User Journey
1. User navigates to clients list
2. User clicks "Delete" button on a client
3. Confirmation dialog appears
4. User confirms deletion
5. System deletes client and all related data
6. Client removed from list

## Expected Behavior

### Visual Flow
1. Delete confirmation dialog shows:
   - Warning message
   - Client name being deleted
   - List of data that will be removed
   - "Confirm Delete" button (red)
   - "Cancel" button

2. During deletion:
   - Loading spinner appears
   - Dialog buttons disabled

3. On successful deletion:
   - Success message appears
   - Dialog closes
   - Client removed from list
   - List updates immediately

4. On error:
   - Error message appears
   - Client remains in list
   - User can retry

## Database Changes in Supabase

### Cascade Deletions
When a client is deleted, all related data is removed:

1. Client Record:
```sql
DELETE FROM clients 
WHERE id = 'client-uuid' 
  AND (created_by = auth.uid() OR user_id = auth.uid())
```

2. Competitors (cascade):
```sql
DELETE FROM competitors 
WHERE client_id = 'client-uuid'
```

3. Analysis Runs (cascade):
```sql
DELETE FROM analysis_runs 
WHERE client_id = 'client-uuid'
```

4. Page Analyses (cascade):
```sql
DELETE FROM page_analyses 
WHERE client_id = 'client-uuid'
```

### Audit Trail
Deletion logged:
```sql
{
  action: "delete_client",
  user_id: auth.uid(),
  entity_type: "client",
  entity_id: "client-uuid",
  metadata: {
    client_name: "Deleted Corp",
    competitors_count: 5,
    analyses_count: 10
  },
  timestamp: current_timestamp
}
```

## Test Scenarios

### Normal Deletion
1. Click delete on client
2. Confirm in dialog
3. Expected: Client and all data removed

### Cancel Deletion
1. Click delete on client
2. Click cancel in dialog
3. Expected: No changes, client remains

### Deletion with Dependencies
1. Delete client with competitors
2. Delete client with analyses
3. Expected: All related data removed

### Permission Check
1. Try to delete another user's client
2. Expected: Permission denied error

## Technical Details
- Soft delete not implemented (hard delete)
- CASCADE rules in database handle related data
- Transaction ensures atomic deletion
- No undo functionality
- RLS policies prevent unauthorized deletion