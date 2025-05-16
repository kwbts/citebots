# Analysis Engine Implementation

## Overview

The Analysis Engine is a core component of Citebots that manages the execution of queries across multiple LLM services and processes the results. This document outlines the implementation details of this feature.

## Architecture

### Components

1. **Query Manager**
   - Transforms keywords into natural language queries
   - Manages query queue and batching
   - Tracks execution status

2. **LLM Connector**
   - Abstracts API interactions with LLM services
   - Handles authentication and rate limiting
   - Implements retry and fallback logic

3. **Response Processor**
   - Parses raw LLM responses
   - Extracts and normalizes citations
   - Categorizes citations by type

4. **Data Persistence Layer**
   - Stores raw responses and processed data
   - Manages database interactions
   - Handles transaction integrity

5. **Progress Tracker**
   - Monitors execution progress
   - Calculates time estimates
   - Triggers notifications

## Implementation Details

### Query Generation

```javascript
// Simplified query generation logic
function generateQuery(keyword, domain, intent) {
  const queryTemplates = {
    brand: `What do you know about ${keyword} related to ${domain}?`,
    product: `What features does ${domain} offer for ${keyword}?`,
    informational: `Tell me about ${keyword} and mention relevant sources.`
  };
  
  return queryTemplates[intent] || queryTemplates.informational;
}
```

### Batch Processing

```javascript
// Simplified batch processing logic
async function processBatch(queries, llmServices) {
  const promises = [];
  
  for (const query of queries) {
    for (const service of llmServices) {
      promises.push(executeQuery(query, service));
    }
  }
  
  return Promise.allSettled(promises);
}
```

### Citation Extraction

```javascript
// Simplified citation extraction logic
function extractCitations(response, domain, competitors) {
  const allDomains = [domain, ...competitors];
  const citations = [];
  
  for (const domain of allDomains) {
    const regex = new RegExp(`(https?://(?:www\\.)?${domain}[\\w\\d\\-./]*)`, 'gi');
    let match;
    
    while ((match = regex.exec(response)) !== null) {
      citations.push({
        url: match[1],
        domain: domain,
        context: getContext(response, match.index)
      });
    }
  }
  
  return citations;
}
```

## Database Schema

### Tables

- `analysis_runs`: Tracks individual analysis execution runs
- `queries`: Stores generated queries
- `responses`: Stores raw LLM responses
- `citations`: Stores extracted citations

### Key Relationships

```sql
CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  query_count INTEGER NOT NULL,
  completed_count INTEGER DEFAULT 0
);

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_run_id UUID REFERENCES analysis_runs(id),
  keyword_id UUID REFERENCES keywords(id),
  query_text TEXT NOT NULL,
  intent TEXT NOT NULL
);

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID REFERENCES queries(id),
  llm_service TEXT NOT NULL,
  raw_response TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES responses(id),
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  context TEXT,
  is_competitor BOOLEAN NOT NULL
);
```

## API Endpoints

### Analysis Control

- `POST /api/analysis/start`: Start a new analysis run
- `GET /api/analysis/{id}/status`: Get analysis run status
- `PUT /api/analysis/{id}/pause`: Pause analysis run
- `PUT /api/analysis/{id}/resume`: Resume analysis run
- `DELETE /api/analysis/{id}/cancel`: Cancel analysis run

### Results Access

- `GET /api/analysis/{id}/results`: Get analysis results
- `GET /api/analysis/{id}/citations`: Get extracted citations
- `GET /api/analysis/{id}/summary`: Get summary statistics

## Performance Considerations

- Concurrent execution with configurable concurrency limits
- Caching of common query responses
- Batch processing for database operations
- Background processing for long-running analysis

## Error Handling

- Service-specific error recovery strategies
- Partial success handling for batch operations
- Detailed error logging for debugging
- User-friendly error messages

## Notification System

- Email notifications on completion
- Slack integration for team alerts
- In-app notifications
- Webhook support for external integrations

## Validation Status

As outlined in the [Second Validation Milestone](../../validation/second-milestone.md), the Analysis Engine has been validated for:

- Executing LLM queries
- Processing and storing responses
- Displaying results in the dashboard