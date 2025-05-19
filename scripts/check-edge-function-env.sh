#!/bin/bash

echo "1. Check Supabase secrets (API keys):"
npx supabase secrets list

echo -e "\n2. Check recent analyze-citation errors:"
npx supabase functions logs analyze-citation --limit 30 | grep -i "error\|api key\|failed"

echo -e "\n3. Check recent process-query logs for citation processing:"
npx supabase functions logs process-query --limit 20 | grep -i "processing.*citation\|analyzing citation"

echo -e "\n4. Check for ScrapingBee errors:"
npx supabase functions logs analyze-citation --limit 30 | grep -i "scrapingbee\|crawl"

echo -e "\n5. Check for OpenAI errors:"
npx supabase functions logs analyze-citation --limit 30 | grep -i "openai\|gpt"