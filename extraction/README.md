# Web Scraping & AI Analysis Extraction Library

A complete, portable library for web page scraping and AI-powered content analysis. This extraction folder contains all the patterns, scripts, and integrations needed to analyze web citations and extract comprehensive metadata.

## Overview

This library provides:
- **Web Scraping**: ScrapingBee integration with fallback strategies
- **AI Analysis**: OpenAI GPT-4o-mini for content quality and EEAT scoring
- **Citation Extraction**: Multi-platform citation parsing (ChatGPT, Perplexity)
- **Metadata Extraction**: Comprehensive page analysis including technical SEO
- **Brand Analysis**: Brand mention detection and competitor analysis

## Quick Start

```bash
# Install dependencies
npm install node-fetch cheerio openai

# Set environment variables
export SCRAPINGBEE_API_KEY="your_key_here"
export OPENAI_API_KEY="your_key_here" 
export PERPLEXITY_API_KEY="your_key_here"

# Run example
node examples/analyze-page.js
```

## Core Components

### 1. Web Scraping (`lib/scraper.js`)
- ScrapingBee integration with cost optimization
- Intelligent fallback strategies (basic → premium → final attempt)
- JavaScript framework detection and rendering
- Error handling with detailed diagnostics

### 2. Page Analysis (`lib/pageAnalyzer.js`)
- Technical SEO analysis (schema, accessibility, structure)
- On-page SEO data (headings, content type, keyword analysis)
- Content quality scoring using AI
- EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) analysis

### 3. Citation Extraction (`lib/citationExtractor.js`)
- Multi-platform support (ChatGPT, Perplexity, Claude)
- URL extraction from various response formats
- Citation normalization and deduplication

### 4. AI Integration (`lib/aiAnalyzer.js`)
- OpenAI GPT-4o-mini integration
- Content quality assessment
- Brand sentiment analysis
- Query intent classification

## Data Schema

### Page Analysis Result
```javascript
{
  // Basic Info
  citation_url: "https://example.com/page",
  domain_name: "example.com",
  page_title: "Page Title",
  
  // Technical SEO
  technical_seo: {
    schema_markup_present: boolean,
    mobile_friendly: boolean,
    html_structure_score: number, // 1-10
    accessibility_score: number
  },
  
  // Content Analysis
  content_quality: {
    content_depth_score: number, // 1-10
    content_uniqueness: number, // 1-10
    eeat_score: number, // 1-10
    rock_paper_scissors: string, // Content type classification
    has_statistics: boolean,
    has_research: boolean
  },
  
  // Brand & Competitor Data
  brand_mentioned: boolean,
  brand_mention_count: number,
  competitor_mentioned: boolean,
  competitor_analysis: object,
  
  // Performance Metrics
  page_performance: {
    page_speed_score: number,
    firstContentfulPaint: number,
    largestContentfulPaint: number
  }
}
```

## API Integrations

### ScrapingBee
- **Purpose**: Web scraping with proxy rotation
- **Cost Optimization**: Basic → Premium fallback strategy
- **Features**: JavaScript rendering, resource blocking, geographic targeting

### OpenAI
- **Models**: GPT-4o-mini for cost-effective analysis
- **Use Cases**: Content quality, EEAT analysis, sentiment scoring
- **Response Format**: Structured JSON for consistent parsing

### Perplexity
- **Purpose**: Real-time web search with citations
- **Features**: Built-in citation extraction, current information

## File Structure

```
extraction/
├── README.md              # This file
├── lib/
│   ├── scraper.js         # Web scraping with ScrapingBee
│   ├── pageAnalyzer.js    # Comprehensive page analysis
│   ├── citationExtractor.js # Multi-platform citation parsing
│   ├── aiAnalyzer.js      # AI-powered content analysis
│   └── utils.js           # Shared utilities
├── examples/
│   ├── analyze-page.js    # Single page analysis example
│   ├── batch-analysis.js  # Multiple URL processing
│   └── citation-demo.js   # Citation extraction demo
├── config/
│   ├── default.js         # Default configuration
│   └── api-keys.example.js # API key templates
└── docs/
    ├── api-reference.md   # Complete API documentation
    ├── integration-guide.md # How to integrate into projects
    └── troubleshooting.md # Common issues and solutions
```

## Environment Variables

```bash
# Required
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional
PERPLEXITY_API_KEY=your_perplexity_api_key
PAGESPEED_API_KEY=your_google_pagespeed_key
MOZ_ACCESS_ID=your_moz_access_id
MOZ_SECRET_KEY=your_moz_secret_key
```

## Usage Examples

### Basic Page Analysis
```javascript
const { analyzePage } = require('./lib/pageAnalyzer');

const result = await analyzePage({
  citation_url: 'https://example.com',
  query_text: 'best project management software',
  keyword: 'project management',
  brand_name: 'YourBrand',
  brand_domain: 'yourbrand.com',
  competitors: [
    { name: 'Competitor1', domain: 'comp1.com' },
    { name: 'Competitor2', domain: 'comp2.com' }
  ]
});
```

### Citation Extraction
```javascript
const { extractCitations } = require('./lib/citationExtractor');

const citations = extractCitations(chatGptResponse, 'chatgpt');
// Returns: [{ url, domain, citation_number, title }]
```

### Batch Processing
```javascript
const { batchAnalyze } = require('./examples/batch-analysis');

const results = await batchAnalyze([
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
], {
  brand_name: 'YourBrand',
  competitors: competitors
});
```

## Key Features

### Cost Optimization
- Intelligent ScrapingBee usage (basic first, premium only when needed)
- Content caching to avoid duplicate API calls
- Rate limiting for API requests

### Error Handling
- Comprehensive error logging with context
- Graceful fallbacks for failed requests
- Default values for missing data

### Extensibility  
- Modular architecture for easy customization
- Plugin system for additional analyzers
- Configurable analysis parameters

## Integration Notes

1. **Copy the entire `extraction/` folder** to your new project
2. **Install dependencies** listed in package.json
3. **Set environment variables** for API keys
4. **Import and use** the main analyzer functions
5. **Customize configurations** in `config/` as needed

## Performance Considerations

- **Concurrent Requests**: Limited to 3-5 simultaneous to avoid rate limits
- **Timeouts**: 15s basic, 30s premium scraping timeouts
- **Caching**: Implement response caching for repeated URLs
- **Resource Management**: Blocks images/CSS when possible to save bandwidth

## Migration from Existing Projects

This library extracts and consolidates patterns from the Citebots project. To migrate:

1. Replace existing scraping code with `lib/scraper.js`
2. Update analysis functions to use `lib/pageAnalyzer.js`
3. Consolidate citation parsing with `lib/citationExtractor.js`
4. Use standardized data schema for consistency

## Support

- **Documentation**: See `docs/` folder for detailed guides
- **Examples**: Check `examples/` for implementation patterns
- **Troubleshooting**: Common issues documented in `docs/troubleshooting.md`