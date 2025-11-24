# Inngest Production Deployment Guide

## Overview

Deploying Inngest functions to production is simple - they deploy **with your Nuxt app** via Netlify. No separate infrastructure needed!

---

## Step 1: Get Your Inngest Keys

### Sign Up for Inngest Cloud

1. Go to https://app.inngest.com/sign-up
2. Create a free account (generous free tier: 1M step executions/month)
3. Create a new app or select existing

### Copy Your Keys

From the Inngest dashboard, you'll get two keys:

```bash
# Event Key (for sending events)
INNGEST_EVENT_KEY=lPaDKVcX...

# Signing Key (for authenticating requests)
INNGEST_SIGNING_KEY=signkey-prod-...
```

**⚠️ Keep these secret!** Never commit them to git.

---

## Step 2: Add Keys to Netlify

### Via Netlify UI

1. Go to your Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Click **Add a variable**

Add both keys:

| Key | Value | Scopes |
|-----|-------|--------|
| `INNGEST_EVENT_KEY` | `lPaDKVcX...` | All scopes |
| `INNGEST_SIGNING_KEY` | `signkey-prod-...` | All scopes |

### Via Netlify CLI

```bash
netlify env:set INNGEST_EVENT_KEY "your-event-key-here"
netlify env:set INNGEST_SIGNING_KEY "your-signing-key-here"
```

---

## Step 3: Deploy Your App

```bash
# Build and deploy (as usual)
npm run deploy

# Or if using git integration, just push:
git push origin main
```

**That's it!** Your Inngest functions deploy automatically with your Nuxt app.

---

## Step 4: Register Your App with Inngest

After deploying, tell Inngest where to find your functions:

### In Inngest Dashboard

1. Go to https://app.inngest.com
2. Navigate to **Apps**
3. Click **Sync app**
4. Enter your production URL:
   ```
   https://citebots.com/api/inngest
   ```
5. Click **Sync**

Inngest will discover all your functions automatically!

---

## Step 5: Verify It's Working

### Test an Event in Production

```typescript
// From your frontend or API
import { inngest } from '~/inngest/client';

await inngest.send({
  name: "client/enhance.requested",
  data: {
    clientId: "...",
    clientName: "...",
    clientDomain: "..."
  }
});
```

### Check Execution

1. Go to https://app.inngest.com
2. Click **Runs**
3. See your function executing in real-time!

---

## Environment Variables Summary

### Local Development
```bash
# .env (already working)
OPENAI_API_KEY=...
NUXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...

# No Inngest keys needed for local dev!
```

### Production (Netlify)
```bash
# Existing vars
OPENAI_API_KEY=...
NUXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...

# Add these for Inngest
INNGEST_EVENT_KEY=lPaDKVcX...
INNGEST_SIGNING_KEY=signkey-prod-...
```

---

## How It Works

### Without Inngest Keys (Dev Mode)
```
Frontend → Inngest Dev Server (localhost:8288)
         → Your Functions (no auth required)
```

### With Inngest Keys (Production)
```
Frontend → Inngest Cloud (secure)
         → Your Functions at /api/inngest (authenticated)
         → Results stored + monitored
```

---

## Key Points

### ✅ No Separate Deployment
- Inngest functions deploy **with your Nuxt app**
- They're served via `/api/inngest` endpoint
- No additional infrastructure needed

### ✅ Automatic Scaling
- Inngest handles queuing and execution
- Your functions scale automatically
- No server management required

### ✅ Zero Downtime
- Deploy updates without stopping functions
- In-flight executions complete safely
- New executions use new code

### ✅ Same Codebase
- Development and production use same functions
- Test locally, deploy confidently
- No environment-specific code needed

---

## Troubleshooting

### Functions Not Appearing in Inngest Dashboard

**Check:**
1. Environment variables set correctly in Netlify
2. App URL is correct: `https://citebots.com/api/inngest`
3. Try manual sync in Inngest dashboard

### Events Not Triggering Functions

