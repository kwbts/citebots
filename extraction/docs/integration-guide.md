# Integration Guide

This guide shows how to integrate the Web Scraping & AI Analysis library into your project.

## Quick Integration

### 1. Copy the Library

Copy the entire `extraction/` folder to your project:

```bash
cp -r extraction/ /path/to/your/project/
```

### 2. Install Dependencies

```bash
cd extraction/
npm install
```

### 3. Set Environment Variables

Create a `.env` file:

```bash
# Required
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional
PERPLEXITY_API_KEY=your_perplexity_api_key
PAGESPEED_API_KEY=your_google_pagespeed_key
```

### 4. Basic Usage

```javascript
import { analyzePage } from './extraction/lib/pageAnalyzer.js';

const result = await analyzePage({
  citation_url: 'https://example.com',
  query_text: 'your search query',
  brand_name: 'YourBrand',
  competitors: [
    { name: 'Competitor1', domain: 'comp1.com' }
  ]
});

console.log(result);
```

## Project Structure Integration

### Option 1: Standalone Directory

Keep the extraction library as a separate module:

```
your-project/
├── src/
├── extraction/          # Copy entire folder here
│   ├── lib/
│   ├── examples/
│   └── config/
└── package.json
```

### Option 2: Integrated Structure

Integrate components into your existing structure:

```
your-project/
├── src/
│   ├── analysis/        # Move lib/ contents here
│   │   ├── pageAnalyzer.js
│   │   ├── scraper.js
│   │   └── citationExtractor.js
│   └── config/
│       └── analysis.js  # Move config/ contents here
├── examples/            # Move examples here
└── package.json
```

## Framework-Specific Integration

### Next.js Integration

#### API Route Implementation

```javascript
// pages/api/analyze-page.js
import { analyzePage } from '../../extraction/lib/pageAnalyzer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, query, brand, competitors } = req.body;
    
    const result = await analyzePage({
      citation_url: url,
      query_text: query,
      brand_name: brand,
      competitors: competitors || []
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

#### Client-Side Usage

```javascript
// pages/analysis.js
import { useState } from 'react';

