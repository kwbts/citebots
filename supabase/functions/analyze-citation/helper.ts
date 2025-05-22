// Helper functions for analyzing website content
// Based on the example backend code in examples/backend/analysis-script/essential-scripts/lib/webCrawler.js

/**
 * Helper function to escape regex special characters
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safe function to find mentions with context
 * @param {string} content - The content to search in
 * @param {string} searchTerm - The term to search for
 * @param {number} contextLength - The length of context to include around the match
 * @returns {string[]} - The matches with context
 */
export function findMentionsWithContext(content: string, searchTerm: string, contextLength: number = 100): string[] {
  const mentions: string[] = [];
  
  if (!searchTerm || !content) {
    return mentions;
  }
  
  try {
    // Escape the search term to make it safe for regex
    const escapedTerm = escapeRegex(searchTerm);
    
    // Create a safe regex pattern
    const pattern = new RegExp(`(.{0,${contextLength}})\\b${escapedTerm}\\b(.{0,${contextLength}})`, 'gi');
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      mentions.push(match[0]);
    }
  } catch (error) {
    console.error(`Error finding mentions for "${searchTerm}":`, error);
  }
  
  return mentions;
}

/**
 * Creates an empty data object for fallback
 * @param {string} url - The URL being processed
 * @returns {Object} - Empty extracted data
 */
export function createEmptyExtractedData(url: string) {
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = 'unknown-domain';
  }
  
  return {
    pageTitle: `Page at ${domain}`,
    metaDescription: '',
    mainContent: '',
    contentSnippet: '',
    wordCount: 0,
    imageCount: 0,
    videoPresent: false,
    headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
    totalHeadings: 0,
    hasTable: false,
    tableCount: 0,
    hasUnorderedList: false,
    unorderedListCount: 0,
    hasOrderedList: false,
    orderedListCount: 0,
    schemaMarkupPresent: false,
    schemaTypes: [],
    ariaLabelsPresent: false,
    ariaLabelTypes: [],
    socialGraphsPresent: false,
    authorshipClear: false,
    lastModifiedDate: '',
    internalLinkCount: 0,
    hreflangDeclaration: false,
    semanticHtmlUsage: false,
    htmlStructureScore: 0,
    hasStatistics: false,
    hasQuotes: false,
    hasCitations: false,
    folderDepth: 1,
    url
  };
}

/**
 * Enhanced function to extract data from HTML
 * @param {string} html - The HTML content to analyze
 * @param {string} url - The URL of the page
 * @returns {Object} - The extracted data
 */
