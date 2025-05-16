// src/config/index.js

require('dotenv').config();

module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    assistantId: process.env.OPENAI_ASSISTANT_ID,
    model: 'gpt-4o'
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: 'sonar'
  },
  chatgpt: {
    apiKey: process.env.CHATGPT_API_KEY || process.env.OPENAI_API_KEY, // Use the same key if not specified separately
    model: 'gpt-4o', // Using gpt-4o which supports web search via tools
    search_context_size: process.env.CHATGPT_SEARCH_CONTEXT_SIZE || 'medium'
  },
  googleSearch: {
    apiKey: process.env.GOOGLE_SEARCH_API_KEY,
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID
  },
  googlePageSpeed: {
    apiKey: process.env.GOOGLE_PAGESPEED_API_KEY
  },
  moz: {
    apiKey: process.env.MOZ_API_KEY
  },
  scrapingBee: {
    apiKey: process.env.SCRAPINGBEE_API_KEY,
    jsRendering: false,
    premiumProxy: false,
    countryCode: 'us',
    device: 'desktop'
  },
  app: {
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3,
    requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000
  }
};