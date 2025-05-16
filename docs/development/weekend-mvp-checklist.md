# Weekend MVP Development Checklist

## Priority: Working Demo by End of Weekend

### Day 1 - Backend Foundation

#### Morning (4 hours)
- [ ] Set up Netlify deployment with custom domain
- [ ] Initialize Supabase project
- [ ] Configure authentication (basic login for 2 users)
- [ ] Verify deployment pipeline works

#### Afternoon (4 hours)
- [ ] Create minimal database schema
  - [ ] Users table (simplified)
  - [ ] Clients table
  - [ ] Analysis results table
  - [ ] Citations table
- [ ] Test basic CRUD operations
- [ ] Validate authentication flow

### Day 2 - Core Functionality

#### Morning (4 hours)
- [ ] Implement simple LLM query execution
- [ ] Test with one LLM service (OpenAI or Claude)
- [ ] Store raw results in Supabase
- [ ] Basic citation extraction

#### Afternoon (4 hours)
- [ ] Create minimal dashboard
  - [ ] Login page
  - [ ] Client list view
  - [ ] Analysis trigger button
  - [ ] Results display (raw)
- [ ] Generate view-only link mechanism

### Day 3 - Demo Preparation

#### Morning (3 hours)
- [ ] Fix critical bugs
- [ ] Clean up UI for demo
- [ ] Prepare sample data
- [ ] Test end-to-end flow

#### Afternoon (2 hours)
- [ ] Create demo script
- [ ] Record backup demo video
- [ ] Deploy to production
- [ ] Final testing

## Success Criteria

1. Can log in successfully
2. Can create a client
3. Can run analysis (even if basic)
4. Can view results
5. Can share results via link

## NOT Required for MVP

- Multiple user roles
- Advanced reporting
- All LLM integrations
- Polished UI
- Email notifications
- Competitor analysis
- Keyword management

## Demo Script Outline

1. Login to Citebots
2. Show client dashboard
3. Run simple analysis
4. Show results appearing
5. Generate shareable link
6. Open link in incognito to show client view

## Backup Plan

If any major blocker:
1. Focus on what works
2. Mock remaining functionality
3. Emphasize validated backend
4. Show future potential