# Next Session Checklist - Client Management

## Pre-Session Setup
- [ ] Review session-2-notes.md for context
- [ ] Verify authentication still works
- [ ] Check current deployment status

## Phase 1: Database Setup (30 mins)
- [ ] Create clients table in Supabase
- [ ] Add RLS policies for clients
- [ ] Test with Supabase UI
- [ ] Create sample data

## Phase 2: Client List Page (1 hour)
- [ ] Create `/pages/dashboard/clients/index.vue`
- [ ] Add client list component
- [ ] Connect to Supabase
- [ ] Add loading states
- [ ] Add empty state

## Phase 3: Add Client Form (1 hour)
- [ ] Create `/pages/dashboard/clients/new.vue`
- [ ] Build form component
- [ ] Add validation
- [ ] Connect to Supabase
- [ ] Handle success/error states

## Phase 4: Client Detail Page (1 hour)
- [ ] Create `/pages/dashboard/clients/[id].vue`
- [ ] Fetch client data
- [ ] Display client info
- [ ] Add edit/delete buttons
- [ ] Add back navigation

## Phase 5: Edit Client (30 mins)
- [ ] Create `/pages/dashboard/clients/[id]/edit.vue`
- [ ] Reuse form component
- [ ] Pre-fill data
- [ ] Handle updates
- [ ] Add cancel functionality

## Phase 6: Delete Client (30 mins)
- [ ] Add delete confirmation modal
- [ ] Implement delete function
- [ ] Handle cascade deletes
- [ ] Redirect after delete

## Testing Checklist
- [ ] Create new client
- [ ] View client list
- [ ] View client details
- [ ] Edit client
- [ ] Delete client
- [ ] Check RLS works correctly

## Nice to Have (if time)
- [ ] Client search/filter
- [ ] Sort by name/date
- [ ] Pagination
- [ ] Export client list

## Remember
- Use Netlify Functions, not Nuxt server routes
- Keep RLS policies simple
- Test on deployed version
- Commit frequently
- Update documentation as you go