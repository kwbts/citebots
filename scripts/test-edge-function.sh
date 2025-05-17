#!/bin/bash

# Test the run-analysis edge function
SUPABASE_URL="https://trmaeodthlywcjwfzdka.supabase.co"
ANON_KEY="$NUXT_PUBLIC_SUPABASE_ANON_KEY"  # You'll need to set this

# Test data
curl -X POST \
  "$SUPABASE_URL/functions/v1/run-analysis" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "0d8f3e16-610c-4227-9504-7e8f259649be",
    "platform": "chatgpt",
    "test_mode": true,
    "keywords": ["test"]
  }'