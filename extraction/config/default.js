/**
 * Default Configuration for Web Scraping & AI Analysis
 * 
 * This file contains all default settings and can be customized for your project
 */

export const DEFAULT_CONFIG = {
  // ScrapingBee Settings
  scraping: {
    // Basic request settings
    render_js: false,           // Enable JavaScript rendering (costs more)
    premium_proxy: false,       // Use premium rotating proxies (costs more)
    country_code: 'us',         // Geographic location for requests
    block_resources: true,      // Block images/CSS to save bandwidth
    timeout: 15000,             // Request timeout in milliseconds
    
    // Fallback strategy
    enable_fallback: true,      // Try premium if basic fails
    max_retries: 3,             // Maximum retry attempts
    
    // Rate limiting
    requests_per_minute: 60,    // Rate limit for API calls
    
    // Content validation
    min_content_length: 500,    // Minimum HTML size to consider valid
    validate_content: true      // Validate response content
  },

  // OpenAI Settings
  openai: {
    model: 'gpt-4o-mini',       // Model for content analysis
    max_tokens: 1000,           // Maximum tokens per request
    temperature: 0.3,           // Creativity vs consistency (0-1)
    
    // Analysis settings
    enable_content_analysis: true,
    enable_eeat_analysis: true,
    enable_brand_analysis: true,
    
    // Rate limiting
    requests_per_minute: 60
  },

  // Analysis Settings
  analysis: {
    // Default scores (1-10 scale)
    default_scores: {
      content_depth: 6,
      content_uniqueness: 6,
      eeat_score: 6,
      citation_match: 6,
      html_structure: 6
    },
    
    // Content classification
    content_types: [
      'Blog Post',
      'Product Page', 
      'Landing Page',
      'Article',
      'Homepage',
      'About Page',
      'Support Page'
    ],
    
    // Rock Paper Scissors classification
    rps_types: [
      'Rock',      // Foundational/pillar content
      'Paper',     // Broad/thin content
      'Scissors',  // Opinion/review content
      'Lizard',    // Time-based content
      'Spock'      // Unique/speculative content
    ]
  },

  // Batch Processing Settings
  batch: {
    concurrency: 3,             // Number of parallel requests
    delay: 1000,                // Delay between batches (ms)
    chunk_size: 5,              // URLs per chunk
    max_batch_size: 50,         // Maximum URLs in one batch
    
    // Error handling
    continue_on_error: true,    // Continue batch if individual URLs fail
    max_failures: 0.3           // Stop if failure rate exceeds 30%
  },

  // Citation Extraction Settings
  citations: {
    // Supported platforms
    platforms: [
      'chatgpt',
      'openai', 
      'perplexity',
      'claude',
      'anthropic',
      'text'
    ],
    
    // Extraction patterns
    enable_markdown_links: true,
    enable_plain_urls: true,
    enable_numbered_citations: true,
    enable_references_section: true,
    
    // Validation
    validate_urls: true,
    deduplicate: true,
    clean_urls: true
  },

  // Brand Analysis Settings
  brand: {
    // Detection settings
    case_sensitive: false,
    match_variations: true,     // Match plurals, etc.
    check_title: true,
    check_content: true,
    
    // Scoring
    mention_weight: 1.0,
    title_weight: 2.0,
    domain_weight: 3.0
  },

  // Competitor Analysis Settings  
  competitors: {
    // Detection settings
    case_sensitive: false,
    match_variations: true,
    check_domains: true,
    
    // Analysis depth  
    sentiment_analysis: false,  // Analyze sentiment of mentions
    context_analysis: false     // Analyze context of mentions
  },

  // Technical SEO Settings
  technical_seo: {
    // Elements to check
    check_schema: true,
    check_meta_tags: true,
    check_headings: true,
    check_accessibility: true,
    check_mobile: true,
    
    // Scoring weights
    schema_weight: 2.0,
    structure_weight: 1.5,
    accessibility_weight: 1.0
  },

  // Performance Settings
  performance: {
    // PageSpeed API settings
    enable_pagespeed: false,    // Requires API key
    strategy: 'desktop',        // or 'mobile'
    categories: ['performance', 'accessibility'],
    
    // Timeout settings
    pagespeed_timeout: 30000
  },

  // Domain Authority Settings
  domain_authority: {
    // Moz API settings
    enable_moz: false,          // Requires API credentials
    
    // Default values when API not available
    default_da: 30,
    default_pa: 20,
    default_backlinks: 100
  },

  // Logging Settings
  logging: {
    level: 'info',              // debug, info, warn, error
    console_output: true,
    file_output: false,
    
    // Debug settings
    debug_crawl: false,
    debug_analysis: false,
    debug_citations: false
  },

  // Export Settings
  export: {
    // Supported formats
    formats: ['json', 'csv', 'xlsx'],
    
    // JSON settings
    pretty_json: true,
    include_raw_data: false,
    
    // CSV settings
    flatten_objects: true,
    include_headers: true
  }
};

