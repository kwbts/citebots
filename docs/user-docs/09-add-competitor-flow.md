# Add Competitor Flow

## Overview
This document describes how users add competitors to a client profile in the Citebots application.

## Pre-requisites
- User must be logged in
- User must own the client
- Client must exist in the system
- User is on client edit page

## User Journey
1. User navigates to client edit page
2. User scrolls to "Competitors" section
3. User clicks "Add Competitor" button
4. User fills out competitor form
5. User clicks "Save Competitor"
6. Competitor added to client

## Expected Behavior

### Visual Flow
1. Competitors section shows:
   - List of existing competitors
   - "Add Competitor" button

2. Add competitor form displays:
   - Name input field (required)
   - Domain input field (required)
   - "Save" button
   - "Cancel" button

3. During save:
   - Loading state
   - Buttons disabled

4. On successful add:
   - Success message
   - Competitor appears in list
   - Form clears or closes

5. On error:
   - Error message
   - Form remains open
   - User can fix and retry

## Database Changes in Supabase

### Competitors Table
New record created:
```sql
INSERT INTO competitors {
  id: UUID (auto-generated),
  client_id: 'client-uuid',
  name: "Competitor Corp",
  domain: "competitor.com",
  created_at: timestamp,
  updated_at: timestamp
}
```

### Validation
Before insert, check:
```sql
-- Ensure client belongs to user
SELECT id FROM clients 
WHERE id = 'client-uuid' 
  AND (created_by = auth.uid() OR user_id = auth.uid())

-- Check for duplicate domain
SELECT id FROM competitors 
WHERE client_id = 'client-uuid' 
  AND domain = 'competitor.com'
```

## Test Scenarios

### Normal Add
1. Fill in name and domain
2. Click Save
3. Expected: Competitor added to list

### Duplicate Domain
1. Try to add existing competitor domain
2. Expected: "Domain already exists" error

### Domain Validation
1. Enter invalid domain format
2. Expected: "Invalid domain format" error

### Multiple Competitors
1. Add first competitor
2. Add second competitor
3. Expected: Both appear in list

### Empty Fields
1. Leave name empty
2. Expected: "Name is required" error

## Technical Details
- Domain uniqueness per client
- Domain format validation (no http://)
- Real-time list update
- No limit on competitors per client
- Competitors linked via client_id foreign key