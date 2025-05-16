// src/lib/webCrawler.js
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');
const { OpenAI } = require('openai');
const scrapingbee = require('scrapingbee');
const fs = require('fs');
const path = require('path');

// Import basic crawler for optional use
const basicCrawler = require('./basicWebCrawler');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openai.apiKey
});

// Initialize ScrapingBee client
const scrapingBeeClient = new scrapingbee.ScrapingBeeClient(
  process.env.SCRAPINGBEE_API_KEY || config.scrapingBee?.apiKey
);

// Determine which crawler to use based on environment variable
const CRAWLER_TYPE = process.env.CITEBOTS_CRAWLER || 'pro';
console.log(`WebCrawler using ${CRAWLER_TYPE} crawler (can be changed with --crawler=basic|pro)`);

// If using basic crawler, log to a file to help track savings
if (CRAWLER_TYPE === 'basic') {
  const logDir = path.join(process.cwd(), 'data/logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.appendFileSync(
    path.join(logDir, 'crawler-savings.log'),
    `${new Date().toISOString()} - Using basic crawler - 1 ScrapingBee credit saved\n`
  );
}

/**
 * Clean URL by removing query parameters and fragments
 * @param {string} urlString - The URL to clean
 * @returns {string} - The cleaned URL
 */
function cleanUrl(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  } catch (error) {
    console.warn(`Error cleaning URL ${urlString}: ${error.message}`);
    return urlString;
  }
}

/**
 * Check if a URL is valid and accessible
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - Whether the URL is valid and accessible
 */
async function isValidUrl(url) {
  try {
    // Clean the URL first to remove query parameters
    const cleanedUrl = cleanUrl(url);
    
    // Basic URL validation
    new URL(cleanedUrl);
    
    // Use either basic validation or ScrapingBee based on crawler type
    if (CRAWLER_TYPE === 'basic') {
      console.log(`Using basic validation for ${cleanedUrl}`);
      return await basicCrawler.isValidUrl(cleanedUrl);
    } else {
      // Use ScrapingBee to check if the URL is valid with minimal data extraction
      const params = {
        url: cleanedUrl,
        render_js: false, // Disable JavaScript rendering to save credits
        premium_proxy: false,
        block_resources: true // Block images, CSS, etc. for faster validation
      };
      
      try {
        console.log(`Validating URL with ScrapingBee: ${cleanedUrl}`);
        const response = await scrapingBeeClient.get(params, {
          timeout: 10000 // 10 second timeout
        });
        
        console.log(`Validation response received for ${cleanedUrl}, status: ${response.status}`);
        
        // Check for valid status code
        return response.status >= 200 && response.status < 400;
      } catch (scrapingError) {
        // Check if the error is because the site is blocking scrapers
        if (scrapingError.message && (
            scrapingError.message.includes('403') || 
            scrapingError.message.includes('captcha') ||
            scrapingError.message.includes('access denied') ||
            scrapingError.message.includes('401'))) {
          console.log(`URL ${cleanedUrl} is valid but may be blocking scrapers, falling back to basic validation`);
          // Try basic validation as fallback
          const isValid = await basicCrawler.isValidUrl(cleanedUrl);
          console.log(`Basic validation for ${cleanedUrl} returned: ${isValid ? 'valid' : 'invalid'}`);
          return isValid;
        }
        
        throw scrapingError; // Re-throw for further handling
      }
    }
  } catch (error) {
    console.error(`URL validation error for ${url}:`, error.message);
    return false;
  }
}

/**
 * Extract relevant data from HTML using cheerio
 * @param {string} html - The HTML content to parse
 * @param {string} url - The URL of the page
 * @returns {Object} - Extracted data from the HTML
 */
