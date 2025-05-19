# Diagnosing Page Analysis Issue

## Step 1: Check if Citations Are Being Extracted

```sql
-- Check if queries have citations but no page analyses
SELECT 
    aq.id,
    aq.query_text,
    aq.status,
    aq.citation_count,
    aq.associated_pages_count,
    aq.model_response IS NOT NULL as has_response,
    LEFT(aq.model_response, 100) as response_preview
FROM public.analysis_queries aq
WHERE aq.citation_count > 0
  AND aq.associated_pages_count = 0
  AND aq.created_at > NOW() - INTERVAL '1 day'
ORDER BY aq.created_at DESC
LIMIT 5;
```

## Step 2: Check Edge Function Logs

Run these commands to see what's happening:

```bash
# Check the most recent process-query logs
npx supabase functions logs process-query --limit 50 | grep -E "(Processing|citation|error|failed)"

# Check analyze-citation for errors
npx supabase functions logs analyze-citation --limit 50 | grep -i "error"

# Check for successful analyze-citation calls
npx supabase functions logs analyze-citation --limit 20
```

## Step 3: Test Analyze-Citation Directly

```bash
# Make sure your environment variable is set
export NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Test with a real URL
curl -X POST https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/analyze-citation \
  -H "Authorization: Bearer $NUXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query_id": "test-123",
    "citation_url": "https://www.knak.com",
    "citation_position": 1,
    "query_text": "How easy is it to use Knak",
    "keyword": "Knak email tool",
    "brand_name": "Knak",
    "brand_domain": "knak.com",
    "competitors": []
  }'
```

## Step 4: Check Environment Variables

The analyze-citation function requires:
- `SCRAPINGBEE_API_KEY` - For web crawling
- `OPENAI_API_KEY` - For AI analysis

Check if these are set in your Supabase edge functions:

```bash
# List all secrets
npx supabase secrets list
```

## Possible Issues & Solutions

### 1. Missing API Keys
If ScrapingBee or OpenAI keys are missing:
```bash
npx supabase secrets set SCRAPINGBEE_API_KEY=your_key
npx supabase secrets set OPENAI_API_KEY=your_key
```

### 2. Citation Format Mismatch
The citations might not have the expected `url` field. Check the actual citation format in the logs.

### 3. Edge Function Not Being Called
The process-query function might be skipping citation analysis. Check for "Processing X citations" messages in logs.

### 4. Database Insert Failing
The page_analyses insert might be failing due to permissions or schema issues.