# User Data Model

## Overview

The user system supports multiple account types with role-based access control. The Super Admin (jon@knowbots.ca) has full system access.

## Database Schema

### users table (extends Supabase auth.users)
```sql
-- This extends the built-in Supabase auth.users table
-- We'll create a profiles table for additional user data
```

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'jon@knowbots.ca' AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'jon@knowbots.ca' AND role = 'super_admin'
    )
  );
```

### access_requests table
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  generated_password TEXT,
  UNIQUE(email)
);

-- Add RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Only super admin can view/manage access requests
CREATE POLICY "Super admin can manage access requests" ON access_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'jon@knowbots.ca' AND role = 'super_admin'
    )
  );
```

## User Roles

1. **super_admin**: Full system access (only jon@knowbots.ca)
2. **partner**: Can manage their clients
3. **client**: Can view their own data
4. **analyst**: Internal team member

## Password Generation

For auto-provisioned accounts, we generate a 16-character password with:
- Uppercase letters
- Lowercase letters
- Numbers
- Special characters

## Access Request Flow

1. User submits request via form
2. If email matches jon@knowbots.ca:
   - Auto-approve
   - Generate password
   - Create auth user
   - Create profile with super_admin role
3. For other users:
   - Store in access_requests table
   - Wait for super admin approval

## Security Considerations

- Only super_admin can provision new accounts
- All passwords are generated securely
- Email verification required for all accounts
- RLS policies restrict data access