# Logout Flow

## Overview
This document describes the user logout flow in the Citebots application.

## Pre-requisites
- User must be logged in
- User must be on any authenticated page

## User Journey
1. User clicks on their user menu in the top navigation
2. User selects "Sign Out" option
3. System logs out the user
4. User is redirected to login page

## Expected Behavior

### Visual Flow
1. User menu options display:
   - User email/name
   - "Sign Out" option

2. After clicking "Sign Out":
   - Brief loading state
   - Redirect to login page

3. On login page:
   - Login form displayed
   - No error messages
   - User must login again to access dashboard

## Database Changes in Supabase

### Session Management
- User's active session is terminated
- JWT token is invalidated
- No direct database changes

### Auth State
- Client-side auth state cleared
- LocalStorage tokens removed
- Cookies cleared (if any)

## Test Scenarios

### Normal Logout
1. Login as any user
2. Click Sign Out
3. Expected: Redirect to login page

### Protected Route Access After Logout
1. Logout from dashboard
2. Try to navigate to /dashboard
3. Expected: Redirect to login page

### Browser Back Button
1. Logout from dashboard
2. Click browser back button
3. Expected: Still redirected to login

## Technical Details
- Supabase auth.signOut() called
- Middleware detects no session
- Protected routes become inaccessible
- Client state reset