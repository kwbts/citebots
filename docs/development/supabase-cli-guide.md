# Supabase CLI Development Guide

## Overview

This guide covers how to use the Supabase CLI for Citebots development, including edge function deployment, database management, and local development.

## Installation & Setup

### 1. Install Supabase CLI

```bash
# Via NPM (already in package.json)
npm install

# Or install globally
npm install -g supabase
```

### 2. Initialize Supabase

```bash
npx supabase init
```

### 3. Login to Supabase

```bash
# Interactive login
npx supabase login

# Or set access token in .env
SUPABASE_ACCESS_TOKEN=your_personal_access_token
```

### 4. Link Project

```bash
npx supabase link --project-ref trmaeodthlywcjwfzdka
```

## Edge Function Development

### Deploy Edge Functions

```bash
# Deploy single function
npx supabase functions deploy [function-name] --no-verify-jwt

# Deploy all functions
npx supabase functions deploy --no-verify-jwt

# Examples
npx supabase functions deploy analyze-citation --no-verify-jwt
npx supabase functions deploy execute-query --no-verify-jwt
```

### Local Development

```bash
# Serve functions locally
npx supabase functions serve --env-file .env

# Test locally
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/execute-query' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"queries": [...]}'
```

### Function Logs

```bash
# Real-time logs
npx supabase functions logs [function-name] --scroll

# Recent logs
npx supabase functions logs [function-name]

# Examples
npx supabase functions logs analyze-citation --scroll
npx supabase functions logs execute-query
```

### List Functions

```bash
# List all deployed functions
npx supabase functions list
```

### Delete Functions

```bash
# Delete a function
npx supabase functions delete [function-name]
```

## Database Management

### Generate TypeScript Types

```bash
# Generate types from remote database
npx supabase gen types typescript --linked > types/supabase.ts

# Generate types with custom schema
npx supabase gen types typescript --linked --schema public > types/database.ts
```

### Database Migrations

```bash
# Create new migration
npx supabase migration new [migration-name]

# List migrations
npx supabase migration list

# Push migrations to remote
npx supabase db push

# Pull remote schema
npx supabase db pull
```

### Database Diff

```bash
# Compare local and remote schemas
npx supabase db diff

# Generate migration from diff
npx supabase db diff -f [migration-name]
```

### Execute SQL

```bash
# Run SQL on remote database
npx supabase db execute --sql "SELECT * FROM clients LIMIT 5"

# Run SQL file
npx supabase db execute -f scripts/update-schema.sql
```

### Open Dashboard

```bash
# Open SQL editor in browser
npx supabase db remote open
```

## Local Development Environment

### Start Local Supabase

```bash
# Start all services (DB, Auth, Storage, etc.)
npx supabase start

# Output includes:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Anon key: [local anon key]
# - Service key: [local service key]
```

### Stop Local Supabase

```bash
# Stop all services
npx supabase stop

# Stop and reset database
npx supabase stop --backup
```

### Check Status

```bash
# View running services
npx supabase status
```

## Environment Variables

Required environment variables for development:

```bash
# .env file
NUXT_PUBLIC_SUPABASE_URL=https://trmaeodthlywcjwfzdka.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ACCESS_TOKEN=your_personal_access_token

# For local development
NUXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NUXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_KEY=local_service_key
```

## Common Workflows

### 1. Update Edge Function

```bash
# 1. Edit function locally
vim supabase/functions/analyze-citation/index.ts

# 2. Test locally (optional)
npx supabase functions serve --env-file .env

# 3. Deploy to production
npx supabase functions deploy analyze-citation --no-verify-jwt

# 4. Check logs
npx supabase functions logs analyze-citation --scroll
```

### 2. Database Schema Update

```bash
# 1. Create migration
npx supabase migration new add-new-column

# 2. Edit migration file
vim supabase/migrations/[timestamp]_add-new-column.sql

# 3. Apply locally
npx supabase db reset

# 4. Push to production
npx supabase db push

# 5. Generate new types
npx supabase gen types typescript --linked > types/supabase.ts
```

### 3. Debug Production Issues

```bash
# 1. Check function logs
npx supabase functions logs [function-name] --scroll

# 2. Open SQL editor
npx supabase db remote open

# 3. Check function list
npx supabase functions list

# 4. Test function directly
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/[function-name] \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Troubleshooting

### Common Issues

1. **"Access token not provided"**
   - Run `npx supabase login` or set `SUPABASE_ACCESS_TOKEN`

2. **"Project not linked"**
   - Run `npx supabase link --project-ref trmaeodthlywcjwfzdka`

3. **Function deployment fails**
   - Check for TypeScript errors
   - Ensure single index.ts file per function
   - Verify environment variables

4. **Database migration conflicts**
   - Use `npx supabase db pull` to sync
   - Resolve conflicts manually
   - Push with `npx supabase db push`

### Debug Mode

```bash
# Run commands with debug output
npx supabase --debug [command]

# Example
npx supabase --debug functions deploy analyze-citation
```

## Best Practices

1. **Always test locally first**
   - Use `supabase start` for local development
   - Test edge functions with `supabase functions serve`

2. **Keep migrations organized**
   - Name migrations descriptively
   - One concern per migration
   - Test on local database first

3. **Monitor function performance**
   - Check logs regularly
   - Watch for rate limiting
   - Monitor error rates

4. **Use TypeScript types**
   - Generate types after schema changes
   - Import types in your code
   - Keep types file in version control

5. **Environment management**
   - Never commit secrets
   - Use different keys for dev/prod
   - Document required variables

## Useful Commands Reference

```bash
# Project management
npx supabase init
npx supabase login
npx supabase link --project-ref trmaeodthlywcjwfzdka

# Edge functions
npx supabase functions new [name]
npx supabase functions deploy [name] --no-verify-jwt
npx supabase functions serve --env-file .env
npx supabase functions logs [name] --scroll
npx supabase functions list
npx supabase functions delete [name]

# Database
npx supabase db push
npx supabase db pull
npx supabase db diff
npx supabase db reset
npx supabase migration new [name]
npx supabase migration list

# Types
npx supabase gen types typescript --linked

# Local development
npx supabase start
npx supabase stop
npx supabase status

# Debugging
npx supabase --debug [command]
npx supabase db remote open
```