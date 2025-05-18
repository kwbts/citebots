# Login Flow

## Overview
This document describes the user login flow for existing users in the Citebots application.

## Pre-requisites
- User must have an existing account in the system
- User must know their email and password

## User Journey
1. Navigate to https://citebots.com or the Netlify URL
2. User is presented with the login page
3. User enters their email address
4. User enters their password
5. User clicks the "Sign In" button
6. System authenticates the user
7. User is redirected to the dashboard

## Expected Behavior

### Visual Flow
1. Login page displays with:
   - Email input field
   - Password input field
   - "Sign In" button
   - "Request Access" tab option

2. During authentication:
   - Loading spinner appears
   - Button becomes disabled

3. On successful login:
   - User sees the dashboard with navigation cards:
     - Clients
     - Analysis
     - Reports
   - Top navigation bar shows with user menu

4. On failed login:
   - Error message appears
   - Form remains visible
   - User can retry

## Database Changes in Supabase

### Authentication
- Check `auth.users` table:
  - User's `last_sign_in_at` timestamp is updated
  - `updated_at` timestamp is refreshed

### Session Management
- New session created in auth system
- JWT token generated with user claims

### Profile Access
- User's profile becomes accessible from `profiles` table
- RLS policies allow access to user's own data

## Test Scenarios

### Success Path
- Email: jon@knowbots.ca
- Password: [generated password]
- Expected: Redirect to /dashboard

### Error Scenarios
1. Invalid email format
   - Expected: "Invalid email format" error

2. Wrong password
   - Expected: "Invalid login credentials" error

3. Non-existent user
   - Expected: "Invalid login credentials" error

## Technical Details
- Authentication handled by Supabase Auth
- Session stored in browser localStorage
- Middleware checks authentication state
- Protected routes redirect to login if unauthenticated