# Citebots V2 Migration Guide

## Overview

Citebots is an SEO intelligence tool that analyzes how brands appear in AI-generated responses across ChatGPT, Claude, and Perplexity. The current v1 is a complex Nuxt/Supabase application that needs a complete rebuild for maintainability and scalability.

## Current State (V1)

### What Works
- **Authentication**: Supabase auth with role-based access
- **Database Schema**: Well-structured tables for clients, competitors, queries
- **Edge Functions**: Working analysis pipeline (though complex)
- **Basic UI**: Dashboard and client management

### Pain Points
- Overly complex architecture
- Mixed deployment strategies (Netlify + Supabase)
- Scattered business logic
- Difficult to debug and extend
- Too many moving parts for an MVP

## V2 Philosophy

### Core Principles
1. **Simplicity First**: Every decision should reduce complexity
2. **Single Source of Truth**: One place for each piece of logic
3. **Progressive Enhancement**: Start minimal, add features incrementally
4. **Developer Experience**: Easy to understand, debug, and extend
5. **Business Focus**: Deliver value, not technical perfection

### Technical Philosophy
- **Monolithic First**: Start with a single deployable unit
- **Database-Driven**: Let PostgreSQL do heavy lifting
- **API-First**: Clear separation between frontend and backend
- **Type Safety**: Full TypeScript from database to UI
- **Minimal Dependencies**: Only add what provides clear value

## Migration Workflow

### Two-Session Approach

**Session 1 (This Directory - Extraction)**
- Extract working code patterns
- Document existing functionality
- Create reference implementations
- Identify reusable components
- Build migration toolkit

**Session 2 (New Directory - Implementation)**
- Fresh start with clean architecture
- Import only validated patterns
- Build incrementally
- Test each component in isolation

### Phase 1: Extraction (Current Session)

1. **Document Core Business Logic**
   - How citation analysis works
   - Query generation patterns
   - Competitor comparison logic
   - Reporting requirements

2. **Extract Working Code**
   ```
   /extraction/
   ├── auth/           # Authentication patterns
   ├── database/       # Schema and queries
   ├── analysis/       # Core analysis logic
   ├── ui-components/  # Reusable UI patterns
   └── utilities/      # Helper functions
   ```

3. **Create Reference Scripts**
   - Database setup script
   - Sample data generation
   - API endpoint examples
   - Testing utilities

4. **Document Lessons Learned**
   - What patterns to avoid
   - Performance considerations
   - Security best practices
   - Deployment gotchas

### Phase 2: Fresh Implementation (New Session)

1. **Technology Stack**
   ```
   Frontend: Next.js 14+ (App Router)
   Backend: Next.js API Routes
   Database: Supabase (PostgreSQL only)
   Auth: Supabase Auth
   Hosting: Vercel
   ```

2. **Project Structure**
   ```
   citebots-v2/
   ├── app/            # Next.js app directory
   ├── lib/            # Shared utilities
   ├── components/     # React components
   ├── server/         # Server-only code
   └── supabase/       # Database migrations
   ```

3. **Implementation Order**
   - Database schema and migrations
   - Authentication flow
   - API routes for CRUD operations
   - Basic UI for core workflow
   - Analysis pipeline
   - Reporting features

## Key Architecture Decisions

### 1. Unified Deployment
- Single Next.js app on Vercel
- No separate edge functions
- API routes handle all backend logic

### 2. Simplified Data Model
- Fewer tables, better relationships
- Views for complex queries
- Stored procedures for business logic

### 3. Predictable State Management
- Server Components by default
- Client state only when necessary
- URL as state where possible

### 4. Clear Boundaries
```
User → UI → API → Service → Database
         ↑__________________|
              (Type Safety)
```

## Migration Checklist

### From V1 (Extract)
- [ ] Authentication flow and user management
- [ ] Database schema (simplified)
- [ ] Core analysis algorithm
- [ ] Query generation logic
- [ ] Reporting queries
- [ ] UI component patterns
- [ ] Environment configuration

### To V2 (Implement)
- [ ] Next.js project setup
- [ ] Supabase project (fresh)
- [ ] Authentication integration
- [ ] Database migrations
- [ ] Core API endpoints
- [ ] Basic UI shell
- [ ] Analysis pipeline
- [ ] Testing setup
- [ ] Deployment pipeline

## Communication Between Sessions

### Handoff Format
When sharing between sessions, use this format:

```markdown
## Component: [Name]
**Purpose**: What it does
**V1 Location**: Where to find it
**V2 Location**: Where it should go
**Dependencies**: What it needs
**Notes**: Important considerations

### Working Code:
[code block]

### Required Changes:
- List of modifications needed
```

## Success Metrics

### Technical
- Single command deployment
- <3s page loads
- Clear error messages
- Comprehensive logging

### Business
- Working demo in 2 days
- Core features operational
- Easy to add new features
- Client can self-serve

## Anti-Patterns to Avoid

1. **Multiple Deployment Targets**: Everything goes to one place
2. **Scattered Configuration**: Single .env file
3. **Complex RLS Policies**: Use API-level authorization
4. **Over-Engineering**: Build only what's needed now
5. **Perfect Code**: Working beats perfect

## Next Steps

1. **In Current Session**: Start extracting components into `/extraction/` directory
2. **Create Handoff Doc**: Document each extracted component
3. **Setup V2 Project**: Fresh Next.js + Supabase
4. **Implement Core**: Auth → Database → API → UI
5. **Test and Deploy**: Get working demo live

## Remember

- **Working > Perfect**
- **Simple > Clever**
- **Clear > Concise**
- **Progress > Planning**

The goal is a maintainable, extendable platform that delivers business value, not a technical masterpiece.