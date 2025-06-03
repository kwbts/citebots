# Enhanced Page Analysis System

This document explains the enhanced page analysis system implemented in the CiteBots local server. The system provides comprehensive analysis of web pages cited in AI responses, aligning with the data definitions specified in `docs/data-definitions.md`.

## Features

The enhanced page analysis system provides:

1. **Technical SEO Analysis**: Evaluates HTML structure, schema markup, accessibility features, and other technical SEO factors.
2. **On-Page SEO Analysis**: Analyzes content structure, headings, links, keywords, and other on-page SEO elements.
3. **Content Quality Assessment**: Uses AI (GPT-4o-mini) to evaluate content depth, uniqueness, readability, and E-E-A-T signals.
4. **Page Performance Metrics**: Integrates with Google PageSpeed API to get real performance data (optional).
5. **Domain Authority Metrics**: Provides domain authority metrics using either Moz API or smart estimation.
6. **Brand & Competitor Analysis**: Detects brand and competitor mentions in the content.
7. **Content Relevance**: Evaluates how well the page matches the query intent.
8. **Enhanced Diagnostics**: Detailed logging throughout the analysis process for easy troubleshooting.

## Components

The system consists of the following components:

1. **Web Crawler**: `/local-server/lib/crawlPage.js` - Enhanced web crawler with detailed logging and fallback strategies.
2. **Page Analyzer**: `/local-server/lib/pageAnalyzer.js` - Core module for analyzing web pages.
3. **Domain Metrics**: `/local-server/lib/domainAuthority.js` - Module for estimating domain authority.
4. **Citation Analyzer**: `/local-server/lib/analyzeCitation.js` - Enhanced module for citation processing with detailed logs.
5. **Test Scripts**: Multiple test scripts for validating different aspects of the system.

## Architecture

The system follows a modular architecture with these key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  crawlPage.js   ├────►│  pageAnalyzer.js├────►│analyzeCitation.js│
│  (Web Crawling) │     │  (Data Analysis)│     │ (Citation Record)│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ScrapingBee    │     │  OpenAI API     │     │   Supabase      │
│  API            │     │  Google APIs    │     │   Database      │
│                 │     │  Domain Auth    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Usage

### Command-Line Testing

```bash
# Test just the web crawling component with detailed logging
node test-crawl-page.js https://example.com/page-to-analyze

# Test the full citation analysis process
node test-citation-analysis.js https://example.com/page-to-analyze --save

# Basic page analysis
node test-page-analysis.js https://example.com/page-to-analyze

# With PageSpeed API integration
node test-page-analysis.js https://example.com/page-to-analyze --pagespeed

# With domain metrics
node test-page-analysis.js https://example.com/page-to-analyze --moz

# Save results to file and enable verbose logging
node test-page-analysis.js https://example.com/page-to-analyze --save --verbose
```

### API Endpoint

The local server provides an API endpoint for running standalone page analysis:

```
POST http://localhost:3001/analyze-page
```

Request body:
```json
{
  "url": "https://example.com/page-to-analyze",
  "query": "Example query about the topic",
  "keyword": "main keyword",
  "brand": {
    "name": "Your Brand",
    "domain": "yourbrand.com"
  },
  "competitors": [
    {
      "name": "Competitor 1",
      "domain": "competitor1.com"
    },
    {
      "name": "Competitor 2",
      "domain": "competitor2.com"
    }
  ]
}
```

## Enhanced Diagnostic Logging

The system now includes comprehensive diagnostic logging to help identify and resolve issues:

### Web Crawling (`crawlPage.js`)

- **URL Validation**: Detailed logging of URL checks and potential issues
  ```
  🔎 URL PRE-CHECK: Analyzing URL https://example.com
  🔍 URL ANALYSIS: Protocol: https:, Domain: example.com, Path: /path
  ```

- **ScrapingBee API**: Detailed request parameters and response metrics
  ```
  📡 SCRAPINGBEE BASIC REQUEST PARAMETERS:
    - URL: https://example.com
    - Render JS: false (static HTML only)
    - Premium proxy: false (standard proxies)
    ...
  ```

- **Response Analysis**: Validation of HTML content and detection of common issues
  ```
  📦 RECEIVED HTML: 25430 bytes in 350ms
  ⚠️ WARNING: Security check or Cloudflare challenge detected
  ```

- **Timing Information**: Performance metrics for each phase
  ```
  ⬅️ RECEIVED RESPONSE: Status 200 in 1250ms
  ```

### Citation Analysis (`analyzeCitation.js`)

- **Analysis Context**: Clear logging of request parameters
  ```
  🔍 CITATION ANALYSIS: Starting analysis of https://example.com
  📊 ANALYSIS CONTEXT: Query: "Example query", Keyword: "example"
  ```

