#!/bin/bash

# Deploy the enhance-client-with-ai edge function
# Usage: ./scripts/deploy-edge-function-with-token.sh YOUR_ACCESS_TOKEN

if [ -z "$1" ]; then
    echo "Please provide your Supabase access token as the first argument"
    echo "You can get this from your Supabase dashboard"
    echo "Usage: ./scripts/deploy-edge-function-with-token.sh YOUR_ACCESS_TOKEN"
    exit 1
fi

echo "Deploying edge function..."
cd /Users/jontaylor/Documents/kb-citebots

# Deploy the function with access token
SUPABASE_ACCESS_TOKEN=$1 npx supabase functions deploy enhance-client-with-ai --project-ref trmaeodthlywcjwfzdka

echo "Deployment complete!"