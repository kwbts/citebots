#!/bin/bash

# Deploy Edge Function Script for Citebots AI Enhancement

echo "Deploying enhance-client-with-ai edge function..."

# Check if we're in the right directory
if [ ! -d "supabase/functions/enhance-client-with-ai" ]; then
    echo "Error: Make sure you're in the project root directory"
    exit 1
fi

# Deploy the function
echo "Deploying function..."
supabase functions deploy enhance-client-with-ai

# Set environment variables
echo "Setting environment variables..."
echo "Enter your Perplexity API key:"
read -r PERPLEXITY_KEY

supabase secrets set PERPLEXITY_API_KEY="$PERPLEXITY_KEY"

echo "Edge function deployed successfully!"
echo "You can test it with:"
echo "supabase functions invoke enhance-client-with-ai --body '{\"clientName\":\"Test\",\"clientDomain\":\"test.com\",\"clientId\":\"test-id\"}'"