/**
 * Enhanced Web Scraper with ScrapingBee Integration
 * 
 * Provides comprehensive web scraping capabilities with:
 * - ScrapingBee API integration with cost optimization
 * - Intelligent fallback strategies (basic → premium → final attempt)
 * - JavaScript framework detection and rendering
 * - Error handling with detailed diagnostics
 * - URL validation and filtering
 */

import fetch from 'node-fetch';

/**
 * Configuration object for scraper
 */
const DEFAULT_CONFIG = {
  // ScrapingBee settings
  render_js: false,
  premium_proxy: false,
  country_code: 'us',
  block_resources: true,
  timeout: 15000,
  
  // Fallback settings
  enable_fallback: true,
  max_retries: 3,
  
  // Content validation
  min_content_length: 500,
  validate_content: true
};

/**
 * Normalize domain for comparison by extracting hostname and removing www prefix
 * @param {string} domainOrUrl - Domain or full URL to normalize  
 * @returns {string} - Normalized domain
 */
function normalizeDomain(domainOrUrl) {
  if (!domainOrUrl) return '';
  
  let domain = domainOrUrl.trim();
  
  // If it looks like a full URL with protocol, extract the hostname
  if (domain.includes('://')) {
    try {
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      console.warn(`Failed to parse URL: ${domainOrUrl}, attempting manual extraction`);
      
      // Remove protocol
      domain = domain.replace(/^https?:\/\//, '');
      // Remove path and query params
      domain = domain.split('/')[0].split('?')[0].split('#')[0];
    }
  }
  
  // Remove www prefix and convert to lowercase
  return domain.toLowerCase().replace(/^www\./, '');
}

/**
 * Check if URL should be skipped based on patterns
 * @param {string} url - URL to check
 * @returns {Object} - {skip: boolean, reason?: string}
 */
function shouldSkipUrl(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();

    // Skip test/local domains
    const skipDomains = ['localhost', '127.0.0.1', 'example.com', 'test.com'];
    if (skipDomains.some(skip => domain.includes(skip))) {
      return { skip: true, reason: `Test/local domain: ${domain}` };
    }

    // Skip 404 patterns
    if (path.includes('/404') || path.includes('/not-found') || path.includes('/error')) {
      return { skip: true, reason: 'Likely 404 page pattern' };
    }

    // Skip search engines (require special handling)
    const searchEngines = ['google.', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
    if (searchEngines.some(engine => domain.includes(engine))) {
      return { skip: true, reason: 'Search engine URL - requires special handling' };
    }

    // Skip file types
    const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.zip', '.doc'];
    if (skipExtensions.some(ext => path.endsWith(ext))) {
      return { skip: true, reason: 'Non-HTML file type' };
    }

    return { skip: false };
  } catch (error) {
    return { skip: true, reason: `Invalid URL format: ${error.message}` };
  }
}

/**
 * Detect if a page uses JavaScript framework and needs rendering
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {boolean} - Whether JS rendering is likely needed
 */
function detectJavascriptFramework(html, url) {
  if (!html) return false;

  // URL-based detection
  const urlLower = url.toLowerCase();
  if (urlLower.includes('vue') || urlLower.includes('react') || 
      urlLower.includes('angular') || urlLower.includes('spa')) {
    return true;
  }

  // Content-based detection
  const jsSignals = [
    // Framework markers
    'vue.js', 'react.js', 'angular.js', 'new Vue(', 'ReactDOM.render',
    // Common patterns
    '<div id="app"', '<div id="root"', 'ng-app', 'v-if', 'v-for',
    // Heavy JS usage indicators
    'window.onload', 'document.addEventListener', 'fetch(', '.appendChild'
  ];

  let signalCount = 0;
  for (const signal of jsSignals) {
    if (html.includes(signal)) {
      signalCount++;
      if (signalCount >= 3) return true;
    }
  }

  // Check for empty containers that might be filled by JS
  const emptyContainers = [
    '<div id="app"></div>',
    '<div id="root"></div>'
  ];

  return emptyContainers.some(container => html.includes(container));
}

/**
 * Count words in HTML content
 * @param {string} html - HTML content
 * @returns {number} - Word count
 */
function countWords(html) {
  if (!html) return 0;
  
  try {
    // Remove HTML tags and scripts
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.split(' ').filter(word => word.length > 0).length;
  } catch (error) {
    console.error('Error counting words:', error);
    return 0;
  }
}

/**
 * Main crawling function with intelligent fallback strategy
 * @param {string} url - URL to crawl
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} - {html, crawl_result}
 */
async function crawlPage(url, config = {}) {
  const options = { ...DEFAULT_CONFIG, ...config };
  
  console.log(`🌐 CRAWL INITIATED: ${url}`);
  console.log(`🕒 TIMESTAMP: ${new Date().toISOString()}`);

  // Check API key
  if (!process.env.SCRAPINGBEE_API_KEY) {
    throw new Error('ScrapingBee API key not configured - set SCRAPINGBEE_API_KEY environment variable');
  }

  // Pre-flight URL validation
  const skipCheck = shouldSkipUrl(url);
  if (skipCheck.skip) {
    console.log(`⏭️ SKIPPING URL: ${skipCheck.reason}`);
    throw new Error(`Skipped crawling: ${skipCheck.reason}`);
  }

  // Ensure URL is properly encoded
  let encodedUrl = url;
  try {
    const decodedUrl = decodeURIComponent(url);
    encodedUrl = encodeURI(decodedUrl);
    if (encodedUrl !== url) {
      console.log(`🔧 URL encoded: ${url} → ${encodedUrl}`);
    }
  } catch (encodeError) {
    console.warn(`URL encoding warning: ${encodeError.message}`);
  }

  // Strategy 1: Basic scraping (lowest cost)
  try {
    console.log('🔄 ATTEMPTING BASIC SCRAPING');
    
    const basicUrl = new URL('https://app.scrapingbee.com/api/v1/');
    basicUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
    basicUrl.searchParams.set('url', encodedUrl);
    basicUrl.searchParams.set('render_js', 'false');
    basicUrl.searchParams.set('premium_proxy', 'false');
    basicUrl.searchParams.set('country_code', options.country_code);
    basicUrl.searchParams.set('block_resources', 'true');
    basicUrl.searchParams.set('timeout', options.timeout.toString());

    console.log('📡 Basic request parameters:', {
      render_js: false,
      premium_proxy: false,
      block_resources: true,
      timeout: options.timeout
    });

    const startTime = Date.now();
    const basicResponse = await fetch(basicUrl.toString());
    const duration = Date.now() - startTime;
    
    console.log(`⬅️ Response: ${basicResponse.status} in ${duration}ms`);

    if (basicResponse.ok) {
      const html = await basicResponse.text();
      console.log(`📦 HTML received: ${html.length} bytes`);

      // Validate content quality
      const wordCount = countWords(html);
      console.log(`📊 Word count: ${wordCount}`);

      // Check if JS rendering might be needed
      const needsJs = detectJavascriptFramework(html, url);
      
      if (needsJs && wordCount < 50) {
        console.log('🔄 Detected JS framework with minimal content, trying JS rendering...');
        
        // Try with JS rendering
        const jsUrl = new URL('https://app.scrapingbee.com/api/v1/');
        jsUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
        jsUrl.searchParams.set('url', encodedUrl);
        jsUrl.searchParams.set('render_js', 'true');
        jsUrl.searchParams.set('premium_proxy', 'false');
        jsUrl.searchParams.set('country_code', options.country_code);
        jsUrl.searchParams.set('timeout', '30000');
        jsUrl.searchParams.set('wait_browser', 'networkidle2');

        const jsResponse = await fetch(jsUrl.toString());
        
        if (jsResponse.ok) {
          const jsHtml = await jsResponse.text();
          const jsWordCount = countWords(jsHtml);
          
          console.log(`✅ JS rendering successful: ${jsWordCount} words`);
          
          return {
            html: jsHtml,
            crawl_result: {
              status_code: jsResponse.status,
              status_text: jsResponse.statusText,
              success: true,
              method: 'js_rendering',
              html_length: jsHtml.length,
              word_count: jsWordCount,
              duration: Date.now() - startTime
            }
          };
        }
      }

      return {
        html,
        crawl_result: {
          status_code: basicResponse.status,
          status_text: basicResponse.statusText,
          success: true,
          method: 'basic',
          html_length: html.length,
          word_count: wordCount,
          duration
        }
      };
    } else {
      // Handle specific error codes
      if (basicResponse.status === 404) {
        const error = new Error('Page not found (404)');
        error.crawl_result = {
          status_code: 404,
          status_text: 'Not Found',
          success: false,
          method: 'basic',
          error_type: 'client_error'
        };
        throw error;
      }

      console.log(`❌ Basic request failed: ${basicResponse.status}`);
      throw new Error(`Basic scraping failed: ${basicResponse.status}`);
    }
  } catch (basicError) {
    console.log(`❌ Basic scraping error: ${basicError.message}`);

    // Don't try premium for 404s
    if (basicError.message.includes('404')) {
      throw basicError;
    }

    // Strategy 2: Premium scraping with JS rendering
    if (options.enable_fallback) {
      try {
        console.log('🔄 FALLING BACK TO PREMIUM SCRAPING');
        
        const premiumUrl = new URL('https://app.scrapingbee.com/api/v1/');
        premiumUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
        premiumUrl.searchParams.set('url', encodedUrl);
        premiumUrl.searchParams.set('render_js', 'true');
        premiumUrl.searchParams.set('premium_proxy', 'true');
        premiumUrl.searchParams.set('country_code', options.country_code);
        premiumUrl.searchParams.set('timeout', '30000');
        premiumUrl.searchParams.set('wait_browser', 'networkidle2');

        console.log('📡 Premium request parameters:', {
          render_js: true,
          premium_proxy: true,
          timeout: 30000
        });

        const startTime = Date.now();
        const premiumResponse = await fetch(premiumUrl.toString());
        const duration = Date.now() - startTime;

        if (premiumResponse.ok) {
          const html = await premiumResponse.text();
          const wordCount = countWords(html);
          
          console.log(`✅ Premium scraping successful: ${html.length} bytes, ${wordCount} words`);

          return {
            html,
            crawl_result: {
              status_code: premiumResponse.status,
              status_text: premiumResponse.statusText,
              success: true,
              method: 'premium',
              html_length: html.length,
              word_count: wordCount,
              duration
            }
          };
        } else {
          const errorText = await premiumResponse.text().catch(() => 'Unknown error');
          console.log(`❌ Premium request failed: ${premiumResponse.status}`);
          
          const error = new Error(`Premium scraping failed: ${premiumResponse.status}`);
          error.crawl_result = {
            status_code: premiumResponse.status,
            status_text: premiumResponse.statusText,
            success: false,
            method: 'premium',
            error_type: premiumResponse.status >= 400 && premiumResponse.status < 500 ? 'client_error' : 'server_error',
            error_details: errorText.substring(0, 200)
          };
          throw error;
        }
      } catch (premiumError) {
        console.error(`❌ All scraping methods failed: ${premiumError.message}`);
        throw new Error(`ScrapingBee failed: Basic (${basicError.message}), Premium (${premiumError.message})`);
      }
    } else {
      throw basicError;
    }
  }
}

/**
 * Batch crawl multiple URLs with rate limiting
 * @param {string[]} urls - URLs to crawl
 * @param {Object} options - Configuration options
 * @returns {Promise<Object[]>} - Array of crawl results
 */
async function batchCrawl(urls, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const concurrency = config.concurrency || 3;
  const results = [];

  console.log(`🚀 Starting batch crawl of ${urls.length} URLs with concurrency: ${concurrency}`);

  // Process URLs in chunks to avoid overwhelming the API
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    console.log(`📦 Processing chunk ${Math.floor(i/concurrency) + 1}/${Math.ceil(urls.length/concurrency)}`);

    const chunkPromises = chunk.map(async (url, index) => {
      try {
        console.log(`🔄 [${i + index + 1}/${urls.length}] Starting: ${url}`);
        const result = await crawlPage(url, config);
        console.log(`✅ [${i + index + 1}/${urls.length}] Success: ${url}`);
        return { url, success: true, ...result };
      } catch (error) {
        console.log(`❌ [${i + index + 1}/${urls.length}] Failed: ${url} - ${error.message}`);
        return { 
          url, 
          success: false, 
          error: error.message,
          crawl_result: error.crawl_result || { success: false, error_type: 'unknown' }
        };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    // Rate limiting delay between chunks
    if (i + concurrency < urls.length) {
      const delay = config.delay || 1000;
      console.log(`⏱️ Rate limiting delay: ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`🎯 Batch crawl completed: ${successCount}/${urls.length} successful`);

  return results;
}

/**
 * Extract text content from HTML
 * @param {string} html - HTML content
 * @returns {string} - Clean text content
 */
function extractTextContent(html) {
  if (!html) return '';

  try {
    // Remove scripts, styles and other non-visible content
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<!--.*?-->/gs, ' '); // Remove HTML comments

    // Replace all remaining tags with space
    content = content.replace(/<[^>]+>/g, ' ');

    // Normalize whitespace and decode entities
    content = content
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return content;
  } catch (error) {
    console.error('Error extracting text content:', error);
    return '';
  }
}

export {
  crawlPage,
  batchCrawl,
  extractTextContent,
  normalizeDomain,
  shouldSkipUrl,
  detectJavascriptFramework,
  countWords,
  DEFAULT_CONFIG
};