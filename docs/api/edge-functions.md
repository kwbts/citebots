# Edge Functions Documentation

## Overview

Citebots uses Supabase Edge Functions for serverless processing of analysis tasks. These functions handle LLM interactions, web scraping, and data processing.

## Base URL

```
https://trmaeodthlywcjwfzdka.supabase.co/functions/v1/
```

## Authentication

All edge functions require authentication:
```
Authorization: Bearer <SUPABASE_ANON_KEY>
```

For admin operations:
```
Authorization: Bearer <SUPABASE_SERVICE_KEY>
```

## Available Functions

### 1. analyze-citation

Analyzes web pages from citations to extract SEO insights.

**Endpoint**: `/analyze-citation`

**Method**: POST

**Request Body**:
```json
{
  "citationData": {
    "clientDomain": "client.com",
    "clientKeywords": ["seo", "marketing"],
    "competitorData": [
      {
        "name": "Competitor 1",
        "pattern": "competitor1.com"
      }
    ],
    "citations": [
      {
        "url": "https://example.com/article",
        "position": 1
      }
    ]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "page_analysis_id": "uuid",
      "citation_url": "https://example.com/article",
      "domain_name": "example.com",
      "is_client_domain": false,
      "is_competitor_domain": false,
      "mention_type": ["direct_mention"],
      "analysis_notes": "AI-generated analysis",
      "technical_seo": {...},
      "page_performance": {...},
      "content_quality": {...}
    }
  ]
}
```

### 2. execute-query

Executes queries on ChatGPT or Perplexity and extracts citations.

**Endpoint**: `/execute-query`

**Method**: POST

**Request Body**:
```json
{
  "queries": [
    {
      "query_id": "uuid",
      "query_text": "What are the best email marketing tools?",
      "query_intent": "informational",
      "data_source": "chatgpt"
    }
  ],
  "apiKey": "your-api-key",
  "processedQueries": []
}
```

**Response**:
```json
{
  "results": [
    {
      "success": true,
      "query_id": "uuid",
      "model_response": "ChatGPT response text...",
      "citations": [
        {
          "url": "https://example.com",
          "position": 1
        }
      ],
      "brand_mentioned": false,
      "competitor_mentioned_names": [],
      "response_outcome": "informative"
    }
  ]
}
```

### 3. generate-queries

Generates search queries from keywords for different intents.

**Endpoint**: `/generate-queries`

**Method**: POST

**Request Body**:
```json
{
  "clientInfo": {
    "brandName": "Client Brand",
    "industry": "Marketing",
    "targetKeywords": ["email marketing", "seo tools"],
    "mainCompetitors": ["Competitor 1", "Competitor 2"]
  }
}
```

**Response**:
```json
[
  {
    "query_id": "uuid",
    "query_text": "What are the best email marketing tools for small businesses?",
    "query_keyword": "email marketing",
    "query_category": "tools_comparison",
    "query_intent": "informational",
    "query_type": "question",
    "funnel_stage": "informational"
  }
]
```

### 4. process-query

Processes individual queries through the analysis pipeline.

**Endpoint**: `/process-query`

**Method**: POST

**Request Body**:
```json
{
  "queryId": "uuid",
  "analysisRunId": "uuid",
  "clientInfo": {
    "name": "Client Name",
    "domain": "client.com",
    "keywords": ["keyword1", "keyword2"],
    "competitors": [
      {
        "name": "Competitor",
        "domain": "competitor.com"
      }
    ]
  }
}
```

**Response**:
```json
{
  "success": true,
  "queryId": "uuid",
  "status": "completed"
}
```

### 5. run-analysis

Runs a complete analysis for a client.

**Endpoint**: `/run-analysis`

**Method**: POST

**Request Body**:
```json
{
  "analysisRunId": "uuid",
  "clientId": "uuid",
  "platform": "both",
  "intents": ["informational", "commercial"],
  "options": {
    "includeBrandAnalysis": true,
    "includeCompetitorAnalysis": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "analysisRunId": "uuid",
  "status": "running",
  "totalQueries": 24,
  "completedQueries": 0
}
```

### 6. enhance-client-with-ai

Enhances client profile using AI analysis.

**Endpoint**: `/enhance-client-with-ai`

**Method**: POST

**Request Body**:
```json
{
  "clientName": "Client Name",
  "clientDomain": "client.com"
}
```

**Response**:
```json
{
  "businessDescription": "AI-generated business description",
  "suggestedKeywords": ["keyword1", "keyword2"],
  "competitorDomains": ["competitor1.com", "competitor2.com"]
}
```

## Error Responses

All functions return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_REQUEST`: Missing or invalid parameters
- `UNAUTHORIZED`: Invalid authentication
- `RATE_LIMIT`: API rate limit exceeded
- `EXTERNAL_API_ERROR`: External service error
- `DATABASE_ERROR`: Database operation failed

## Defensive Programming Patterns

All edge functions implement defensive programming:

1. **Input Validation**: All inputs are validated before processing
2. **Error Boundaries**: Try-catch blocks at multiple levels
3. **Null Checks**: Comprehensive null/undefined checks
4. **Graceful Degradation**: Functions continue with partial data
5. **Detailed Logging**: Console logs for debugging

## Rate Limiting

- API calls: 2-second delay between requests
- Batch processing: Maximum 10 items per batch
- Concurrent requests: Limited to 2-3 simultaneous

## Deployment

Deploy edge functions using Supabase CLI:

```bash
# Deploy single function
npx supabase functions deploy [function-name] --no-verify-jwt

# Deploy all functions
npx supabase functions deploy --no-verify-jwt
```

## Local Development

Run functions locally:

```bash
npx supabase functions serve --env-file .env
```

Test locally:
```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/execute-query' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"queries": [...]}'
```

## Monitoring

View function logs:

```bash
# Real-time logs
npx supabase functions logs [function-name] --scroll

# Recent logs
npx supabase functions logs [function-name]
```

## Best Practices

1. **Always validate inputs** before processing
2. **Use defensive programming** patterns
3. **Implement proper error handling**
4. **Log important operations** for debugging
5. **Test with edge cases** before deployment
6. **Monitor function performance** regularly
7. **Keep functions focused** on single responsibilities