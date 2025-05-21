# Fix for run-custom-analysis Authentication Issue

## Problem
The queue-enabled version of `run-custom-analysis` was broken because:
1. It expected `created_by` to be sent from the frontend
2. The frontend doesn't send `created_by` - it's determined server-side from auth
3. This caused "Missing required parameters" errors

## Solution
Restored proper authentication handling:
1. Use the authenticated user's ID for `created_by`
2. Check both `created_by` and `user_id` columns when verifying client ownership
3. Better error logging to diagnose issues

## Key Changes

### Authentication Flow
```typescript
// Get authenticated user
const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
if (userError || !user) {
  throw new Error('Unauthorized')
}

// Use authenticated user's ID
created_by: user.id, // Use the authenticated user's ID
```

### Client Ownership Check
```typescript
// Check both created_by and user_id columns
const { data: client } = await supabaseClient
  .from('clients')
  .select('*')
  .eq('id', client_id)
  .or(`created_by.eq.${user.id},user_id.eq.${user.id}`)
  .single()
```

### Better Error Handling
- Added validation for required parameters
- Better error logging for debugging
- Clear error messages for missing data

## Deployment

1. Replace the current function:
```bash
cp /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index-auth-fixed.ts /Users/jontaylor/Documents/kb-citebots/supabase/functions/run-custom-analysis/index.ts
```

2. Deploy:
```bash
npx supabase functions deploy run-custom-analysis --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
```

## Testing
The function now works with both:
- Standard analysis (without queue flag)
- Queue-based analysis (with X-Use-Queue header)

Both use proper authentication and don't require `created_by` from frontend.