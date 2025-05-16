# Citebots System Documentation

## Overview

Citebots is an automated system designed to analyze brand presence and competitor mentions in AI-generated responses. It processes keywords through various intent types, executes queries on AI platforms (ChatGPT and Perplexity), extracts citations, crawls those pages, and provides comprehensive brand analysis and SEO metrics.

## System Architecture

### Core Components

1. **Query Execution**: Runs queries on AI platforms (ChatGPT/Perplexity)
2. **Citation Extraction**: Extracts citations from AI responses
3. **Web Crawling**: Fetches and analyzes cited web pages
4. **Content Analysis**: Analyzes content for brand/competitor mentions
5. **SEO Metrics**: Calculates various SEO-related metrics
6. **Results Formatting**: Structures data for easy consumption

### Key Scripts

#### 1. `citebots.js` - Main Orchestrator
**Purpose**: The main entry point that orchestrates the entire workflow.

**Inputs**:
- Query keywords (string)
- Brand name (string) 
- Competitor name (string)
- Options object:
  - Client info (name, industry)
  - Save to file flag
  - File prefix for output
  - AI client selection (chatgpt/perplexity)
  - Crawler type (basic/pro)

**Outputs**:
- Comprehensive JSON report containing:
  - Query details
  - AI responses
  - Citations
  - Web content analysis
  - SEO metrics
  - Brand/competitor presence analysis

**Process Flow**:
1. Processes keywords through intent generator
2. Executes each intent query on selected AI platform
3. Extracts citations from responses
4. Crawls cited web pages
5. Analyzes content for brand mentions
6. Calculates SEO metrics
7. Formats and returns results

#### 2. `process-keywords.js` - Keyword Intent Generator
**Purpose**: Transforms base keywords into multiple intent-based queries.

**Inputs**:
- Keywords (string)
- Brand name (string)
- Client context (industry, name)
- Options (output file, save flag)

**Outputs**:
- Array of intent-based queries:
  - Informational (general information)
  - Commercial (product comparisons)
  - Transactional (purchase-ready)
  - Navigational (brand-specific)
  - Local (location-based)
  - Educational (learning-focused)
  - Support (help/troubleshooting)
  - Opinion (review-based)

**Process Flow**:
1. Parses input keywords
2. Formats client context
3. Generates queries for each intent type
4. Uses ChatGPT to create natural variations
5. Validates and filters results
6. Returns structured query array

#### 3. `run-citebot-query.js` - Query Runner
**Purpose**: Executes individual queries on AI platforms.

**Inputs**:
- Query string
- Client info object
- Brand name
- Competitor name
- Options (AI client, crawler type)

**Outputs**:
- Complete query results including:
  - Original query
  - AI response
  - Extracted citations
  - Crawled content
  - Brand analysis
  - SEO metrics

**Process Flow**:
1. Executes query on selected AI platform
2. Extracts citations from response
3. De-duplicates citations
4. Crawls each cited URL
5. Analyzes content for brand presence
6. Calculates SEO metrics
7. Returns structured results

#### 4. `consolidate-results.js` - Results Consolidator
**Purpose**: Merges multiple query results into a single comprehensive report.

**Inputs**:
- Array of individual query results

**Outputs**:
- Consolidated report with:
  - Combined citations
  - Aggregated SEO metrics
  - Brand presence summaries
  - Competitor analysis
  - Timing and performance data

**Process Flow**:
1. Loads and validates input data
2. Merges citations across queries
3. Calculates aggregate metrics
4. Identifies patterns and trends
5. Formats comprehensive report
6. Saves output to timestamped file

### Library Modules

#### `perplexityClient.js`
- Handles Perplexity API interactions
- Manages rate limiting
- Custom citation extraction

#### `chatgptClient.js`
- OpenAI GPT interactions
- Response formatting
- Citation extraction

#### `webCrawler.js`
- Pro crawler using ScrapingBee
- Handles JavaScript-rendered content
- Fallback to basic crawler

#### `basicWebCrawler.js`
- Free crawler using Puppeteer
- Basic content extraction
- No JavaScript rendering

#### `contentAnalyzer.js`
- Page content analysis
- SEO metrics calculation
- Content categorization

#### `brandAnalyzer.js`
- Brand/competitor mention detection
- Sentiment analysis
- Context extraction

