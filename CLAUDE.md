# Claude AI Assistant Instructions - Citebots Project

## Project Overview

Citebots is an internal SEO/digital marketing tool that analyzes citations in LLM responses (ChatGPT, Claude, Perplexity) to help organizations optimize their content. This is an urgent weekend MVP sprint to close a business deal.

## Critical Context

- **Timeline**: Weekend sprint (2 days)
- **Goal**: Working demo to show prospects
- **Priority**: Backend functionality over UI polish
- **Business**: Low revenue period, need this deal

## Your Role

You are the technical development partner for this sprint. Focus on:
1. Rapid, incremental development
2. Clear validation at each step
3. Risk mitigation
4. Working functionality over perfection

## Project Structure

```
kb-citebots/
├── docs/                    # All documentation
│   ├── project/            # Overview, philosophy, roadmap
│   ├── architecture/       # System design, data model
│   ├── development/        # Setup guides, standards
│   ├── features/           # Feature implementations
│   ├── integrations/       # External service docs
│   ├── validation/         # Milestone tracking
│   └── workflows/          # User workflows
├── CLAUDE.md               # This file
└── [code directories]      # To be created
```

## Key Documents to Reference

### Urgent/Current Sprint
1. `/docs/project/urgent-mvp-requirements.md` - Current business context
2. `/docs/development/weekend-mvp-checklist.md` - Hour-by-hour plan
3. `/docs/development/micro-steps-mvp.md` - Development sequence
4. `/docs/development/immediate-action-plan.md` - Timeline and decisions

### Architecture
1. `/docs/architecture/system-design.md` - Overall architecture
2. `/docs/architecture/data-model.md` - Database schema
3. `/docs/architecture/multi-tenant-philosophy.md` - Future-proofing

### Implementation
1. `/docs/development/quick-start-weekend.md` - Code snippets
2. `/docs/development/supabase-implementation.md` - Backend setup
3. `/docs/integrations/` - External services

## Current State

- Web scraping algorithm: READY
- Next step: Frontend deployment on Netlify
- Technology: Nuxt.js + Supabase + Netlify

## Development Approach

### Phase 1: Visible Progress
Start with deployment to show immediate results:
1. Basic Nuxt app
2. Deploy to Netlify
3. Add authentication UI
4. Connect Supabase

### Phase 2: Core Functionality
Add the business logic:
1. Client management
2. Analysis execution
3. Results display
4. Share links

### Phase 3: Demo Preparation
Polish for presentation:
1. Bug fixes
2. Sample data
3. Demo script
4. Backup plans

## Key Technical Decisions

1. **Frontend**: Nuxt.js (Vue framework)
2. **Backend**: Supabase (PostgreSQL + Auth)
3. **Hosting**: Netlify (with Edge Functions)
4. **Scraper**: Already built (to be integrated)

## Code Generation Guidelines

When writing code:
1. Start simple, enhance incrementally
2. Use TypeScript when beneficial
3. Add comments for complex logic
4. Focus on working over perfect
5. Include error boundaries

## Progress Tracking

After each micro-step:
1. Confirm functionality works
2. Commit to git
3. Deploy to Netlify
4. Report status

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy
netlify deploy --prod

# Supabase
supabase init
supabase db push
```

## Risk Mitigation

If blockers occur:
1. Document the issue
2. Find a workaround
3. Mock if necessary
4. Keep moving forward

## Communication Style

1. Be concise and action-oriented
2. Confirm each step completion
3. Suggest next actions
4. Flag potential issues early
5. Celebrate small wins

## Success Criteria

By end of weekend:
- [ ] Site live at citebots.com
- [ ] Can log in
- [ ] Can create clients
- [ ] Can run analysis
- [ ] Can share results
- [ ] Demo script ready

## Emergency Fallbacks

If time runs out:
1. Focus on what works
2. Use mockups for missing parts
3. Emphasize validated backend
4. Show future potential

## Remember

- **Working > Perfect**
- **Backend > Frontend**
- **Progress > Planning**
- **Demo > Documentation**

## Next Steps

1. Create Nuxt.js application
2. Deploy to Netlify
3. Confirm deployment works
4. Move to next micro-step

**Ready to start development!**