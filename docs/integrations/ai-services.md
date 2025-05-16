# AI Services Integration

## Overview

Citebots integrates with multiple Large Language Model (LLM) services to perform citation analysis and generate recommendations. This document outlines the integration approaches and configurations for each service.

## Supported LLM Services

### OpenAI (ChatGPT)

- **Models Used**: GPT-4, GPT-3.5 Turbo
- **API Endpoint**: https://api.openai.com/v1/chat/completions
- **Authentication**: API Key
- **Rate Limiting**: Managed through token-bucket algorithm
- **Retry Logic**: Exponential backoff with jitter

### Anthropic (Claude)

- **Models Used**: Claude 3 Opus, Claude 3 Sonnet
- **API Endpoint**: https://api.anthropic.com/v1/messages
- **Authentication**: API Key
- **Rate Limiting**: Managed through token-bucket algorithm
- **Retry Logic**: Exponential backoff with jitter

### Google (Gemini)

- **Models Used**: Gemini Pro, Gemini Ultra
- **API Endpoint**: https://generativelanguage.googleapis.com/
- **Authentication**: API Key
- **Rate Limiting**: Managed through token-bucket algorithm
- **Retry Logic**: Exponential backoff with jitter

### Perplexity

- **Models Used**: Perplexity Online
- **API Endpoint**: https://api.perplexity.ai/
- **Authentication**: API Key
- **Rate Limiting**: Managed through token-bucket algorithm
- **Retry Logic**: Exponential backoff with jitter

## Query Execution Process

1. Natural language query is prepared based on client keywords
2. Query is sent to all selected LLM services in parallel
3. Responses are collected and parsed for citations
4. Citation data is extracted and structured
5. Results are stored in Supabase

## Rate Limiting and Throttling

- Dynamic rate limiting based on service quotas
- Queue-based approach for high-volume analysis
- Batching mechanism to optimize throughput
- Automatic scaling of concurrency based on quota availability

## Error Handling

- Service-specific error codes and handling
- Automatic retry for transient errors
- Fallback mechanisms when a service is unavailable
- Error logging and alerting

## Response Parsing

- Standardized parsing logic across all LLMs
- Citation extraction using regex and NLP techniques
- URL normalization for consistent domain tracking
- Sentiment and context analysis for citations

## Environment Variables

The following environment variables are required:

```
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
PERPLEXITY_API_KEY=your-perplexity-key
```

## Validation Status

As outlined in the [Second Validation Milestone](../validation/second-milestone.md), the AI services integration has been validated for:

- Executing simple LLM analysis
- Sending analysis data to Supabase
- Rendering results in the dashboard