// Environment-specific overrides
export const getConfig = (environment = 'development') => {
  const config = { ...DEFAULT_CONFIG };
  
  switch (environment) {
    case 'production':
      config.logging.level = 'warn';
      config.logging.debug_crawl = false;
      config.logging.debug_analysis = false;
      config.batch.concurrency = 5;
      config.scraping.requests_per_minute = 120;
      break;
      
    case 'testing':
      config.logging.level = 'error';
      config.batch.concurrency = 1;
      config.scraping.requests_per_minute = 10;
      config.analysis.enable_content_analysis = false;
      break;
      
    case 'development':
    default:
      config.logging.level = 'debug';
      config.logging.debug_crawl = true;
      config.logging.debug_analysis = true;
      config.batch.concurrency = 2;
      break;
  }
  
  return config;
};

// Validate configuration
export const validateConfig = (config) => {
  const errors = [];
  
  // Check required API keys based on enabled features
  if (config.analysis.enable_content_analysis && !process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY required for content analysis');
  }
  
  if (!process.env.SCRAPINGBEE_API_KEY) {
    errors.push('SCRAPINGBEE_API_KEY required for web scraping');
  }
  
  if (config.performance.enable_pagespeed && !process.env.PAGESPEED_API_KEY) {
    errors.push('PAGESPEED_API_KEY required for PageSpeed analysis');
  }
  
  if (config.domain_authority.enable_moz && 
      (!process.env.MOZ_ACCESS_ID || !process.env.MOZ_SECRET_KEY)) {
    errors.push('MOZ_ACCESS_ID and MOZ_SECRET_KEY required for domain authority');
  }
  
  // Validate numeric ranges
  if (config.batch.concurrency < 1 || config.batch.concurrency > 10) {
    errors.push('Batch concurrency must be between 1-10');
  }
  
  if (config.openai.temperature < 0 || config.openai.temperature > 1) {
    errors.push('OpenAI temperature must be between 0-1');
  }
  
  if (config.scraping.timeout < 5000 || config.scraping.timeout > 60000) {
    errors.push('Scraping timeout must be between 5-60 seconds');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Load configuration from environment variables
export const loadConfigFromEnv = () => {
  const config = { ...DEFAULT_CONFIG };
  
  // Override with environment variables
  if (process.env.SCRAPING_CONCURRENCY) {
    config.batch.concurrency = parseInt(process.env.SCRAPING_CONCURRENCY);
  }
  
  if (process.env.OPENAI_MODEL) {
    config.openai.model = process.env.OPENAI_MODEL;
  }
  
  if (process.env.SCRAPING_TIMEOUT) {
    config.scraping.timeout = parseInt(process.env.SCRAPING_TIMEOUT);
  }
  
  if (process.env.ENABLE_JS_RENDERING === 'true') {
    config.scraping.render_js = true;
  }
  
  if (process.env.ENABLE_PREMIUM_PROXY === 'true') {
    config.scraping.premium_proxy = true;
  }
  
  if (process.env.LOG_LEVEL) {
    config.logging.level = process.env.LOG_LEVEL;
  }
  
  return config;
};

export default DEFAULT_CONFIG;