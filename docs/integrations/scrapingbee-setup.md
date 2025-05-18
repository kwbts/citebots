# ScrapingBee Integration Setup

## Overview
ScrapingBee is used in Citebots to crawl and extract content from cited pages in LLM responses. The `analyze-citation` edge function depends on ScrapingBee to fetch page content for analysis.

## Setup Requirements

### 1. Get ScrapingBee API Key
1. Sign up at [ScrapingBee](https://app.scrapingbee.com/)
2. Get your API key from the dashboard
3. Note: Free tier includes 100 requests/month

### 2. Set Environment Variable in Supabase

```bash
# Set the ScrapingBee API key as a secret in Supabase
npx supabase secrets set SCRAPINGBEE_API_KEY=your_actual_api_key \
  --project-ref trmaeodthlywcjwfzdka
```

### 3. Verify Environment Variable
```bash
# List all secrets (without showing values)
npx supabase secrets list --project-ref trmaeodthlywcjwfzdka
```

### 4. Redeploy Edge Function
After setting the environment variable:
```bash
npx supabase functions deploy analyze-citation \
  --project-ref trmaeodthlywcjwfzdka \
  --no-verify-jwt
```

## Troubleshooting

### Common Issues

1. **"ScrapingBee error: Resource not found on the server"**
   - Check if the URL being scraped is valid
   - Verify ScrapingBee API key is set correctly
   - Test with a known working URL

2. **Authentication Failed (401)**
   - API key is invalid or not set
   - Check if the API key has the correct format
   - Verify the key is active in ScrapingBee dashboard

3. **Rate Limit (429)**
   - You've exceeded your plan's request limit
   - Check ScrapingBee dashboard for usage
   - Upgrade plan or wait for reset

### Debug Steps

1. **Check if API key is set:**
   ```bash
   # In your edge function logs
   console.log('SCRAPINGBEE_API_KEY present:', !!Deno.env.get('SCRAPINGBEE_API_KEY'))
   ```

2. **Test ScrapingBee connection:**
   ```javascript
   // Test with a simple URL
   const testUrl = 'https://httpbin.org/get'
   const response = await crawlPage(testUrl)
   ```

3. **Enable detailed logging:**
   ```javascript
   console.log(`Crawling URL: ${url}`)
   console.log(`ScrapingBee response status: ${response.status}`)
   console.log(`Response headers:`, response.headers)
   ```

## ScrapingBee Configuration in analyze-citation

The function uses these ScrapingBee parameters:
- `render_js: 'false'` - No JavaScript rendering (faster)
- `premium_proxy: 'false'` - Standard proxy
- `country_code: 'us'` - US-based request
- `device: 'desktop'` - Desktop user agent
- `return_page_source: 'true'` - Get full HTML
- `block_ads: 'true'` - Block advertisements
- `timeout: '30000'` - 30 second timeout

## Testing ScrapingBee Integration

1. Create a test file `test-scrapingbee.js`:
```javascript
// Test ScrapingBee directly
const SCRAPINGBEE_API_KEY = 'your_api_key_here'
const testUrl = 'https://example.com'

const params = new URLSearchParams({
  api_key: SCRAPINGBEE_API_KEY,
  url: testUrl,
})

fetch(`https://app.scrapingbee.com/api/v1/?${params}`)
  .then(response => {
    console.log('Status:', response.status)
    return response.text()
  })
  .then(html => {
    console.log('HTML length:', html.length)
    console.log('Title:', html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1])
  })
  .catch(error => {
    console.error('Error:', error)
  })
```

2. Run the test:
```bash
node test-scrapingbee.js
```

## Monitoring Usage

- Check ScrapingBee dashboard for API usage
- Monitor edge function logs for crawl failures
- Set up alerts for rate limit errors

## Security Notes

- Never commit the API key to git
- Always use Supabase secrets for production
- Rotate API keys periodically
- Monitor for unusual usage patterns