- **Database Operations**: Detailed logging of Supabase operations
  ```
  🔌 DATABASE: Checking Supabase connection...
  ✅ DATABASE: Analysis saved successfully with ID: abc-123
  ```

- **Results Summary**: Concise overview of analysis findings
  ```
  🔢 RESULT SUMMARY:
    - Technical SEO Score: 8/10
    - Content Depth Score: 4/5
    - Page Relevance: direct
    - Citation Match Quality: 4/5
    - Brand Mentioned: Yes
  ```

## Configuration

Add the following environment variables to your `.env` file:

```
# Required API keys
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional API keys for extended functionality
PAGESPEED_API_KEY=your_pagespeed_api_key
GOOGLE_PAGESPEED_API_KEY=your_pagespeed_api_key  # Alternative name

# Supabase connection (if saving to database)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Data Structure

The analysis produces a comprehensive data structure that aligns with the definitions in `docs/data-definitions.md`, including:

```javascript
{
  // Citation metadata
  "citation_url": "https://example.com/page",
  "citation_position": 1,
  "domain_name": "example.com",
  "is_client_domain": false,
  "is_competitor_domain": false,

  // Technical SEO data
  "technical_seo": {
    "is_valid": true,
    "is_crawlable": true,
    "http_response_code": 200,
    "schema_markup_present": true,
    "schema_types": ["Article"],
    "html_structure_score": 8,
    "semantic_html_usage": true,
    "mobile_friendly": true,
    "hreflang_declaration": false,
    "date_created": "2023-05-15T10:30:00Z",
    "date_modified": "2023-06-01T14:45:00Z",
    "cdn_usage": true,
    "meta_description_present": true,
    "aria_labels_present": true,
    "aria_labels_types": ["label", "describedby"],
    "social_graphs_present": true
  },

  // On-page SEO data
  "on_page_seo": {
    "page_title": "Page Title",
    "content_type": "Blog Post",
    "meta_description": "Meta description text",
    "word_count": 1500,
    "image_count": 6,
    "video_present": true,
    "has_table": true,
    "has_table_count": 2,
    "has_unordered_list": true,
    "has_unordered_list_count": 3,
    "has_ordered_list": true,
    "has_ordered_list_count": 1,
    "internal_link_count": 12,
    "folder_depth": 2,
    "authorship_clear": true,
    "heading_count": 8,
    "heading_count_type": {
      "h1": 1,
      "h2": 3,
      "h3": 4,
      "h4": 0,
      "h5": 0,
      "h6": 0
    },
    "keyword_match": ["example", "examples"]
  },

  // Content quality data
  "content_quality": {
    "content_depth_score": 4,
    "readability_score": 4,
    "sentiment_score": 0.5,
    "content_uniqueness": 4,
    "content_optimization_score": 3,
    "has_statistics": true,
    "has_quotes": true,
    "has_citations": true,
    "has_research": true,
    "analysis_score": 4,
    "rock_paper_scissors": "Paper",
    "citation_match_quality": 4,
    "eeat_score": 4,
    "ai_content_detection": 4,
    "topical_cluster": "Marketing"
  },

  // Page performance data (if PageSpeed API enabled)
  "page_performance": {
    "page_speed_score": 85,
    "firstContentfulPaint": 800,
    "largestContentfulPaint": 1200,
    "totalBlockingTime": 100,
    "cumulativeLayoutShift": 0.05,
    "accessibility_score": 4
  },

  // Domain authority data
  "domain_authority": {
    "domain_name": "example.com",
    "domain_authority": 45,
    "page_authority": 38,
    "backlink_count": 1250,
    "referring_domains": 320,
    "link_propensity": 0.7,
    "spam_score": 1
  },

  // Page analysis data
  "page_analysis": {
    "page_relevance_type": "direct",
    "page_intent_alignment": "high",
    "content_format": "article",
    "content_depth": "comprehensive",
    "brand_positioning": "mentioned",
    "competitor_presence": "mentioned",
    "call_to_action_strength": "moderate",
    "content_recency": "recent",
    "eeat_signals": "strong",
    "user_experience_quality": "good",
    "content_structure": "hierarchical",
    "analysis_notes": "This page directly addresses the query with comprehensive information..."
  },

  // Brand and competitor data
  "brand_mentioned": true,
  "brand_in_title": false,
  "brand_mention_count": 5,
  "competitor_mentioned": true,
  "competitor_names": ["Competitor 1"],
  "competitor_analysis": {
    "Competitor 1": {
      "name": "Competitor 1",
      "mentions": 3,
      "domain": "competitor1.com"
    }
  }
}
```

## Web Crawling Enhancements

The enhanced web crawler (`crawlPage.js`) includes:

1. **Intelligent URL Validation**
   - Identifies and skips problematic URLs before making API calls
   - Detects search engine URLs, file types, and other non-HTML content
   - Provides detailed diagnostics about URL structure

2. **Tiered Crawling Strategy**
   - Starts with basic (low-cost) configuration
   - Falls back to premium configuration only when necessary
   - Provides detailed logging of each strategy's parameters and results

3. **Error Detection**
   - Identifies common issues like CAPTCHA challenges and Cloudflare protection
   - Provides specific error messages for different failure modes
   - Includes timing information to identify performance bottlenecks

4. **Response Analysis**
   - Validates HTML content for common error patterns
   - Extracts and previews text content for quality checks
   - Measures response size and content extraction effectiveness

## AI Integration

The system uses GPT-4o-mini for content analysis, which provides:

1. Content quality assessment
2. Page relevance evaluation
3. Content format and depth analysis
4. Brand and competitor positioning analysis

The AI is configured to use a lower temperature (0.3) to ensure consistent results, and uses response_format to get structured JSON data.

AI prompts have been carefully designed to extract specific SEO and content metrics:

```javascript
const prompt = `
Analyze this web page content that was cited in response to the query: "${queryText}"

URL: ${url}
Content: ${truncatedContent.substring(0, 4000)}

Return ONLY a JSON object with these fields:
{
  "content_type": "Blog Post, Product Page, Landing Page, etc.",
  "rock_paper_scissors": "Rock, Paper, or Scissors (where Rock=factual reference content, Paper=comprehensive guides, Scissors=persuasive/sales content)",
  "content_depth_score": (1-5 score with 5 being most comprehensive),
  ...
}`;
```

## Extension Points

To extend the system:

1. **New APIs**: Add additional API integrations in `pageAnalyzer.js`.
2. **Custom Metrics**: Add new extraction functions for specific metrics.
3. **AI Prompts**: Modify the AI analysis prompts in `analyzeContentQuality` and `analyzePageContext` functions.
4. **Logging Enhancements**: Add more detailed logging to specific components.
5. **Test Scripts**: Create specialized test scripts for new functionality.

## Troubleshooting

Common issues and their solutions:

### ScrapingBee API Errors

- **API Key Invalid**: Check your SCRAPINGBEE_API_KEY in the `.env` file
  ```
  ⚠️ CONFIGURATION ERROR: ScrapingBee API key not found in environment variables
  ```

- **URL Blocked by Cloudflare**:
  ```
  🔒 CLOUDFLARE DETECTED: 403 Forbidden, will try premium with JS
  ```
  - Solution: The system will automatically try premium mode with JavaScript rendering

- **CAPTCHA Detected**:
  ```
  ⚠️ WARNING: CAPTCHA detected in response
  ```
  - Solution: Consider using a different URL or adding a delay between requests

### AI Analysis Errors

- **API Key Invalid**:
  ```
  ❌ CONTENT ANALYSIS ERROR: OpenAI API error: invalid_api_key
  ```
  - Solution: Check your OPENAI_API_KEY in the `.env` file

- **Rate Limit Exceeded**:
  ```
  ❌ CONTENT ANALYSIS ERROR: OpenAI API error: rate_limit_exceeded
  ```
  - Solution: Wait or use a different API key, or reduce the number of requests

### Database Errors

- **Connection Failed**:
  ```
  ❌ DATABASE ERROR: Failed to connect to Supabase: Network error
  ```
  - Solution: Check your SUPABASE_URL and SUPABASE_SERVICE_KEY in the `.env` file

- **Insertion Failed**:
  ```
  ❌ DATABASE ERROR: Failed to save analysis: duplicate key value violates unique constraint
  ```
  - Solution: Check your data structure and database schema

## Diagnostic Tools

To help diagnose issues with the system, use these specialized test scripts:

1. **Web Crawling Test**:
   ```bash
   node test-crawl-page.js https://example.com
   ```
   - Tests just the ScrapingBee integration with detailed logging

2. **Citation Analysis Test**:
   ```bash
   node test-citation-analysis.js https://example.com --save
   ```
   - Tests the full citation analysis pipeline without requiring database connection
   - Saves results to a local JSON file for inspection

3. **Server Status**:
   ```bash
   curl http://localhost:3001/status
   ```
   - Shows server status, processed counts, and any errors

Remember to check the server logs for detailed diagnostics when issues occur.

## Further Documentation

For more information on specific components:

- **Server API**: See README.md for server API endpoints and usage
- **Supabase Integration**: Review the database schema in docs/data-definitions.md
- **AI Analysis**: Explore the AI prompts in pageAnalyzer.js
- **Test Scripts**: Check the test scripts for usage examples and options