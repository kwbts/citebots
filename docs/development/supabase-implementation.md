# Supabase Implementation Guide for Citebots

This document provides a detailed guide for implementing Supabase as the backend for the Citebots GEO Analytics application, based on the requirements and development plan.

## Table of Contents

1. [Overview](#overview)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [Edge Functions](#edge-functions)
6. [Realtime Features](#realtime-features)
7. [Storage Configuration](#storage-configuration)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Validation Steps](#validation-steps)

## Overview

Supabase will serve as the core backend infrastructure for Citebots, providing:

- User authentication and authorization
- Database for storing client data, analysis results, and recommendations
- Edge functions for executing LLM queries and processing responses
- Realtime features for progress tracking and notifications
- Storage for reports and exported data

## Supabase Setup

### Initial Project Configuration

1. Create a new Supabase project:
   - Visit [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project with a name like "citebots-prod" (and "citebots-dev" for development)
   - Select the region closest to your target users
   - Set a secure database password

2. Environment Configuration:
   - Create `.env` file with Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Supabase Client Setup in your application:
   ```javascript
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_ANON_KEY
   )
   ```

## Database Schema

### Core Tables

```sql
-- Authentication and User Profiles
CREATE TYPE user_role AS ENUM ('admin', 'partner', 'client');

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'client',
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, client_id)
);

-- Client Profiles
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  primary_domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Domains
CREATE TABLE competitor_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_profile_id UUID REFERENCES client_profiles(id) NOT NULL,
  domain TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords and Queries
CREATE TABLE keyword_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_profile_id UUID REFERENCES client_profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_list_id UUID REFERENCES keyword_lists(id) NOT NULL,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  priority INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Runs
CREATE TYPE analysis_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE analysis_type AS ENUM ('brand', 'product', 'content', 'custom');

CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_profile_id UUID REFERENCES client_profiles(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  analysis_type analysis_type NOT NULL,
  status analysis_status NOT NULL DEFAULT 'pending',
  progress NUMERIC DEFAULT 0,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM Queries and Results
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES analysis_runs(id) NOT NULL,
  keyword_id UUID REFERENCES keywords(id),
  query_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE llm_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  api_endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE query_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID REFERENCES queries(id) NOT NULL,
  llm_service_id UUID REFERENCES llm_services(id) NOT NULL,
  raw_response TEXT NOT NULL,
  processed_response JSONB,
  execution_time NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(query_id, llm_service_id)
);

-- Citations
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_result_id UUID REFERENCES query_results(id) NOT NULL,
  domain TEXT NOT NULL,
  url TEXT,
  context TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES analysis_runs(id) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recommendation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID REFERENCES recommendations(id) NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Reports
CREATE TABLE shared_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES analysis_runs(id) NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Authentication & Authorization

### User Roles and Access Control

1. Set up three user roles with Row Level Security (RLS):

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;

-- Admin Policy (can access everything)
CREATE POLICY admin_all_access ON profiles
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Partner can see their own profile and their clients
CREATE POLICY partner_profile_access ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR 
    auth.uid() IN (
      SELECT partner_id FROM relationships WHERE client_id = id
    ) OR
    role = 'admin'
  );

-- Client can only see their own profile
CREATE POLICY client_profile_access ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Similar policies for other tables...
```

2. Create Auth Hooks in your application:

```javascript
// Check if user is admin
const isAdmin = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', supabase.auth.user().id)
    .single();
  
  if (error) return false;
  return data.role === 'admin';
};

// Get accessible clients for a partner
const getAccessibleClients = async () => {
  const { data, error } = await supabase
    .from('relationships')
    .select(`
      client_id,
      clients:profiles!client_id(id, name, email, company)
    `)
    .eq('partner_id', supabase.auth.user().id);
  
  if (error) return [];
  return data.map(item => item.clients);
};
```

### Supabase Auth UI Integration

1. Implement Auth UI with Supabase:

```javascript
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const AuthComponent = () => (
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    providers={[]}
  />
);
```

2. Custom Sign-up Flow for Invited Users:

```javascript
// Generate invite link for new client/partner
const generateInvite = async (email, role, partnerID = null) => {
  // Create a custom token or use Supabase's magic link
  const { data, error } = await supabase.auth.api.inviteUserByEmail(email);
  
  if (error) return { error };
  
  // Store role information for when they sign up
  await supabase.from('pending_invites').insert({
    email,
    role,
    partner_id: partnerID,
    invite_token: data.invite_token
  });
  
  return { data };
};
```

## Edge Functions

Edge functions will handle:
1. LLM API calls
2. Response processing
3. Citation extraction
4. Recommendation generation

Example edge function for query execution:

```javascript
// supabase/functions/execute-query/index.js
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

export const handler = async (req, res) => {
  // Initialize Supabase client with service role key
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { queryId, llmServiceId } = req.body;
  
  // Get query details
  const { data: query, error: queryError } = await supabaseAdmin
    .from('queries')
    .select('*')
    .eq('id', queryId)
    .single();
    
  if (queryError) return { error: queryError.message };
  
  // Get LLM service details
  const { data: llmService, error: llmError } = await supabaseAdmin
    .from('llm_services')
    .select('*')
    .eq('id', llmServiceId)
    .single();
    
  if (llmError) return { error: llmError.message };
  
  // Execute query based on LLM service type
  let response;
  try {
    if (llmService.name === 'openai') {
      const openai = new OpenAIApi(new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      }));
      
      const startTime = Date.now();
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: query.query_text }],
      });
      const executionTime = (Date.now() - startTime) / 1000;
      
      response = {
        raw_response: completion.data.choices[0].message.content,
        execution_time: executionTime
      };
    }
    // Add other LLM services...
    
    // Process response to extract citations
    const citations = extractCitations(response.raw_response);
    
    // Store result
    const { data: resultData, error: resultError } = await supabaseAdmin
      .from('query_results')
      .insert({
        query_id: queryId,
        llm_service_id: llmServiceId,
        raw_response: response.raw_response,
        processed_response: { citations },
        execution_time: response.execution_time
      })
      .select('id')
      .single();
      
    if (resultError) return { error: resultError.message };
    
    // Store citations
    if (citations.length > 0) {
      const citationRecords = citations.map((citation, index) => ({
        query_result_id: resultData.id,
        domain: citation.domain,
        url: citation.url,
        context: citation.context,
        position: index + 1
      }));
      
      await supabaseAdmin.from('citations').insert(citationRecords);
    }
    
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Helper function to extract citations from text
function extractCitations(text) {
  // Implement citation extraction logic
  // This would use regex or NLP to identify URLs and domains in the text
  const citations = [];
  // Implementation...
  return citations;
}
```

## Realtime Features

Enable realtime updates for analysis progress tracking:

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE analysis_runs;
```

Client-side subscription:

```javascript
// Subscribe to analysis run updates
const subscribeToAnalysisRun = (analysisRunId, callback) => {
  const subscription = supabase
    .from(`analysis_runs:id=eq.${analysisRunId}`)
    .on('UPDATE', payload => {
      callback(payload.new);
    })
    .subscribe();
    
  return subscription;
};

// Usage
const unsubscribe = subscribeToAnalysisRun(analysisId, (updatedRun) => {
  console.log(`Progress: ${updatedRun.progress}%`);
  if (updatedRun.status === 'completed') {
    console.log('Analysis completed!');
  }
});

// Later, unsubscribe
unsubscribe();
```

## Storage Configuration

Set up storage buckets for reports and exports:

```javascript
// Create buckets
const setupStorage = async () => {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  await supabaseAdmin.storage.createBucket('reports', {
    public: false,
    allowedMimeTypes: ['application/pdf', 'text/csv'],
    fileSizeLimit: 10485760 // 10MB
  });
};

// Generate and store a report
const generateReport = async (analysisRunId) => {
  // Generate PDF/CSV report
  const reportBuffer = await createReportPDF(analysisRunId);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(`report-${analysisRunId}.pdf`, reportBuffer, {
      contentType: 'application/pdf'
    });
    
  if (error) throw error;
  
  // Create signed URL for access
  const { signedURL } = await supabase.storage
    .from('reports')
    .createSignedUrl(`report-${analysisRunId}.pdf`, 60 * 60 * 24 * 7); // 7 days
    
  return signedURL;
};
```

## Implementation Roadmap

### Phase 1: Core Infrastructure

1. Set up Supabase project
2. Create database schema
3. Configure authentication
4. Implement basic RLS policies
5. Test connection from frontend

### Phase 2: User Management

1. Implement admin dashboard for user management
2. Create invite system for partners and clients
3. Set up relationship management
4. Test access controls

### Phase 3: Analysis Engine

1. Create Edge Functions for LLM integration
2. Implement query execution and progress tracking
3. Set up storage for results
4. Test complete analysis flow

### Phase 4: Dashboard & Reporting

1. Implement dashboard views based on user role
2. Create report generation functionality
3. Enable view-only link sharing
4. Integrate AI recommendations

### Phase 5: Advanced Features

1. Partner management portal
2. AI recommendation system
3. Enhanced security features
4. Performance optimizations

## Validation Steps

### Supabase Authentication

1. Set up Auth UI in the application
2. Test login/logout functionality
3. Test role-based access control
4. Verify invitation system

```javascript
// Test authentication
const testAuth = async () => {
  const { user, session, error } = await supabase.auth.signIn({
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (error) {
    console.error('Authentication failed:', error.message);
    return false;
  }
  
  console.log('Authentication successful:', user);
  return true;
};
```

### Edge Function Execution

1. Create a simple "hello world" edge function
2. Deploy and test the function
3. Verify it can be called from the frontend

```javascript
// Test edge function
const testEdgeFunction = async () => {
  const { data, error } = await supabase.functions.invoke('hello-world', {
    body: { name: 'Citebots' }
  });
  
  if (error) {
    console.error('Function invocation failed:', error.message);
    return false;
  }
  
  console.log('Function response:', data);
  return true;
};
```

### Database Operations

1. Test inserting data
2. Test reading data with RLS policies
3. Verify realtime subscriptions

```javascript
// Test database operations
const testDatabase = async () => {
  // Test insert
  const { data: insertData, error: insertError } = await supabase
    .from('client_profiles')
    .insert({
      user_id: supabase.auth.user().id,
      name: 'Test Client',
      primary_domain: 'example.com'
    });
    
  if (insertError) {
    console.error('Insert failed:', insertError.message);
    return false;
  }
  
  // Test select
  const { data: selectData, error: selectError } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', supabase.auth.user().id);
    
  if (selectError) {
    console.error('Select failed:', selectError.message);
    return false;
  }
  
  console.log('Database operations successful:', selectData);
  return true;
};
```

### Dashboard Rendering

1. Test fetching analysis data
2. Render dashboard with mock data
3. Verify all components display correctly

```javascript
// Test dashboard rendering
const testDashboard = async () => {
  const { data, error } = await supabase
    .from('analysis_runs')
    .select(`
      *,
      client_profile:client_profiles(*),
      queries(
        *,
        query_results(
          *,
          citations(*)
        )
      )
    `)
    .eq('id', 'test-analysis-id')
    .single();
    
  if (error) {
    console.error('Dashboard data fetch failed:', error.message);
    return false;
  }
  
  console.log('Dashboard data:', data);
  // Render dashboard with this data
  return true;
};
```

## Conclusion

This Supabase implementation plan provides a comprehensive foundation for building the Citebots GEO Analytics application. By following this guide, you can:

1. Set up the necessary Supabase infrastructure
2. Implement authentication and authorization
3. Create and deploy edge functions for LLM integration
4. Configure realtime features for progress tracking
5. Set up storage for reports and exports

The implementation roadmap outlines a phased approach, allowing for incremental development and validation at each step. This ensures a robust and reliable application that meets all the requirements specified in the development plan.