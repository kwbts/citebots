# Request Access Flow

## Overview
This document describes the flow for new users requesting access to the Citebots application.

## Pre-requisites
- User does not have an existing account
- User has a valid email address

## User Journey
1. Navigate to https://citebots.com
2. Click on "Request Access" tab on the login page
3. Fill out the request form
4. Submit the form
5. Receive access credentials (if auto-approved)

## Expected Behavior

### Visual Flow
1. Request Access form displays with:
   - Email input field
   - First Name input field
   - Last Name input field
   - Company input field
   - "Request Access" button

2. During submission:
   - Loading spinner appears
   - Button becomes disabled

3. On successful submission:
   - For jon@knowbots.ca (auto-approved):
     - Success message with generated password
     - Link to sign in
   - For other emails:
     - "Request submitted" message
     - "Admin will review" notice

4. On error:
   - Error message appears
   - Form remains visible

## Database Changes in Supabase

### Access Requests Table
New record created in `access_requests`:
```sql
{
  id: UUID,
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  company: "Acme Corp",
  status: "pending", // or "approved" for jon@knowbots.ca
  generated_password: "xxxxx", // only for auto-approved
  created_at: timestamp,
  approved_at: null // or timestamp for auto-approved
}
```

### For Auto-Approved Users (jon@knowbots.ca)
Additional changes:

1. Auth User Created:
```sql
auth.users {
  id: UUID,
  email: "jon@knowbots.ca",
  created_at: timestamp
}
```

2. Profile Created:
```sql
profiles {
  id: UUID (same as auth.users.id),
  email: "jon@knowbots.ca",
  first_name: "Jon",
  last_name: "Taylor",
  company: "Knowbots",
  role: "super_admin",
  is_active: true,
  created_at: timestamp
}
```

## Test Scenarios

### Auto-Approval Path
- Email: jon@knowbots.ca
- Expected: 
  - Immediate approval
  - Password displayed
  - Profile created
  - Can login immediately

### Regular Request Path
- Email: test@example.com
- Expected:
  - Request pending
  - No password shown
  - Waiting for admin approval

### Error Scenarios
1. Duplicate email
   - Expected: "Email already registered" error

2. Missing required fields
   - Expected: Field validation errors

## Technical Details
- Netlify Function handles provisioning
- Password generation: 16 characters
- Auto-provision only for specific emails
- Service role key required for user creation