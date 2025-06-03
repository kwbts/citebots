/**
 * Enhanced ScrapingBee crawler with detailed logging and error handling
 * Provides comprehensive diagnostics for troubleshooting web crawling issues
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Function to detect URL type and determine if we should skip crawling
 * @param {string} url - URL to check
 * @returns {Object} - Skip decision and reason
 */
function shouldSkipUrl(url) {
  console.log(`\n🔎 URL PRE-CHECK: Analyzing URL ${url}`);

  try {
    const urlObj = new URL(url);
    console.log(`🔍 URL ANALYSIS: Protocol: ${urlObj.protocol}, Domain: ${urlObj.hostname}, Path: ${urlObj.pathname}`);

    // Skip obvious 404 patterns
    const path = urlObj.pathname.toLowerCase();
    if (path.includes('/404') || path.includes('/not-found') || path.includes('/error')) {
      console.log(`⚠️ URL CHECK: Detected likely 404 pattern in path: ${path}`);
      return { skip: true, reason: 'Likely 404 page' };
    }

    // Skip Google search URLs unless specifically needed
    if (urlObj.hostname.includes('google.') && urlObj.pathname.includes('/search')) {
      console.log(`⚠️ URL CHECK: Google search URL detected: ${urlObj.hostname}${urlObj.pathname}`);
      return { skip: true, reason: 'Google search URL - requires custom_google parameter and high cost' };
    }

    // Skip other search engines that are likely to be blocked
    const searchEngines = ['bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.com'];
    if (searchEngines.some(engine => urlObj.hostname.includes(engine))) {
      const matchedEngine = searchEngines.find(engine => urlObj.hostname.includes(engine));
      console.log(`⚠️ URL CHECK: Search engine URL detected: ${matchedEngine}`);
      return { skip: true, reason: `Search engine URL (${matchedEngine}) - likely blocked or irrelevant` };
    }

    // Skip PDF files
    if (path.endsWith('.pdf')) {
      console.log(`⚠️ URL CHECK: PDF file detected: ${path}`);
      return { skip: true, reason: 'PDF file - requires special handling' };
    }

    // Skip other file types
    const skipExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mp3', '.wav', '.zip', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    if (skipExtensions.some(ext => path.endsWith(ext))) {
      const matchedExt = skipExtensions.find(ext => path.endsWith(ext));
      console.log(`⚠️ URL CHECK: Media/document file detected: ${matchedExt}`);
      return { skip: true, reason: `File type (${matchedExt}) - not HTML content` };
    }

    console.log(`✅ URL CHECK: URL passed all pre-checks`);
    return { skip: false };
  } catch (e) {
    console.log(`❌ URL ERROR: ${e.message}`);
    return { skip: true, reason: `Invalid URL format: ${e.message}` };
  }
}

/**
 * Function to extract text content from HTML
 * @param {string} html - HTML content
 * @returns {string} - Text content
 */
function extractTextContent(html) {
  console.log(`\n📄 TEXT EXTRACTION: Starting text extraction from HTML`);

  if (!html) {
    console.log(`❌ EXTRACTION ERROR: Empty HTML provided`);
    return '';
  }

  try {
    // Load HTML with cheerio
    const $ = cheerio.load(html);
    console.log(`✅ CHEERIO: HTML loaded successfully`);

    // Remove scripts, styles, and non-content elements
    $('script, style, iframe, noscript').remove();
    console.log(`🧹 CLEANUP: Removed script, style, iframe, and noscript tags`);

    // Extract text from body
    const bodyText = $('body').text();

    // Clean up whitespace
    const cleanText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    console.log(`📏 EXTRACTION COMPLETE: Extracted ${cleanText.length} characters of text`);

    // Show a preview of the text
    if (cleanText.length > 0) {
      const previewLength = Math.min(cleanText.length, 200);
      console.log(`📝 TEXT PREVIEW: ${cleanText.substring(0, previewLength)}...`);
    } else {
      console.log(`⚠️ EXTRACTION WARNING: No text content extracted`);
    }

    return cleanText;
  } catch (error) {
    console.error(`❌ EXTRACTION ERROR: ${error.message}`);
    return '';
  }
}

/**
 * Function to crawl a page using ScrapingBee with intelligent fallback strategy
 * Enhanced with detailed logging for diagnostic purposes
 * @param {string} url - URL to crawl
 * @returns {Object} - HTML content and metadata about the crawl
 */
