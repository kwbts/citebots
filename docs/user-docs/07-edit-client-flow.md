# Edit Client Flow

## Overview
This document describes how users edit existing client profiles in the Citebots application.

## Pre-requisites
- User must be logged in
- User must own the client or have permission to edit
- Client must exist in the system

## User Journey
1. User navigates to clients list
2. User clicks "Edit" button on a client
3. User is taken to edit form with pre-filled data
4. User modifies client information
5. User clicks "Update Client" button
6. System saves changes and shows confirmation

## Expected Behavior

### Visual Flow
1. Edit form displays with:
   - Pre-filled client name
   - Pre-filled domain
   - Pre-filled keywords
   - Pre-filled description
   - "Enhance with AI" button
   - "Update Client" button
   - "Cancel" button

2. During update:
   - Loading spinner appears
   - Buttons become disabled

3. On successful update:
   - Success message appears
   - User stays on edit page or redirects to list
   - Changes reflected immediately

4. On error:
   - Error message appears
   - Form remains editable
   - Original values preserved

## Database Changes in Supabase

### Clients Table Update
```sql
UPDATE clients SET
  name = "Updated Corp",
  domain = "updated.com",
  keywords = ["new", "keywords"],
  description = "Updated description",
  updated_at = current_timestamp
WHERE id = 'client-uuid' 
  AND (created_by = auth.uid() OR user_id = auth.uid())
```

### Audit Trail
Activity logged:
```sql
{
  action: "update_client",
  user_id: auth.uid(),
  entity_type: "client",
  entity_id: "client-uuid",
  changes: {
    name: { old: "Old Corp", new: "Updated Corp" },
    domain: { old: "old.com", new: "updated.com" }
  },
  timestamp: current_timestamp
}
```

## Test Scenarios

### Normal Edit
1. Change client name
2. Add keywords
3. Update description
4. Click Update
5. Expected: All changes saved

### Domain Validation
1. Try to change to invalid domain
2. Expected: "Invalid domain format" error

### Concurrent Edit Protection
1. User A loads edit form
2. User B updates same client
3. User A tries to save
4. Expected: Conflict warning or merge

### AI Enhancement
1. Clear description
2. Click "Enhance with AI"
3. Expected: AI generates new content
4. Review and save

## Technical Details
- Optimistic locking may be implemented
- Domain uniqueness checked
- Keywords array properly merged
- Updated_at timestamp automatic
- RLS ensures only owner can edit