function extractFromHtml(html, url) {
  // Validate input to ensure we have a string
  if (!html || typeof html !== 'string') {
    console.error('Invalid HTML provided to extractFromHtml: ', typeof html);
    // Return default empty values
    return {
      pageTitle: '',
      metaDescription: '',
      mainContent: '',
      contentSnippet: '',
      wordCount: 0,
      imageCount: 0,
      videoPresent: false,
      authorshipClear: false,
      schemaMarkupPresent: false,
      schemaTypes: [],
      htmlStructureScore: 0,
      accessibilityScore: 0,
      headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      totalHeadings: 0,
      ariaLabelsPresent: false,
      ariaLabelTypes: [],
      socialGraphsPresent: false,
      hasStatistics: false,
      hasQuotes: false,
      hasCitations: false
    };
  }

  // Try to load the HTML with cheerio
  let $;
  try {
    $ = cheerio.load(html);
  } catch (error) {
    console.error(`Error parsing HTML with cheerio: ${error.message}`);
    // Return default empty values
    return {
      pageTitle: '',
      metaDescription: '',
      mainContent: '',
      contentSnippet: '',
      wordCount: 0,
      imageCount: 0,
      videoPresent: false,
      authorshipClear: false,
      schemaMarkupPresent: false,
      schemaTypes: [],
      htmlStructureScore: 0,
      accessibilityScore: 0,
      headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      totalHeadings: 0,
      ariaLabelsPresent: false,
      ariaLabelTypes: [],
      socialGraphsPresent: false,
      hasStatistics: false,
      hasQuotes: false,
      hasCitations: false
    };
  }
  
  // Basic extraction logic
  const pageTitle = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || '';

  console.log(`Extracted title: "${pageTitle}"`);
  console.log(`Extracted meta description: "${metaDescription}"`);

  // Remove scripts, styles, and hidden elements for content analysis
  $('script, style, [style*="display:none"], [style*="display: none"]').remove();
  
  // Extract the main content
  const mainContent = $('body').text().replace(/\s+/g, ' ').trim();
  
  // Extract a representative content snippet
  const contentSnippet = metaDescription || 
                      (mainContent.substring(0, 500) + (mainContent.length > 500 ? '...' : ''));
                      
  console.log(`Content length: ${mainContent.length} characters`);
  
  // Calculate word count
  const wordCount = mainContent.split(/\s+/).filter(Boolean).length;
  
  // Count images
  const imageCount = $('img').length;
  
  // Check if video is present
  const videoPresent = $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0;
  
  // Check if authorship is clear
  const authorship = $('author, [rel="author"], [class*="author"], [id*="author"], [itemprop="author"]').text().trim();
  const authorshipClear = authorship.length > 0;
  
  // Extract schema markup and types
  const { schemaMarkupPresent, schemaTypes } = extractSchemaData($);
  
  // Extract heading data
  const { headingCounts, totalHeadings, htmlStructureScore } = extractHeadingData($);
  
  // Extract accessibility data
  const { ariaLabelsPresent, ariaLabelTypes, socialGraphsPresent, accessibilityScore } = extractAccessibilityData($);
  
  // Internal link count
  const internalLinkCount = $(`a[href^="/"], a[href^="${url}"], a[href^="${url.replace(/https?:\/\//, '')}"]`).length;
  
  // Last modified date
  let lastModifiedDate = '';
  try {
    const modifiedMeta = $('meta[property="article:modified_time"], meta[name="last-modified"]').attr('content');
    if (modifiedMeta) {
      lastModifiedDate = modifiedMeta;
    }
  } catch (dateError) {
    console.error(`Error extracting modified date for ${url}:`, dateError);
  }
  
  // Check for tables and lists
  const tableElements = $('table').filter(function() {
    return $(this).parents('table').length === 0;
  });
  const hasTable = tableElements.length > 0;
  const tableCount = tableElements.length;
  
  const ulElements = $('ul').filter(function() {
    return $(this).parents('ul').length === 0;
  });
  const hasUnorderedList = ulElements.length > 0;
  const unorderedListCount = ulElements.length;
  
  const olElements = $('ol').filter(function() {
    return $(this).parents('ol').length === 0;
  });
  const hasOrderedList = olElements.length > 0;
  const orderedListCount = olElements.length;
  
  // Check for semantic HTML usage
  const semanticElements = $('article, section, nav, aside, header, footer, main, figure, figcaption, time, address, details, summary');
  const semanticHtmlUsage = semanticElements.length > 0;
  
  // Check for hreflang declaration
  const hreflangDeclaration = $('link[rel="alternate"][hreflang]').length > 0 || 
                              $('html[lang]').length > 0;
  
  // Check for statistics (basic check)
  const hasStatistics = /\d+%|\d+\s*\w+\s*increase|\d+\s*\w+\s*decrease|\$\s*\d+|\d+\s*\w+\s*per\s*\w+/.test(mainContent);
  
  // Check for quotes
  const hasQuotes = /"[^"]{15,}"/.test(mainContent) || 
                    (mainContent.includes('"') && mainContent.includes('"')) ||
                    $('blockquote').length > 0;
  
  // Check for outbound citations
  const hasCitations = $('a[href^="http"]').length > 0;
  
  return {
    pageTitle,
    metaDescription,
    mainContent,
    contentSnippet,
    wordCount,
    imageCount,
    videoPresent,
    authorshipClear,
    hasStatistics,
    hasQuotes,
    hasCitations,
    schemaMarkupPresent,
    schemaTypes,
    htmlStructureScore,
    accessibilityScore,
    mobileFriendly: true, // Default value since we can't detect this without JS rendering
    internalLinkCount,
    hasTable,
    tableCount,
    hasUnorderedList,
    unorderedListCount,
    hasOrderedList,
    orderedListCount,
    semanticHtmlUsage,
    hreflangDeclaration,
    totalHeadings,
    headingCounts,
    ariaLabelsPresent,
    ariaLabelTypes,
    socialGraphsPresent,
    lastModifiedDate
  };
}

