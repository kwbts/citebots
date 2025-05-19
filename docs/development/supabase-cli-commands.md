# Supabase CLI Commands for Development

## Edge Functions

### Deploy Functions
```bash
# Deploy single function
npx supabase functions deploy analyze-citation --no-verify-jwt

# Deploy all functions
npx supabase functions deploy --no-verify-jwt
```

### Local Development
```bash
# Serve functions locally
npx supabase functions serve --env-file .env

# Watch logs
npx supabase functions logs analyze-citation --scroll
npx supabase functions logs execute-query --scroll
```

## Database

### Generate TypeScript Types
```bash
npx supabase gen types typescript --linked > types/supabase.ts
```

### Push Migrations
```bash
npx supabase db push
```

### Run SQL
```bash
npx supabase db execute --sql "SELECT * FROM clients LIMIT 5"
```

## Local Development

### Start Local Supabase
```bash
npx supabase start
```

### Stop Local Supabase
```bash
npx supabase stop
```

### Status Check
```bash
npx supabase status
```

## Environment Management

### Pull Remote Config
```bash
npx supabase db pull
```

### List Edge Functions
```bash
npx supabase functions list
```

### Delete Function
```bash
npx supabase functions delete function-name
```

## Helper Commands

### Open Dashboard
```bash
npx supabase db remote open
```

### Create Migration
```bash
npx supabase migration new migration-name
```