export function enhancedExtractFromHtml(html: string, url: string) {
  // Validate input to ensure we have a string
  if (!html || typeof html !== 'string') {
    console.error('Invalid HTML provided to extractFromHtml: ', typeof html);
    return createEmptyExtractedData(url);
  }

  // BASIC EXTRACTION
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : '';
  
  // Enhanced meta description extraction (try multiple formats)
  let metaDescription = '';
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  
  if (metaDescMatch) {
    metaDescription = metaDescMatch[1].trim();
  } else if (ogDescMatch) {
    metaDescription = ogDescMatch[1].trim();
  }
  
  console.log(`Extracted title: "${pageTitle}"`);
  console.log(`Extracted meta description: "${metaDescription}"`);
  
  // Main content extraction with better script/style removal
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const rawContent = bodyMatch ? bodyMatch[1] : html;
  const mainContent = rawContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract a content snippet for easier reference
  const contentSnippet = metaDescription || 
    (mainContent.substring(0, 500) + (mainContent.length > 500 ? '...' : ''));
  
  console.log(`Content length: ${mainContent.length} characters`);
  
  // CONTENT METRICS
  const wordCount = mainContent.split(/\s+/).filter(Boolean).length;
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
  const videoPresent = /<video[^>]*>|<iframe[^>]*youtube|<iframe[^>]*vimeo|<iframe[^>]*dailymotion|<iframe[^>]*wistia|<iframe[^>]*loom/i.test(html);
  
  // Extract heading data
  const headingCounts = {
    h1: (html.match(/<h1[^>]*>/gi) || []).length,
    h2: (html.match(/<h2[^>]*>/gi) || []).length,
    h3: (html.match(/<h3[^>]*>/gi) || []).length,
    h4: (html.match(/<h4[^>]*>/gi) || []).length,
    h5: (html.match(/<h5[^>]*>/gi) || []).length,
    h6: (html.match(/<h6[^>]*>/gi) || []).length,
  };
  
  const totalHeadings = Object.values(headingCounts).reduce((a, b) => a + b, 0);
  
  // HTML structure score based on heading hierarchy
  let htmlStructureScore = 5; // Start with middle score
  
  // Check for good practices
  if (headingCounts.h1 === 1) htmlStructureScore += 1; // Single H1
  if (headingCounts.h2 > 0) htmlStructureScore += 1; // Has H2s
  if (headingCounts.h1 <= headingCounts.h2) htmlStructureScore += 1; // More H2s than H1s (good hierarchy)
  if (/<header|nav|main|footer|section|article/i.test(html)) htmlStructureScore += 1; // Semantic HTML
  
  // Cap the score
  htmlStructureScore = Math.min(10, Math.max(1, htmlStructureScore));
  
  // TABLES AND LISTS
  const hasTable = /<table[^>]*>/i.test(html);
  const tableCount = (html.match(/<table[^>]*>/gi) || []).length;
  
  const hasUnorderedList = /<ul[^>]*>/i.test(html);
  const unorderedListCount = (html.match(/<ul[^>]*>/gi) || []).length;
  
  const hasOrderedList = /<ol[^>]*>/i.test(html);
  const orderedListCount = (html.match(/<ol[^>]*>/gi) || []).length;
  
  // SCHEMA DATA
  let schemaMarkupPresent = false;
  let schemaTypes: string[] = [];
  
  try {
    // 1. Check for JSON-LD schema
    const jsonLdSchemas = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdSchemas && jsonLdSchemas.length > 0) {
      schemaMarkupPresent = true;
      
      jsonLdSchemas.forEach(schema => {
        try {
          const schemaContent = schema.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
          if (schemaContent && schemaContent[1]) {
            const jsonData = JSON.parse(schemaContent[1].trim());
            
            // Handle both single schema and schema arrays
            if (Array.isArray(jsonData)) {
              jsonData.forEach(item => {
                if (item['@type']) {
                  if (Array.isArray(item['@type'])) {
                    item['@type'].forEach(type => schemaTypes.push(type));
                  } else {
                    schemaTypes.push(item['@type']);
                  }
                }
              });
            } else if (jsonData['@graph'] && Array.isArray(jsonData['@graph'])) {
              jsonData['@graph'].forEach(item => {
                if (item['@type']) {
                  if (Array.isArray(item['@type'])) {
                    item['@type'].forEach(type => schemaTypes.push(type));
                  } else {
                    schemaTypes.push(item['@type']);
                  }
                }
              });
            } else if (jsonData['@type']) {
              if (Array.isArray(jsonData['@type'])) {
                jsonData['@type'].forEach(type => schemaTypes.push(type));
              } else {
                schemaTypes.push(jsonData['@type']);
              }
            }
          }
        } catch (e) {
          console.warn(`Error parsing JSON-LD schema: ${e.message}`);
        }
      });
    }
    
    // 2. Check for microdata schema
    const itemtypeElements = html.match(/itemtype=["']https?:\/\/schema\.org\/([^"']+)["']/gi);
    if (itemtypeElements && itemtypeElements.length > 0) {
      schemaMarkupPresent = true;
      
      itemtypeElements.forEach(element => {
        const typeMatch = element.match(/schema\.org\/([^"']+)/i);
        if (typeMatch && typeMatch[1]) {
          schemaTypes.push(typeMatch[1]);
        }
      });
    }
    
    // 3. Check for RDFa schema
    const typeofElements = html.match(/typeof=["']([^"']+)["']/gi);
    if (typeofElements && typeofElements.length > 0) {
      schemaMarkupPresent = true;
      
      typeofElements.forEach(element => {
        const typeMatch = element.match(/typeof=["']([^"']+)["']/i);
        if (typeMatch && typeMatch[1]) {
          const types = typeMatch[1].split(/\s+/);
          types.forEach(type => {
            const cleanType = type.includes(':') ? type.split(':')[1] : type;
            schemaTypes.push(cleanType);
          });
        }
      });
    }
    
    // Remove duplicates and filter out non-string values
    schemaTypes = [...new Set(schemaTypes)].filter(type => typeof type === 'string');
    
  } catch (schemaError) {
    console.error(`Error analyzing schema:`, schemaError);
  }
  
  // ACCESSIBILITY
  const ariaElements = html.match(/aria-[a-z]+=/gi);
  const roleElements = html.match(/role=["'][^"']+["']/gi);
  const ariaLabelsPresent = !!(ariaElements && ariaElements.length > 0) || !!(roleElements && roleElements.length > 0);
  
  // Extract ARIA label types
  const ariaLabelTypes: string[] = [];
  if (roleElements && roleElements.length > 0) {
    roleElements.forEach(role => {
      const match = role.match(/role=["']([^"']+)["']/i);
      if (match && match[1]) {
        ariaLabelTypes.push(match[1]);
      }
    });
  }
  
  // SOCIAL AND AUTHORSHIP
  const socialGraphsPresent = /<meta[^>]*property=["']og:|<meta[^>]*name=["']twitter:/i.test(html);
  
  const authorshipElements = html.match(/<author[^>]*>|rel=["']author["']|itemprop=["']author["']|class=["'][^"']*author[^"']*["']|id=["'][^"']*author[^"']*["']/gi);
  const authorshipClear = !!(authorshipElements && authorshipElements.length > 0);
  
  // DATA FRESHNESS
  let lastModifiedDate = '';
  const modifiedMatch = html.match(/<meta[^>]*property=["']article:modified_time["'][^>]*content=["']([^"']+)["']/i);
  if (modifiedMatch && modifiedMatch[1]) {
    lastModifiedDate = modifiedMatch[1];
  }
  
  // DOMAIN AND URL HANDLING
  const domain = new URL(url).hostname;
  
  // QUALITY SIGNALS
  const hasStatistics = /\d+%|\d+\s*\w+\s*increase|\d+\s*\w+\s*decrease|\$\s*\d+|\d+\s*\w+\s*per\s*\w+/i.test(mainContent);
  
  const hasQuotes = /"[^"]{15,}"/i.test(mainContent) || 
                 (mainContent.includes('"') && mainContent.includes('"')) ||
                 /<blockquote/i.test(html);
  
  const hasCitations = new RegExp(`<a[^>]*href=["']https?:\/\/(?!${escapeRegex(domain)})[^"']+["']`, 'i').test(html);
  
  // Internal links
  const internalLinkRegex = new RegExp(`<a[^>]*href=["'](?:https?:)?\/\/${escapeRegex(domain)}[^"']*["']|<a[^>]*href=["']\/[^"']*["']`, 'gi');
  const internalLinkCount = (html.match(internalLinkRegex) || []).length;
  
  // Semantic elements
  const semanticHtmlUsage = /<article|section|nav|aside|header|footer|main|figure|figcaption|time|address|details|summary/i.test(html);
  
  // Other SEO signals
  const hreflangDeclaration = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']+["']/i.test(html) || 
                           /<html[^>]*lang=["'][^"']+["']/i.test(html);
  
  // Calculate folder depth
  let folderDepth = 1; // Root counts as 1
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path && path !== '/') {
      // Remove trailing slash if present
      const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
      // Count folders by counting the slashes, and add 1 for root
      folderDepth = cleanPath.split('/').filter(Boolean).length + 1;
    }
  } catch (urlError) {
    console.error(`Error parsing URL path ${url}:`, urlError.message);
  }
  
  return {
    pageTitle,
    metaDescription,
    mainContent: mainContent.substring(0, 5000),
    contentSnippet,
    wordCount,
    imageCount,
    videoPresent,
    headingCounts,
    totalHeadings,
    hasTable,
    tableCount,
    hasUnorderedList,
    unorderedListCount,
    hasOrderedList,
    orderedListCount,
    schemaMarkupPresent,
    schemaTypes,
    ariaLabelsPresent,
    ariaLabelTypes,
    socialGraphsPresent,
    authorshipClear,
    lastModifiedDate,
    internalLinkCount,
    hreflangDeclaration,
    semanticHtmlUsage,
    htmlStructureScore,
    hasStatistics,
    hasQuotes,
    hasCitations,
    folderDepth,
    url
  };
}