**Check:**
1. Event name matches function trigger
   ```typescript
   // Function expects:
   { event: "client/enhance.requested" }

   // Send exactly:
   inngest.send({ name: "client/enhance.requested", data: {...} })
   ```
2. Function is registered in `/server/api/inngest.ts`
3. Check Inngest dashboard for errors

### Authentication Errors

**Check:**
1. `INNGEST_SIGNING_KEY` is set in Netlify
2. Key starts with `signkey-prod-`
3. No extra quotes or spaces in the key

---

## Development Workflow

### Before Deployment
```bash
# Terminal 1: Inngest Dev Server
npm run inngest:dev

# Terminal 2: Nuxt Dev Server
npm run dev

# Test locally
npm run test:enhance-client
```

### Deployment
```bash
# Commit changes
git add .
git commit -m "Add Inngest functions"
git push

# Netlify auto-deploys
# Functions go live automatically!
```

### After Deployment
```bash
# Check Inngest dashboard
open https://app.inngest.com/runs

# Monitor function executions in real-time
```

---

## Cost Considerations

### Inngest Free Tier (Generous!)
- **1 million step executions** per month
- Unlimited functions
- Unlimited events
- Full observability

### Example Usage
```
enhance-client-with-ai has 4 steps:
- call-openai
- process-ai-data
- update-client-record
- upsert-competitors

Each execution = 4 steps

1M steps ÷ 4 = 250,000 client enhancements/month for free!
```

You'll likely stay in the free tier for a long time.

---

## Comparison: Deployment Complexity

### Supabase Edge Functions (Current)
```bash
# Deploy each function separately
npx supabase functions deploy enhance-client-with-ai
npx supabase functions deploy generate-queries
npx supabase functions deploy content-brief-generator

# Set secrets for each
npx supabase secrets set OPENAI_API_KEY=...

# Manage separately from frontend
```

### Inngest (New)
```bash
# Deploy everything together
git push

# Environment variables set once in Netlify
# All functions deploy automatically
# Nothing to manage separately
```

**Much simpler!**

---

## Security Notes

### Keys Are Secret
- Never commit `INNGEST_EVENT_KEY` or `INNGEST_SIGNING_KEY` to git
- Add to `.env` locally (already in `.gitignore`)
- Set in Netlify environment variables for production

### Request Authentication
- All requests between Inngest and your app are signed
- `INNGEST_SIGNING_KEY` verifies authenticity
- Prevents unauthorized function execution

### Environment Isolation
- Dev mode uses local Inngest Dev Server (no keys)
- Production uses Inngest Cloud (requires keys)
- Can't accidentally trigger production from dev

---

## Next Steps After Deployment

### 1. Monitor Your Functions
- Check https://app.inngest.com/runs regularly
- Set up alerts for failures (in Inngest dashboard)
- Review execution times and optimize if needed

### 2. Migrate More Functions
- `generate-queries` - next candidate
- `content-brief-generator` - good for steps
- Any other long-running or expensive operations

### 3. Optimize Concurrency
```typescript
// Adjust based on actual usage
{
  concurrency: { limit: 5 }  // Start conservative
}

// Monitor in Inngest dashboard
// Increase if functions are queuing too long
// Decrease if hitting rate limits
```

### 4. Set Up Retries
```typescript
// Configure per function
{
  retries: 3,  // More retries for critical functions
  // or
  retries: 0,  // No retries for idempotent operations
}
```

---

## Summary

### To Deploy to Production:

1. **Sign up** at https://app.inngest.com
2. **Copy keys** from Inngest dashboard
3. **Add to Netlify** environment variables
4. **Deploy app** (git push or `npm run deploy`)
5. **Sync app** in Inngest dashboard
6. **Test** by sending an event

**No separate deployment needed** - Inngest functions deploy with your Nuxt app!

---

## Questions?

- **Inngest Docs**: https://inngest.com/docs/deploy
- **Netlify Env Vars**: https://docs.netlify.com/environment-variables/overview/
- **Your Test Script**: `npm run test:enhance-client`
- **Local Testing Guide**: `/INNGEST-TESTING.md`

You're ready to deploy! 🚀
