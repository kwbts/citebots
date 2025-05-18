#!/bin/bash

# Deploy edge functions to Supabase
echo "Deploying edge functions..."

# Set your Supabase project reference
PROJECT_REF="trmaeodthlywcjwfzdka"

# Deploy execute-query function
echo "Deploying execute-query function..."
npx supabase functions deploy execute-query \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Deploy process-query function  
echo "Deploying process-query function..."
npx supabase functions deploy process-query \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Deploy analyze-citation function
echo "Deploying analyze-citation function..."
npx supabase functions deploy analyze-citation \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Deploy run-analysis function
echo "Deploying run-analysis function..."
npx supabase functions deploy run-analysis \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo "Edge functions deployed successfully!"

# Update environment variables if needed
echo ""
echo "Remember to set the following environment variables:"
echo "- OPENAI_API_KEY"
echo "- PERPLEXITY_API_KEY" 
echo "- SCRAPINGBEE_API_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"