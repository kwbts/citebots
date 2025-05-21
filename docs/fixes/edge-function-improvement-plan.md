# Edge Function Improvement Plan - Quick Reference

## Implementation Priority Order

1. CORS Headers Protection
2. Error Handling Reinforcement 
3. ScrapingBee Integration Enhancement
4. Queue Architecture Implementation

## 1. CORS Headers Protection

**Issue**: CORS headers aren't returned on timeouts, breaking frontend requests

**Solution**: Ensure CORS headers are sent at the very beginning of function execution

**Implementation**:
```typescript
// Pattern to apply to ALL edge functions
serve(async (req) => {
  // 1. Handle OPTIONS immediately for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 2. Prepare headers object that will be used in ALL responses
  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
  
  try {
    // Process request normally...
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: responseHeaders, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Always use the same headers even for errors
    return new Response(
      JSON.stringify({ success: false, error: error.message || String(error) }),
      { headers: responseHeaders, status: 400 }
    );
  }
});
```

**Verification**: Test with a request that will timeout but should still return CORS headers

## 2. Error Handling Reinforcement

**Issue**: Parsing errors and unexpected data structures cause cascade failures

**Solution**: Add robust validation and defensive programming

**Implementation**:
```typescript
// JSON parsing pattern
try {
  const result = await response.json();
  
  // Validate response format
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid response format');
  }
  
  // Always check for required fields
  if (result.success === false) {
    throw new Error(result.error || 'Unknown error');
  }
  
  // Validate expected data
  if (!result.data || !Array.isArray(result.data.citations)) {
    // Provide fallback or default values
    result.data = result.data || {};
    result.data.citations = result.data.citations || [];
  }
  
  return result;
} catch (error) {
  console.error('Error parsing response:', error);
  throw new Error(`Failed to process response: ${error.message}`);
}
```

**Verification**: Test with missing fields, malformed JSON, and unexpected data types

## 3. ScrapingBee Integration Enhancement

**Issue**: Some websites block scraping attempts, causing cascade failures

**Solution**: Create tiered fallback system with domain-specific settings

**Implementation**:
```typescript
// Domain-aware crawler with retry logic
const knownDifficultDomains = ['glassdoor.com', 'g2.com', 'capterra.com'];
const premiumOptions = { premium_proxy: true, country_code: 'us' };

async function fetchWithFallback(url, options = {}) {
  const domain = new URL(url).hostname;
  const needsPremium = knownDifficultDomains.some(d => domain.includes(d));
  
  // Try primary method
  try {
    const initialOptions = needsPremium 
      ? { ...options, ...premiumOptions }
      : options;
      
    const response = await scrapingBeeClient.get(url, initialOptions);
    return response;
  } catch (error) {
    console.log(`Primary fetch failed for ${url}: ${error.message}`);
    
    // Try fallback with premium options
    try {
      const fallbackOptions = { ...options, ...premiumOptions, stealth_proxy: true };
      const response = await scrapingBeeClient.get(url, fallbackOptions);
      return response;
    } catch (fallbackError) {
      console.error(`All fallback methods failed for ${url}`);
      throw new Error(`Failed to scrape ${url}: ${fallbackError.message}`);
    }
  }
}
```

**Verification**: Test with known difficult domains to ensure fallback works

## 4. Queue Architecture Implementation

**Issue**: Edge function timeouts when processing large batches

**Solution**: Implement queue-based processing with feature flag

**Implementation**:
```typescript
// Feature flag check in run-custom-analysis
const useQueue = req.headers.get('X-Use-Queue') === 'true' || 
                 queries.length > MAX_DIRECT_PROCESS;

if (useQueue) {
  // Queue all queries for background processing
  await queueQueries(analysisRunId, queries, client, formattedCompetitors);
  
  // Return immediately
  return new Response(
    JSON.stringify({ 
      success: true, 
      analysis_run_id: analysisRunId,
      processing_method: 'queue'
    }),
    { headers: responseHeaders, status: 200 }
  );
} else {
  // Process synchronously (existing code)
  // ...
}
```

**Verification**: Test with feature flag enabled and disabled, verify queue processing works

## Monitoring Implementation

**SQL Queries for Verification**:
```sql
-- Check queue health
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM query_queue;

-- Check recent runs
SELECT id, client_id, status, queries_total, queries_completed, created_at
FROM analysis_runs
ORDER BY created_at DESC
LIMIT 10;
```

## Rollback Procedures

If any step causes issues:

1. Restore previous versions of edge functions:
   ```bash
   # Restore from backup
   cp /supabase/functions/[function-name]/index.ts.backup /supabase/functions/[function-name]/index.ts
   
   # Redeploy original function
   npx supabase functions deploy [function-name] --project-ref trmaeodthlywcjwfzdka --no-verify-jwt
   ```

2. Feature flag disable:
   - Set `X-Use-Queue: false` in headers
   - Remove queue-specific UI elements