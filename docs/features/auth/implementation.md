# Authentication Implementation

## Overview

The Authentication system for Citebots is built on Supabase Auth, providing secure access control with role-based permissions. This document outlines the implementation details of this feature.

## Architecture

### Components

1. **Auth Service**
   - Manages user authentication flows
   - Handles session management
   - Implements role-based access control

2. **User Management**
   - User creation and invitation
   - Profile management
   - Password reset functionality

3. **Permission System**
   - Role definition and assignment
   - Resource-level permissions
   - Access control enforcement

4. **Session Management**
   - JWT token handling
   - Session persistence
   - Automatic token refresh

## Implementation Details

### Authentication Flow

```javascript
// Simplified authentication logic
async function login(email, password) {
  try {
    const { user, session, error } = await supabase.auth.signIn({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Store session in local storage
    localStorage.setItem('supabase.auth.token', session.access_token);
    
    return { user, session };
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw error;
  }
}
```

### User Roles

The system implements the following roles:

- **Admin**: Full system access (Knowbots staff only)
  - Can create partner accounts
  - Access to all data and features
  - Super admin privileges
- **Partner**: Agency/partner access
  - Can provision client accounts
  - Manage multiple clients
  - View all their clients' data
  - Created only by Admin
- **Analyst**: Access to analysis features and client data
  - Internal team members
  - Can run analyses and generate reports
- **Client**: Limited access to specific client reports
  - View-only access to their own data
  - Cannot provision other accounts
  - Created by Admin or Partner
- **Guest**: View-only access to shared reports
  - Temporary access via share links

### Role Assignment

```javascript
// Simplified role assignment logic
async function assignUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId,
        role: role,
        updated_at: new Date()
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error assigning role:', error.message);
    throw error;
  }
}
```

### Permission Checks

```javascript
// Simplified permission check logic
function checkPermission(user, resource, action) {
  // Get user role
  const userRole = user.role || 'guest';
  
  // Permission matrix
  const permissions = {
    admin: ['*:*'],
    partner: [
      'clients:*:own',
      'reports:*:own',
      'users:create:client',
      'users:read:own_clients',
      'analyses:*:own_clients'
    ],
    analyst: ['clients:read', 'analyses:*', 'reports:read'],
    client: [`clients:read:${user.client_id}`, `reports:read:${user.client_id}`],
    guest: ['reports:read:shared']
  };
  
  // Check if role has permission
  const rolePermissions = permissions[userRole] || [];
  
  // Format of permission: resource:action:id
  const requiredPermission = `${resource}:${action}`;
  
  return rolePermissions.some(permission => {
    // Handle wildcard permissions
    if (permission === '*:*') return true;
    
    const [permResource, permAction, permId] = permission.split(':');
    
    // Handle resource-level wildcards
    if (permResource === resource && permAction === '*') return true;
    
    // Handle exact permission match
    return permission.startsWith(requiredPermission);
  });
}
```

## Database Schema

### Tables

- `users`: Core user information (managed by Supabase Auth)
- `user_profiles`: Extended user profile information
- `user_roles`: User role assignments

### Key Relationships

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration (admin only)
- `POST /api/auth/logout`: User logout
- `POST /api/auth/reset-password`: Password reset request
- `POST /api/auth/update-password`: Update password

### User Management

- `GET /api/users`: List users (admin only)
- `GET /api/users/{id}`: Get user details
- `PUT /api/users/{id}`: Update user
- `DELETE /api/users/{id}`: Delete user (admin only)
- `POST /api/users/{id}/roles`: Assign role to user

## Security Considerations

- Passwords stored as secure hashes (managed by Supabase)
- JWT tokens with short expiration times
- HTTPS-only cookie storage for tokens
- Row-level security policies in database
- Rate limiting on authentication endpoints

## User Invitation Flow

1. Admin creates user account with temporary password
2. System sends invitation email with password reset link
3. User sets permanent password
4. User completes profile information
5. Admin assigns appropriate role

## Validation Status

As outlined in the [First Validation Milestone](../../validation/first-milestone.md), the Authentication system has been validated for:

- User login via Supabase authentication
- Basic role-based access control
- Session management