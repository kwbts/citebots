/**
 * Enhanced Content Scraper
 * 
 * This module provides improved web page scraping capabilities with:
 * - Extraction of links for deeper crawling
 * - Enhanced content metadata extraction
 * - Better error handling and retries
 * - More comprehensive content analysis
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('./logger');
const contentScraper = require('./contentScraper'); // We'll use the existing scraper as a base

/**
 * Scrapes content from URLs, including extraction of additional links
 * @param {Array<string>} urls - The URLs to scrape
 * @param {Object} options - Options for scraping
 * @param {boolean} options.extractLinks - Whether to extract links from pages (default: true)
 * @param {number} options.linkDepth - How many levels deep to crawl (default: 1)
 * @param {number} options.maxLinksPerPage - Maximum links to extract per page (default: 5)
 * @param {Function} options.linkFilter - Function to filter extracted links (default: null)
 * @returns {Promise<Object>} - The scraped content and any additional crawled links
 */
async function enhancedScrape(urls, options = {}) {
  const defaultOptions = {
    extractLinks: true,
    linkDepth: 1,
    maxLinksPerPage: 5,
    linkFilter: null
  };

  const config = { ...defaultOptions, ...options };
  logger.info('Starting enhanced content scraping', { 
    urlCount: urls.length,
    extractLinks: config.extractLinks,
    linkDepth: config.linkDepth,
    maxLinksPerPage: config.maxLinksPerPage
  });

  // Use original scraper for first-level URLs
  const primaryResults = await contentScraper.scrapeUrls(urls);
  
  if (!config.extractLinks || config.linkDepth < 1 || primaryResults.length === 0) {
    return { 
      pages: primaryResults,
      extractedLinks: [],
      crawlStats: {
        totalPages: primaryResults.length,
        primaryPages: primaryResults.length,
        secondaryPages: 0
      }
    };
  }
  
  // Extract links from the scraped content
  const allExtractedLinks = await extractLinksFromContent(primaryResults, config);
  
  // Limit the number of secondary links to prevent timeouts (RATE LIMITING FIX)
  const maxSecondaryLinks = 15; // Reasonable limit to prevent timeouts
  const extractedLinks = allExtractedLinks.slice(0, maxSecondaryLinks);
  
  logger.info('Extracted secondary links for deeper crawling', { 
    totalFound: allExtractedLinks.length,
    limitedTo: extractedLinks.length,
    sources: primaryResults.length,
    maxAllowed: maxSecondaryLinks
  });
  
  // Crawl the extracted links with additional logging
  let secondaryResults = [];
  if (extractedLinks.length > 0) {
    logger.info('Starting secondary URL scraping with rate limiting', { 
      urlCount: extractedLinks.length 
    });
    secondaryResults = await contentScraper.scrapeUrls(extractedLinks);
    logger.info('Completed secondary URL scraping', { 
      scrapedCount: secondaryResults.length 
    });
  }
  
  logger.info('Completed enhanced content scraping', {
    primaryPages: primaryResults.length,
    extractedLinks: extractedLinks.length,
    secondaryPages: secondaryResults.length,
    totalPages: primaryResults.length + secondaryResults.length
  });
  
  // Combine all results
  return {
    pages: [...primaryResults, ...secondaryResults],
    extractedLinks,
    allExtractedLinks, // Include all found links for reference
    crawlStats: {
      totalPages: primaryResults.length + secondaryResults.length,
      primaryPages: primaryResults.length,
      secondaryPages: secondaryResults.length,
      totalLinksFound: allExtractedLinks.length,
      linksProcessed: extractedLinks.length,
      linksLimited: allExtractedLinks.length > maxSecondaryLinks
    }
  };
}

/**
 * Extracts links from scraped content
 * @param {Array<Object>} scrapedContent - The scraped content
 * @param {Object} options - Options for link extraction
 * @returns {Promise<Array<string>>} - The extracted links
 */