/**
 * Extract schema data from HTML using improved detection
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Schema data and types
 */
function extractSchemaData($) {
  let schemaMarkupPresent = false;
  let schemaTypes = new Set();
  
  try {
    // 1. Check for JSON-LD schema
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        schemaMarkupPresent = true;
        const schemaText = $(el).html();
        const schema = JSON.parse(schemaText);
        
        // Handle both single schema and schema arrays
        if (Array.isArray(schema)) {
          schema.forEach(item => {
            if (item['@type']) {
              if (Array.isArray(item['@type'])) {
                item['@type'].forEach(type => schemaTypes.add(type));
              } else {
                schemaTypes.add(item['@type']);
              }
            }
          });
        } else if (schema['@graph'] && Array.isArray(schema['@graph'])) {
          schema['@graph'].forEach(item => {
            if (item['@type']) {
              if (Array.isArray(item['@type'])) {
                item['@type'].forEach(type => schemaTypes.add(type));
              } else {
                schemaTypes.add(item['@type']);
              }
            }
          });
        } else if (schema['@type']) {
          if (Array.isArray(schema['@type'])) {
            schema['@type'].forEach(type => schemaTypes.add(type));
          } else {
            schemaTypes.add(schema['@type']);
          }
        }
      } catch (e) {
        console.warn(`Error parsing JSON-LD schema: ${e.message}`);
      }
    });
    
    // 2. Check for microdata schema
    $('[itemtype]').each((i, el) => {
      schemaMarkupPresent = true;
      const itemtype = $(el).attr('itemtype');
      if (itemtype) {
        // Extract the schema type from the itemtype URL
        const typeMatch = itemtype.match(/schema\.org\/([^\/]+)/);
        if (typeMatch && typeMatch[1]) {
          schemaTypes.add(typeMatch[1]);
        }
      }
    });
    
    // 3. Check for RDFa schema
    $('[typeof]').each((i, el) => {
      schemaMarkupPresent = true;
      const typeValue = $(el).attr('typeof');
      if (typeValue) {
        // RDFa often uses prefixes, get the part after the colon
        const types = typeValue.split(/\s+/);
        types.forEach(type => {
          const cleanType = type.includes(':') ? type.split(':')[1] : type;
          schemaTypes.add(cleanType);
        });
      }
    });
  } catch (schemaError) {
    console.error(`Error analyzing schema:`, schemaError);
  }
  
  return {
    schemaMarkupPresent,
    schemaTypes: [...schemaTypes]
  };
}

/**
 * Extract ARIA attributes and accessibility information
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Accessibility data
 */
