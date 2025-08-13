# Content Brief Generator API Contract

This document defines the API contract between the frontend and the backend edge function for the Content Brief Generator feature.

## Edge Function: `content-brief-generator`

### Endpoint
```
/functions/v1/content-brief-generator
```

### Authentication
- Requires a valid JWT token in the Authorization header
- User must be authenticated and have access to the selected client

### Request Format

```json
{
  "client_id": "uuid-string",
  "title": "Example Working Title",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "purpose": "inform | convert | awareness | authority | seo",
  "audience": "beginners | intermediate | advanced | decision-makers",
  "style_guide": "Optional style requirements and formatting preferences",
  "custom_instructions": "Any specific requirements or additional context"
}
```

#### Required Fields:
- `client_id`: UUID of the client in the Supabase database
- `title`: The working title for the content brief
- `keywords`: Array of 1-5 target keywords

#### Optional Fields:
- `purpose`: Content purpose (defaults to "inform" if not provided)
- `audience`: Target audience (defaults to "intermediate" if not provided)
- `style_guide`: Content style guidelines
- `custom_instructions`: Additional specific instructions

### Response Format

```json
{
  "success": true,
  "brief": {
    "id": "generated-brief-uuid",
    "client_id": "client-uuid",
    "title": "Final Recommended Title",
    "meta": {
      "client_name": "Client Name",
      "client_domain": "example.com",
      "client_info": { 
        // Client metadata from database
      },
      "keywords": ["keyword1", "keyword2"],
      "purpose": "inform",
      "audience": "intermediate",
      "generated_at": "2025-06-17T15:30:00Z",
      "research_stats": {
        "llm_queries_executed": 3,
        "google_searches_performed": 2,
        "pages_analyzed": 7,
        "competitor_pages_analyzed": 3
      }
    },
    "summary": "Summary of findings from the research process, with emphasis on competitor domains and content approach.",
    "content_suggestions": [
      {
        "suggestion": "Include a comparison table of [topic] features with competitors",
        "importance": 9.8,
        "rationale": "Competitive analysis shows users appreciate direct feature comparisons"
      },
      // Additional suggestions (max 5)
    ],
    "table_of_contents": [
      {
        "title": "Section 1: Introduction to [Topic]",
        "points": [
          "Provide industry context and relevance",
          "Establish key challenges that readers face",
          "Present a brief overview of what the article covers"
        ]
      },
      // Additional sections (max 7)
    ],
    "research_links": [
      {
        "title": "Source Title",
        "url": "https://example.com/source",
        "description": "Contains relevant statistics on industry growth",
        "source_type": "research | news | academic | industry"
      },
      // Additional sources (max 5)
    ],
    "process_notes": {
      "llm_responses": [
        // Summaries of LLM responses (for transparency)
      ],
      "search_results": [
        // Key search results analyzed
      ],
      "competitor_insights": [
        // Insights from competitor analysis
      ]
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      // Additional error context if available
    }
  }
}
```

### Common Error Codes

- `auth_error`: Authentication issue (invalid or expired token)
- `permission_error`: User doesn't have access to the requested client
- `client_not_found`: Specified client_id doesn't exist
- `invalid_parameters`: Missing or invalid request parameters
- `api_rate_limit`: External API rate limit exceeded (Google, OpenAI, etc.)
- `process_error`: Error during brief generation process
- `service_unavailable`: Temporary service unavailability

## Processing Steps

1. **Request Validation**
   - Validate authentication and permissions
   - Verify client existence and access rights
   - Validate required parameters

2. **Client Data Retrieval**
   - Fetch client profile and metadata
   - Retrieve competitor information
   - Gather existing client content and keywords

3. **AI Query Generation**
   - Analyze inputs to generate LLM research queries
   - Create diverse queries covering different angles

4. **Research Execution**
   - Run LLM queries (ChatGPT, Perplexity)
   - Execute Google searches for primary and client-specific keywords
   - Process and analyze responses

5. **Web Content Analysis**
   - Scrape and extract content from search results
   - Analyze competitor content structure and approach
   - Identify patterns and opportunities

6. **Brief Generation**
   - Synthesize research into findings summary
   - Generate high-importance content suggestions
   - Create structured table of contents
   - Identify and verify quality research links

7. **Response Formatting**
   - Format all components into the response structure
   - Store brief in database for future reference
   - Return complete brief data

## Implementation Notes

- The edge function should implement appropriate error handling and timeout management
- Authentication should be implemented using Supabase JWT verification
- All external API calls (OpenAI, Google, ScrapingBee) should implement retry logic
- Response data should be cached in Supabase for future reference
- Processing should follow a step-by-step approach with appropriate logging
- Long-running operations should be handled with appropriate timeouts and chunking