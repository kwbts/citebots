# Current Architecture - Citebots

## Overview

Citebots is a citation analysis tool that helps organizations optimize their content for Large Language Model (LLM) responses. The system analyzes citations in responses from ChatGPT, Perplexity, and other AI services to provide SEO insights.

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Layer     │────▶│   Database      │
│   (Nuxt 3)      │     │  (Netlify/Edge) │     │   (Supabase)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        ▼                        │
        │              ┌─────────────────┐               │
        │              │  Edge Functions  │               │
        │              │   (Supabase)     │               │
        │              └─────────────────┘               │
        │                        │                        │
        └────────────────────────┴────────────────────────┘
                                │
                                ▼
                     ┌─────────────────┐
                     │ External APIs   │
                     │ - OpenAI        │
                     │ - Perplexity    │
                     │ - ScrapingBee   │
                     └─────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Nuxt 3 (Vue 3)
- **UI**: Tailwind CSS
- **Deployment**: Netlify (Static SPA)
- **State Management**: Vue Composition API
- **Auth**: Supabase Auth

### Backend
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **API Functions**: Netlify Functions (Node.js)
- **Authentication**: Supabase Auth

### External Services
- **LLM Services**: OpenAI (ChatGPT), Perplexity
- **Web Scraping**: ScrapingBee
- **Hosting**: Netlify
- **DNS**: Citebots.com

## Core Components

### 1. Frontend (Nuxt 3 SPA)

The frontend is a static single-page application built with Nuxt 3:

```
/pages/
├── index.vue                # Login page
├── dashboard/              
│   ├── index.vue           # Main dashboard
│   ├── clients/            # Client management
│   ├── analysis/           # Analysis views
│   └── reports/            # Reporting features
```

Key features:
- Server-side rendering disabled (SPA mode)
- Static deployment to Netlify
- Real-time updates via Supabase subscriptions
- Responsive design with Tailwind CSS

### 2. Authentication System

Authentication uses Supabase Auth with custom provisioning:

```
Login Flow:
1. User enters credentials on login page
2. Supabase Auth validates credentials
3. User profile loaded from profiles table
4. Dashboard access granted based on role
```

User roles:
- `super_admin`: Full system access
- `partner`: Multi-client access
- `client`: Single client access
- `analyst`: Read-only access

### 3. API Layer

Two types of API endpoints:

#### Netlify Functions
Located in `/netlify/functions/`:
- `auth-provision.js`: User provisioning

#### Supabase Edge Functions
Located in `/supabase/functions/`:
- `analyze-citation`: Citation content analysis
- `execute-query`: Query execution (ChatGPT/Perplexity)
- `generate-queries`: Query generation from keywords
- `process-query`: Query processing pipeline
- `run-analysis`: Complete analysis workflow
- `enhance-client-with-ai`: AI client enhancement

### 4. Database Schema

Primary tables:
- `profiles`: User profiles and roles
- `clients`: Client organizations
- `competitors`: Client competitors (separate table)
- `analysis_runs`: Analysis batch runs
- `analysis_queries`: Individual queries
- `page_analyses`: Web page analysis results

### 5. Analysis Pipeline

```
1. Keyword Input
   └─→ generate-queries
       └─→ execute-query (ChatGPT/Perplexity)
           └─→ Citation extraction
               └─→ analyze-citation (Web scraping)
                   └─→ Content analysis
                       └─→ Results storage
```

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies based on auth.uid()
- Service role bypass for edge functions

### API Security
- Supabase Anon Key for public endpoints
- Service Key for admin operations
- CORS configured for production domain

### Environment Variables
Required environment variables:
```
NUXT_PUBLIC_SUPABASE_URL
NUXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
OPENAI_API_KEY
PERPLEXITY_API_KEY
SCRAPINGBEE_API_KEY
```

## Deployment

### Frontend Deployment
1. Build: `npm run build`
2. Deploy: Automatic via GitHub integration
3. Output: Static files to Netlify

### Edge Function Deployment
Manual deployment via Supabase CLI:
```bash
npx supabase functions deploy [function-name] --no-verify-jwt
```

### Database Migrations
SQL scripts in `/scripts/` directory:
1. Review migration files
2. Run via Supabase dashboard
3. Verify with RLS policies

## Performance Considerations

### Caching
- Frontend: Nuxt built-in caching
- API: Response caching in edge functions
- Database: Query optimization

### Rate Limiting
- LLM API calls: 2-second delays
- Web scraping: 5-second delays between requests
- Batch processing: Limited concurrent requests

### Error Handling
- Comprehensive try-catch blocks
- Graceful fallbacks
- User-friendly error messages
- Detailed logging for debugging

## Monitoring

### Application Monitoring
- Netlify Analytics for frontend
- Supabase Dashboard for database
- Edge function logs via CLI

### Error Tracking
- Console logging in development
- Supabase function logs in production
- Network tab for API debugging

## Future Considerations

### Scalability
- Database partitioning by client
- CDN for static assets
- Queue system for heavy processing

### Multi-tenancy
- Tenant isolation in database
- Separate edge function instances
- Custom domains per tenant

### Feature Expansion
- Real-time collaboration
- Advanced reporting
- API access for partners
- Mobile app consideration