# View Profile Flow

## Overview
This document describes how users view their profile information in the Citebots application.

## Pre-requisites
- User must be logged in
- User must have a profile in the system

## User Journey
1. User navigates to dashboard
2. User clicks on their user menu or profile link
3. User is taken to /dashboard/user page
4. User views their profile information

## Expected Behavior

### Visual Flow
1. Profile page displays:
   - Page title: "User Profile"
   - Profile card with user information:
     - Email address
     - First name
     - Last name
     - Company
     - Role badge
     - Account status

2. Loading state:
   - Brief spinner while fetching profile

3. Error state (rare):
   - Error message if profile fetch fails

## Database Queries in Supabase

### Profile Fetch
Query executed:
```sql
SELECT * FROM profiles 
WHERE id = auth.uid()
```

### Data Retrieved
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "company": "Acme Corp",
  "role": "super_admin",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Test Scenarios

### Normal View
1. Login as any user
2. Navigate to /dashboard/user
3. Expected: See complete profile info

### Role Display
- super_admin: Shows "Super Admin" badge
- partner: Shows "Partner" badge
- client: Shows "Client" badge
- analyst: Shows "Analyst" badge

### Active Status
- is_active: true - Shows "Active" status
- is_active: false - Shows "Inactive" status

## Technical Details
- RLS policies ensure users can only see their own profile
- Profile fetched using authenticated Supabase client
- No write operations on this page
- Real-time subscriptions not used (static view)