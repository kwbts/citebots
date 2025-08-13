# LLM Analysis Implementation Patterns

This document captures the working implementation patterns for the LLM analysis components in the local-server directory (excluding brief-generator).

## 1. Project Structure

```
local-server/
├── server.js                 # Express server for queue processing
├── lib/                      # Core analysis modules
│   ├── analyzeCitation.js    # Main citation analysis orchestrator
│   ├── executeQuery.js       # LLM query execution (ChatGPT/Perplexity)
│   ├── pageAnalyzer.js       # Comprehensive page analysis
│   ├── crawlPage.js          # Web scraping with ScrapingBee
│   ├── eeatAnalyzer.js       # EEAT (Experience, Expertise, Authoritativeness, Trust) analysis
│   └── domainAuthority.js    # Domain metrics calculation
├── test-*.js                 # Test scripts for individual components
│   ├── test-citation-analysis.js
│   ├── test-crawl-page.js
│   ├── test-eeat-analyzer.js
│   ├── test-execute-query.js
│   └── test-page-analyzer.js
├── package.json
├── package-lock.json
└── .env                      # Environment configuration (not in repo)
```

### Directory Purposes
- **lib/**: Core business logic modules, each handling specific analysis tasks
- **test-*.js**: Standalone scripts for testing individual components
- **server.js**: Queue processor that orchestrates analysis for production

## 2. CLI Implementation

### Main CLI Entry Points

```javascript
// local-server/test-citation-analysis.js
// Full citation analysis test script

const url = process.argv[2];
const saveToFile = process.argv.includes('--save');

if (!url) {
  console.log('Usage: node test-citation-analysis.js <url> [--save]');
  process.exit(1);
}

// Environment validation
const requiredEnvVars = ['OPENAI_API_KEY', 'SCRAPINGBEE_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Test data structure
const testRequest = {
  citation_url: url,
  citation_position: 1,
  query_text: "What are the best practices for technical SEO in 2024?",
  keyword: "technical SEO best practices",
  brand_name: "Example Brand",
  brand_domain: "example.com",
  competitors: [
    { name: "Competitor 1", domain: "competitor1.com" },
    { name: "Competitor 2", domain: "competitor2.com" }
  ],
  options: {
    enhanced: true,
    verbose: true,
    pagespeed: false,
    moz: false
  }
};

// Run analysis
try {
  const result = await analyzeCitation(testRequest);
  console.log('\n📊 Analysis complete!');
  
  if (saveToFile) {
    const filename = `citation-analysis-${Date.now()}.json`;
    await fs.writeFile(filename, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved to ${filename}`);
  }
} catch (error) {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
}
```

```javascript
// local-server/test-execute-query.js
// LLM query execution test

const query = process.argv[2];
const llm = process.argv[3] || 'chatgpt';

if (!query) {
  console.log('Usage: node test-execute-query.js "your query" [chatgpt|perplexity]');
  console.log('Example: node test-execute-query.js "What is technical SEO?" perplexity');
  process.exit(1);
}

// Execute query with specified LLM
const result = await executeQuery({
  query_text: query,
  keyword: query,
  llm_type: llm
});

console.log(`\n✅ ${llm.toUpperCase()} Response:`);
console.log(result.content);
console.log(`\n📎 Citations found: ${result.citations.length}`);
result.citations.forEach((citation, index) => {
  console.log(`  ${index + 1}. ${citation.url}`);
});
```

### Command Registration Pattern

Commands are implemented as standalone scripts rather than a unified CLI framework:

```javascript
// Pattern for all test scripts
1. Parse command-line arguments
2. Validate required arguments
3. Check environment variables
4. Set up test data
5. Execute the specific function
6. Display results with emojis for clarity
7. Optional: Save results to file
```

## 3. Service Layer Patterns

### Main Service Module - Citation Analysis

```javascript
// local-server/lib/analyzeCitation.js
// Complete service module showing composition and error handling

const { createClient } = require('@supabase/supabase-js');
const crawlPage = require('./crawlPage');
const { 
  extractPageInfo, 
  extractTechnicalSeoData, 
  analyzeContentQuality,
  calculateBrandRelationshipScore 
} = require('./pageAnalyzer');
const analyzeEEAT = require('./eeatAnalyzer');

async function analyzeCitation(requestData) {
  console.log(`\n==========================================================`);
  console.log(`🔍 CITATION ANALYSIS: Starting analysis of ${requestData.citation_url}`);
  console.log(`📊 ANALYSIS CONTEXT: Query: "${requestData.query_text}"`);
  console.log(`🏷️ KEYWORD: "${requestData.keyword}"`);
  console.log(`==========================================================\n`);

  try {
    // Step 1: Crawl the page with retry logic
    console.log(`\n🕷️ CRAWLING: Attempting to crawl ${requestData.citation_url}...`);
    let crawlResult;
    try {
      crawlResult = await crawlPage(requestData.citation_url, {
        includePagespeed: requestData.options?.pagespeed || false
      });
    } catch (crawlError) {
      console.error(`❌ CRAWL ERROR: Failed to crawl ${requestData.citation_url}`);
      console.error(crawlError);
      
      // Return error record for database
      return {
        citation_url: requestData.citation_url,
        crawl_success: false,
        error_message: crawlError.message,
        analysis_timestamp: new Date().toISOString()
      };
    }

    // Step 2: Extract and process page data
    const { htmlContent, pagespeedData } = crawlResult;
    console.log(`✅ CRAWL SUCCESS: Retrieved ${htmlContent.length} characters of HTML`);

    // Step 3: Basic page information extraction
    console.log(`\n📄 EXTRACTING: Page information...`);
    const pageInfo = extractPageInfo(htmlContent, requestData.citation_url);
    
    // Step 4: Technical SEO analysis
    console.log(`\n🔧 ANALYZING: Technical SEO data...`);
    const technicalSeoData = extractTechnicalSeoData(htmlContent);
    
    // Step 5: AI-powered content quality analysis
    console.log(`\n🤖 AI ANALYSIS: Analyzing content quality...`);
    const contentQualityData = await analyzeContentQuality(
      htmlContent, 
      requestData.citation_url,
      requestData.query_text
    );
    
    // Step 6: Brand relationship calculation
    console.log(`\n🏢 BRAND ANALYSIS: Calculating brand relationships...`);
    const brandScore = calculateBrandRelationshipScore(
      htmlContent,
      requestData.brand_name,
      requestData.brand_domain,
      requestData.competitors || []
    );
    
    // Step 7: EEAT analysis (if enhanced mode)
    let eeatAnalysisData = null;
    if (requestData.options?.enhanced) {
      console.log(`\n🎯 EEAT ANALYSIS: Performing enhanced EEAT analysis...`);
      eeatAnalysisData = await analyzeEEAT({
        url: requestData.citation_url,
        htmlContent: htmlContent,
        queryText: requestData.query_text,
        keyword: requestData.keyword
      });
    }
    
    // Step 8: Compose final analysis record
    const pageAnalysisRecord = {
      // Basic information
      citation_url: requestData.citation_url,
      citation_position: requestData.citation_position || null,
      crawl_success: true,
      
      // Page metadata
      page_title: pageInfo.title,
      meta_description: pageInfo.metaDescription,
      
      // Technical SEO metrics
      technical_seo: {
        html_structure_score: technicalSeoData.htmlStructureScore,
        schema_markup_present: technicalSeoData.schemaMarkupPresent,
        schema_types: technicalSeoData.schemaTypes,
        mobile_friendly: technicalSeoData.mobileFriendly,
        page_load_speed: pagespeedData?.loadTime || null,
        core_web_vitals: pagespeedData?.coreWebVitals || null,
        open_graph_present: technicalSeoData.openGraphPresent,
        canonical_url: technicalSeoData.canonicalUrl,
        robots_meta: technicalSeoData.robotsMeta,
        language: technicalSeoData.language,
        ssl_present: requestData.citation_url.startsWith('https')
      },
      
      // Content quality metrics
      content_quality: {
        content_depth_score: contentQualityData.content_depth_score,
        rock_paper_scissors: contentQualityData.rock_paper_scissors,
        eeat_score: contentQualityData.eeat_score,
        listicle: contentQualityData.listicle,
        year_published: contentQualityData.year_published,
        estimated_reading_time: contentQualityData.estimated_reading_time,
        multimedia_score: contentQualityData.multimedia_score,
        internal_links: contentQualityData.internal_links,
        external_links: contentQualityData.external_links,
        content_structure_score: contentQualityData.content_structure_score
      },
      
      // Brand relationship
      brand_relationship_score: brandScore,
      
      // EEAT analysis (if available)
      eeat_analysis: eeatAnalysisData,
      
      // Metadata
      analysis_timestamp: new Date().toISOString()
    };
    
    console.log(`\n✅ ANALYSIS COMPLETE: Successfully analyzed ${requestData.citation_url}`);
    return pageAnalysisRecord;
    
  } catch (error) {
    console.error(`\n❌ ANALYSIS ERROR: Failed to analyze ${requestData.citation_url}`);
    console.error(error);
    
    return {
      citation_url: requestData.citation_url,
      crawl_success: false,
      error_message: error.message,
      analysis_timestamp: new Date().toISOString()
    };
  }
}

module.exports = analyzeCitation;
```

### Error Handling Pattern

```javascript
// local-server/lib/crawlPage.js
// Shows retry logic and progressive enhancement for web scraping

async function crawlPage(url, options = {}) {
  const maxAttempts = 5;
  let attempt = 0;
  let lastError;
  
  // Progressive enhancement strategy
  const strategies = [
    { js_render: false, premium_proxy: false },                    // Basic (cheapest)
    { js_render: true, premium_proxy: false },                     // JavaScript rendering
    { js_render: true, premium_proxy: true },                      // Premium proxy
    { js_render: true, premium_proxy: true, block_resources: false } // No blocking
  ];
  
  while (attempt < maxAttempts) {
    const strategy = strategies[Math.min(attempt, strategies.length - 1)];
    
    try {
      console.log(`🌐 Attempt ${attempt + 1}: ${JSON.stringify(strategy)}`);
      
      const response = await fetch('https://app.scrapingbee.com/api/v1/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        params: new URLSearchParams({
          api_key: process.env.SCRAPINGBEE_API_KEY,
          url: url,
          ...strategy,
          return_page_source: true,
          timeout: 30000
        })
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Detect if we need JavaScript rendering
        if (!strategy.js_render && needsJavaScriptRendering(html)) {
          console.log('🔄 JavaScript framework detected, upgrading strategy...');
          attempt++;
          continue;
        }
        
        return { htmlContent: html };
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
    }
    
    attempt++;
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
    }
  }
  
  throw lastError || new Error('Failed to crawl page after all attempts');
}

function needsJavaScriptRendering(html) {
  const jsFrameworks = [
    'react-root', '__NEXT_DATA__', 'ng-app', 'vue-app',
    'ember-application', '__nuxt', '_app', '__GATSBY'
  ];
  
  return jsFrameworks.some(framework => html.includes(framework));
}
```

## 4. Schema Definitions

### Request Schema (Implicit)

```javascript
// local-server/lib/analyzeCitation.js
// Implicit schema through object destructuring

const CitationAnalysisRequest = {
  // Required fields
  citation_url: 'string',              // URL to analyze
  query_text: 'string',                // Original search query
  keyword: 'string',                   // Target keyword
  
  // Optional fields
  citation_position: 'number',         // Position in search results
  brand_name: 'string',                // Brand to check for
  brand_domain: 'string',              // Brand's domain
  competitors: [{                      // Competitor information
    name: 'string',
    domain: 'string'
  }],
  options: {                           // Analysis options
    enhanced: 'boolean',               // Include EEAT analysis
    verbose: 'boolean',                // Detailed logging
    pagespeed: 'boolean',              // Include PageSpeed data
    moz: 'boolean'                     // Include Moz data (not implemented)
  }
};
```

### Response Schema

```javascript
// local-server/lib/analyzeCitation.js
// Page analysis record structure

const PageAnalysisRecord = {
  // Basic information
  citation_url: 'string',
  citation_position: 'number | null',
  crawl_success: 'boolean',
  error_message: 'string | null',
  
  // Page metadata
  page_title: 'string',
  meta_description: 'string',
  
  // Technical SEO object
  technical_seo: {
    html_structure_score: 'number',     // 1-10
    schema_markup_present: 'boolean',
    schema_types: 'string[]',
    mobile_friendly: 'boolean',
    page_load_speed: 'number | null',
    core_web_vitals: 'object | null',
    open_graph_present: 'boolean',
    canonical_url: 'string | null',
    robots_meta: 'string | null',
    language: 'string | null',
    ssl_present: 'boolean'
  },
  
  // Content quality object
  content_quality: {
    content_depth_score: 'number',      // 1-10
    rock_paper_scissors: 'string',      // Analysis framework result
    eeat_score: 'number',               // 1-10
    listicle: 'boolean',
    year_published: 'number | null',
    estimated_reading_time: 'number',   // minutes
    multimedia_score: 'number',         // 0-10
    internal_links: 'number',
    external_links: 'number',
    content_structure_score: 'number'   // 1-10
  },
  
  // Brand metrics
  brand_relationship_score: 'number',   // 0-100
  
  // EEAT analysis (optional)
  eeat_analysis: {
    eeat_score: 'number',               // 1-10
    experience: {
      score: 'number',
      signals: 'string[]'
    },
    expertise: {
      score: 'number',
      signals: 'string[]'
    },
    authoritativeness: {
      score: 'number',
      signals: 'string[]'
    },
    trustworthiness: {
      score: 'number',
      signals: 'string[]'
    }
  } | null,
  
  // Metadata
  analysis_timestamp: 'string'          // ISO 8601 datetime
};
```

### AI Response Schema

```javascript
// local-server/lib/pageAnalyzer.js
// Enforced through prompt engineering

const ContentQualitySchema = {
  content_depth_score: 'number',        // 1-10, comprehensiveness
  rock_paper_scissors: 'string',        // One of: Rock, Paper, Scissors, Lizard, Spock
  eeat_score: 'number',                 // 1-10, overall EEAT signals
  listicle: 'boolean',                  // Is it a list-based article?
  year_published: 'number | null',      // Extracted publication year
  estimated_reading_time: 'number',     // Minutes to read
  multimedia_score: 'number',           // 0-10, richness of media
  internal_links: 'number',             // Count of internal links
  external_links: 'number',             // Count of external links
  content_structure_score: 'number'     // 1-10, organization quality
};
```

## 5. Testing Approach

### Test Configuration

```javascript
// local-server/test-*.js files
// Common test setup pattern

require('dotenv').config();

// Environment validation
const validateEnvironment = () => {
  const required = ['OPENAI_API_KEY', 'SCRAPINGBEE_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nPlease create a .env file with:');
    missing.forEach(key => console.error(`${key}=your_${key.toLowerCase()}`));
    process.exit(1);
  }
};

validateEnvironment();
```

### Integration Test Example

```javascript
// local-server/test-citation-analysis.js
// Complete integration test with real API calls

async function runIntegrationTest() {
  console.log('🧪 Starting Citation Analysis Integration Test\n');
  
  // Test case 1: Successful analysis
  try {
    const result = await analyzeCitation({
      citation_url: 'https://www.searchenginejournal.com/technical-seo-guide/',
      query_text: 'technical SEO best practices',
      keyword: 'technical SEO',
      brand_name: 'Search Engine Journal',
      brand_domain: 'searchenginejournal.com',
      competitors: [
        { name: 'Moz', domain: 'moz.com' },
        { name: 'Ahrefs', domain: 'ahrefs.com' }
      ],
      options: { enhanced: true, verbose: true }
    });
    
    // Validate result structure
    assert(result.crawl_success === true, 'Crawl should succeed');
    assert(result.technical_seo !== undefined, 'Should have technical SEO data');
    assert(result.content_quality !== undefined, 'Should have content quality data');
    assert(typeof result.brand_relationship_score === 'number', 'Should have brand score');
    
    console.log('✅ Test case 1 passed: Successful analysis\n');
    
  } catch (error) {
    console.error('❌ Test case 1 failed:', error);
  }
  
  // Test case 2: Invalid URL handling
  try {
    const result = await analyzeCitation({
      citation_url: 'https://this-domain-definitely-does-not-exist-12345.com',
      query_text: 'test query',
      keyword: 'test'
    });
    
    assert(result.crawl_success === false, 'Crawl should fail');
    assert(result.error_message !== undefined, 'Should have error message');
    
    console.log('✅ Test case 2 passed: Invalid URL handling\n');
    
  } catch (error) {
    console.error('❌ Test case 2 failed:', error);
  }
}
```

### Service Test with Mocking

```javascript
// local-server/test-page-analyzer.js
// Testing individual service functions

const fs = require('fs').promises;

async function testWithMockData() {
  console.log('🧪 Testing Page Analyzer with mock HTML\n');
  
  // Load mock HTML
  const mockHtml = await fs.readFile('./test-data/sample-page.html', 'utf-8');
  
  // Test technical SEO extraction
  console.log('📊 Testing Technical SEO Extraction...');
  const technicalData = extractTechnicalSeoData(mockHtml);
  
  console.log('Schema Present:', technicalData.schemaMarkupPresent);
  console.log('Schema Types:', technicalData.schemaTypes);
  console.log('Mobile Friendly:', technicalData.mobileFriendly);
  console.log('HTML Structure Score:', technicalData.htmlStructureScore);
  
  // Test AI-powered analysis with mock
  console.log('\n🤖 Testing AI Content Analysis...');
  
  // Mock the OpenAI call for testing
  const originalOpenAI = global.openai;
  global.openai = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                content_depth_score: 8,
                rock_paper_scissors: "Paper",
                eeat_score: 7,
                listicle: false,
                year_published: 2024,
                estimated_reading_time: 5,
                multimedia_score: 6,
                internal_links: 15,
                external_links: 8,
                content_structure_score: 9
              })
            }
          }]
        })
      }
    }
  };
  
  const contentQuality = await analyzeContentQuality(mockHtml, 'https://example.com', 'test query');
  console.log('Content Quality:', JSON.stringify(contentQuality, null, 2));
  
  // Restore original
  global.openai = originalOpenAI;
}
```

## 6. Configuration Management

### Environment Configuration

```bash
# local-server/.env
# Complete environment configuration

# LLM APIs
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...

# Web Scraping
SCRAPINGBEE_API_KEY=...

# Optional APIs
PAGESPEED_API_KEY=...       # Google PageSpeed Insights
MOZ_ACCESS_ID=...           # Moz API (not implemented)
MOZ_SECRET_KEY=...

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Server Configuration
PORT=3001
POLL_INTERVAL=5000          # Queue polling interval (ms)
BATCH_SIZE=3                # Items to process per batch
RATE_LIMIT_DELAY=2000       # Delay between API calls (ms)

# Feature Flags
ENABLE_PAGESPEED=false      # PageSpeed API calls (quota limited)
ENABLE_MOZ=false            # Moz API integration
ENABLE_ENHANCED_EEAT=true   # Enhanced EEAT analysis
```

### Configuration Loading

```javascript
// local-server/server.js
// Configuration with defaults and validation

require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  pollInterval: parseInt(process.env.POLL_INTERVAL) || 5000,
  batchSize: parseInt(process.env.BATCH_SIZE) || 3,
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY) || 2000,
  
  features: {
    pagespeed: process.env.ENABLE_PAGESPEED === 'true',
    moz: process.env.ENABLE_MOZ === 'true',
    enhancedEeat: process.env.ENABLE_ENHANCED_EEAT !== 'false' // Default true
  },
  
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  }
};

// Validate critical configuration
if (!config.supabase.url || !config.supabase.serviceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}
```

## 7. External API Integration

### OpenAI Integration

```javascript
// local-server/lib/pageAnalyzer.js
// Standard OpenAI integration pattern

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeContentQuality(htmlContent, url, queryText) {
  // Truncate content to avoid token limits
  const truncatedContent = htmlContent.substring(0, 10000);
  
  const prompt = `Analyze this web page content for quality and relevance to the query "${queryText}".
  
  URL: ${url}
  HTML Content: ${truncatedContent}
  
  Provide your analysis as a JSON object with these exact fields:
  {
    "content_depth_score": (1-10 scale, how comprehensive/detailed),
    "rock_paper_scissors": (categorize as "Rock", "Paper", "Scissors", "Lizard", or "Spock"),
    "eeat_score": (1-10 scale for Experience, Expertise, Authoritativeness, Trust signals),
    "listicle": (true/false),
    "year_published": (number or null),
    "estimated_reading_time": (number in minutes),
    "multimedia_score": (0-10 for images, videos, infographics),
    "internal_links": (count),
    "external_links": (count),
    "content_structure_score": (1-10 for headings, sections, organization)
  }`;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content analyst. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    
    // Return default values on error
    return {
      content_depth_score: 5,
      rock_paper_scissors: "Unknown",
      eeat_score: 5,
      listicle: false,
      year_published: null,
      estimated_reading_time: 5,
      multimedia_score: 0,
      internal_links: 0,
      external_links: 0,
      content_structure_score: 5
    };
  }
}
```

### Perplexity API Integration

```javascript
// local-server/lib/executeQuery.js
// Direct fetch implementation for Perplexity

async function executePerplexityQuery(queryText) {
  const requestBody = {
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful search assistant. Always cite your sources.'
      },
      {
        role: 'user',
        content: queryText
      }
    ],
    temperature: 0.2,
    top_p: 0.9,
    return_citations: true,
    search_recency_filter: 'month'
  };
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract citations from content
    const citations = extractCitations(content);
    
    return {
      content,
      citations,
      raw_response: data
    };
    
  } catch (error) {
    console.error('❌ Perplexity API error:', error);
    throw error;
  }
}
```

### ScrapingBee Integration

```javascript
// local-server/lib/crawlPage.js
// Progressive enhancement scraping strategy

const scrapingStrategies = [
  {
    name: 'Basic HTML',
    params: {
      js_render: false,
      premium_proxy: false,
      block_resources: true
    },
    cost: 1  // API credits
  },
  {
    name: 'JavaScript Rendering',
    params: {
      js_render: true,
      premium_proxy: false,
      block_resources: true,
      wait: 2000
    },
    cost: 5
  },
  {
    name: 'Premium Proxy',
    params: {
      js_render: true,
      premium_proxy: true,
      block_resources: true,
      wait: 3000
    },
    cost: 10
  },
  {
    name: 'Full Rendering',
    params: {
      js_render: true,
      premium_proxy: true,
      block_resources: false,
      wait: 5000,
      screenshot: false
    },
    cost: 25
  }
];

async function crawlWithStrategy(url, strategy) {
  const params = new URLSearchParams({
    api_key: process.env.SCRAPINGBEE_API_KEY,
    url: url,
    ...strategy.params,
    return_page_source: true,
    timeout: 30000
  });
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ScrapingBee error (${response.status}): ${error}`);
  }
  
  return response.text();
}
```

### Rate Limiting Pattern

```javascript
// local-server/server.js
// Rate limiting for API calls

class RateLimiter {
  constructor(delayMs) {
    this.delayMs = delayMs;
    this.lastCall = 0;
  }
  
  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastCall;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCall = Date.now();
  }
}

const apiRateLimiter = new RateLimiter(2000); // 2 second minimum between calls

// Usage in processing
async function processQueueItem(item) {
  await apiRateLimiter.throttle();
  
  // Process item...
}
```

## 8. File Operations

### Reading Files Pattern

```javascript
// local-server/test-*.js
// Standard file reading pattern

const fs = require('fs').promises;
const path = require('path');

async function loadTestData(filename) {
  try {
    const filepath = path.join(__dirname, 'test-data', filename);
    const content = await fs.readFile(filepath, 'utf-8');
    console.log(`✅ Loaded test data from ${filename}`);
    return content;
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    return null;
  }
}
```

### Writing Results Pattern

```javascript
// local-server/test-*.js
// Results saving pattern

async function saveResults(data, prefix = 'results') {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `${prefix}-${timestamp}.json`;
  
  try {
    await fs.writeFile(
      filename, 
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    console.log(`💾 Results saved to ${filename}`);
    return filename;
  } catch (error) {
    console.error(`❌ Failed to save results:`, error.message);
    return null;
  }
}

// Usage
if (process.argv.includes('--save')) {
  await saveResults(analysisResult, 'citation-analysis');
}
```

### Batch Processing Pattern

```javascript
// local-server/server.js
// Batch file processing from queue

async function processBatch(items) {
  console.log(`\n📦 Processing batch of ${items.length} items...`);
  
  const results = [];
  
  for (const item of items) {
    try {
      console.log(`\n🔄 Processing item ${item.id}...`);
      
      // Update status
      await updateItemStatus(item.id, 'processing');
      
      // Process item
      const result = await processItem(item);
      results.push({ success: true, item, result });
      
      // Update with results
      await updateItemResults(item.id, result);
      
    } catch (error) {
      console.error(`❌ Failed to process item ${item.id}:`, error);
      results.push({ success: false, item, error: error.message });
      
      // Mark as failed
      await updateItemStatus(item.id, 'failed', error.message);
    }
    
    // Rate limiting between items
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}
```

## 9. Dependencies

### Package.json Dependencies

```json
{
  "name": "citebots-local-server",
  "version": "1.0.0",
  "description": "Local processing server for CiteBots LLM analysis",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-citation-analysis.js https://example.com"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.3",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "node-fetch": "^3.3.2",
    "openai": "^4.24.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Key Dependencies Explained

1. **@supabase/supabase-js** (^2.39.3)
   - Database client for PostgreSQL operations
   - Handles authentication and row-level security
   - Required for queue management and results storage

2. **openai** (^4.24.1)
   - Official OpenAI SDK for GPT-4 integration
   - Used for content quality and EEAT analysis
   - Configured for JSON response format

3. **express** (^4.18.2)
   - Web server framework for queue processor
   - Handles health checks and manual triggers
   - Minimal usage - mainly runs background processing

4. **node-fetch** (^3.3.2)
   - HTTP client for Perplexity and ScrapingBee APIs
   - ESM module - requires dynamic import
   - Used where SDK not available

5. **dotenv** (^16.3.1)
   - Environment variable management
   - Loads .env file in development
   - Critical for API key security

6. **uuid** (^9.0.1)
   - Generates unique identifiers
   - Used for creating analysis IDs
   - Ensures data integrity

### Version Constraints and Gotchas

1. **node-fetch v3**: ESM only, requires dynamic import
   ```javascript
   const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
   ```

2. **OpenAI v4**: Breaking changes from v3
   - Client instantiation changed
   - Response format different
   - Requires `response_format` for JSON

3. **Supabase v2**: Different from v1
   - Client creation syntax changed
   - New error handling patterns
   - RLS policies must be configured

4. **Node.js**: Requires v16+ for full compatibility
   - Native fetch available in v18+
   - ESM module support
   - Async/await throughout

## Summary

This patterns document captures the working implementation of the LLM analysis system. Key characteristics:

1. **Modular Architecture**: Clear separation between crawling, analysis, and AI components
2. **Progressive Enhancement**: Smart fallback strategies for web scraping
3. **Comprehensive Analysis**: Multiple analysis dimensions (technical, content, EEAT)
4. **Robust Error Handling**: Retry logic, fallbacks, and detailed logging
5. **Queue-Based Processing**: Scalable approach for long-running tasks
6. **AI Integration**: Structured prompts for consistent JSON responses
7. **Developer Experience**: Extensive logging, test scripts, and clear patterns

The system is designed for reliability and comprehensive analysis rather than speed, making it suitable for background processing of citation analysis tasks in the CiteBots platform.