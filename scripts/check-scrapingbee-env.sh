#!/bin/bash

# Check ScrapingBee environment variable in Supabase Edge Functions

echo "Checking ScrapingBee environment configuration..."
echo ""

PROJECT_REF="trmaeodthlywcjwfzdka"

# Check if SCRAPINGBEE_API_KEY is set locally
if [ -z "$SCRAPINGBEE_API_KEY" ]; then
  echo "⚠️  WARNING: SCRAPINGBEE_API_KEY is not set in your local environment"
  echo "   You may need to export it before running this script"
else
  echo "✓ SCRAPINGBEE_API_KEY is set locally"
fi

echo ""
echo "To set the SCRAPINGBEE_API_KEY in Supabase Edge Functions, run:"
echo ""
echo "npx supabase secrets set SCRAPINGBEE_API_KEY=your_actual_api_key --project-ref $PROJECT_REF"
echo ""
echo "To list all secrets (without values) in Supabase:"
echo "npx supabase secrets list --project-ref $PROJECT_REF"
echo ""

# You can also update the edge function with the secret
echo "After setting the secret, redeploy the analyze-citation function:"
echo "npx supabase functions deploy analyze-citation --project-ref $PROJECT_REF --no-verify-jwt"