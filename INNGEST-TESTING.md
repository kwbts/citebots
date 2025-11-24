# Inngest Integration Testing Guide

## Setup Complete ✅

The following has been set up:

1. **Inngest SDK** - installed and configured
2. **Inngest Client** - `/inngest/client.ts`
3. **Test Function** - `/inngest/functions/hello-world.ts`
4. **API Endpoint** - `/server/api/inngest.ts` (serves functions to Inngest)
5. **Test Script** - `/test-inngest.mjs`

## How to Test

### Step 1: Start the Inngest Dev Server

Open a terminal and run:

```bash
npm run inngest:dev
```

This will:
- Start the Inngest Dev Server at http://localhost:8288
- Provide a UI to monitor functions and events
- Auto-discover your functions when you start the Nuxt server

**Leave this terminal running.**

### Step 2: Start the Nuxt Dev Server

Open a **second terminal** and run:

```bash
npm run dev
```

This will:
- Start Nuxt at http://localhost:3000
- Serve the Inngest API endpoint at http://localhost:3000/api/inngest
- Auto-register functions with the Inngest Dev Server

**Leave this terminal running.**

### Step 3: Verify Function Registration

1. Open http://localhost:8288 in your browser
2. You should see the Inngest Dev Server UI
3. Click on "Functions" in the sidebar
4. You should see **"hello-world"** listed

### Step 4: Test the Function

**Option A: Use the Test Script**

In a **third terminal**, run:

```bash
npm run test:inngest
```

This sends a test event to trigger the hello-world function.

**Option B: Use the Inngest UI**

1. Go to http://localhost:8288
2. Click on the "hello-world" function
3. Click "Invoke Function"
4. Enter test data:
   ```json
   {
     "name": "Citebots"
   }
   ```
5. Click "Invoke"

**Option C: Send Event from Code**

You can trigger the function from anywhere in your app:

```typescript
import { inngest } from '~/inngest/client'

// Send an event
await inngest.send({
  name: "test/hello.world",
  data: { name: "Jon" }
})
```

### Step 5: View Results

1. Go to http://localhost:8288
2. Click "Stream" to see all events
3. Click on your event to see:
   - Event payload
   - Function execution steps
   - Return value
   - Timing information

## What You Should See

### In the Inngest UI:

```
Event: test/hello.world
Status: Completed
Steps:
  1. create-greeting ✓
  2. add-timestamp ✓

Output:
{
  "message": "Hello Citebots! Inngest is working!",
  "timestamp": "2025-01-18T...",
  "eventData": { "name": "Citebots" }
}
```

### In the Test Script Terminal:

```
🧪 Testing Inngest hello-world function...

✅ Event sent successfully!
Event IDs: ["01JH..."]

📊 Check the Inngest Dev Server UI to see the function run:
   http://localhost:8288
```

## Troubleshooting

### Functions Not Showing Up

1. Make sure **both** servers are running (Inngest + Nuxt)
2. Check http://localhost:3000/api/inngest - should return Inngest's response
3. Restart the Inngest Dev Server

### Events Not Triggering

1. Check the Dev Server is running at http://localhost:8288
2. Verify the event name matches: `"test/hello.world"`
3. Look for errors in the Nuxt terminal

### Import Errors

If you see TypeScript errors:
```bash
npm run postinstall
```

## Next Steps

Once this test passes, we'll migrate a real edge function (like `analyze-citation`) to prove the concept works with actual business logic.

## Architecture Overview

```
Frontend/API
    ↓
inngest.send() → Inngest Dev Server → Your Functions
                      ↓
                 Queue + Orchestration
                      ↓
                 Execute Steps (retries, concurrency)
                      ↓
                 Save Results to Supabase
```

## Key Benefits You'll See

1. **No Timeouts** - Functions run as long as needed
2. **Steps** - Each step is checkpointed (no re-running on failure)
3. **Observability** - See exactly what happened in the UI
4. **Retries** - Automatic retry with exponential backoff
5. **Concurrency** - Control how many run at once
