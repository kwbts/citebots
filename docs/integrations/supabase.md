# Supabase Integration

## Overview

Supabase serves as the primary backend service for Citebots, providing database storage, authentication, and serverless function capabilities. This document outlines the integration points and configuration details.

## Authentication

Supabase Auth is used for user authentication with the following configuration:

- Email/password authentication
- Role-based access control
- JWT token management
- Session persistence

## Database Structure

The PostgreSQL database contains the following primary tables:

- `users`: User accounts and profile information
- `clients`: Client brand information
- `competitors`: Competitor information linked to clients
- `keywords`: Keyword lists associated with clients
- `queries`: Natural language queries derived from keywords
- `analysis_results`: Results from LLM query execution
- `citations`: Citations extracted from analysis results
- `recommendations`: Generated recommendations

## Database Relationships

- One client has many competitors (one-to-many)
- One client has many keywords (one-to-many)
- One keyword generates many queries (one-to-many)
- One query has many analysis results (one-to-many)
- One analysis result has many citations (one-to-many)

## Row-Level Security (RLS)

Supabase RLS policies ensure data security:

- Users can only access client data they are authorized to view
- Admin users have full access to all data
- View-only users have restricted access based on client associations

## Serverless Functions

Supabase Edge Functions are used for:

- LLM API interactions
- Data processing operations
- Scheduled tasks
- Notification dispatch

## Configuration Requirements

To set up the Supabase integration:

1. Create a Supabase project
2. Configure authentication providers
3. Initialize database tables and relationships
4. Set up RLS policies
5. Deploy edge functions

## Environment Variables

The following environment variables are required:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Data Backup Strategy

- Daily automated backups
- Point-in-time recovery enabled
- Scheduled database exports to secure storage

## Validation Status

As outlined in the [First Validation Milestone](../validation/first-milestone.md), the Supabase integration has been validated for:

- User authentication
- Script execution
- Data storage and retrieval