# Create Client Flow

## Overview
This document describes how users create new client profiles in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have permission to create clients
- User navigates to /dashboard/clients page

## User Journey
1. User clicks on "Clients" card in dashboard
2. User clicks "Create New Client" button
3. User fills out the client form
4. User clicks "Save Client" button
5. System creates the client and redirects to client list

## Expected Behavior

### Visual Flow
1. Client form displays with:
   - Client name input field (required)
   - Domain input field (required)
   - Keywords textarea (optional)
   - Description textarea (optional)
   - "Enhance with AI" button
   - "Save Client" button
   - "Cancel" button

2. During creation:
   - Loading spinner appears
   - Buttons become disabled

3. On successful creation:
   - Success message appears
   - Redirect to client list
   - New client appears in list

4. On error:
   - Error message appears
   - Form remains visible
   - User can fix and retry

## Database Changes in Supabase

### Clients Table
New record created:
```sql
INSERT INTO clients {
  id: UUID (auto-generated),
  created_by: auth.uid(),
  user_id: auth.uid(),
  name: "Example Corp",
  domain: "example.com",
  keywords: ["keyword1", "keyword2"],
  description: "Client description",
  is_active: true,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Audit Trail
Activity logged in system (if audit table exists):
```sql
{
  action: "create_client",
  user_id: auth.uid(),
  entity_type: "client",
  entity_id: "client-uuid",
  timestamp: current_timestamp
}
```

## Test Scenarios

### Success Path
1. Fill all required fields
2. Click Save Client
3. Expected: Client created, redirect to list

### AI Enhancement
1. Fill name and domain
2. Click "Enhance with AI"
3. Expected: AI generates description and keywords
4. Review and save

### Validation Errors
1. Leave name empty
   - Expected: "Name is required" error

2. Leave domain empty
   - Expected: "Domain is required" error

3. Invalid domain format
   - Expected: "Invalid domain format" error

### Duplicate Domain
1. Try to create client with existing domain
2. Expected: "Domain already exists" error

## Technical Details
- Form validation before submission
- Domain format validation (no http://)
- Keywords stored as array
- Created_by and user_id both set to current user
- RLS policies ensure user can only see their own clients