#### `citationExtractor.js`
- Platform-specific citation extraction
- URL validation
- Reference formatting

#### `cacheManager.js`
- Response caching
- Rate limit protection
- Duplicate request prevention

## Configuration

### Environment Variables
```env
PERPLEXITY_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SCRAPINGBEE_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Config Structure
```javascript
{
  API_KEYS: {
    PERPLEXITY: process.env.PERPLEXITY_API_KEY,
    OPENAI: process.env.OPENAI_API_KEY,
    SCRAPINGBEE: process.env.SCRAPINGBEE_API_KEY,
    GROQ: process.env.GROQ_API_KEY
  },
  RATE_LIMITS: {
    PERPLEXITY: { requests: 50, window: 60 },
    CHATGPT: { requests: 60, window: 60 }
  },
  CACHE_DURATION: 300000,
  CRAWLER_TIMEOUT: 30000
}
```

## Data Structures

### Query Object
```javascript
{
  id: "unique_id",
  timestamp: "ISO_date",
  query: "search query",
  intent: "query_intent",
  client: { name: "client", industry: "industry" },
  brand: "brand_name",
  competitor: "competitor_name"
}
```

### Citation Object
```javascript
{
  id: "citation_id",
  url: "https://example.com",
  title: "Page Title",
  domain: "example.com",
  position: 1,
  context: "citation context"
}
```

### SEO Metrics Object
```javascript
{
  domainAuthority: 85,
  pageAuthority: 72,
  trustFlow: 0.8,
  citationFlow: 0.7,
  domainAge: 15,
  contentLength: 2500,
  readabilityScore: 75,
  keywordDensity: 0.02
}
```

## Usage Examples

### Basic Query Execution
```javascript
const citebots = require('./citebots');

const results = await citebots({
  keywords: 'construction software',
  brand: 'Bridgit',
  competitor: 'Procore',
  options: {
    clientInfo: {
      name: 'Bridgit',
      industry: 'Construction Tech'
    },
    aiClient: 'perplexity',
    crawler: 'pro'
  }
});
```

### Keyword Processing
```javascript
const processKeywords = require('./process-keywords');

const queries = await processKeywords(
  'email marketing platform',
  'Knak',
  { name: 'Knak', industry: 'MarTech' },
  { saveToFile: true }
);
```

### Results Consolidation
```javascript
const consolidateResults = require('./consolidate-results');

await consolidateResults(
  'output/knak_query_*.json',
  'output/consolidated/knak_all_queries.json'
);
```

## Error Handling

### Rate Limiting
- Automatic retry with exponential backoff
- Cache-first approach to prevent duplicate requests
- Configurable rate limits per API

### Crawler Failures
- Fallback from pro to basic crawler
- Timeout protection
- Invalid URL handling

### API Errors
- Graceful degradation
- Partial result return
- Error logging and reporting

## Best Practices

1. **Rate Limiting**: Always respect API rate limits
2. **Caching**: Utilize cache to minimize API calls
3. **Error Handling**: Implement proper try-catch blocks
4. **Logging**: Enable detailed logging for debugging
5. **Testing**: Test with small datasets first
6. **Monitoring**: Track API usage and costs

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify environment variables
2. **Rate Limit Exceeded**: Implement delays between requests
3. **Crawler Timeouts**: Increase timeout values
4. **Memory Issues**: Process results in batches
5. **Invalid Citations**: Improve extraction patterns

### Debug Mode
Enable verbose logging:
```javascript
process.env.DEBUG = 'citebots:*';
```

## Extension Points

### Adding New AI Clients
1. Create new client module in `lib/`
2. Implement standard interface
3. Add to client factory
4. Update configuration

### Custom Intent Types
1. Modify `process-keywords.js`
2. Add new intent generator
3. Update prompt templates
4. Test with sample data

### Additional Metrics
1. Extend `contentAnalyzer.js`
2. Add metric calculation
3. Update results formatter
4. Document new metrics

## Performance Optimization

### Parallel Processing
- Process multiple queries concurrently
- Batch crawler requests
- Utilize connection pooling

### Caching Strategy
- Cache AI responses
- Store crawled content
- Implement TTL policies

### Resource Management
- Memory usage monitoring
- Garbage collection optimization
- Connection limit management