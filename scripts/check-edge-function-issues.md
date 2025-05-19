# Edge Function Debugging Steps

## 1. Check Recent Logs

Run these commands to see what's happening:

```bash
# Check process-query logs for the specific query
npx supabase functions logs process-query --scroll | grep "462e07c2-6b8d-40b2-96b8-2f50a6687c55"

# Check recent analyze-citation logs
npx supabase functions logs analyze-citation --limit 50

# Check for any errors in analyze-citation
npx supabase functions logs analyze-citation --scroll | grep -i "error"
```

## 2. Look for Common Issues

In the logs, look for:
- "Processing X citations" messages
- "Failed to analyze citation" errors
- ScrapingBee API errors
- OpenAI API errors
- Database insertion errors

## 3. Possible Causes

Based on the data, here are likely issues:

1. **Citation Format Mismatch**: The execute-query function might be returning citations in a different format than process-query expects
2. **API Key Issues**: ScrapingBee or OpenAI keys might be missing/invalid
3. **Error in analyze-citation**: The function might be failing silently
4. **Database Permission Issues**: The page_analyses insert might be failing

## 4. Quick Test

Let's test the analyze-citation function directly:

```bash
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/analyze-citation \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": "test-123",
    "citation_url": "https://example.com",
    "citation_position": 1,
    "query_text": "test query",
    "keyword": "test",
    "brand_name": "TestBrand",
    "brand_domain": "testbrand.com",
    "competitors": []
  }'
```

This will help us see if the function works in isolation.