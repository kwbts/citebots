/**
 * API Keys Configuration Template
 * 
 * Copy this file to api-keys.js and fill in your actual API keys
 * DO NOT commit api-keys.js to version control
 */

// Environment variables template for .env file
export const ENV_TEMPLATE = `
# Required APIs
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional APIs
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PAGESPEED_API_KEY=your_google_pagespeed_api_key_here
MOZ_ACCESS_ID=your_moz_access_id_here
MOZ_SECRET_KEY=your_moz_secret_key_here

# Configuration overrides
SCRAPING_CONCURRENCY=3
OPENAI_MODEL=gpt-4o-mini
SCRAPING_TIMEOUT=15000
LOG_LEVEL=info

# Feature flags
ENABLE_JS_RENDERING=false
ENABLE_PREMIUM_PROXY=false
ENABLE_PAGESPEED=false
ENABLE_MOZ=false
`;

// API key configuration object (alternative to environment variables)
export const API_KEYS = {
  // ScrapingBee - Web scraping service
  scrapingbee: {
    api_key: process.env.SCRAPINGBEE_API_KEY || 'your_scrapingbee_api_key_here',
    base_url: 'https://app.scrapingbee.com/api/v1/',
    docs: 'https://www.scrapingbee.com/documentation/'
  },

  // OpenAI - Content analysis and AI services
  openai: {
    api_key: process.env.OPENAI_API_KEY || 'your_openai_api_key_here', 
    base_url: 'https://api.openai.com/v1/',
    docs: 'https://platform.openai.com/docs/'
  },

  // Perplexity - Real-time web search with citations
  perplexity: {
    api_key: process.env.PERPLEXITY_API_KEY || 'your_perplexity_api_key_here',
    base_url: 'https://api.perplexity.ai/',
    docs: 'https://docs.perplexity.ai/'
  },

  // Google PageSpeed Insights - Page performance metrics
  pagespeed: {
    api_key: process.env.PAGESPEED_API_KEY || 'your_google_pagespeed_api_key_here',
    base_url: 'https://www.googleapis.com/pagespeedonline/v5/',
    docs: 'https://developers.google.com/speed/docs/insights/v5/get-started'
  },

  // Moz - Domain authority and SEO metrics
  moz: {
    access_id: process.env.MOZ_ACCESS_ID || 'your_moz_access_id_here',
    secret_key: process.env.MOZ_SECRET_KEY || 'your_moz_secret_key_here',
    base_url: 'https://lsapi.seomoz.com/v2/',
    docs: 'https://moz.com/help/links-api'
  }
};

// API usage costs and limits (for reference)
export const API_COSTS = {
  scrapingbee: {
    basic_request: 0.01,        // $0.01 per request
    js_rendering: 0.05,         // $0.05 per request with JS
    premium_proxy: 0.1,         // $0.10 per request with premium proxy
    monthly_limit: 1000,        // Free tier limit
    docs: 'https://www.scrapingbee.com/pricing/'
  },

  openai: {
    'gpt-4o-mini': {
      input: 0.00015,           // $0.00015 per 1K input tokens
      output: 0.0006,           // $0.0006 per 1K output tokens
    },
    'gpt-4': {
      input: 0.03,              // $0.03 per 1K input tokens  
      output: 0.06,             // $0.06 per 1K output tokens
    },
    docs: 'https://openai.com/pricing'
  },

  perplexity: {
    'sonar': 0.005,             // $0.005 per request
    monthly_limit: 5,           // Free tier limit (5 requests)
    docs: 'https://perplexity.ai/pricing'
  },

  pagespeed: {
    free_quota: 25000,          // 25,000 requests per day (free)
    cost_per_request: 0,        // Free for reasonable usage
    docs: 'https://developers.google.com/speed/docs/insights/v5/get-started#APIKey'
  },

  moz: {
    free_rows: 10000,           // 10,000 rows per month (free)
    paid_per_row: 0.001,        // $0.001 per row above free tier
    docs: 'https://moz.com/products/api/pricing'
  }
};

// Validation functions
export const validateApiKeys = () => {
  const results = {
    scrapingbee: !!process.env.SCRAPINGBEE_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    pagespeed: !!process.env.PAGESPEED_API_KEY,
    moz: !!(process.env.MOZ_ACCESS_ID && process.env.MOZ_SECRET_KEY)
  };

  const missing = Object.entries(results)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  return {
    all_present: missing.length === 0,
    present: Object.entries(results).filter(([key, value]) => value).map(([key]) => key),
    missing,
    required_missing: missing.filter(key => ['scrapingbee', 'openai'].includes(key))
  };
};

// Setup instructions
export const SETUP_INSTRUCTIONS = {
  scrapingbee: {
    title: 'ScrapingBee Setup',
    steps: [
      '1. Go to https://www.scrapingbee.com/',
      '2. Sign up for a free account (1000 requests/month)',
      '3. Get your API key from the dashboard',
      '4. Set SCRAPINGBEE_API_KEY environment variable'
    ],
    testing: 'Test with: curl "https://app.scrapingbee.com/api/v1/?api_key=YOUR_KEY&url=https://httpbin.org/json"'
  },

  openai: {
    title: 'OpenAI Setup',
    steps: [
      '1. Go to https://platform.openai.com/',
      '2. Create an account and add billing information',
      '3. Generate an API key in API Keys section',
      '4. Set OPENAI_API_KEY environment variable'
    ],
    testing: 'Test with: node -e "console.log(process.env.OPENAI_API_KEY ? \'Set\' : \'Missing\')"'
  },

  perplexity: {
    title: 'Perplexity Setup (Optional)',
    steps: [
      '1. Go to https://perplexity.ai/',
      '2. Sign up and go to API settings',
      '3. Generate an API key (5 free requests)',
      '4. Set PERPLEXITY_API_KEY environment variable'
    ],
    note: 'Optional - only needed for real-time web search features'
  },

  pagespeed: {
    title: 'Google PageSpeed Setup (Optional)',
    steps: [
      '1. Go to Google Cloud Console',
      '2. Create a project and enable PageSpeed Insights API',
      '3. Create credentials (API key)',
      '4. Set PAGESPEED_API_KEY environment variable'
    ],
    note: 'Optional - provides page performance metrics'
  },

  moz: {
    title: 'Moz API Setup (Optional)', 
    steps: [
      '1. Go to https://moz.com/products/api',
      '2. Sign up for Moz Pro or API access',
      '3. Get Access ID and Secret Key from account',
      '4. Set MOZ_ACCESS_ID and MOZ_SECRET_KEY'
    ],
    note: 'Optional - provides domain authority metrics'
  }
};

// Generate .env file content
export const generateEnvFile = () => {
  return ENV_TEMPLATE.trim();
};

// Check if running in development with placeholder keys
export const checkDevelopmentMode = () => {
  const placeholders = [
    'your_scrapingbee_api_key_here',
    'your_openai_api_key_here',
    'your_perplexity_api_key_here'
  ];

  const usingPlaceholders = placeholders.some(placeholder => 
    Object.values(process.env).includes(placeholder)
  );

  if (usingPlaceholders) {
    console.warn('⚠️ WARNING: Using placeholder API keys');
    console.warn('   Please set your actual API keys before running analysis');
    console.warn('   Copy config/api-keys.example.js to config/api-keys.js and update');
  }

  return usingPlaceholders;
};

export default {
  API_KEYS,
  API_COSTS,
  SETUP_INSTRUCTIONS,
  validateApiKeys,
  generateEnvFile,
  checkDevelopmentMode
};