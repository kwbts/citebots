/**
 * Enhanced Page Analyzer Module
 * 
 * Provides comprehensive analysis of web pages based on the CiteBots data definition schema
 */

import OpenAI from 'openai';
import fetch from 'node-fetch';
import { getDomainMetrics } from './domainAuthority.js';

/**
 * Main function to analyze a web page
 * @param {Object} requestData - Request data including URL and analysis parameters
 * @returns {Object} - Complete page analysis results
 */
async function analyzePage(requestData) {
  const {
    citation_url,
    citation_position,
    query_text,
    keyword,
    brand_name,
    brand_domain,
    competitors = [],
    options = {}
  } = requestData;

  console.log(`\n====== STARTING PAGE ANALYSIS ======`);
  console.log(`📄 URL: ${citation_url}`);
  console.log(`🔍 Query: "${query_text}"`);
  console.log(`🏷️ Keyword: "${keyword}"`);
  console.log(`🏢 Brand: ${brand_name} (${brand_domain || 'no domain'})`);
  console.log(`🥇 Competitors: ${competitors.map(c => c.name).join(', ') || 'none'}`);
  console.log(`⚙️ Options: ${JSON.stringify(options)}`);
  console.log(`=======================================\n`);

  try {
    // Validate URL format
    let urlObj;
    try {
      urlObj = new URL(citation_url);
    } catch (urlError) {
      throw new Error(`Invalid URL format: ${citation_url}`);
    }

    const domain = urlObj.hostname;

    // Skip certain domains that commonly cause issues
    const skipDomains = ['localhost', '127.0.0.1', 'example.com', 'test.com'];
    if (skipDomains.some(skip => domain.includes(skip))) {
      throw new Error(`Skipping analysis for test/local domain: ${domain}`);
    }

    // Check if this is a client or competitor domain
    const isClientDomain = brand_domain && domain.includes(brand_domain.toLowerCase());
    const competitorMatch = competitors.find(comp => 
      comp.domain && domain.includes(comp.domain.toLowerCase())
    );
    const isCompetitorDomain = !!competitorMatch;

    let crawlError = null;
    let pageInfo = null;
    let htmlContent = null;
    
    // Try to crawl the page
    try {
      console.log(`\n🕸️ CRAWLING PHASE - Starting web crawl`);
      htmlContent = await crawlPage(citation_url);
      console.log(`✅ Crawl successful - Received ${htmlContent.length} bytes of HTML`);

      console.log(`\n📊 EXTRACTION PHASE - Extracting basic page information`);
      pageInfo = extractPageInfo(htmlContent, citation_url);
      console.log(`📝 Page title: "${pageInfo.title}"`);
      console.log(`📏 Word count: ${pageInfo.wordCount}`);
      console.log(`🖼️ Images: ${pageInfo.imageCount}`);
      console.log(`🔤 Headings: ${pageInfo.headingCount}`);
      console.log(`🔗 Internal links: ${pageInfo.internalLinkCount}`);
    } catch (error) {
      crawlError = error.message;
      console.error(`❌ CRAWL ERROR: Failed to crawl ${citation_url}:`, error.message);
      pageInfo = {
        title: `Page at ${domain}`,
        domain
      };
      console.log(`⚠️ Using fallback page info for ${domain}`);
    }

    // Extract technical SEO data
    console.log(`\n🔧 TECHNICAL SEO PHASE - Analyzing HTML structure and technical elements`);
    const technicalSeoData = extractTechnicalSeoData(htmlContent, citation_url, crawlError);
    console.log(`⚙️ Schema markup: ${technicalSeoData.schema_markup_present ? 'Present' : 'Not found'}`);
    console.log(`📱 Mobile friendly: ${technicalSeoData.mobile_friendly ? 'Yes' : 'No'}`);
    console.log(`🏗️ HTML structure score: ${technicalSeoData.html_structure_score}/10`);
    console.log(`♿ Accessibility: ${technicalSeoData.aria_labels_present ? 'ARIA elements present' : 'No ARIA elements'}`);

    // Extract on-page SEO data
    console.log(`\n📝 ON-PAGE SEO PHASE - Analyzing content structure and elements`);
    const onPageSeoData = extractOnPageSeoData(htmlContent, citation_url, pageInfo, keyword);
    console.log(`📊 Content type: ${onPageSeoData.content_type}`);
    console.log(`📋 Lists: ${onPageSeoData.has_unordered_list ? 'Yes' : 'No'} (${onPageSeoData.has_unordered_list_count} unordered, ${onPageSeoData.has_ordered_list_count} ordered)`);
    console.log(`🔤 Heading structure: h1=${onPageSeoData.heading_count_type.h1}, h2=${onPageSeoData.heading_count_type.h2}, h3=${onPageSeoData.heading_count_type.h3}`);
    console.log(`🏷️ Keywords detected: ${onPageSeoData.keyword_match.join(', ') || 'None found'}`);

    // Extract content quality data (use AI analysis)
    console.log(`\n🧠 AI ANALYSIS PHASE - Using GPT-4o-mini to analyze content quality`);
    const contentQualityData = await analyzeContentQuality(
      htmlContent,
      citation_url,
      query_text,
      crawlError
    );
    console.log(`📈 Content depth score: ${contentQualityData.content_depth_score}/5`);
    console.log(`📊 Content uniqueness: ${contentQualityData.content_uniqueness}/5`);
    console.log(`🧩 Content type: ${contentQualityData.rock_paper_scissors} (Rock=reference, Paper=guide, Scissors=persuasive)`);
    console.log(`🎯 Citation match quality: ${contentQualityData.citation_match_quality}/5`);
    console.log(`📚 Topic cluster: ${contentQualityData.topical_cluster}`);

    // Get page performance data (optional PageSpeed API)
    console.log(`\n⚡ PAGE PERFORMANCE PHASE - Measuring page speed metrics`);
    let pagePerformanceData = getDefaultPagePerformance();
    if (options.pagespeed) {
      try {
        console.log(`🚀 Calling PageSpeed API for ${citation_url}`);
        pagePerformanceData = await getPageSpeedData(citation_url);
        console.log(`✅ PageSpeed API call successful`);
      } catch (psError) {
        console.warn(`❌ PageSpeed API error: ${psError.message}`);
        console.log(`⚠️ Using default performance values`);
      }
    } else {
      console.log(`ℹ️ PageSpeed API disabled, using default values`);
    }

    // Get domain authority data (optional Moz API)
    console.log(`\n🔍 DOMAIN METRICS PHASE - Calculating domain authority`);
    let domainAuthorityData = getDefaultDomainAuthority(domain);
    if (options.moz) {
      try {
        console.log(`🌐 Getting domain metrics for ${domain}`);
        domainAuthorityData = await getMozData(domain);
        console.log(`✅ Domain metrics obtained successfully`);
      } catch (mozError) {
        console.warn(`❌ Domain metrics error: ${mozError.message}`);
        console.log(`⚠️ Using default domain authority values`);
      }
    } else {
      console.log(`ℹ️ Domain metrics disabled, using default values`);
    }
    
    // Check for brand mentions
    let brandMentioned = false;
    let brandInTitle = false;
    let brandMentionCount = 0;

    if (brand_name && pageInfo) {
      const titleLower = pageInfo.title.toLowerCase();
      const brandLower = brand_name.toLowerCase();
      
      brandInTitle = titleLower.includes(brandLower);
      brandMentioned = brandInTitle || isClientDomain;
      
      if (htmlContent) {
        const regex = new RegExp(brand_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = htmlContent.match(regex);
        brandMentionCount = matches ? matches.length : 0;
      }
    }

    // Check for competitor mentions
    let competitorMentioned = false;
    let competitorNames = [];
    let competitorAnalysis = {};

    if (competitors && competitors.length > 0 && htmlContent) {
      for (const comp of competitors) {
        if (!comp.name) continue;
        
        const compNameRegex = new RegExp(comp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = htmlContent.match(compNameRegex);
        const mentionCount = matches ? matches.length : 0;
        
        if (mentionCount > 0) {
          competitorMentioned = true;
          competitorNames.push(comp.name);
          
          competitorAnalysis[comp.name] = {
            name: comp.name,
            mentions: mentionCount,
            domain: comp.domain || ''
          };
        }
      }
    }

    // Use AI to analyze page content with respect to query
    const pageAnalysisData = await analyzePageContext(
      htmlContent || '', 
      citation_url,
      query_text,
      brand_name,
      competitorNames,
      crawlError
    );

    // Create the full page analysis record
    const pageAnalysisRecord = {
      citation_url,
      citation_position: citation_position || 1,
      domain_name: domain,
      is_client_domain: isClientDomain,
      is_competitor_domain: isCompetitorDomain,
      mention_type: ['citation'],
      analysis_notes: crawlError ? 'Default analysis used due to crawl error' : 'Analysis completed',
      
      // SEO and technical data
      technical_seo: technicalSeoData,
      on_page_seo: onPageSeoData,
      content_quality: contentQualityData,
      page_performance: pagePerformanceData,
      domain_authority: domainAuthorityData,
      page_analysis: pageAnalysisData,
      
      // Brand and competitor data
      brand_mentioned: brandMentioned,
      brand_in_title: brandInTitle,
      brand_mention_count: brandMentionCount,
      brand_context: brandMentioned ? 'citation' : '',
      
      competitor_mentioned: competitorMentioned,
      competitor_names: competitorNames,
      competitor_analysis: competitorAnalysis,
      competitor_context: competitorMentioned ? 'title_mention' : '',
      
      // Query data
      query_text,
      query_keyword: keyword,
      page_title: pageInfo ? pageInfo.title : `Page at ${domain}`,
      
      // Scores
      relevance_score: pageAnalysisData.page_relevance_type === 'direct' ? 0.9 : 
                        pageAnalysisData.page_relevance_type === 'partial' ? 0.6 : 0.3,
      content_quality_score: contentQualityData.content_depth_score || 3,
      
      // Error handling
      crawl_error: crawlError,
      created_at: new Date().toISOString()
    };

    return pageAnalysisRecord;

  } catch (error) {
    console.error(`Error analyzing citation ${citation_url}:`, error.message);
    throw error;
  }
}

/**
 * Function to crawl a page using ScrapingBee with intelligent fallback strategy
 * @param {string} url - URL to crawl
 * @returns {string} - HTML content of the page
 */
async function crawlPage(url) {
  if (!process.env.SCRAPINGBEE_API_KEY) {
    throw new Error('ScrapingBee API key not configured');
  }

  console.log(`Crawling page: ${url}`);

  // Try basic scraper first (lowest cost)
  try {
    console.log('Attempting basic ScrapingBee request...');
    const basicUrl = new URL('https://app.scrapingbee.com/api/v1/');
    basicUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
    basicUrl.searchParams.set('url', url);
    basicUrl.searchParams.set('render_js', 'false');
    basicUrl.searchParams.set('premium_proxy', 'false');
    basicUrl.searchParams.set('country_code', 'us');
    basicUrl.searchParams.set('block_resources', 'true'); // Block images/CSS to save bandwidth
    basicUrl.searchParams.set('timeout', '15000'); // 15 second timeout

    const basicResponse = await fetch(basicUrl.toString());

    if (basicResponse.ok) {
      console.log('Basic ScrapingBee request succeeded');
      const html = await basicResponse.text();

      // Quick validation of response
      if (html.length < 500 || html.includes('404') || html.includes('Not Found')) {
        console.log('Response appears to be error page, checking content...');
      }

      return html;
    } else {
      console.log(`Basic request failed with ${basicResponse.status}, analyzing error...`);

      // Check if it's worth trying premium
      if (basicResponse.status === 404) {
        throw new Error('Page not found (404) - skipping premium attempt');
      }

      if (basicResponse.status === 403) {
        console.log('403 Forbidden - likely Cloudflare protection, trying premium with JS...');
      }

      throw new Error(`Basic ScrapingBee failed: ${basicResponse.status}`);
    }
  } catch (basicError) {
    // Only try premium for specific error types
    const errorMessage = basicError.message.toLowerCase();

    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      console.log('404 error - not attempting expensive premium crawl');
      throw new Error(`ScrapingBee failed: ${basicError.message}`);
    }

    console.log('Basic ScrapingBee failed, attempting selective premium fallback...');

    // Fallback to premium with stealth capabilities (higher cost - use selectively)
    try {
      const premiumUrl = new URL('https://app.scrapingbee.com/api/v1/');
      premiumUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
      premiumUrl.searchParams.set('url', url);
      premiumUrl.searchParams.set('render_js', 'true'); // JS rendering for dynamic content
      premiumUrl.searchParams.set('premium_proxy', 'true'); // Premium rotating proxies
      premiumUrl.searchParams.set('country_code', 'us');
      premiumUrl.searchParams.set('block_resources', 'true'); // Still block unnecessary resources
      premiumUrl.searchParams.set('timeout', '20000'); // Slightly longer timeout for JS
      premiumUrl.searchParams.set('wait_browser', 'networkidle2'); // Wait for page to fully load

      const premiumResponse = await fetch(premiumUrl.toString());

      if (!premiumResponse.ok) {
        const errorText = await premiumResponse.text().catch(() => 'Unknown error');

        // Parse specific error types
        if (errorText.includes('403') && errorText.includes('Cloudflare')) {
          throw new Error('Cloudflare protection detected - site actively blocking scrapers');
        }

        throw new Error(`Premium ScrapingBee error: ${premiumResponse.status} ${premiumResponse.statusText} - ${errorText}`);
      }

      console.log('Premium ScrapingBee request succeeded');
      const html = await premiumResponse.text();
      return html;
    } catch (premiumError) {
      console.error(`Both basic and premium ScrapingBee failed for ${url}:`, premiumError.message);
      throw new Error(`ScrapingBee failed (basic: ${basicError.message}, premium: ${premiumError.message})`);
    }
  }
}

/**
 * Function to extract basic page information from HTML
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @returns {Object} - Basic page information
 */
function extractPageInfo(html, url) {
  if (!html) {
    return { title: `Page at ${new URL(url).hostname}`, domain: new URL(url).hostname };
  }

  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  
  // Basic regex patterns for extracting page information
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `Page at ${domain}`;
  
  // Count basic elements
  const wordCount = (html.match(/\b\w+\b/g) || []).length;
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;
  
  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1] : '';
  
  // Count internal links (same domain)
  const linkMatches = html.match(/<a[^>]*href=["\']([^"\']*)["\'][^>]*>/gi) || [];
  const internalLinkCount = linkMatches.filter(link => {
    const hrefMatch = link.match(/href=["\']([^"\']*)["\']/i);
    if (!hrefMatch) return false;
    const href = hrefMatch[1];
    return href.includes(domain) || href.startsWith('/');
  }).length;
  
  return {
    title,
    wordCount,
    imageCount,
    headingCount,
    metaDescription,
    internalLinkCount,
    domain
  };
}

/**
 * Extract technical SEO data from HTML
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @param {string|null} crawlError - Error message if crawling failed
 * @returns {Object} - Technical SEO data
 */
function extractTechnicalSeoData(html, url, crawlError) {
  if (!html || crawlError) {
    return getDefaultTechnicalSeo(url, crawlError);
  }

  try {
    // Schema markup detection
    const jsonLdSchema = html.includes('<script type="application/ld+json">');
    const microdata = html.includes('itemtype="http://schema.org/') || html.includes('itemtype="https://schema.org/');
    const schemaMarkupPresent = jsonLdSchema || microdata;
    
    // Extract schema types
    const schemaTypes = [];
    
    if (jsonLdSchema) {
      const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = schemaRegex.exec(html)) !== null) {
        try {
          const schemaJson = JSON.parse(match[1]);
          if (schemaJson['@type']) {
            if (Array.isArray(schemaJson['@type'])) {
              schemaTypes.push(...schemaJson['@type']);
            } else {
              schemaTypes.push(schemaJson['@type']);
            }
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    }
    
    if (microdata) {
      const microdataRegex = /itemtype="https?:\/\/schema\.org\/([^"]+)"/gi;
      let match;
      while ((match = microdataRegex.exec(html)) !== null) {
        schemaTypes.push(match[1]);
      }
    }
    
    // Deduplicate schema types
    const uniqueSchemaTypes = [...new Set(schemaTypes)];
    
    // Meta description presence
    const metaDescriptionPresent = html.includes('name="description"');
    
    // ARIA labels presence
    const ariaLabelsPresent = html.includes('aria-') || html.includes('role=');
    
    // Extract ARIA label types
    const ariaLabelTypes = [];
    const ariaRegex = /aria-([a-z]+)=/gi;
    let ariaMatch;
    while ((ariaMatch = ariaRegex.exec(html)) !== null) {
      ariaLabelTypes.push(ariaMatch[1]);
    }
    
    // Deduplicate ARIA label types
    const uniqueAriaLabelTypes = [...new Set(ariaLabelTypes)];
    
    // Social graphs presence
    const socialGraphsPresent = html.includes('property="og:') || html.includes('name="twitter:');
    
    // HTML structure score
    let htmlStructureScore = 3; // Default score
    
    // Check for semantic HTML elements
    const semanticHtmlUsage = /(<article|<section|<nav|<aside|<header|<footer|<main)/i.test(html);
    if (semanticHtmlUsage) htmlStructureScore += 1;
    
    // Check for proper heading structure
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    
    if (h1Count === 1) htmlStructureScore += 1; // One H1 tag
    if (h2Count > 0) htmlStructureScore += 1; // Has H2 tags
    if (h3Count > 0 && h2Count >= h3Count) htmlStructureScore += 1; // Proper hierarchy
    
    // Check for language declaration
    const hreflangDeclaration = html.includes('hreflang="') || html.includes('lang="');
    if (hreflangDeclaration) htmlStructureScore += 1;
    
    // Cap score at 10
    htmlStructureScore = Math.min(10, htmlStructureScore);
    
    // Date information
    let dateCreated = null;
    let dateModified = null;
    
    // Look for date metadata
    const publishedMatch = html.match(/published_time" content="([^"]+)"/);
    const modifiedMatch = html.match(/modified_time" content="([^"]+)"/);
    
    if (publishedMatch) dateCreated = publishedMatch[1];
    if (modifiedMatch) dateModified = modifiedMatch[1];
    
    // CDN detection (basic heuristics)
    const cdnUsage = html.includes('cdn.') || 
                    html.includes('cloudfront.net') || 
                    html.includes('cloudflare.com') ||
                    html.includes('akamai');
    
    return {
      is_valid: true,
      is_crawlable: true,
      http_response_code: 200,
      schema_markup_present: schemaMarkupPresent,
      schema_types: uniqueSchemaTypes,
      html_structure_score: htmlStructureScore,
      semantic_html_usage: semanticHtmlUsage,
      mobile_friendly: true, // Assumption
      hreflang_declaration: hreflangDeclaration,
      date_created: dateCreated,
      date_modified: dateModified,
      cdn_usage: cdnUsage,
      meta_description_present: metaDescriptionPresent,
      aria_labels_present: ariaLabelsPresent,
      aria_labels_types: uniqueAriaLabelTypes,
      social_graphs_present: socialGraphsPresent
    };
  } catch (error) {
    console.error('Error extracting technical SEO data:', error);
    return getDefaultTechnicalSeo(url, error.message);
  }
}

/**
 * Extract on-page SEO data from HTML
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @param {Object} pageInfo - Basic page information
 * @param {string} keyword - Target keyword
 * @returns {Object} - On-page SEO data
 */
function extractOnPageSeoData(html, url, pageInfo, keyword) {
  if (!html) {
    return getDefaultOnPageSeo(url);
  }

  try {
    const urlObj = new URL(url);
    const folderDepth = urlObj.pathname.split('/').filter(p => p).length;
    
    // Extract content type (basic heuristic)
    let contentType = 'Unknown';
    if (url.includes('/blog/')) {
      contentType = 'Blog Post';
    } else if (url.includes('/product/')) {
      contentType = 'Product Page';
    } else if (url.includes('/about/')) {
      contentType = 'About Page';
    } else if (urlObj.pathname === '/' || urlObj.pathname === '') {
      contentType = 'Homepage';
    } else if (html.includes('article') || html.includes('blog')) {
      contentType = 'Article';
    }
    
    // Count headings by type
    const headingCountType = {
      h1: (html.match(/<h1[^>]*>/gi) || []).length,
      h2: (html.match(/<h2[^>]*>/gi) || []).length,
      h3: (html.match(/<h3[^>]*>/gi) || []).length,
      h4: (html.match(/<h4[^>]*>/gi) || []).length,
      h5: (html.match(/<h5[^>]*>/gi) || []).length,
      h6: (html.match(/<h6[^>]*>/gi) || []).length
    };
    
    // Check for tables
    const hasTable = html.includes('<table');
    const tableCount = (html.match(/<table/gi) || []).length;
    
    // Check for lists
    const hasUnorderedList = html.includes('<ul');
    const unorderedListCount = (html.match(/<ul/gi) || []).length;
    
    const hasOrderedList = html.includes('<ol');
    const orderedListCount = (html.match(/<ol/gi) || []).length;
    
    // Check for authorship
    const authorshipPatterns = [
      'author',
      'byline',
      'by:',
      'written by',
      'posted by',
      'published by'
    ];
    
    const authorshipClear = authorshipPatterns.some(pattern => 
      html.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Check for keyword presence
    const keywordMatch = [];
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      const htmlLower = html.toLowerCase();
      
      if (htmlLower.includes(keywordLower)) {
        keywordMatch.push(keyword);
      }
      
      // Check for keyword variations
      const variations = [
        keyword.replace(/s$/, ''), // Singular
        keyword + 's', // Plural
        keyword.split(' ').reverse().join(' ') // Reverse word order
      ];
      
      for (const variation of variations) {
        if (variation !== keyword && htmlLower.includes(variation.toLowerCase())) {
          keywordMatch.push(variation);
        }
      }
    }
    
    // Check for video
    const videoPresent = html.includes('video') || 
                        html.includes('youtube.com') || 
                        html.includes('vimeo.com') ||
                        html.includes('wistia') ||
                        html.includes('loom.com');
    
    return {
      page_title: pageInfo.title || '',
      content_type: contentType,
      meta_description: pageInfo.metaDescription || '',
      word_count: pageInfo.wordCount || 0,
      image_count: pageInfo.imageCount || 0,
      video_present: videoPresent,
      has_table: hasTable,
      has_table_count: tableCount,
      has_unordered_list: hasUnorderedList,
      has_unordered_list_count: unorderedListCount,
      has_ordered_list: hasOrderedList,
      has_ordered_list_count: orderedListCount,
      internal_link_count: pageInfo.internalLinkCount || 0,
      folder_depth: folderDepth,
      authorship_clear: authorshipClear,
      heading_count: Object.values(headingCountType).reduce((sum, count) => sum + count, 0),
      heading_count_type: headingCountType,
      keyword_match: keywordMatch
    };
  } catch (error) {
    console.error('Error extracting on-page SEO data:', error);
    return getDefaultOnPageSeo(url);
  }
}

/**
 * Analyze content quality using AI
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @param {string} queryText - Query text for context
 * @param {string|null} crawlError - Error message if crawling failed
 * @returns {Object} - Content quality data
 */
async function analyzeContentQuality(html, url, queryText, crawlError) {
  if (!html || crawlError || !process.env.OPENAI_API_KEY) {
    return getDefaultContentQuality();
  }

  try {
    // Extract text content from HTML
    const textContent = extractTextContent(html);
    
    // Truncate to avoid token limits
    const truncatedContent = textContent.substring(0, 10000);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Prepare prompt
    const prompt = `
Analyze this web page content that was cited in response to the query: "${queryText}"

URL: ${url}
Content: ${truncatedContent.substring(0, 4000)}

Return ONLY a JSON object with these fields:
{
  "content_type": "Blog Post, Product Page, Landing Page, etc.",
  "rock_paper_scissors": "Rock, Paper, or Scissors (where Rock=factual reference content, Paper=comprehensive guides, Scissors=persuasive/sales content)",
  "content_depth_score": (1-5 score with 5 being most comprehensive),
  "sentiment_score": (-1 to 1 with -1 being negative, 0 neutral, 1 positive),
  "content_uniqueness": (1-5 score with 5 being most unique),
  "content_optimization_score": (1-5 score with 5 being best optimized),
  "has_statistics": (true/false),
  "has_quotes": (true/false),
  "has_research": (true/false),
  "analysis_score": (1-5 overall quality score),
  "citation_match_quality": (1-5 score of how well this content matches the query),
  "topical_cluster": "Main topic category of this content",
  "eeat_score": (1-5 score with 5 being strongest signals of expertise, experience, authoritativeness, and trustworthiness),
  "ai_content_detection": (1-5 score with 5 being most likely to be human-written content)
}`;

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content analyst specializing in SEO and content quality. Return ONLY valid JSON with the exact fields requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate and fill in missing fields with defaults
    const defaultData = getDefaultContentQuality();
    
    return {
      content_depth_score: result.content_depth_score || defaultData.content_depth_score,
      readability_score: result.readability_score || defaultData.readability_score,
      sentiment_score: result.sentiment_score || defaultData.sentiment_score,
      content_uniqueness: result.content_uniqueness || defaultData.content_uniqueness,
      content_optimization_score: result.content_optimization_score || defaultData.content_optimization_score,
      has_statistics: result.has_statistics || defaultData.has_statistics,
      has_quotes: result.has_quotes || defaultData.has_quotes,
      has_citations: result.has_citations || defaultData.has_citations,
      has_research: result.has_research || defaultData.has_research,
      analysis_score: result.analysis_score || defaultData.analysis_score,
      rock_paper_scissors: result.rock_paper_scissors || defaultData.rock_paper_scissors,
      citation_match_quality: result.citation_match_quality || defaultData.citation_match_quality,
      eeat_score: result.eeat_score || defaultData.eeat_score,
      ai_content_detection: result.ai_content_detection || defaultData.ai_content_detection,
      topical_cluster: result.topical_cluster || defaultData.topical_cluster
    };
    
  } catch (error) {
    console.error('Error analyzing content quality:', error);
    return getDefaultContentQuality();
  }
}

/**
 * Analyze page context in relation to query
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @param {string} queryText - Query text for context
 * @param {string} brandName - Brand name
 * @param {string[]} competitorNames - Competitor names
 * @param {string|null} crawlError - Error message if crawling failed
 * @returns {Object} - Page analysis data
 */
async function analyzePageContext(html, url, queryText, brandName, competitorNames, crawlError) {
  if (!html || crawlError || !process.env.OPENAI_API_KEY) {
    return getDefaultPageAnalysis();
  }

  try {
    // Extract text content from HTML
    const textContent = extractTextContent(html);
    
    // Truncate to avoid token limits
    const truncatedContent = textContent.substring(0, 6000);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Prepare prompt
    const prompt = `
Analyze this web page in relation to the query: "${queryText}"

URL: ${url}
Brand mentioned: ${brandName || 'None'}
Competitors mentioned: ${competitorNames.join(', ') || 'None'}
Content: ${truncatedContent.substring(0, 4000)}

Return ONLY a JSON object with these fields (choose from the options in parentheses):
{
  "page_relevance_type": ("direct", "partial", "misaligned"),
  "page_intent_alignment": ("high", "moderate", "low", "mismatch"),
  "content_format": ("article", "blog", "landing_page", "product", "category", "about", "support", "other"),
  "content_depth": ("comprehensive", "overview", "shallow"),
  "brand_positioning": ("prominent", "mentioned", "absent"),
  "competitor_presence": ("exclusive", "featured", "mentioned", "none"),
  "call_to_action_strength": ("strong", "moderate", "passive", "none"),
  "content_recency": ("recent", "older", "outdated", "undated"),
  "eeat_signals": ("strong", "moderate", "weak"),
  "user_experience_quality": ("excellent", "good", "average", "poor", "problematic"),
  "content_structure": ("hierarchical", "linear", "fragmented"),
  "analysis_notes": "Brief 1-2 sentence analysis of how well this page serves the query intent"
}`;

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a web page analyst specializing in SEO and content quality. Return ONLY valid JSON with the exact fields requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate and fill in missing fields with defaults
    const defaultData = getDefaultPageAnalysis();
    
    return {
      page_relevance_type: result.page_relevance_type || defaultData.page_relevance_type,
      page_intent_alignment: result.page_intent_alignment || defaultData.page_intent_alignment,
      content_format: result.content_format || defaultData.content_format,
      content_depth: result.content_depth || defaultData.content_depth,
      brand_positioning: result.brand_positioning || defaultData.brand_positioning,
      competitor_presence: result.competitor_presence || defaultData.competitor_presence,
      call_to_action_strength: result.call_to_action_strength || defaultData.call_to_action_strength,
      content_recency: result.content_recency || defaultData.content_recency,
      eeat_signals: result.eeat_signals || defaultData.eeat_signals,
      user_experience_quality: result.user_experience_quality || defaultData.user_experience_quality,
      content_structure: result.content_structure || defaultData.content_structure,
      analysis_notes: result.analysis_notes || defaultData.analysis_notes
    };
    
  } catch (error) {
    console.error('Error analyzing page context:', error);
    return getDefaultPageAnalysis();
  }
}

/**
 * Extract text content from HTML
 * @param {string} html - HTML content
 * @returns {string} - Text content
 */
function extractTextContent(html) {
  if (!html) return '';
  
  try {
    // Remove scripts and styles
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    
    // Replace all tags with space
    content = content.replace(/<[^>]+>/g, ' ');
    
    // Normalize whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    return content;
  } catch (error) {
    console.error('Error extracting text content:', error);
    return '';
  }
}

/**
 * Get PageSpeed data using Google PageSpeed Insights API
 * @param {string} url - URL to analyze
 * @returns {Object} - PageSpeed data
 */
async function getPageSpeedData(url) {
  if (!process.env.PAGESPEED_API_KEY) {
    console.warn('PageSpeed API key not found, using default values');
    return getDefaultPagePerformance();
  }
  
  try {
    console.log('Querying PageSpeed API for:', url);
    
    // Create API URL with key and parameters
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', process.env.PAGESPEED_API_KEY);
    apiUrl.searchParams.append('strategy', 'desktop'); // Use desktop strategy
    apiUrl.searchParams.append('category', 'performance');
    apiUrl.searchParams.append('category', 'accessibility');
    
    console.log('Fetching PageSpeed data...');
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the metrics we need
    const metrics = {};
    
    // Get overall scores
    const performance = data.lighthouseResult?.categories?.performance?.score || 0;
    const accessibility = data.lighthouseResult?.categories?.accessibility?.score || 0;
    
    // Convert from 0-1 scale to 0-100
    metrics.page_speed_score = Math.round(performance * 100);
    metrics.accessibility_score = Math.round(accessibility * 5) / 1; // Convert to 1-5 scale
    
    // Extract Core Web Vitals
    const audits = data.lighthouseResult?.audits || {};
    
    // First Contentful Paint in ms
    metrics.firstContentfulPaint = Math.round(
      audits['first-contentful-paint']?.numericValue || 1000
    );
    
    // Largest Contentful Paint in ms
    metrics.largestContentfulPaint = Math.round(
      audits['largest-contentful-paint']?.numericValue || 2500
    );
    
    // Total Blocking Time in ms
    metrics.totalBlockingTime = Math.round(
      audits['total-blocking-time']?.numericValue || 100
    );
    
    // Cumulative Layout Shift (unitless)
    metrics.cumulativeLayoutShift = 
      parseFloat((audits['cumulative-layout-shift']?.numericValue || 0.1).toFixed(2));
    
    console.log('PageSpeed API metrics retrieved:', metrics);
    return metrics;
  } catch (error) {
    console.error('Error fetching PageSpeed data:', error);
    return getDefaultPagePerformance();
  }
}

/**
 * Get domain authority data
 * @param {string} domain - Domain to analyze
 * @returns {Object} - Domain authority data
 */
async function getMozData(domain) {
  try {
    console.log('Getting domain metrics for:', domain);
    
    // Use our domain metrics module to get the data
    // This handles all the details internally
    return await getDomainMetrics(domain);
  } catch (error) {
    console.error('Error fetching domain metrics:', error);
    return getDefaultDomainAuthority(domain);
  }
}

/**
 * Get default technical SEO data
 * @param {string} url - URL of the page
 * @param {string|null} errorReason - Error message if crawling failed
 * @returns {Object} - Default technical SEO data
 */
function getDefaultTechnicalSeo(url, errorReason = null) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  
  return {
    is_valid: true,
    is_crawlable: !errorReason,
    http_response_code: errorReason ? 0 : 200,
    schema_markup_present: false,
    schema_types: [],
    html_structure_score: 3,
    semantic_html_usage: false,
    mobile_friendly: true,
    hreflang_declaration: false,
    date_created: null,
    date_modified: null,
    cdn_usage: false,
    meta_description_present: false,
    aria_labels_present: false,
    aria_labels_types: [],
    social_graphs_present: false
  };
}

/**
 * Get default on-page SEO data
 * @param {string} url - URL of the page
 * @returns {Object} - Default on-page SEO data
 */
function getDefaultOnPageSeo(url) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const folderDepth = urlObj.pathname.split('/').filter(p => p).length;
  
  return {
    page_title: `Page at ${domain}`,
    content_type: 'Unknown',
    meta_description: '',
    word_count: 0,
    image_count: 0,
    video_present: false,
    has_table: false,
    has_table_count: 0,
    has_unordered_list: false,
    has_unordered_list_count: 0,
    has_ordered_list: false,
    has_ordered_list_count: 0,
    internal_link_count: 0,
    folder_depth: folderDepth,
    authorship_clear: false,
    heading_count: 0,
    heading_count_type: {
      h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0
    },
    keyword_match: []
  };
}

/**
 * Get default content quality data
 * @returns {Object} - Default content quality data
 */
function getDefaultContentQuality() {
  return {
    content_depth_score: 3,
    readability_score: 3,
    sentiment_score: 0,
    content_uniqueness: 3,
    content_optimization_score: 3,
    has_statistics: false,
    has_quotes: false,
    has_citations: false,
    has_research: false,
    analysis_score: 3,
    rock_paper_scissors: 'Rock',
    citation_match_quality: 3,
    eeat_score: 3,
    ai_content_detection: 3,
    topical_cluster: 'General'
  };
}

/**
 * Get default page performance data
 * @returns {Object} - Default page performance data
 */
function getDefaultPagePerformance() {
  return {
    page_speed_score: 50,
    firstContentfulPaint: 1000,
    largestContentfulPaint: 2500,
    totalBlockingTime: 100,
    cumulativeLayoutShift: 0.1,
    accessibility_score: 3
  };
}

/**
 * Get default domain authority data
 * @param {string} domain - Domain name
 * @returns {Object} - Default domain authority data
 */
function getDefaultDomainAuthority(domain) {
  return {
    domain_name: domain,
    domain_authority: 30,
    page_authority: 20,
    backlink_count: 100,
    referring_domains: 50,
    link_propensity: 0.5,
    spam_score: 2
  };
}

/**
 * Get default page analysis data
 * @returns {Object} - Default page analysis data
 */
function getDefaultPageAnalysis() {
  return {
    page_relevance_type: 'partial',
    page_intent_alignment: 'moderate',
    content_format: 'article',
    content_depth: 'overview',
    brand_positioning: 'absent',
    competitor_presence: 'none',
    call_to_action_strength: 'none',
    content_recency: 'undated',
    eeat_signals: 'weak',
    user_experience_quality: 'average',
    content_structure: 'linear',
    analysis_notes: 'Default analysis due to crawl error or missing data'
  };
}

export {
  analyzePage,
  crawlPage,
  extractPageInfo,
  extractTechnicalSeoData,
  extractOnPageSeoData,
  analyzeContentQuality,
  analyzePageContext
};