function extractAccessibilityData($) {
  // Check for ARIA attributes
  const ariaElements = $('[aria-label], [aria-describedby], [aria-labelledby], [role]');
  const ariaLabelsPresent = ariaElements.length > 0;
  
  // Extract the types of ARIA attributes used
  const ariaLabelTypes = new Set();
  
  ariaElements.each((i, el) => {
    const role = $(el).attr('role');
    if (role) ariaLabelTypes.add(role);
    
    // Check for aria-hidden elements which are not properly accessible
    const ariaHidden = $(el).attr('aria-hidden');
    if (ariaHidden === 'true') ariaLabelTypes.add('hidden');
  });
  
  // Check for social graph metadata
  const openGraphTags = $('meta[property^="og:"], meta[name^="twitter:"]');
  const socialGraphsPresent = openGraphTags.length > 0;
  
  // Calculate a basic accessibility score (0-10)
  let accessibilityScore = 5; // Start with a middle score
  
  // Increment for good practices
  if (ariaLabelsPresent) accessibilityScore += 1;
  if ($('img[alt]').length >= $('img').length * 0.8) accessibilityScore += 1; // At least 80% of images have alt text
  if ($('html[lang]').length > 0) accessibilityScore += 1; // Language is declared
  if ($('a[aria-label], a[title]').length > 0) accessibilityScore += 0.5; // Links have accessible labels
  if ($('label[for]').length > 0) accessibilityScore += 0.5; // Form labels are properly linked
  if ($('h1').length === 1) accessibilityScore += 1; // Single H1
  
  // Cap the score
  accessibilityScore = Math.min(10, Math.round(accessibilityScore));
  
  return {
    ariaLabelsPresent,
    ariaLabelTypes: [...ariaLabelTypes],
    socialGraphsPresent,
    accessibilityScore
  };
}

/**
 * Extract heading structure and information
 * @param {Object} $ - Cheerio instance
 * @returns {Object} - Heading data
 */
function extractHeadingData($) {
  const headingCounts = {
    h1: $('h1').length,
    h2: $('h2').length,
    h3: $('h3').length,
    h4: $('h4').length,
    h5: $('h5').length,
    h6: $('h6').length
  };
  
  const totalHeadings = Object.values(headingCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate HTML structure score based on heading hierarchy
  let htmlStructureScore = 5; // Start with middle score
  
  // Check for good practices
  if (headingCounts.h1 === 1) htmlStructureScore += 1; // Single H1
  if (headingCounts.h2 > 0) htmlStructureScore += 1; // Has H2s
  if (headingCounts.h1 <= headingCounts.h2) htmlStructureScore += 1; // More H2s than H1s (good hierarchy)
  if ($('header, nav, main, footer, section, article').length > 0) htmlStructureScore += 1; // Semantic HTML
  if ($('table[role="presentation"]').length === 0 && $('div[role="table"]').length === 0) htmlStructureScore += 1; // No tables for layout
  
  // Cap the score
  htmlStructureScore = Math.min(10, Math.round(htmlStructureScore));
  
  return {
    headingCounts,
    totalHeadings,
    htmlStructureScore
  };
}

/**
 * Use OpenAI to extract relevant keywords from page content
 * @param {string} pageTitle - The page title
 * @param {string} contentSnippet - Content snippet from the page
 * @param {string} query - The original search query
 * @returns {Promise<Object>} - Extracted keywords and topical cluster
 */
async function extractKeywordsWithAI(pageTitle, contentSnippet, query) {
  try {
    // Default values in case the API call fails
    let keywordMatch = query.split(' ')
      .filter(w => w.length > 3)
      .slice(0, 3);
    
    let topicalCluster = '';
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a keyword extraction specialist. Extract the most relevant keywords from webpage content and identify the main topical cluster.'
        },
        {
          role: 'user',
          content: `Given the following webpage title, content snippet, and original query, please:
1. Extract exactly 3 relevant keywords/keyphrases (2-4 words each) that best represent the content.
2. Identify one high-level topical cluster (2-4 words) that describes the focus of the page.

Page Title: "${pageTitle}"
Content Snippet: "${contentSnippet.substring(0, 500)}${contentSnippet.length > 500 ? '...' : ''}"
Original Query: "${query}"

Format your response as JSON with these fields:
- keyword_match: Array of 3 strings (the keywords/phrases)
- topical_cluster: String (the main topic)`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0].message.content;
    const result = JSON.parse(content);
    
    return {
      keywordMatch: result.keyword_match || keywordMatch,
      topicalCluster: result.topical_cluster || topicalCluster
    };
  } catch (error) {
    console.error(`Error extracting keywords with AI: ${error.message}`);
    
    // Return default values based on the query
    const cleanedQuery = query.replace(/what|are|is|the|best|top|how|to|can|i|you|we|they|for|a|an|in|on|of|about/gi, '')
      .trim().split(/\s+/);
    
    const keywordMatch = cleanedQuery
      .filter(w => w.length > 3)
      .slice(0, 3);
    
    return {
      keywordMatch,
      topicalCluster: keywordMatch.slice(0, 2).join(' ')
    };
  }
}

