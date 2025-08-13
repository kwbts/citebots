const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');

/**
 * Cleans and validates URLs before scraping
 * @param {string} url - The URL to clean
 * @returns {string|null} - The cleaned URL or null if invalid
 */
function cleanAndValidateUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove citation markers like [1], [2], etc. from URLs
  let cleanedUrl = url.replace(/\[\d+\]$/, '');
  
  // Remove any trailing spaces or newlines
  cleanedUrl = cleanedUrl.trim();
  
  // Check if it's a valid URL
  try {
    const urlObj = new URL(cleanedUrl);
    
    // Filter out problematic URL patterns
    const problematicPatterns = [
      /facebook\.com/i,
      /twitter\.com/i,
      /linkedin\.com/i,
      /instagram\.com/i,
      /youtube\.com/i,
      /tiktok\.com/i,
      /pinterest\.com/i,
      /reddit\.com/i
    ];
    
    // Check if URL matches any problematic patterns
    if (problematicPatterns.some(pattern => pattern.test(cleanedUrl))) {
      logger.debug('Filtering out social media URL', { url: cleanedUrl });
      return null;
    }
    
    // Ensure it's HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return cleanedUrl;
  } catch (error) {
    logger.debug('Invalid URL format', { url: cleanedUrl, error: error.message });
    return null;
  }
}

/**
 * Scrapes content from a list of URLs
 * @param {Array<string>} urls - The URLs to scrape
 * @returns {Promise<Array<Object>>} - The scraped content
 */
async function scrapeUrls(urls) {
  logger.info('Starting content scraping', { urlCount: urls.length });
  const results = [];

  // Check if ScrapingBee API key is available
  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;
  const useScrapingBee = !!scrapingBeeApiKey;

  if (!scrapingBeeApiKey) {
    logger.warn('ScrapingBee API key not found, will attempt direct scraping');
  }

  // List of problematic domains to avoid entirely or handle specially
  const BLOCKED_DOMAINS = [
    'statista.com',  // Known to have strong anti-scraping measures
    'statistaplus.com',
    'researchandmarkets.com',
    'marketingprofs.com'
  ];

  // Clean and filter URLs
  const filteredUrls = [];
  const skippedUrls = [];
  let socialMediaFiltered = 0;
  let invalidUrls = 0;

  urls.forEach(url => {
    // First clean and validate the URL
    const cleanedUrl = cleanAndValidateUrl(url);
    
    if (!cleanedUrl) {
      if (url && /facebook\.com|twitter\.com|linkedin\.com|instagram\.com/i.test(url)) {
        socialMediaFiltered++;
        logger.debug('Filtered social media URL', { originalUrl: url });
      } else {
        invalidUrls++;
        logger.debug('Invalid URL filtered', { originalUrl: url });
      }
      return;
    }

    try {
      const domain = new URL(cleanedUrl).hostname;
      // Check if this URL is from a blocked domain
      if (BLOCKED_DOMAINS.some(blockedDomain => domain.includes(blockedDomain))) {
        skippedUrls.push({
          url: cleanedUrl,
          title: `Skipped ${domain} Content`,
          text: `This content was skipped because ${domain} is known to have anti-scraping measures or requires authentication.`,
          headings: [],
          metadata: {
            domain: domain,
            reason: 'domain_blocked',
            skipped: true
          },
          scrapedAt: new Date().toISOString(),
          method: 'skipped'
        });
      } else {
        filteredUrls.push(cleanedUrl);
      }
    } catch (e) {
      // If URL parsing fails, skip this URL
      skippedUrls.push({
        url,
        title: 'Invalid URL',
        text: 'This URL could not be parsed.',
        headings: [],
        metadata: {
          error: e.message,
          reason: 'invalid_url',
          skipped: true
        },
        scrapedAt: new Date().toISOString(),
        method: 'skipped'
      });
    }
  });

  // Log filtering results
  logger.info('URL filtering completed', {
    originalCount: urls.length,
    validUrls: filteredUrls.length,
    blockedDomains: skippedUrls.length,
    socialMediaFiltered,
    invalidUrls,
    totalFiltered: urls.length - filteredUrls.length
  });

  // Add skipped URLs to results
  if (skippedUrls.length > 0) {
    logger.info(`Skipping ${skippedUrls.length} URLs from blocked domains`, {
      skippedDomains: skippedUrls.map(item => new URL(item.url).hostname)
    });
    results.push(...skippedUrls);
  }

  logger.debug(`Using ${useScrapingBee ? 'ScrapingBee' : 'direct'} scraping method for ${filteredUrls.length} URLs`);
  
  // Process URLs in smaller batches to reduce load on APIs
  const batchSize = 3; // Reduced from 5 to 3
  for (let i = 0; i < filteredUrls.length; i += batchSize) {
    const batch = filteredUrls.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map(url => {
      return useScrapingBee
        ? scrapeWithScrapingBee(url, scrapingBeeApiKey)
        : scrapeDirectly(url);
    });

    // Wait for batch to complete
    const batchResults = await Promise.allSettled(batchPromises);

    // Process results - always collect something for each URL
    batchResults.forEach((result, index) => {
      const url = batch[index];

      if (result.status === 'fulfilled' && result.value) {
        // Add the result to our collection
        results.push(result.value);
      } else {
        // If the promise rejected (which shouldn't happen now with our error handling)
        // Create a minimal result object to ensure we have data for this URL
        logger.warn('Unexpected scraping failure for URL', {
          url,
          error: result.reason?.message || 'Unknown error'
        });

        // Create a placeholder result
        results.push({
          url,
          title: url.split('/').pop() || 'Failed Page',
          text: 'Could not retrieve content for this page.',
          headings: [],
          metadata: {
            domain: new URL(url).hostname,
            error: result.reason?.message || 'Unknown error'
          },
          scrapedAt: new Date().toISOString(),
          method: 'error-fallback'
        });
      }
    });

    // Add a larger delay between batches to avoid rate limiting
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 4000)); // Increased to 4000ms for more breathing room
    }
  }
  
  logger.info('Completed content scraping', { 
    successCount: results.length,
    failureCount: urls.length - results.length
  });
  
  return results;
}

