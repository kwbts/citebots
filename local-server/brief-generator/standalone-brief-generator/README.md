# Citebots Brief Generator

Standalone content brief generation service that creates comprehensive, strategic content briefs using AI-powered research.

## Features

- **Multi-Source Research**: Integrates ChatGPT, Perplexity, and Google Search APIs
- **Web Scraping**: Enhanced content scraping with ScrapingBee integration
- **AI Analysis**: Claude-powered strategic insights and competitive analysis
- **Database Integration**: Supabase for data persistence and metrics tracking
- **Rate Limiting**: Built-in protection against API rate limits

## Quick Start

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env` file and configure your API keys:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
PERPLEXITY_API_KEY=your_perplexity_key
SCRAPINGBEE_API_KEY=your_scrapingbee_key

# Google Search (optional - can be disabled)
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_cse_id
DISABLE_GOOGLE_SEARCH=true

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Start Server

```bash
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### Generate Brief
```bash
POST /generate-brief
```

**Request Body:**
```json
{
  "title": "Your Content Title",
  "keywords": ["keyword1", "keyword2"],
  "purpose": "blog",
  "audience": "developers",
  "researchDepth": "deep",
  "platforms": {
    "chatGpt": true,
    "perplexity": true,
    "google": false
  },
  "clientId": "optional-client-id",
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "briefId": "brief-uuid",
  "message": "Brief generation started",
  "estimatedTime": "2-3 minutes"
}
```

### Get Brief
```bash
GET /brief/:id
```

### List Briefs
```bash
GET /briefs?status=completed&limit=20
```

### Health Check
```bash
GET /health
```

## Architecture

### Core Components

- **Query Generator**: Creates research queries from keywords and client data
- **LLM Researcher**: Handles ChatGPT and Perplexity API calls
- **Web Searcher**: Google Custom Search integration with rate limiting
- **Content Scraper**: ScrapingBee and direct scraping with fallbacks
- **Content Analyzer**: Claude-powered analysis and insights
- **Brief Assembler**: Formats final strategic content brief

### Key Features

1. **Strategic Focus**: Generates opinionated briefs for human writers
2. **Competitive Analysis**: Tracks competitor insights and differentiation
3. **Statistical Extraction**: Finds and formats quotable statistics
4. **Enhanced Scraping**: Multi-level content extraction with timeout protection
5. **Comprehensive Logging**: Detailed process tracking and debugging

## Rate Limiting & Quotas

The service includes built-in protection for API rate limits:

- **Google Search**: Automatic retry with exponential backoff
- **Disable Google**: Set `DISABLE_GOOGLE_SEARCH=true` when quota exceeded
- **LLM APIs**: Timeout protection and error handling
- **Web Scraping**: Batch processing with delays

## Data Schema

Generated briefs include:

- `strategic_overview`: Strategic positioning for writers
- `table_of_contents`: Structured content outline
- `quotable_statistics`: Ready-to-use stats with sources
- `competitive_landscape_analysis`: Competitor insights
- `research_links`: Source attribution
- `process_notes`: Debug information and metrics

## Production Considerations

### Memory Requirements
- Minimum: 1GB RAM
- Recommended: 2GB+ RAM for concurrent processing

### Environment Variables
```bash
NODE_ENV=production
BRIEF_GENERATOR_PORT=3001
```

### Monitoring
- Comprehensive Winston logging
- Health check endpoint
- Processing metrics in database

## Troubleshooting

### Common Issues

1. **Google 429 Errors**: Set `DISABLE_GOOGLE_SEARCH=true`
2. **Memory Issues**: Increase container memory allocation
3. **Timeout Errors**: Check network connectivity to APIs
4. **Empty Responses**: Verify API key validity

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## License

MIT