export async function crawlPage(url) {
  console.log(`\n🌐 CRAWL INITIATED: ${url}`);
  console.log(`🕒 TIMESTAMP: ${new Date().toISOString()}`);

  // Check API key
  if (!process.env.SCRAPINGBEE_API_KEY) {
    console.log('⚠️ CONFIGURATION ERROR: ScrapingBee API key not found in environment variables');
    console.log('📝 RESOLUTION: Please set SCRAPINGBEE_API_KEY in your .env file');
    throw new Error('ScrapingBee API key not configured');
  }

  // Pre-flight check to avoid costly requests
  const skipCheck = shouldSkipUrl(url);
  if (skipCheck.skip) {
    console.log(`⏭️ SKIPPING URL: ${skipCheck.reason}`);
    throw new Error(`Skipped crawling: ${skipCheck.reason}`);
  }

  // Try basic scraper first (lowest cost)
  try {
    console.log('\n🔄 ATTEMPTING BASIC SCRAPING: Using low-cost ScrapingBee configuration');

    // Configure basic ScrapingBee request
    const basicUrl = new URL('https://app.scrapingbee.com/api/v1/');
    basicUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
    basicUrl.searchParams.set('url', url);
    basicUrl.searchParams.set('render_js', 'false');
    basicUrl.searchParams.set('premium_proxy', 'false');
    basicUrl.searchParams.set('country_code', 'us');
    basicUrl.searchParams.set('block_resources', 'true'); // Block images/CSS to save bandwidth
    basicUrl.searchParams.set('timeout', '15000'); // 15 second timeout

    console.log(`📡 SCRAPINGBEE BASIC REQUEST PARAMETERS:`);
    console.log(`  - URL: ${url}`);
    console.log(`  - Render JS: false (static HTML only)`);
    console.log(`  - Premium proxy: false (standard proxies)`);
    console.log(`  - Country: US`);
    console.log(`  - Block resources: true (saving bandwidth)`);
    console.log(`  - Timeout: 15000ms (15 seconds)`);

    console.log(`🔄 SENDING BASIC REQUEST TO SCRAPINGBEE API...`);
    const requestStartTime = Date.now();
    const basicResponse = await fetch(basicUrl.toString());
    const requestDuration = Date.now() - requestStartTime;
    console.log(`⬅️ RECEIVED RESPONSE: Status ${basicResponse.status} in ${requestDuration}ms`);

    // Log response headers for debugging
    console.log(`📋 RESPONSE HEADERS:`);
    basicResponse.headers.forEach((value, name) => {
      console.log(`  - ${name}: ${value}`);
    });

    if (basicResponse.ok) {
      console.log('✅ BASIC REQUEST SUCCEEDED: Reading response body');
      const responseStartTime = Date.now();
      const html = await basicResponse.text();
      const responseDuration = Date.now() - responseStartTime;
      console.log(`📦 RECEIVED HTML: ${html.length} bytes in ${responseDuration}ms`);

      // Quick validation of response
      if (html.length < 500) {
        console.log('⚠️ WARNING: Very small HTML response received (< 500 bytes)');
        console.log(`📄 FULL RESPONSE: ${html}`);
      }

      if (html.includes('404') || html.includes('Not Found')) {
        console.log('⚠️ WARNING: Response may be an error page, contains 404 or "Not Found" text');
      }

      // Display a small HTML preview for debugging
      const previewLength = Math.min(html.length, 200);
      console.log(`📄 HTML PREVIEW: ${html.substring(0, previewLength)}...`);

      // Check for common error patterns in the HTML
      if (html.includes('captcha') || html.includes('CAPTCHA')) {
        console.log('⚠️ WARNING: CAPTCHA detected in response');
      }

      if (html.includes('security check') || html.includes('Cloudflare')) {
        console.log('⚠️ WARNING: Security check or Cloudflare challenge detected');
      }

      // Extract text content for validation
      const textContent = extractTextContent(html);

      // Return HTML with additional metadata
      return {
        html,
        success: true,
        statusCode: basicResponse.status,
        source: 'basic',
        size: html.length,
        textContent,
        duration: requestDuration + responseDuration
      };
    } else {
      console.log(`❌ BASIC REQUEST FAILED: Status ${basicResponse.status}`);

      // Get error details if available
      let errorText = '';
      try {
        errorText = await basicResponse.text();
        console.log(`📄 ERROR DETAILS: ${errorText.substring(0, 200)}...`);
      } catch (textError) {
        console.log(`❓ ERROR DETAILS UNAVAILABLE: ${textError.message}`);
      }

      // Check if it's worth trying premium
      if (basicResponse.status === 404) {
        console.log('⛔ STOPPING: 404 Not Found, skipping premium attempt');
        throw new Error('Page not found (404) - skipping premium attempt');
      }

      if (basicResponse.status === 403) {
        console.log('🔒 CLOUDFLARE DETECTED: 403 Forbidden, will try premium with JS');
      }

      throw new Error(`Basic ScrapingBee failed: ${basicResponse.status}`);
    }
  } catch (basicError) {
    // Only try premium for specific error types
    const errorMessage = basicError.message.toLowerCase();
    console.log(`❌ BASIC SCRAPING ERROR: ${basicError.message}`);

    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      console.log('⛔ NOT FOUND: Not attempting expensive premium crawl for 404 error');
      throw new Error(`ScrapingBee failed: ${basicError.message}`);
    }

    console.log('\n🔄 FALLING BACK TO PREMIUM: Basic scrape failed, attempting premium configuration');

    // Fallback to premium with stealth capabilities (higher cost - use selectively)
    try {
      console.log('🔄 CONFIGURING PREMIUM REQUEST: Using JS rendering and premium proxies');

      const premiumUrl = new URL('https://app.scrapingbee.com/api/v1/');
      premiumUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
      premiumUrl.searchParams.set('url', url);
      premiumUrl.searchParams.set('render_js', 'true'); // JS rendering for dynamic content
      premiumUrl.searchParams.set('premium_proxy', 'true'); // Premium rotating proxies
      premiumUrl.searchParams.set('country_code', 'us');
      premiumUrl.searchParams.set('block_resources', 'true'); // Still block unnecessary resources
      premiumUrl.searchParams.set('timeout', '20000'); // Slightly longer timeout for JS
      premiumUrl.searchParams.set('wait_browser', 'networkidle2'); // Wait for page to fully load

      console.log(`📡 SCRAPINGBEE PREMIUM REQUEST PARAMETERS:`);
      console.log(`  - URL: ${url}`);
      console.log(`  - Render JS: true (full JavaScript rendering)`);
      console.log(`  - Premium proxy: true (high-quality rotating proxies)`);
      console.log(`  - Country: US`);
      console.log(`  - Block resources: true (saving bandwidth)`);
      console.log(`  - Timeout: 20000ms (20 seconds)`);
      console.log(`  - Wait browser: networkidle2 (wait for network to be idle)`);

      console.log('🔄 SENDING PREMIUM REQUEST TO SCRAPINGBEE API...');
      const requestStartTime = Date.now();
      const premiumResponse = await fetch(premiumUrl.toString());
      const requestDuration = Date.now() - requestStartTime;
      console.log(`⬅️ RECEIVED PREMIUM RESPONSE: Status ${premiumResponse.status} in ${requestDuration}ms`);

      // Log response headers for debugging
      console.log(`📋 PREMIUM RESPONSE HEADERS:`);
      premiumResponse.headers.forEach((value, name) => {
        console.log(`  - ${name}: ${value}`);
      });

      if (!premiumResponse.ok) {
        let errorText = '';
        try {
          errorText = await premiumResponse.text();
          console.log(`📄 PREMIUM ERROR DETAILS: ${errorText.substring(0, 200)}...`);
        } catch (e) {
          errorText = 'Unknown error';
        }

        // Parse specific error types
        if (errorText.includes('403') && errorText.includes('Cloudflare')) {
          console.log('🛡️ PROTECTION DETECTED: Cloudflare is actively blocking scrapers');
          throw new Error('Cloudflare protection detected - site actively blocking scrapers');
        }

        throw new Error(`Premium ScrapingBee error: ${premiumResponse.status} ${premiumResponse.statusText} - ${errorText}`);
      }

      console.log('✅ PREMIUM REQUEST SUCCEEDED: Reading response body');
      const responseStartTime = Date.now();
      const html = await premiumResponse.text();
      const responseDuration = Date.now() - responseStartTime;
      console.log(`📦 RECEIVED HTML: ${html.length} bytes in ${responseDuration}ms`);

      // Display a small HTML preview for debugging
      const previewLength = Math.min(html.length, 200);
      console.log(`📄 HTML PREVIEW: ${html.substring(0, previewLength)}...`);

      // Check for common error patterns in the HTML
      if (html.includes('captcha') || html.includes('CAPTCHA')) {
        console.log('⚠️ WARNING: CAPTCHA detected in response even with premium');
      }

      // Extract text content for validation
      const textContent = extractTextContent(html);

      // Return HTML with additional metadata
      return {
        html,
        success: true,
        statusCode: premiumResponse.status,
        source: 'premium',
        size: html.length,
        textContent,
        duration: requestDuration + responseDuration
      };
    } catch (premiumError) {
      console.error(`❌ BOTH SCRAPING METHODS FAILED: ${premiumError.message}`);
      console.log(`📝 COMPLETE ERROR CHAIN:
        1. Basic error: ${basicError.message}
        2. Premium error: ${premiumError.message}
      `);
      throw new Error(`ScrapingBee failed (basic: ${basicError.message}, premium: ${premiumError.message})`);
    }
  }
}