async function extractLinksFromContent(scrapedContent, options) {
  const allExtractedLinks = [];
  const seenUrls = new Set();

  // First, add all original URLs to the seen set to avoid duplicate crawling
  scrapedContent.forEach(content => {
    if (content.url) {
      seenUrls.add(content.url);
    }
  });

  // Process each piece of scraped content
  for (const content of scrapedContent) {
    try {
      if (!content.url || !content.text) continue;
      
      // If the content has raw HTML, extract links from it
      if (content.html) {
        const extractedLinks = extractLinksFromHtml(content.html, content.url, options);
        addUniqueLinks(extractedLinks, allExtractedLinks, seenUrls, options);
      } 
      // Otherwise, we need to refetch the page to get links
      else {
        // Skip if we already have too many links
        if (allExtractedLinks.length >= scrapedContent.length * options.maxLinksPerPage) {
          continue;
        }
        
        try {
          const response = await axios.get(content.url, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          const extractedLinks = extractLinksFromHtml(response.data, content.url, options);
          addUniqueLinks(extractedLinks, allExtractedLinks, seenUrls, options);
        } catch (error) {
          logger.warn('Failed to fetch HTML for link extraction', {
            url: content.url,
            error: error.message
          });
        }
      }
    } catch (error) {
      logger.error('Error extracting links from content', {
        url: content.url,
        error: error.message
      });
    }
  }
  
  return allExtractedLinks;
}

/**
 * Extracts links from HTML content using Cheerio (no JSDOM CSS parsing issues)
 * @param {string} html - The HTML content
 * @param {string} baseUrl - The base URL for resolving relative links
 * @param {Object} options - Options for link extraction
 * @returns {Array<string>} - The extracted links
 */
function extractLinksFromHtml(html, baseUrl, options) {
  try {
    // Use Cheerio instead of JSDOM to avoid CSS parsing errors
    const $ = cheerio.load(html);
    const baseUrlObj = new URL(baseUrl);
    const links = [];
    
    // Find all links in the document
    $('a[href]').each((index, element) => {
      try {
        const href = $(element).attr('href');
        if (!href) return;
        
        // Resolve relative URLs
        let fullUrl;
        try {
          fullUrl = new URL(href, baseUrl).href;
        } catch (e) {
          return; // Skip invalid URLs
        }
        
        // Apply filters
        if (isValidLink(fullUrl, baseUrlObj, options)) {
          links.push(fullUrl);
        }
      } catch (error) {
        // Skip problematic links
        logger.debug('Skipping problematic link', { href, error: error.message });
      }
    });
    
    logger.debug('Link extraction completed', { 
      baseUrl, 
      totalLinksFound: links.length,
      htmlLength: html.length 
    });
    
    return links;
  } catch (error) {
    logger.error('Error parsing HTML for link extraction', {
      url: baseUrl,
      error: error.message,
      htmlLength: html ? html.length : 0
    });
    return [];
  }
}

/**
 * Checks if a link is valid for extraction
 * @param {string} url - The URL to check
 * @param {URL} baseUrlObj - The base URL object
 * @param {Object} options - Options for link validation
 * @returns {boolean} - Whether the link is valid
 */
function isValidLink(url, baseUrlObj, options) {
  try {
    const urlObj = new URL(url);

    // Skip non-HTTP protocols
    if (!urlObj.protocol.startsWith('http')) {
      return false;
    }

    // Skip common file types that aren't useful for content
    const fileExtension = urlObj.pathname.split('.').pop().toLowerCase();
    const skipExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'css', 'js', 'xml', 'json', 'zip', 'tar', 'gz'];
    if (skipExtensions.includes(fileExtension)) {
      return false;
    }

    // Skip common non-content paths
    const skipPaths = ['/wp-admin/', '/wp-content/', '/wp-includes/', '/login', '/logout', '/cart', '/checkout'];
    if (skipPaths.some(path => urlObj.pathname.includes(path))) {
      return false;
    }

    // Skip problematic domains that often time out or block scraping
    const BLOCKED_DOMAINS = [
      'statista.com',  // Known to have strong anti-scraping measures
      'statistaplus.com',
      'researchandmarkets.com',
      'marketingprofs.com',
      'forbes.com',    // Often uses anti-bot measures
      'nytimes.com',   // Paywall
      'wsj.com',       // Paywall
      'ft.com',        // Paywall
      'bloomberg.com', // Paywall
      'seeking-alpha.com', // Registration wall
      'jstor.org',     // Academic paywall
      'springer.com',  // Academic paywall
      'sciencedirect.com', // Academic paywall
      'wiley.com'      // Academic paywall
    ];

    // Skip blocked domains
    if (BLOCKED_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }

    // If we're only interested in the same domain, check domain
    if (options.sameDomainOnly) {
      return urlObj.hostname === baseUrlObj.hostname;
    }

    // Apply custom filter if provided
    if (options.linkFilter && typeof options.linkFilter === 'function') {
      return options.linkFilter(url, baseUrlObj.href);
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Adds unique links to the collection, respecting the seen URLs and limits
 * @param {Array<string>} newLinks - The new links to add
 * @param {Array<string>} allLinks - The collection of all links
 * @param {Set<string>} seenUrls - The set of seen URLs
 * @param {Object} options - Options for adding links
 */
function addUniqueLinks(newLinks, allLinks, seenUrls, options) {
  // Shuffle links to get more variety
  const shuffledLinks = [...newLinks].sort(() => 0.5 - Math.random());
  
  for (const link of shuffledLinks) {
    // Skip if we've seen this URL before
    if (seenUrls.has(link)) {
      continue;
    }
    
    // Skip if we've reached the limit for the page
    if (allLinks.length >= options.maxLinksPerPage * seenUrls.size) {
      break;
    }
    
    // Add the link
    allLinks.push(link);
    seenUrls.add(link);
  }
}

/**
 * Extracts enhanced metadata from content
 * @param {Object} content - The content to extract metadata from
 * @returns {Object} - The enhanced metadata
 */
function extractEnhancedMetadata(content) {
  const metadata = content.metadata || {};
  
  try {
    if (!content.html) return metadata;
    
    // Use Cheerio instead of JSDOM
    const $ = cheerio.load(content.html);
    
    // Extract social metadata
    metadata.socialTitle = $('meta[property="og:title"]').attr('content') ||
                           $('meta[name="twitter:title"]').attr('content') ||
                           metadata.title;
                           
    metadata.socialDescription = $('meta[property="og:description"]').attr('content') ||
                                $('meta[name="twitter:description"]').attr('content') ||
                                metadata.description;
                                
    metadata.socialImage = $('meta[property="og:image"]').attr('content') ||
                          $('meta[name="twitter:image"]').attr('content');
    
    // Extract article metadata
    metadata.articleModified = $('meta[property="article:modified_time"]').attr('content');
    metadata.articleSection = $('meta[property="article:section"]').attr('content');
    metadata.articleTags = $('meta[property="article:tag"]').attr('content');
    
    // Extract schema.org metadata
    $('script[type="application/ld+json"]').each((index, element) => {
      try {
        const ldJson = JSON.parse($(element).text());
        if (ldJson['@type'] === 'Article' || ldJson['@type'] === 'BlogPosting') {
          metadata.schemaType = ldJson['@type'];
          metadata.schemaHeadline = ldJson.headline;
          metadata.schemaAuthor = ldJson.author?.name;
          metadata.schemaDatePublished = ldJson.datePublished;
          metadata.schemaDateModified = ldJson.dateModified;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
    
    return metadata;
  } catch (error) {
    logger.error('Error extracting enhanced metadata', {
      url: content.url,
      error: error.message
    });
    return metadata;
  }
}

module.exports = {
  enhancedScrape,
  extractEnhancedMetadata
};