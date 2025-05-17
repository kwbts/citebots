#!/bin/bash

# Script to set environment variables for the enhance-client-with-ai edge function
# Run this from the project root directory

echo "Setting environment variables for enhance-client-with-ai edge function..."

# You'll need to replace these with your actual API keys
npx supabase secrets set PERPLEXITY_API_KEY="your-perplexity-api-key-here"
npx supabase secrets set OPENAI_API_KEY="your-openai-api-key-here"

echo "Environment variables set successfully!"
echo "Make sure to replace the placeholder values with your actual API keys."