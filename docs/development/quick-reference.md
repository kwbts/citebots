# Quick Reference Guide - Citebots

## Common Development Tasks

### Starting Development

```bash
# 1. Start dev server
npm run dev

# 2. Start local Supabase (optional)
npx supabase start

# 3. Open browser
open http://localhost:3000
```

### Deploying Code

```bash
# Frontend (automatic via GitHub)
git push origin main

# Edge Functions (manual)
npx supabase functions deploy [function-name] --no-verify-jwt

# All Edge Functions
npx supabase functions deploy --no-verify-jwt
```

### Database Updates

```bash
# Run SQL migration
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --linked > types/supabase.ts

# Open SQL editor
npx supabase db remote open
```

## Edge Function Commands

### Deploy Functions

```bash
# Single function
npx supabase functions deploy analyze-citation --no-verify-jwt
npx supabase functions deploy execute-query --no-verify-jwt
npx supabase functions deploy generate-queries --no-verify-jwt
npx supabase functions deploy process-query --no-verify-jwt
npx supabase functions deploy run-analysis --no-verify-jwt
npx supabase functions deploy enhance-client-with-ai --no-verify-jwt

# All functions
npx supabase functions deploy --no-verify-jwt
```

### Monitor Functions

```bash
# Real-time logs
npx supabase functions logs [function-name] --scroll

# Examples
npx supabase functions logs analyze-citation --scroll
npx supabase functions logs execute-query --scroll
```

### Test Functions

```bash
# Local testing
npx supabase functions serve --env-file .env

# Test endpoint
curl -X POST http://localhost:54321/functions/v1/[function-name] \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Database Queries

### Common SQL Queries

```sql
-- List all clients
SELECT * FROM clients ORDER BY created_at DESC;

-- List analysis runs
SELECT * FROM analysis_runs 
WHERE status = 'completed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check user roles
SELECT email, role FROM profiles ORDER BY created_at DESC;

-- View competitors for a client
SELECT c.name, comp.* 
FROM clients c 
JOIN competitors comp ON c.id = comp.client_id 
WHERE c.name = 'Client Name';
```

### RLS Policy Templates

```sql
-- Allow users to view their own data
CREATE POLICY "Users view own data"
  ON table_name
  FOR SELECT
  USING (user_id = auth.uid());

-- Super admin full access
CREATE POLICY "Super admin access"
  ON table_name
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON table_name
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Environment Variables

### Required Variables

```bash
# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ACCESS_TOKEN=your_personal_access_token

# API Keys
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
SCRAPINGBEE_API_KEY=your_scrapingbee_key

# URLs
SITE_URL=https://citebots.com
```

### Local Development Variables

```bash
# For local Supabase
NUXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NUXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_KEY=local_service_key
```

## Debugging

### Check Logs

```bash
# Edge function logs
npx supabase functions logs [function-name] --scroll

# Netlify function logs
netlify functions:log [function-name]

# Frontend logs
# Check browser console
```

### Common Issues

1. **Edge function not updating**
   ```bash
   # Force redeploy
   npx supabase functions delete [function-name]
   npx supabase functions deploy [function-name] --no-verify-jwt
   ```

2. **Database permission errors**
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. **API key issues**
   ```bash
   # Verify environment variables
   echo $OPENAI_API_KEY
   echo $SUPABASE_SERVICE_KEY
   ```

## Testing

### Manual Testing Flow

1. **Login Test**
   - Go to https://citebots.com
   - Login with test credentials
   - Verify dashboard loads

2. **Client Creation**
   - Navigate to Clients
   - Create new client
   - Add competitors
   - Save and verify

3. **Analysis Run**
   - Select client
   - Choose analysis options
   - Run analysis
   - Monitor progress
   - View results

### API Testing

```bash
# Test edge function
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/generate-queries \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clientInfo": {
      "brandName": "Test Brand",
      "targetKeywords": ["test keyword"]
    }
  }'
```

## Git Workflow

### Standard Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create PR on GitHub
```

### Hotfix Workflow

```bash
# Quick fix on main
git checkout main
git pull origin main

# Make fix
git add .
git commit -m "Fix: urgent issue"
git push origin main
```

## Monitoring Production

### Check Status

```bash
# Edge functions
npx supabase functions list

# Database status
npx supabase status

# Frontend status
netlify status
```

### View Metrics

1. **Supabase Dashboard**
   - https://supabase.com/dashboard/project/trmaeodthlywcjwfzdka
   - Check API usage
   - Monitor database size
   - View function invocations

2. **Netlify Dashboard**
   - View build status
   - Check deploy logs
   - Monitor bandwidth

## Emergency Procedures

### API Key Compromised

```bash
# 1. Rotate key immediately in provider dashboard
# 2. Update environment variables
# 3. Redeploy edge functions
npx supabase functions deploy --no-verify-jwt
```

### Database Issue

```sql
-- Check connections
SELECT count(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE query_start < now() - interval '1 hour';
```

### Edge Function Error

```bash
# 1. Check logs
npx supabase functions logs [function-name] --scroll

# 2. Rollback if needed
git checkout [previous-commit]
npx supabase functions deploy [function-name] --no-verify-jwt
```

## Useful Links

- **Production**: https://citebots.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/trmaeodthlywcjwfzdka
- **Netlify Dashboard**: https://app.netlify.com
- **GitHub Repo**: https://github.com/[your-username]/kb-citebots
- **Documentation**: /docs/

## Contact for Help

- **Technical Issues**: Check logs first, then escalate
- **Access Issues**: Verify credentials and permissions
- **Deployment Help**: Follow deployment checklist
- **Emergency**: Contact system administrator