export default function AnalysisPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeUrl = async (url) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          query: 'your query here',
          brand: 'YourBrand'
        })
      });
      
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => analyzeUrl('https://example.com')}>
        Analyze Page
      </button>
      {loading && <p>Analyzing...</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### Express.js Integration

```javascript
// server.js
import express from 'express';
import { analyzePage } from './extraction/lib/pageAnalyzer.js';
import { batchAnalyze } from './extraction/examples/batch-analysis.js';

const app = express();
app.use(express.json());

// Single page analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyzePage(req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch analysis endpoint
app.post('/api/analyze-batch', async (req, res) => {
  try {
    const { urls, config } = req.body;
    const result = await batchAnalyze(urls, config);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Analysis server running on port 3000');
});
```

### Nuxt.js Integration

```javascript
// server/api/analyze.post.js
import { analyzePage } from '../../extraction/lib/pageAnalyzer.js';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  try {
    const result = await analyzePage(body);
    return { success: true, result };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
});
```

## Database Integration

### Store Results in Database

```javascript
// helpers/database.js
import { analyzePage } from '../extraction/lib/pageAnalyzer.js';

export async function analyzeAndStore(url, query, brand) {
  try {
    // Run analysis
    const result = await analyzePage({
      citation_url: url,
      query_text: query,
      brand_name: brand
    });

    // Store in database
    const record = {
      url,
      query,
      brand,
      analysis_result: result,
      created_at: new Date(),
      
      // Extract key metrics for indexing
      content_score: result.content_quality?.content_depth_score,
      eeat_score: result.eeat_score,
      brand_mentioned: result.brand_mentioned,
      competitor_mentioned: result.competitor_mentioned
    };

    await db.collection('page_analyses').add(record);
    
    return { success: true, id: record.id, result };
  } catch (error) {
    console.error('Analysis and storage failed:', error);
    throw error;
  }
}
```

### Query Stored Results

```javascript
// helpers/queries.js
export async function getAnalysesByBrand(brandName) {
  return await db.collection('page_analyses')
    .where('brand', '==', brandName)
    .orderBy('created_at', 'desc')
    .get();
}

export async function getTopContentByScore(minScore = 8) {
  return await db.collection('page_analyses')
    .where('content_score', '>=', minScore)
    .orderBy('content_score', 'desc')
    .limit(10)
    .get();
}
```

## Background Job Integration

### Using Bull Queue (Redis)

```javascript
// jobs/analysisWorker.js
import Queue from 'bull';
import { analyzePage } from '../extraction/lib/pageAnalyzer.js';

const analysisQueue = new Queue('page analysis', {
  redis: { host: 'localhost', port: 6379 }
});

// Process analysis jobs
analysisQueue.process('analyze-page', async (job) => {
  const { url, query, brand, competitors } = job.data;
  
  try {
    const result = await analyzePage({
      citation_url: url,
      query_text: query,
      brand_name: brand,
      competitors
    });
    
    // Store result or send webhook
    await storeResult(job.data.id, result);
    
    return result;
  } catch (error) {
    console.error(`Analysis failed for ${url}:`, error);
    throw error;
  }
});

// Add job to queue
export function queueAnalysis(url, query, brand, competitors = []) {
  return analysisQueue.add('analyze-page', {
    url, query, brand, competitors,
    id: generateId()
  }, {
    attempts: 3,
    backoff: 'exponential',
    delay: 2000
  });
}
```

### Using Agenda (MongoDB)

```javascript
// jobs/agenda.js
import Agenda from 'agenda';
import { batchAnalyze } from '../extraction/examples/batch-analysis.js';

const agenda = new Agenda({
  db: { address: 'mongodb://localhost:27017/analysis-jobs' }
});

agenda.define('batch-analysis', async (job) => {
  const { urls, config } = job.attrs.data;
  
  try {
    const result = await batchAnalyze(urls, config);
    
    // Send results via webhook or email
    await sendResults(result);
    
    console.log(`Batch analysis completed: ${result.results.length}/${urls.length} successful`);
  } catch (error) {
    console.error('Batch analysis failed:', error);
    throw error;
  }
});

// Schedule batch analysis
export function scheduleBatchAnalysis(urls, config, when = 'now') {
  return agenda.schedule(when, 'batch-analysis', { urls, config });
}
```

## Error Handling & Monitoring

### Comprehensive Error Handling

```javascript
// helpers/errorHandler.js
import { analyzePage } from '../extraction/lib/pageAnalyzer.js';

export async function safeAnalyzePage(request) {
  const startTime = Date.now();
  
  try {
    const result = await analyzePage(request);
    
    // Log successful analysis
    console.log(`✅ Analysis completed for ${request.citation_url} in ${Date.now() - startTime}ms`);
    
    return {
      success: true,
      result,
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    // Categorize error types
    const errorType = categorizeError(error);
    
    // Log error with context
    console.error(`❌ Analysis failed for ${request.citation_url}:`, {
      error: error.message,
      type: errorType,
      duration: Date.now() - startTime,
      url: request.citation_url
    });
    
    // Send to monitoring service
    await sendErrorToMonitoring(error, request);
    
    return {
      success: false,
      error: error.message,
      errorType,
      duration: Date.now() - startTime
    };
  }
}

function categorizeError(error) {
  if (error.message.includes('ScrapingBee')) return 'scraping_error';
  if (error.message.includes('OpenAI')) return 'ai_error';
  if (error.message.includes('Invalid URL')) return 'validation_error';
  if (error.message.includes('timeout')) return 'timeout_error';
  return 'unknown_error';
}
```

### Health Check Endpoints

```javascript
// routes/health.js
import { crawlPage } from '../extraction/lib/scraper.js';
import { validateApiKeys } from '../extraction/config/api-keys.example.js';

export async function healthCheck() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  };

  try {
    // Check API keys
    const apiValidation = validateApiKeys();
    checks.checks.api_keys = {
      status: apiValidation.required_missing.length === 0 ? 'pass' : 'fail',
      missing_keys: apiValidation.required_missing
    };

    // Test scraping
    try {
      await crawlPage('https://httpbin.org/json');
      checks.checks.scraping = { status: 'pass' };
    } catch (error) {
      checks.checks.scraping = { status: 'fail', error: error.message };
    }

    // Test OpenAI
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      checks.checks.openai = { status: 'pass' };
    } catch (error) {
      checks.checks.openai = { status: 'fail', error: error.message };
    }

  } catch (error) {
    checks.status = 'unhealthy';
    checks.error = error.message;
  }

  return checks;
}
```

## Configuration Management

### Environment-Based Configuration

```javascript
// config/analysis.js
import { getConfig, validateConfig } from '../extraction/config/default.js';

const environment = process.env.NODE_ENV || 'development';
const config = getConfig(environment);

// Override with project-specific settings
config.brand.default_brand = process.env.DEFAULT_BRAND || 'YourBrand';
config.analysis.default_competitors = JSON.parse(
  process.env.DEFAULT_COMPETITORS || '[]'
);

// Validate configuration
const validation = validateConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  process.exit(1);
}

export default config;
```

### Runtime Configuration Updates

```javascript
// helpers/configManager.js
let currentConfig = getConfig();

export function updateConfig(updates) {
  currentConfig = { ...currentConfig, ...updates };
  
  const validation = validateConfig(currentConfig);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }
  
  return currentConfig;
}

export function getActiveConfig() {
  return currentConfig;
}
```

## Testing Integration

### Unit Tests Example

```javascript
// tests/analysis.test.js
import { analyzePage } from '../extraction/lib/pageAnalyzer.js';
import { extractCitations } from '../extraction/lib/citationExtractor.js';

describe('Page Analysis', () => {
  test('should analyze page successfully', async () => {
    const result = await analyzePage({
      citation_url: 'https://httpbin.org/json',
      query_text: 'test query',
      brand_name: 'TestBrand'
    });

    expect(result).toHaveProperty('citation_url');
    expect(result).toHaveProperty('content_quality');
    expect(result.domain_name).toBe('httpbin.org');
  });

  test('should extract citations from ChatGPT response', () => {
    const response = {
      choices: [{
        message: {
          content: 'Here are some links: https://example.com and https://test.com'
        }
      }]
    };

    const citations = extractCitations(response, 'chatgpt');
    expect(citations).toHaveLength(2);
    expect(citations[0]).toHaveProperty('url');
    expect(citations[0]).toHaveProperty('domain');
  });
});
```

## Performance Optimization

### Caching Results

```javascript
// helpers/cache.js
const cache = new Map();

export async function getCachedAnalysis(url, ttl = 3600000) { // 1 hour TTL
  const key = `analysis:${url}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`📦 Cache hit for ${url}`);
    return cached.result;
  }
  
  // Run analysis
  const result = await analyzePage({ citation_url: url });
  
  // Cache result
  cache.set(key, {
    result,
    timestamp: Date.now()
  });
  
  console.log(`💾 Cached analysis for ${url}`);
  return result;
}
```

### Connection Pooling

```javascript
// helpers/pool.js
import { RateLimiter } from '../extraction/lib/utils.js';

// Create rate limiter for ScrapingBee
const scrapingLimiter = new RateLimiter(60, 60000); // 60 requests/minute

// Create rate limiter for OpenAI
const openaiLimiter = new RateLimiter(60, 60000);

export { scrapingLimiter, openaiLimiter };
```

This integration guide provides comprehensive examples for integrating the extraction library into various project types and frameworks. Choose the approach that best fits your architecture and requirements.