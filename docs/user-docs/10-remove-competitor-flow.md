# Remove Competitor Flow

## Overview
This document describes how users remove competitors from a client profile in the Citebots application.

## Pre-requisites
- User must be logged in
- User must own the client
- Client must have at least one competitor
- User is on client edit page

## User Journey
1. User navigates to client edit page
2. User sees list of competitors
3. User clicks "Remove" or "X" button next to competitor
4. Confirmation may appear
5. Competitor is removed from list

## Expected Behavior

### Visual Flow
1. Competitors list shows:
   - Each competitor with name and domain
   - Remove button/icon for each

2. On remove click:
   - Optional confirmation dialog
   - Or immediate removal with undo option

3. During removal:
   - Brief loading state
   - Item may fade out

4. After removal:
   - Success message (brief)
   - Competitor removed from list
   - List updates immediately

5. On error:
   - Error message
   - Competitor remains in list

## Database Changes in Supabase

### Competitors Table
Record deleted:
```sql
DELETE FROM competitors 
WHERE id = 'competitor-uuid' 
  AND client_id IN (
    SELECT id FROM clients 
    WHERE (created_by = auth.uid() OR user_id = auth.uid())
  )
```

### Cascade Effects
Any analysis data referencing this competitor:
```sql
-- May need to update analysis results
UPDATE page_analyses 
SET competitor_data = 
  jsonb_set(competitor_data, 
    '{competitors}', 
    (competitor_data->'competitors') - 'competitor-uuid'
  )
WHERE 'competitor-uuid' = ANY(competitor_ids)
```

## Test Scenarios

### Normal Removal
1. Click remove on competitor
2. Confirm if dialog appears
3. Expected: Competitor removed

### Last Competitor
1. Remove all competitors
2. Expected: Empty state message

### Quick Succession
1. Remove multiple competitors quickly
2. Expected: All removed correctly

### Error Handling
1. Simulate network error
2. Expected: Error message, competitor remains

## Technical Details
- Hard delete (no soft delete)
- May affect historical analysis data
- Consider confirmation for destructive action
- Real-time UI update
- No cascade to analysis results (data preserved)