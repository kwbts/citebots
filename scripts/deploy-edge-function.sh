#!/bin/bash

# Deploy the enhance-client-with-ai edge function
echo "Deploying edge function..."
cd /Users/jontaylor/Documents/kb-citebots

# Deploy the function
npx supabase functions deploy enhance-client-with-ai

echo "Deployment complete!"