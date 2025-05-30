import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Standard response headers for all responses (includes CORS)
const responseHeaders = { 
  ...corsHeaders, 
  'Content-Type': 'application/json' 
};

interface AnalyzeCitationRequest {
  query_id: string
  citation_url: string
  citation_position: number
  query_text: string
  keyword: string
  brand_name: string
  brand_domain: string
  competitors: any[]
}

// ============== HELPER FUNCTIONS ==============

/**
 * Helper function to escape regex special characters
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safe function to find mentions with context
 * @param {string} content - The content to search in
 * @param {string} searchTerm - The term to search for
 * @param {number} contextLength - The length of context to include around the match
 * @returns {string[]} - The matches with context
 */
function findMentionsWithContext(content: string, searchTerm: string, contextLength: number = 100): string[] {
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
function createEmptyExtractedData(url: string) {
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
 * Fallback function to create basic info without full crawl
 * @param {string} url - The URL that failed to crawl
 * @param {string} error - The error message from the crawl attempt
 * @returns {Object} - Basic fallback data with error details
 */
function createFallbackAnalysis(url: string, error: string) {
  console.log('Creating fallback analysis due to crawl failure')
  
  // Use the helper function to create empty data
  const emptyData = createEmptyExtractedData(url);
  
  // Add the crawl error message
  return {
    ...emptyData,
    mainContent: `Unable to crawl page: ${error}`,
    crawlError: error
  }
}

/**
 * Enhanced function to extract data from HTML
 * @param {string} html - The HTML content to analyze
 * @param {string} url - The URL of the page
 * @returns {Object} - The extracted data
 */
function enhancedExtractFromHtml(html: string, url: string) {
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
  
  // SCHEMA DATA - Enhanced detection with all formats
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

// ============== END HELPER FUNCTIONS ==============

// Domain knowledge store to remember which domains need premium options
const knownDifficultDomains = new Map<string, number>();

// List of known domains that typically require premium handling
const KNOWN_PROBLEM_DOMAINS = [
  'g2.com',
  'capterra.com',
  'softwareadvice.com',
  'trustradius.com',
  'techradar.com',
  'pcmag.com',
  'gartner.com',
  'getapp.com',
  'sourceforge.net',
  'cnet.com',
  'trustpilot.com'
];

// Initialize known difficult domains with software review sites
KNOWN_PROBLEM_DOMAINS.forEach(domain => {
  knownDifficultDomains.set(domain, 3); // Assume premium proxy needed (tier 3)
});

// Function to determine if a domain likely needs premium options based on past experience
function needsPremiumOptions(url: string): number {
  try {
    const domain = new URL(url).hostname;
    return knownDifficultDomains.get(domain) || 1; // Default to basic tier (1)
  } catch {
    return 1; // Default to basic tier
  }
}

// Function to remember if a domain needed premium options
function rememberDomainDifficulty(url: string, requiredTier: number) {
  try {
    const domain = new URL(url).hostname;

    // Only update if the new tier is higher than what we knew before
    const currentTier = knownDifficultDomains.get(domain) || 0;
    if (requiredTier > currentTier) {
      console.log(`Remembering that domain ${domain} requires tier ${requiredTier}`);
      knownDifficultDomains.set(domain, requiredTier);
    }
  } catch (e) {
    console.error(`Error remembering domain difficulty: ${e.message}`);
  }
}

// Enhanced crawlPage function with fallback options and domain knowledge
async function crawlPage(url: string, attempt: number = 0): Promise<string> {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY')
  if (!apiKey) {
    console.error('ScrapingBee API key not found in environment')
    throw new Error('ScrapingBee API key not configured')
  }

  // If this is the first attempt, check if we already know this domain needs premium options
  if (attempt === 0) {
    attempt = needsPremiumOptions(url);
    console.log(`Starting with tier ${attempt} for URL: ${url} (based on domain knowledge)`);
  }

  // Cap at attempt 4 (stealth proxy is the highest tier)
  attempt = Math.min(attempt, 4);

  console.log(`Attempting to crawl URL: ${url} (tier ${attempt})`);

  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    console.error(`Invalid URL provided: ${url}`);
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Configure parameters based on attempt number
  let params: URLSearchParams;
  let creditCost = 1; // Track credit cost for analytics

  switch(attempt) {
    case 1:
      // First attempt: Basic crawl (1 credit)
      params = new URLSearchParams({
        api_key: apiKey,
        url: url,
        render_js: 'false',
        premium_proxy: 'false',
        country_code: 'us',
        device: 'desktop',
        return_page_source: 'true',
        block_ads: 'true',
        block_resources: 'false',
        wait: '0',
        timeout: '30000'
      });
      creditCost = 1;
      break;

    case 2:
      // Second attempt: JavaScript rendering (5 credits)
      params = new URLSearchParams({
        api_key: apiKey,
        url: url,
        render_js: 'true',
        premium_proxy: 'false',
        country_code: 'us',
        device: 'desktop',
        return_page_source: 'true',
        block_ads: 'true',
        wait: '2000',
        timeout: '30000'
      });
      creditCost = 5;
      break;

    case 3:
      // Third attempt: Premium proxy (10-25 credits)
      params = new URLSearchParams({
        api_key: apiKey,
        url: url,
        render_js: 'true',
        premium_proxy: 'true',
        country_code: 'us',
        device: 'desktop',
        return_page_source: 'true',
        block_ads: 'true',
        wait: '2000',
        timeout: '30000'
      });
      creditCost = 25; // Assume worst case
      break;

    default:
      // Final attempt: Stealth proxy (75 credits)
      params = new URLSearchParams({
        api_key: apiKey,
        url: url,
        render_js: 'true',
        stealth_proxy: 'true',
        country_code: 'us',
        device: 'desktop',
        return_page_source: 'true',
        block_ads: 'true',
        wait: '2000',
        timeout: '30000'
      });
      creditCost = 75;
  }

  console.log(`Making request to ScrapingBee API (tier ${attempt}, ~${creditCost} credits)...`);

  try {
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`);

    console.log(`ScrapingBee response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScrapingBee error response: ${errorText}`);

      // Try to parse error JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      // Handle specific error cases
      if (response.status === 403 ||
          (errorData.reason && errorData.reason.includes('403')) ||
          (errorData.error && errorData.error.includes('Server responded with 403'))) {
        // Remember that this domain had issues
        rememberDomainDifficulty(url, attempt + 1);

        if (attempt < 4) {
          console.log(`403 error, trying with higher tier (tier ${attempt + 1})`);
          return crawlPage(url, attempt + 1);
        }
      } else if (response.status === 401) {
        throw new Error('ScrapingBee authentication failed - check API key');
      } else if (response.status === 429) {
        throw new Error('ScrapingBee rate limit exceeded');
      } else if (response.status === 500 ||
                (errorData.error && errorData.error.includes('try again'))) {
        // For 500 errors, also try with higher tier
        rememberDomainDifficulty(url, attempt + 1);

        if (attempt < 4) {
          console.log(`Server error, trying with higher tier (tier ${attempt + 1})`);
          return crawlPage(url, attempt + 1);
        }
      } else if (errorData.error &&
                (errorData.error.includes('premium_proxy') ||
                 errorData.error.includes('render_js'))) {
        // The error message suggests using premium or js rendering
        rememberDomainDifficulty(url, attempt + 1);

        if (attempt < 4) {
          console.log(`API suggests higher tier needed, trying tier ${attempt + 1}`);
          return crawlPage(url, attempt + 1);
        }
      }

      throw new Error(`ScrapingBee error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const html = await response.text();
    const htmlLength = html ? html.length : 0;

    if (htmlLength < 1000 && attempt < 4) {
      // If we got a very small response, it might be a soft block or error page
      console.log(`Warning: Very small HTML response (${htmlLength} chars), might be blocked. Trying higher tier.`);
      rememberDomainDifficulty(url, attempt + 1);
      return crawlPage(url, attempt + 1);
    }

    console.log(`Successfully crawled page: ${url} (received ${htmlLength} characters) using tier ${attempt}`);

    // Remember that this tier worked successfully
    rememberDomainDifficulty(url, attempt);

    return html;

  } catch (error) {
    if (error.message && error.message.includes('rate limit')) {
      throw error; // Don't retry rate limits
    }

    // For other errors, try next tier if not at max
    if (attempt < 4) {
      console.log(`Error on tier ${attempt}, trying higher tier: ${error.message}`);
      return crawlPage(url, attempt + 1);
    }

    throw error;
  }
}

// Function to analyze content using OpenAI
async function analyzeContentWithAI(pageData: any, queryText: string, brandName: string, competitors: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    console.error('OpenAI API key not configured, using default analysis')
    return getDefaultAnalysis()
  }

  // Skip AI analysis if we have a crawl error
  if (pageData.crawlError) {
    return getDefaultAnalysis()
  }

  // Find brand and competitor mentions safely
  const brandMentions = findMentionsWithContext(pageData.mainContent || '', brandName || '');
  const competitorAnalysis: any = {};

  // Ensure competitors is an array before iterating
  const competitorsList = Array.isArray(competitors) ? competitors : [];

  for (const competitor of competitorsList) {
    // Check competitor structure is valid
    if (!competitor || typeof competitor !== 'object') {
      console.error('Invalid competitor object:', competitor);
      continue;
    }

    const compName = competitor.name || '';
    if (compName) {
      const mentions = findMentionsWithContext(pageData.mainContent || '', compName);
      competitorAnalysis[compName] = mentions ? mentions.length : 0;
    }
  }

  const prompt = `
Analyze this web page that was cited in response to the query: "${queryText}".

Page info:
URL: ${pageData.url}
Title: ${pageData.pageTitle}
Meta description: ${pageData.metaDescription}
Word count: ${pageData.wordCount}
Brand mentions: ${brandMentions.length}
Competitor mentions: ${JSON.stringify(competitorAnalysis)}
Content sample: ${pageData.mainContent.substring(0, 1000)}

Please provide the following in JSON format:
{
  "content_type": "Blog/Product/Documentation/News/etc",
  "rock_paper_scissors": "Rock/Paper/Scissors",
  "content_depth_score": 1-5,
  "sentiment_score": -1 to 1,
  "content_uniqueness": 1-5,
  "content_optimization_score": 1-5,
  "has_statistics": true/false,
  "has_quotes": true/false,
  "has_research": true/false,
  "analysis_score": 1-5,
  "citation_match_quality": 1-5,
  "topical_cluster": "main topic",
  "page_relevance_type": "direct/partial/misaligned",
  "page_intent_alignment": "high/moderate/low/mismatch",
  "content_format": "article/blog/landing_page/etc",
  "content_depth": "comprehensive/overview/shallow",
  "brand_positioning": "prominent/mentioned/absent",
  "competitor_presence": "exclusive/featured/mentioned/none",
  "call_to_action_strength": "strong/moderate/passive/none",
  "content_recency": "recent/older/outdated/undated",
  "eeat_signals": "strong/moderate/weak",
  "user_experience_quality": "excellent/good/average/poor/problematic",
  "content_structure": "hierarchical/linear/fragmented",
  "analysis_notes": "Brief notes about the page"
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Provide analysis in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)
    
    return analysis
  } catch (error) {
    console.error('AI analysis error:', error)
    return getDefaultAnalysis()
  }
}

function getDefaultAnalysis() {
  return {
    content_type: "Unknown",
    rock_paper_scissors: "Rock",
    content_depth_score: 3,
    sentiment_score: 0,
    content_uniqueness: 3,
    content_optimization_score: 3,
    has_statistics: false,
    has_quotes: false,
    has_research: false,
    analysis_score: 3,
    citation_match_quality: 3,
    topical_cluster: "General",
    page_relevance_type: "partial",
    page_intent_alignment: "moderate",
    content_format: "article",
    content_depth: "shallow",
    brand_positioning: "absent",
    competitor_presence: "none",
    call_to_action_strength: "none",
    content_recency: "undated",
    eeat_signals: "weak",
    user_experience_quality: "average",
    content_structure: "linear",
    analysis_notes: "Default analysis used due to crawl or AI error"
  }
}

// Helper function to check if a column exists in a table
async function columnExists(serviceClient: any, tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await serviceClient
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();

    return !(error || !data);
  } catch (error) {
    console.warn(`Error checking for ${columnName} column:`, error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests - respond immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse and validate request body
    const body = await req.json().catch(err => {
      console.error('Error parsing request JSON:', err);
      throw new Error('Invalid JSON in request body');
    });
    
    // Type assertion with validation
    const request = body as AnalyzeCitationRequest;
    console.log('Received analyze-citation request:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!request.citation_url) {
      throw new Error('citation_url is required');
    }
    
    if (!request.query_id) {
      throw new Error('query_id is required');
    }

    let extractedData;
    
    try {
      // Try to crawl the page with fallback options
      console.log(`Crawling ${request.citation_url}`);
      const html = await crawlPage(request.citation_url);
      
      // Extract basic data with enhanced extraction
      extractedData = enhancedExtractFromHtml(html, request.citation_url);
    } catch (crawlError) {
      console.error('Crawl failed, using fallback:', crawlError.message);
      extractedData = createFallbackAnalysis(request.citation_url, crawlError.message);
    }
    
    // Analyze with AI (will handle fallback if crawl failed)
    console.log('Analyzing content with AI');
    const aiAnalysis = await analyzeContentWithAI(
      extractedData, 
      request.query_text || '', 
      request.brand_name || '', 
      request.competitors || []
    );
    
    // Determine if it's client or competitor domain
    const domain = new URL(request.citation_url).hostname;
    const isClientDomain = request.brand_domain ? domain.includes(request.brand_domain) : false;
    let isCompetitorDomain = false;

    // Ensure competitors is an array before processing
    const competitorsList = Array.isArray(request.competitors) ? request.competitors : [];

    for (const competitor of competitorsList) {
      if (!competitor || typeof competitor !== 'object') {
        continue;
      }

      const compDomain = competitor.domain || competitor.pattern || '';
      if (compDomain && domain.includes(compDomain)) {
        isCompetitorDomain = true;
        break;
      }
    }

    // Create service client for Supabase
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Check for required columns in table
    const hasCrawlErrorColumn = await columnExists(serviceClient, 'page_analyses', 'crawl_error');
    const hasCrawlStatusColumn = await columnExists(serviceClient, 'page_analyses', 'crawl_status');

    // Find brand and competitor mentions
    const brandMentions = findMentionsWithContext(extractedData.mainContent || '', request.brand_name || '');
    const isBrandMentioned = brandMentions.length > 0 ||
                           (extractedData.pageTitle || '').toLowerCase().includes((request.brand_name || '').toLowerCase());
    const isBrandInTitle = (extractedData.pageTitle || '').toLowerCase().includes((request.brand_name || '').toLowerCase());

    // Enhanced competitor analysis with context for each
    const mentionedCompetitors = new Set<string>();
    const competitorContexts: string[] = [];
    const competitorAnalysisObj: Record<string, any> = {};
    
    for (const comp of competitorsList) {
      if (!comp || !comp.name) continue;
      
      const mentions = findMentionsWithContext(extractedData.mainContent || '', comp.name || '');
      const compName = comp.name || '';
      const isInTitle = (extractedData.pageTitle || '').toLowerCase().includes(compName.toLowerCase());
      
      if (mentions.length > 0 || isInTitle) {
        mentionedCompetitors.add(compName);
        
        // Add the first mention context to the list
        if (mentions[0]) {
          competitorContexts.push(`${compName}: "${mentions[0].trim()}"`);
        }
        
        // Detailed competitor analysis
        competitorAnalysisObj[compName] = {
          name: compName,
          domain: comp.domain || comp.pattern || '',
          mentions: mentions.length,
          in_title: isInTitle,
          context: mentions.length > 0 ? mentions[0] : '',
          sentiment: mentions.length > 0 ? 'neutral' : 'not_present' // Default sentiment
        };
      }
    }

    // Create base page analysis record
    const basePageAnalysis = {
      query_id: request.query_id,
      page_analysis_id: `${domain.replace(/\./g, '_')}_${Date.now()}`,
      citation_url: request.citation_url,
      citation_position: request.citation_position || 0,
      domain_name: domain,
      is_client_domain: isClientDomain,
      is_competitor_domain: isCompetitorDomain,
      mention_type: ['citation'],
      analysis_notes: aiAnalysis.analysis_notes,

      // Add these fields to ensure they're populated
      brand_mentioned: isBrandMentioned,
      page_title: extractedData.pageTitle || '',
      brand_mention_count: brandMentions.length,
      brand_in_title: isBrandInTitle,
      competitor_mentioned: isCompetitorDomain || mentionedCompetitors.size > 0,
      competitor_analysis: competitorAnalysisObj,
      competitor_names: Array.from(mentionedCompetitors),
      brand_context: brandMentions.length > 0 ? brandMentions[0] : '',
      competitor_context: competitorContexts.join(' | '),
      relevance_score: aiAnalysis.citation_match_quality ? aiAnalysis.citation_match_quality / 5 : 0,
      content_quality_score: aiAnalysis.content_depth_score || 0,
      query_keyword: request.keyword || '',
      query_text: request.query_text || '',

      technical_seo: {
        is_valid: true,
        is_crawlable: !extractedData.crawlError,
        http_response_code: extractedData.crawlError ? 0 : 200,
        schema_markup_present: extractedData.schemaMarkupPresent || false,
        schema_types: extractedData.schemaTypes || [],
        html_structure_score: extractedData.htmlStructureScore || 3,
        semantic_html_usage: extractedData.semanticHtmlUsage || extractedData.totalHeadings > 0,
        mobile_friendly: true,
        hreflang_declaration: extractedData.hreflangDeclaration || false,
        date_created: null,
        date_modified: extractedData.lastModifiedDate || null,
        cdn_usage: false,
        meta_description_present: !!extractedData.metaDescription,
        aria_labels_present: extractedData.ariaLabelsPresent || false,
        aria_labels_types: extractedData.ariaLabelTypes || [],
        social_graphs_present: extractedData.socialGraphsPresent || false
      },
      
      page_performance: {
        page_speed_score: 50,
        firstContentfulPaint: 1000,
        largestContentfulPaint: 2500,
        totalBlockingTime: 100,
        cumulativeLayoutShift: 0.1,
        accessibility_score: extractedData.ariaLabelsPresent ? 4 : 3
      },
      
      domain_authority: {
        domain_name: domain,
        domain_authority: 30,
        page_authority: 20,
        backlink_count: 100,
        referring_domains: 50,
        link_propensity: 0.5,
        spam_score: 2
      },
      
      on_page_seo: {
        page_title: extractedData.pageTitle || '',
        content_type: aiAnalysis.content_type,
        meta_description: extractedData.metaDescription || '',
        word_count: extractedData.wordCount || 0,
        image_count: extractedData.imageCount || 0,
        video_present: extractedData.videoPresent || false,
        has_table: extractedData.hasTable || false,
        has_table_count: extractedData.tableCount || 0,
        has_unordered_list: extractedData.hasUnorderedList || false,
        has_unordered_list_count: extractedData.unorderedListCount || 0,
        has_ordered_list: extractedData.hasOrderedList || false,
        has_ordered_list_count: extractedData.orderedListCount || 0,
        internal_link_count: extractedData.internalLinkCount || 0,
        folder_depth: extractedData.folderDepth || request.citation_url.split('/').length - 3,
        authorship_clear: extractedData.authorshipClear || false,
        heading_count: extractedData.totalHeadings || 0,
        heading_count_type: extractedData.headingCounts || {},
        keyword_match: extractedData.keywordMatch || [request.keyword].filter(Boolean)
      },
      
      content_quality: {
        content_depth_score: aiAnalysis.content_depth_score,
        readability_score: 3,
        sentiment_score: aiAnalysis.sentiment_score,
        content_uniqueness: aiAnalysis.content_uniqueness,
        content_optimization_score: aiAnalysis.content_optimization_score,
        has_statistics: extractedData.hasStatistics || aiAnalysis.has_statistics || false,
        has_quotes: extractedData.hasQuotes || aiAnalysis.has_quotes || false,
        has_citations: extractedData.hasCitations || false,
        has_research: aiAnalysis.has_research || false,
        analysis_score: aiAnalysis.analysis_score,
        rock_paper_scissors: aiAnalysis.rock_paper_scissors,
        citation_match_quality: aiAnalysis.citation_match_quality,
        eeat_score: extractedData.authorshipClear ? 4 : 3,
        ai_content_detection: 3,
        topical_cluster: aiAnalysis.topical_cluster
      },
      
      page_analysis: {
        page_relevance_type: aiAnalysis.page_relevance_type,
        page_intent_alignment: aiAnalysis.page_intent_alignment,
        content_format: aiAnalysis.content_format,
        content_depth: aiAnalysis.content_depth,
        brand_positioning: aiAnalysis.brand_positioning,
        competitor_presence: aiAnalysis.competitor_presence,
        call_to_action_strength: aiAnalysis.call_to_action_strength,
        content_recency: aiAnalysis.content_recency,
        eeat_signals: aiAnalysis.eeat_signals,
        user_experience_quality: aiAnalysis.user_experience_quality,
        content_structure: aiAnalysis.content_structure
      }
    };

    // Add optional fields based on column existence
    const pageAnalysis = {
      ...basePageAnalysis,
      ...(hasCrawlErrorColumn && extractedData.crawlError ? { crawl_error: extractedData.crawlError } : {}),
      ...(hasCrawlStatusColumn ? { crawl_status: extractedData.crawlError ? 'failed' : 'success' } : {})
    };

    // Insert into database
    const { data, error } = await serviceClient
      .from('page_analyses')
      .insert(pageAnalysis)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        page_analysis: data
      }),
      {
        headers: responseHeaders,
        status: 200
      }
    );

  } catch (error) {
    console.error('Citation analysis error:', error);
    
    // Always use the same response headers for errors to ensure CORS headers are sent
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }),
      {
        headers: responseHeaders,
        status: 400
      }
    );
  }
});