# Citebots System Flow

## High-Level System Flow

```
┌─────────────────┐
│  User Input     │
│  - Keywords     │
│  - Brand        │
│  - Competitor   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Process Keywords│
│ Generate Intents│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute Queries │◄─────┐
│ (ChatGPT/Perplex)     │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│Extract Citations│      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Crawl Web Pages │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Analyze Content │      │
│ - Brand Mentions│      │
│ - SEO Metrics   │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│ Format Results  │      │
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│More Intents?    │──Yes─┘
└────────┬────────┘
         │No
         ▼
┌─────────────────┐
│Consolidate All  │
│Results          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Final Report    │
│ (JSON/CSV)      │
└─────────────────┘
```

## Detailed Component Flows

### 1. Keyword Processing Flow

```
Keywords Input: "construction software"
         │
         ▼
┌─────────────────────┐
│ Parse & Validate    │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Generate Intents    │
│ - Informational     │
│ - Commercial        │
│ - Transactional     │
│ - Navigational      │
│ - Local             │
│ - Educational       │
│ - Support           │
│ - Opinion           │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Format Queries      │
│ "What is the best   │
│  construction       │
│  software?"         │
└─────────┬───────────┘
         │
         ▼
    Query Array
```

### 2. Query Execution Flow

```
Query: "Best construction software for small contractors"
         │
         ▼
┌─────────────────────┐
│ Select AI Client    │
│ (ChatGPT/Perplexity)│
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Check Cache         │
│ (Avoid duplicates)  │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Execute Query       │
│ (With rate limits)  │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Parse Response      │
│ Extract Citations   │
└─────────┬───────────┘
         │
         ▼
  Citations Array
```

### 3. Web Crawling Flow

```
Citations: [url1, url2, url3]
         │
         ▼
┌─────────────────────┐
│ For Each Citation   │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Validate URL        │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐     ┌─────────────────┐
│ Try Pro Crawler     │────►│ ScrapingBee API │
│ (JavaScript render) │     └─────────────────┘
└─────────┬───────────┘
         │Fail
         ▼
┌─────────────────────┐     ┌─────────────────┐
│ Fallback to Basic   │────►│ Puppeteer Local │
│ (No JS render)      │     └─────────────────┘
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Extract Content     │
│ - Title             │
│ - Meta Description  │
│ - Body Text         │
│ - Links             │
└─────────┬───────────┘
         │
         ▼
   Crawled Content
```

### 4. Content Analysis Flow

```
Crawled Content
         │
         ▼
┌─────────────────────┐
│ Brand Analysis      │
│ - Find brand mentions│
│ - Context extraction│
│ - Sentiment scoring │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Competitor Analysis │
│ - Find mentions     │
│ - Compare presence  │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ SEO Metrics         │
│ - Domain Authority  │
│ - Content Length    │
│ - Readability       │
│ - Keyword Density   │
└─────────┬───────────┘
         │
         ▼
  Analysis Results
```

### 5. Results Consolidation Flow

```
Multiple Query Results
         │
         ▼
┌─────────────────────┐
│ Load All Results    │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Merge Citations     │
│ (Remove duplicates) │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Aggregate Metrics   │
│ - Average DA        │
│ - Total mentions    │
│ - Citation patterns │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Generate Summary    │
│ - Top citations     │
│ - Brand presence    │
│ - Recommendations   │
└─────────┬───────────┘
         │
         ▼
  Consolidated Report
```

## Rate Limiting Strategy

```
┌─────────────────────┐
│ API Request         │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Check Rate Limits   │
│ tokens/minute       │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Within Limits?      │
└─────┬───────┬───────┘
      │Yes    │No
      ▼       ▼
┌──────────┐ ┌────────────┐
│ Execute  │ │ Wait/Queue │
└──────────┘ └────────────┘
```

## Error Handling Flow

```
┌─────────────────────┐
│ Operation          │
└─────────┬───────────┘
         │
         ▼
┌─────────────────────┐
│ Try Execute         │
└─────────┬───────────┘
         │Error
         ▼
┌─────────────────────┐
│ Error Type?         │
├─────────┬───────────┤
│Rate     │Network    │Other
│Limit    │Error      │
└─┬───────┴───────┬───┘
  │               │
  ▼               ▼
┌──────────┐ ┌──────────┐
│ Retry    │ │ Log &    │
│ w/Backoff│ │ Continue │
└──────────┘ └──────────┘
```

## Data Flow Summary

```
Input Keywords
    ↓
Intent Queries (8 types)
    ↓
AI Responses (ChatGPT/Perplexity)
    ↓
Extracted Citations
    ↓
Crawled Web Content
    ↓
Brand/SEO Analysis
    ↓
Formatted Results
    ↓
Consolidated Report
```

## Key Integration Points

1. **AI Platform APIs**
   - ChatGPT (OpenAI)
   - Perplexity API
   - Rate-limited access

2. **Web Crawling Services**
   - ScrapingBee (Pro)
   - Puppeteer (Basic)
   - Fallback strategy

3. **Cache Layer**
   - Request deduplication
   - Response caching
   - TTL management

4. **File System**
   - JSON outputs
   - CSV exports
   - Log files

## Performance Considerations

1. **Parallel Processing**
   - Multiple intent queries
   - Concurrent crawling
   - Batch analysis

2. **Resource Management**
   - Memory optimization
   - Connection pooling
   - Request queuing

3. **Monitoring Points**
   - API usage tracking
   - Error rate monitoring
   - Performance metrics