/**
 * Crawl a web page using either basic crawler or ScrapingBee and extract its content and metadata
 * @param {string} url - The URL to crawl
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The extracted data
 */
async function crawlPage(url, options = {}) {
  // Use the crawler type from environment variable
  if (CRAWLER_TYPE === 'basic') {
    console.log(`Using basic crawler for ${url}`);
    // Call the basic crawler
    return await basicCrawler.crawlPage(url, options);
  }
  
  // Otherwise use the pro crawler with ScrapingBee
  console.log(`Using pro crawler (ScrapingBee) for ${url}`);
  
  // Clean the URL first
  const cleanedUrl = cleanUrl(url);
  
  let domainName = '';
  let folderDepth = 1; // Root counts as 1
  
  try {
    const urlObj = new URL(cleanedUrl);
    domainName = urlObj.hostname;
    
    // Calculate folder depth from path
    const path = urlObj.pathname;
    if (path && path !== '/') {
      // Remove trailing slash if present
      const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
      // Count folders by counting the slashes, and add 1 for root
      folderDepth = cleanPath.split('/').filter(Boolean).length + 1;
    }
  } catch (urlError) {
    console.error(`Error parsing URL ${cleanedUrl}:`, urlError.message);
  }

  try {
    console.log(`Crawling URL with ScrapingBee: ${cleanedUrl}`);
    
    // Set ScrapingBee parameters - optimize for lowest cost (1 credit)
    const params = {
      url: cleanedUrl,
      render_js: false, // Disable JavaScript to reduce costs (1 credit instead of 5)
      premium_proxy: false, // Don't use premium proxies by default
      country_code: options.countryCode || 'us',
      device: options.device || 'desktop',
      block_resources: true // Block images and CSS for faster processing
    };
    
    // If the site requires JS rendering or might be blocking scrapers, use premium_proxy
    if (options.forceRenderJs || options.forcePremiumProxy) {
      params.render_js = options.forceRenderJs || false;
      params.premium_proxy = options.forcePremiumProxy || false;
      console.log(`Using enhanced options: render_js=${params.render_js}, premium_proxy=${params.premium_proxy}`);
    }
    
    // Make the request
    const response = await scrapingBeeClient.get(params);
    
    console.log(`ScrapingBee response received for ${cleanedUrl}, status: ${response.status}`);
    
    // If response is not successful, return an error object
    if (response.status < 200 || response.status >= 400) {
      throw new Error(`Failed to crawl URL, status: ${response.status}`);
    }
    
    // Handle the response data - ScrapingBee returns raw HTML as a string in response.data
    let htmlContent = '';
    
    if (typeof response.data === 'string') {
      // ScrapingBee returned raw HTML directly
      console.log('Response contains raw HTML string');
      htmlContent = response.data;
    } else if (response.data && response.data.html && typeof response.data.html === 'string') {
      // ScrapingBee returned a JSON object with html property (when using extract_rules)
      console.log('Response contains HTML in data.html property');
      htmlContent = response.data.html;
    } else if (Buffer.isBuffer(response.data)) {
      // Response is binary data, convert to string
      console.log('Response is binary data, converting to string');
      htmlContent = response.data.toString('utf-8');
    } else {
      // Unexpected response format
      console.error('Unexpected response format from ScrapingBee:', typeof response.data);
      console.error('Response data sample:', JSON.stringify(response.data).substring(0, 200));
      throw new Error('Unexpected response format from ScrapingBee');
    }
    
    // Log HTML content size for debugging
    console.log(`HTML content size: ${htmlContent.length} characters`);
    
    // Extract data from the HTML
    const extractedData = extractFromHtml(htmlContent, cleanedUrl);
    
    // Extract keywords and topical cluster using AI if we have a query
    let keywordData = {
      keywordMatch: [],
      topicalCluster: ''
    };
    
    try {
      // Use the original query from options if available
      const query = options.query || '';
      if (query) {
        keywordData = await extractKeywordsWithAI(
          extractedData.pageTitle,
          extractedData.contentSnippet, 
          query
        );
      }
    } catch (keywordError) {
      console.error(`Error extracting keywords for ${cleanedUrl}:`, keywordError);
    }
    
    // Return the complete data
    return {
      url: cleanedUrl,
      domainName,
      pageTitle: extractedData.pageTitle,
      metaDescription: extractedData.metaDescription,
      contentSnippet: extractedData.contentSnippet,
      wordCount: extractedData.wordCount,
      imageCount: extractedData.imageCount,
      videoPresent: extractedData.videoPresent,
      authorshipClear: extractedData.authorshipClear,
      hasStatistics: extractedData.hasStatistics,
      hasQuotes: extractedData.hasQuotes,
      hasCitations: extractedData.hasCitations,
      schemaMarkupPresent: extractedData.schemaMarkupPresent,
      schemaTypes: Array.isArray(extractedData.schemaTypes) ? extractedData.schemaTypes.join(', ') : '',
      htmlStructureScore: extractedData.htmlStructureScore,
      accessibilityScore: extractedData.accessibilityScore,
      mobileFriendly: extractedData.mobileFriendly,
      pageSpeedScore: 50, // Default value since we can't measure this without JS rendering
      firstContentfulPaint: 1000, // Default values
      largestContentfulPaint: 2500,
      totalBlockingTime: 100,
      cumulativeLayoutShift: 0.1,
      sslEnabled: cleanedUrl.startsWith('https'),
      lastModifiedDate: extractedData.lastModifiedDate,
      internalLinkCount: extractedData.internalLinkCount,
      has_table: extractedData.hasTable,
      has_table_count: extractedData.tableCount,
      has_unordered_list: extractedData.hasUnorderedList,
      has_unordered_list_count: extractedData.unorderedListCount,
      has_ordered_list: extractedData.hasOrderedList,
      has_ordered_list_count: extractedData.orderedListCount,
      semantic_html_usage: extractedData.semanticHtmlUsage,
      hreflang_declaration: extractedData.hreflangDeclaration,
      folder_depth: folderDepth,
      total_headings: extractedData.totalHeadings,
      heading_count_type: extractedData.headingCounts,
      aria_labels_present: extractedData.ariaLabelsPresent,
      aria_labels_types: extractedData.ariaLabelTypes,
      social_graphs_present: extractedData.socialGraphsPresent,
      keyword_match: keywordData.keywordMatch,
      topical_cluster: keywordData.topicalCluster,
      
      // Include full content for content analysis
      main_content: extractedData.mainContent,
      
      // Default values for fields we're not implementing in the simplified version
      domain_authority: 30,
      page_authority: 20,
      spam_score: 2,
      backlink_count: 100,
      referring_domains: 50,
      link_propensity: 0.5
    };
  } catch (crawlError) {
    console.error(`Error crawling ${cleanedUrl}:`, crawlError.message);
    
    // Return basic information with error details
    return {
      url: cleanedUrl,
      domainName,
      error: crawlError.message,
      isValid: true, // Still mark as valid as the URL might work with a different approach
      isCrawlable: false,
      pageTitle: '',
      contentSnippet: '',
      wordCount: 0,
      htmlStructureScore: 0,
      accessibilityScore: 0,
      schemaMarkupPresent: false,
      schemaTypes: '',
      folder_depth: folderDepth,
      keyword_match: [],
      topical_cluster: '',
      
      // Default values for fields we're not implementing in the simplified version
      domain_authority: 0,
      page_authority: 0,
      spam_score: 0,
      backlink_count: 0,
      referring_domains: 0,
      link_propensity: 0
    };
  }
}

// Integration of caching with crawlPage
const { getCachedOrFetch } = require('./cacheManager');

/**
 * Crawl a web page with caching support, using either the basic or pro crawler based on environment variable
 * @param {string} url - The URL to crawl
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - The extracted data
 */
async function crawlPageWithCache(url, options = {}) {
  // Clean the URL for consistent caching
  const cleanedUrl = cleanUrl(url);
  
  // Cache configuration
  const cacheTTL = options.cacheTTL || 7 * 24 * 60 * 60 * 1000; // 7 days by default
  const bypassCache = options.bypassCache || false;
  
  // Create a function that will be called if cache miss
  const fetchPageData = async () => {
    return await crawlPage(cleanedUrl, options);
  };
  
  // Get cached or fresh data
  return await getCachedOrFetch(cleanedUrl, fetchPageData, {
    ttl: cacheTTL,
    bypassCache
  });
}


module.exports = {
  crawlPage,
  crawlPageWithCache,
  isValidUrl,
  cleanUrl,
  extractKeywordsWithAI
};