/**
 * Scrapes a URL using ScrapingBee
 * @param {string} url - The URL to scrape
 * @param {string} apiKey - The ScrapingBee API key
 * @returns {Promise<Object>} - The scraped content
 */
async function scrapeWithScrapingBee(url, apiKey) {
  const startTime = Date.now();

  // Determine domain for domain-specific settings
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    // If URL is invalid, we'll use default settings
  }

  // Adjust timeout and settings based on domain
  // Some domains are known to be slow or problematic
  let timeout = 30000; // Increased to 30 seconds for more breathing room
  let renderJs = false; // Default no JS rendering
  let premiumProxy = false; // Default no premium proxy

  // Domains that are slow but we still want to try to scrape
  if (domain.includes('reddit.com')) {
    timeout = 20000; // More time for Reddit
    renderJs = true; // Reddit requires JS rendering
  } else if (domain.includes('youtube.com')) {
    timeout = 25000; // More time for YouTube
    renderJs = true;
  } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
    timeout = 25000; // More time for Twitter/X
    renderJs = true;
  } else if (domain.includes('facebook.com')) {
    timeout = 20000; // More time for Facebook
    premiumProxy = true;
  } else if (domain.includes('pdf') || url.includes('.pdf')) {
    timeout = 45000; // Much more time for PDF processing
    renderJs = true;
  }

  logger.debug('Scraping with ScrapingBee', { url, domain, timeout, renderJs });

  try {
    // Configure ScrapingBee request
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodedUrl}&render_js=${renderJs}&premium_proxy=${premiumProxy}&extract_rules={"content":"body"}&wait_browser=domcontentloaded`;

    // Send request to ScrapingBee - note we've changed wait_browser to domcontentloaded instead of load
    const response = await axios.get(apiUrl, {
      timeout: timeout, // Domain-specific timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max response size
      // Handle HTTP errors as resolved promises instead of exceptions
      validateStatus: function (status) {
        // Accept any status code to avoid throwing errors
        return true;
      }
    });

    // Handle error status codes gracefully
    if (response.status === 404) {
      logger.warn('Page not found (404)', { url });
      return {
        url,
        title: 'Page Not Found',
        text: 'This page returned a 404 Not Found error.',
        headings: [],
        metadata: { domain: new URL(url).hostname, status: 404 },
        scrapedAt: new Date().toISOString(),
        method: 'scrapingbee-error',
        error: 'Page not found (404)'
      };
    }

    if (response.status === 403) {
      logger.warn('Access forbidden (403)', { url });
      return {
        url,
        title: 'Access Forbidden',
        text: 'This page returned a 403 Forbidden error. Access may be restricted or require authentication.',
        headings: [],
        metadata: { domain: new URL(url).hostname, status: response.status },
        scrapedAt: new Date().toISOString(),
        method: 'scrapingbee-error',
        error: 'Access forbidden (403)'
      };
    }

    if (response.status === 500 || response.status >= 502) {
      logger.warn(`Server error (${response.status})`, { url });
      return {
        url,
        title: 'Server Error',
        text: `This page returned a ${response.status} Server Error.`,
        headings: [],
        metadata: { domain: new URL(url).hostname, status: response.status },
        scrapedAt: new Date().toISOString(),
        method: 'scrapingbee-error',
        error: `Server error (${response.status})`
      };
    }

    if (response.status !== 200) {
      logger.warn(`Unexpected response status: ${response.status}`, { url });
      // For other error codes, still try to extract content if we have a response body
      if (!response.data || !response.data.content) {
        throw new Error(`Invalid response from ScrapingBee: status ${response.status}`);
      }
    }

    // Check if we got valid data
    if (!response.data || !response.data.content) {
      logger.warn('Empty or invalid content returned', { url });
      return {
        url,
        title: url.split('/').pop() || 'Unknown Page',
        text: 'No content could be extracted from this page.',
        headings: [],
        metadata: { domain: new URL(url).hostname },
        scrapedAt: new Date().toISOString(),
        method: 'scrapingbee-empty'
      };
    }

    // Extract content
    const content = response.data.content;
    const { title, text, headings, metadata } = extractContentFromHtml(content, url);

    logger.debug('Successfully scraped with ScrapingBee', {
      url,
      responseTime: Date.now() - startTime,
      contentLength: content.length,
      textLength: text.length,
      headingsCount: headings.length
    });

    return {
      url,
      title,
      text,
      headings,
      metadata,
      scrapedAt: new Date().toISOString(),
      method: 'scrapingbee'
    };

  } catch (error) {
    logger.warn('Error scraping with ScrapingBee', {
      url,
      error: error.message
    });

    // Return an empty result with error information instead of trying a fallback
    // This avoids unnecessary retries and fallbacks
    return {
      url,
      title: url.split('/').pop() || 'Error Page',
      text: `Could not scrape this page: ${error.message}`,
      headings: [],
      metadata: {
        domain: new URL(url).hostname,
        error: error.message,
        errorType: error.name
      },
      scrapedAt: new Date().toISOString(),
      method: 'scrapingbee-error'
    };
  }
}

/**
 * Scrapes a URL directly (fallback method)
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} - The scraped content
 */
async function scrapeDirectly(url) {
  const startTime = Date.now();
  logger.debug('Scraping directly', { url });

  try {
    // Send request to URL
    const response = await axios.get(url, {
      timeout: 25000, // Increased to 25 second timeout for direct scraping
      maxContentLength: 10 * 1024 * 1024, // 10MB max response size
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      // Handle HTTP errors as resolved promises instead of exceptions
      validateStatus: function (status) {
        // Accept any status code to avoid throwing errors
        return true;
      }
    });

    // Handle error status codes gracefully
    if (response.status === 404) {
      logger.warn('Page not found (404)', { url });
      return {
        url,
        title: 'Page Not Found',
        text: 'This page returned a 404 Not Found error.',
        headings: [],
        metadata: { domain: new URL(url).hostname, status: 404 },
        scrapedAt: new Date().toISOString(),
        method: 'direct-error',
        error: 'Page not found (404)'
      };
    }

    if (response.status === 403) {
      logger.warn('Access forbidden (403)', { url });
      return {
        url,
        title: 'Access Forbidden',
        text: 'This page returned a 403 Forbidden error. Access may be restricted or require authentication.',
        headings: [],
        metadata: { domain: new URL(url).hostname, status: response.status },
        scrapedAt: new Date().toISOString(),
        method: 'direct-error',
        error: 'Access forbidden (403)'
      };
    }

    if (response.status === 500 || response.status >= 502) {
      logger.warn(`Server error (${response.status})`, { url });
      return {
        url,
        title: 'Server Error',
        text: `This page returned a ${response.status} Server Error.`,
        headings: [],
        metadata: { domain: new URL(url).hostname, status: response.status },
        scrapedAt: new Date().toISOString(),
        method: 'direct-error',
        error: `Server error (${response.status})`
      };
    }

    if (response.status !== 200) {
      logger.warn(`Unexpected response status: ${response.status}`, { url });
      return {
        url,
        title: `HTTP Error ${response.status}`,
        text: `This page returned an HTTP ${response.status} error.`,
        headings: [],
        metadata: { domain: new URL(url).hostname, status: response.status },
        scrapedAt: new Date().toISOString(),
        method: 'direct-error',
        error: `HTTP error (${response.status})`
      };
    }

    // Extract content
    const { title, text, headings, metadata } = extractContentFromHtml(response.data, url);

    logger.debug('Successfully scraped directly', {
      url,
      responseTime: Date.now() - startTime,
      contentLength: response.data.length,
      textLength: text.length,
      headingsCount: headings.length
    });

    return {
      url,
      title,
      text,
      headings,
      metadata,
      scrapedAt: new Date().toISOString(),
      method: 'direct'
    };

  } catch (error) {
    logger.warn('Error scraping directly', {
      url,
      error: error.message
    });

    // Return a structured error result instead of null
    return {
      url,
      title: url.split('/').pop() || 'Error Page',
      text: `Could not scrape this page: ${error.message}`,
      headings: [],
      metadata: {
        domain: new URL(url).hostname,
        error: error.message,
        errorType: error.name
      },
      scrapedAt: new Date().toISOString(),
      method: 'direct-error'
    };
  }
}

/**
 * Extracts structured content from HTML
 * @param {string} html - The HTML content
 * @param {string} url - The URL of the content
 * @returns {Object} - The extracted content
 */
function extractContentFromHtml(html, url) {
  try {
    // Parse HTML with Cheerio (no CSS parsing issues like JSDOM)
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text() || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('h1').first().text() || 
                  url.split('/').pop() || 
                  'Untitled Document';
    
    // Extract metadata
    const metadata = {
      description: $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      publishDate: $('meta[property="article:published_time"]').attr('content') || '',
      domain: new URL(url).hostname
    };
    
    // Extract headings
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
      const $heading = $(element);
      headings.push({
        level: parseInt($heading.prop('tagName').substring(1)),
        text: $heading.text().trim()
      });
    });
    
    // Find main content area
    let $mainElement = $('main').first();
    if ($mainElement.length === 0) $mainElement = $('article').first();
    if ($mainElement.length === 0) $mainElement = $('.content').first();
    if ($mainElement.length === 0) $mainElement = $('.article').first();
    if ($mainElement.length === 0) $mainElement = $('body');
    
    // Clone the element to avoid modifying the original
    const $contentClone = $mainElement.clone();
    
    // Remove unwanted elements
    $contentClone.find('script, style, nav, header, footer, aside, .sidebar, .comments, .ad, .advertisement').remove();
    
    // Get text and clean it up
    let text = $contentClone.text() || '';
    text = text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
    
    return {
      title,
      text,
      headings,
      metadata
    };
    
  } catch (error) {
    logger.error('Error extracting content from HTML', {
      url,
      error: error.message
    });
    
    // Return minimal data
    return {
      title: url.split('/').pop() || 'Untitled Document',
      text: '',
      headings: [],
      metadata: { domain: new URL(url).hostname }
    };
  }
}


module.exports = {
  scrapeUrls,
  cleanAndValidateUrl
};