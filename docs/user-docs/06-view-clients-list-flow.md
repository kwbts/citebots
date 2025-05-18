# View Clients List Flow

## Overview
This document describes how users view their list of clients in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have permission to view clients

## User Journey
1. User clicks on "Clients" card in dashboard
2. System loads the clients list page
3. User sees all their clients displayed
4. User can search/filter clients
5. User can click on a client to view details

## Expected Behavior

### Visual Flow
1. Clients page displays:
   - Page title: "Clients"
   - "Create New Client" button
   - Search/filter bar
   - List of client cards showing:
     - Client name
     - Domain
     - Keywords count
     - Competitors count
     - Created date
     - Action buttons (View, Edit, Delete)

2. Loading state:
   - Spinner while fetching clients

3. Empty state:
   - "No clients yet" message
   - Prominent "Create New Client" button

4. Error state:
   - Error message if fetch fails
   - Retry button

## Database Queries in Supabase

### Clients Fetch
Main query executed:
```sql
SELECT * FROM clients 
WHERE created_by = auth.uid() 
   OR user_id = auth.uid()
ORDER BY created_at DESC
```

### Data Retrieved
```json
[
  {
    "id": "client-uuid-1",
    "name": "Example Corp",
    "domain": "example.com",
    "keywords": ["seo", "marketing"],
    "description": "Client description",
    "created_at": "2024-01-01T00:00:00Z",
    "competitors": [] // Loaded separately
  },
  // ... more clients
]
```

### Competitors Count
For each client, separate query:
```sql
SELECT COUNT(*) FROM competitors 
WHERE client_id = 'client-uuid'
```

## Test Scenarios

### Normal View
1. Login as user with clients
2. Navigate to /dashboard/clients
3. Expected: See all owned clients

### Empty State
1. Login as new user
2. Navigate to /dashboard/clients
3. Expected: Empty state message

### Search/Filter
1. Enter search term in search bar
2. Expected: List filters in real-time
3. Matches on name or domain

### Pagination (if implemented)
1. User with many clients
2. Expected: Pagination controls
3. 10-20 clients per page

## Technical Details
- RLS policies filter clients by user ownership
- Competitors loaded separately (not in main query)
- Real-time search on client-side
- Sorting by creation date (newest first)
- No real-time subscriptions (manual refresh)