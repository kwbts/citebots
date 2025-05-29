# Citebots Documentation

Welcome to the Citebots documentation. This directory contains comprehensive documentation for the AI Citation Analysis Platform.

## 📚 Documentation Structure

### Architecture
- [Current Architecture](/docs/architecture/current-architecture.md) - System overview and components
- [Data Model](/docs/architecture/current-data-model.md) - Database schema and relationships
- [Authentication & Security](/docs/architecture/auth-and-security.md) - Security patterns and auth flow
- [System Design](/docs/architecture/system-design.md) - Overall system architecture
- [Multi-tenant Philosophy](/docs/architecture/multi-tenant-philosophy.md) - Future multi-tenancy approach
- [Multi-tenancy Performance Guidelines](/docs/architecture/multi-tenancy-performance-guidelines.md) - RLS policy best practices

### Incidents
- [RLS Policy Cascade (May 28, 2025)](/docs/incidents/rls-policy-cascade-incident-2025-05-28.md) - Database resource exhaustion incident

### API Reference
- [Edge Functions](/docs/api/edge-functions.md) - Complete edge function API documentation
- [API Endpoints](/docs/architecture/api-endpoints.md) - API endpoint documentation

### Development
- [Supabase CLI Guide](/docs/development/supabase-cli-guide.md) - Using Supabase CLI for development
- [Quick Reference](/docs/development/quick-reference.md) - Common commands and tasks
- [Supabase CLI Commands](/docs/development/supabase-cli-commands.md) - Command reference sheet
- [Standards](/docs/development/standards.md) - Code standards and practices
- [Testing](/docs/development/testing.md) - Testing approach

### Features
- [Auth Implementation](/docs/features/auth/implementation.md) - Authentication system details
- [Client Profiles](/docs/features/client-profiles/implementation.md) - Client management features
- [Analysis Engine](/docs/features/analysis-engine/implementation.md) - LLM analysis system
- [Reporting](/docs/features/reporting/implementation.md) - Report generation
- [AI Recommendations](/docs/features/ai-recommendations/implementation.md) - AI insights

### Deployment
- [Production Deployment](/docs/deployment/production-deployment.md) - Production deployment guide
- [Edge Function Updates](/docs/deployment/edge-function-updates.md) - Updating edge functions
- [Netlify Deployment](/docs/development/netlify-deployment.md) - Netlify setup

### Project
- [Overview](/docs/project/overview.md) - What is Citebots
- [Philosophy](/docs/project/philosophy.md) - Development approach
- [Tech Stack](/docs/project/tech-stack.md) - Technology choices
- [Roadmap](/docs/project/roadmap.md) - Development phases

### User Documentation
- User guides and workflow documentation in `/docs/user-docs/`

### Workflows
- [Client Setup Flow](/docs/workflows/client-setup-flow.md) - Client onboarding
- [Analysis Flow](/docs/workflows/analysis-flow.md) - Running analysis
- [Recommendation Flow](/docs/workflows/recommendation-flow.md) - Generating insights

### Changelog
- [Changelog](/docs/changelog/changelog.md) - Project version history and updates

### Archive
- [MVP Sprint Docs](/docs/archive/mvp-sprint/) - Historical MVP development documentation

## 🚀 Latest Updates (May 28, 2025)

### Critical Incident Resolution
- ✅ Fixed RLS policy cascade incident causing database resource exhaustion
- ✅ Implemented direct client_id column on page_analyses table
- ✅ Replaced complex multi-table JOIN RLS policies with simple direct lookups
- ✅ Restored frontend queries with optimized RLS approach
- ✅ Documented incident root cause and mitigation in new incidents folder

### Performance Improvements
- ✅ Added proper indexes for RLS policies
- ✅ Established guidelines for future RLS policy development
- ✅ Reduced query complexity in key dashboard pages
- ✅ Removed console.log statements from frontend code

### Multi-Tenant Architecture
- Created performance-focused multi-tenant RLS strategy
- Implemented efficient client data access patterns
- Added database resource monitoring recommendations

### Previous Updates (January 18, 2025)
- Added `associated_pages` column to store page analysis results
- Fixed edge function API key configuration
- Enhanced error handling in all edge functions
- Documented architecture and development workflows

## 📖 Quick Start

For developers new to the project:

1. Start with [Architecture Overview](/docs/architecture/current-architecture.md)
2. Review the [Data Model](/docs/architecture/current-data-model.md)
3. Check [Quick Reference](/docs/development/quick-reference.md) for common tasks
4. Read [Edge Functions API](/docs/api/edge-functions.md) for backend development

## 🔧 Development Resources

- **Environment Setup**: See main README.md
- **Database Queries**: Check quick reference guide
- **Edge Functions**: Use Supabase CLI guide
- **Troubleshooting**: Quick reference includes common issues

## 📋 Documentation Standards

When adding new documentation:

1. Use clear, descriptive filenames
2. Include a header with purpose and last updated date
3. Use markdown formatting consistently
4. Link to related documents
5. Keep technical accuracy as priority

## 🔄 Keeping Documentation Updated

Documentation should be updated when:
- New features are added
- Architecture changes
- API modifications occur
- Security updates are implemented
- Common issues are discovered

## 📁 Directory Structure

```
docs/
├── api/                    # API documentation
├── architecture/           # System architecture
├── deployment/             # Deployment guides
├── development/            # Development guides
├── features/               # Feature documentation
├── incidents/              # Incident reports and postmortems
├── integrations/           # External integrations
├── fixes/                  # Bug fix documentation
├── project/                # Project overview
├── user-docs/              # User guides
├── validation/             # Validation milestones
├── workflows/              # User workflows
├── changelog/              # Version history
└── archive/                # Historical docs
    └── mvp-sprint/         # MVP sprint docs
```

---

Last updated: May 28, 2025