/**
 * Comprehensive Page Analysis Module
 * 
 * Provides deep analysis of web pages including:
 * - Technical SEO analysis (schema, accessibility, structure)
 * - On-page SEO data (headings, content type, keyword analysis)
 * - Content quality scoring using AI
 * - EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) analysis
 * - Brand and competitor mention detection
 */

import OpenAI from 'openai';
import { crawlPage, extractTextContent, normalizeDomain } from './scraper.js';

/**
 * Default scoring values for various metrics
 */
const DEFAULT_SCORES = {
  technical_seo: {
    html_structure_score: 6,
    accessibility_score: 3
  },
  content_quality: {
    content_depth_score: 6,
    content_uniqueness: 6,
    eeat_score: 6,
    citation_match_quality: 6,
    analysis_score: 6,
    ai_content_detection: 6
  },
  page_performance: {
    page_speed_score: 50,
    accessibility_score: 3
  }
};

/**
 * Check if two domains match (exact match after normalization)
 * @param {string} domain1 - First domain
 * @param {string} domain2 - Second domain  
 * @returns {boolean} - Whether domains match
 */
function domainsMatch(domain1, domain2) {
  if (!domain1 || !domain2) return false;
  return normalizeDomain(domain1) === normalizeDomain(domain2);
}

/**
 * Main function to analyze a web page comprehensively
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

    // Check domain relationships
    const isClientDomain = brand_domain && domainsMatch(domain, brand_domain);
    const competitorMatch = competitors.find(comp => 
      comp.domain && domainsMatch(domain, comp.domain)
    );
    const isCompetitorDomain = !!competitorMatch;

    console.log(`🏷️ Domain classification: Client=${isClientDomain}, Competitor=${isCompetitorDomain}`);

    let crawlError = null;
    let pageInfo = null;
    let htmlContent = null;
    let crawlResultData = null;

    // Attempt to crawl the page
    try {
      console.log(`\n🕸️ CRAWLING PHASE - Starting web crawl`);
      const crawlResult = await crawlPage(citation_url, options);
      htmlContent = crawlResult.html;
      crawlResultData = crawlResult.crawl_result;

      console.log(`✅ Crawl successful - ${crawlResultData.html_length} bytes using ${crawlResultData.method}`);
      console.log(`🌐 Status: ${crawlResultData.status_code} (${crawlResultData.word_count} words)`);

      console.log(`\n📊 EXTRACTION PHASE - Extracting basic page information`);
      pageInfo = extractPageInfo(htmlContent, citation_url);
      console.log(`📝 Title: "${pageInfo.title}"`);
      console.log(`📏 Content: ${pageInfo.wordCount} words, ${pageInfo.imageCount} images`);
      
    } catch (error) {
      crawlError = error.message;
      console.error(`❌ CRAWL ERROR: ${error.message}`);

      crawlResultData = error.crawl_result || {
        status_code: 0,
        status_text: 'Crawl Failed',
        success: false,
        method: 'failed',
        error_type: 'crawl_error',
        error_details: error.message
      };

      pageInfo = { title: `Page at ${domain}`, domain };
    }

    // Extract technical SEO data
    console.log(`\n🔧 TECHNICAL SEO PHASE`);
    const technicalSeoData = extractTechnicalSeoData(htmlContent, citation_url, crawlError);
    console.log(`⚙️ Schema: ${technicalSeoData.schema_markup_present ? 'Yes' : 'No'}`);
    console.log(`📱 Mobile friendly: ${technicalSeoData.mobile_friendly ? 'Yes' : 'No'}`);
    console.log(`🏗️ Structure score: ${technicalSeoData.html_structure_score}/10`);

    // Extract on-page SEO data
    console.log(`\n📝 ON-PAGE SEO PHASE`);
    const onPageSeoData = extractOnPageSeoData(htmlContent, citation_url, pageInfo, keyword);
    console.log(`📊 Content type: ${onPageSeoData.content_type}`);
    console.log(`🔤 Headings: H1=${onPageSeoData.heading_count_type.h1}, H2=${onPageSeoData.heading_count_type.h2}`);
    console.log(`🏷️ Keywords: ${onPageSeoData.keyword_match.join(', ') || 'None'}`);

    // AI-powered content quality analysis
    console.log(`\n🧠 AI ANALYSIS PHASE - Content quality assessment`);
    const contentQualityData = await analyzeContentQuality(
      htmlContent,
      citation_url,
      query_text,
      crawlError
    );
    console.log(`📈 Content depth: ${contentQualityData.content_depth_score}/10`);
    console.log(`🎯 Citation match: ${contentQualityData.citation_match_quality}/10`);
    console.log(`🧩 Content type: ${contentQualityData.rock_paper_scissors}`);

    // Brand and competitor analysis
    console.log(`\n🏢 BRAND ANALYSIS PHASE`);
    const brandAnalysis = analyzeBrandMentions(
      htmlContent,
      pageInfo,
      brand_name,
      brand_domain,
      isClientDomain
    );
    console.log(`🏷️ Brand mentioned: ${brandAnalysis.brand_mentioned} (${brandAnalysis.brand_mention_count} times)`);

    const competitorAnalysis = analyzeCompetitorMentions(
      htmlContent,
      competitors,
      isCompetitorDomain
    );
    console.log(`🥇 Competitors mentioned: ${competitorAnalysis.competitor_names.join(', ') || 'None'}`);

    // Page context analysis
    console.log(`\n🎯 CONTEXT ANALYSIS PHASE`);
    const pageAnalysisData = await analyzePageContext(
      htmlContent || '', 
      citation_url,
      query_text,
      brand_name,
      competitorAnalysis.competitor_names,
      crawlError
    );
    console.log(`📊 Relevance: ${pageAnalysisData.page_relevance_type}`);
    console.log(`🎯 Intent alignment: ${pageAnalysisData.page_intent_alignment}`);

    // Performance data (placeholder - can be enhanced with real PageSpeed API)
    const pagePerformanceData = getDefaultPagePerformance();
    
    // Domain authority data (placeholder - can be enhanced with Moz API)
    const domainAuthorityData = getDefaultDomainAuthority(domain);

    // EEAT Analysis
    console.log(`\n🎓 EEAT ANALYSIS PHASE`);
    let eeatAnalysisData = null;
    try {
      if (contentQualityData && contentQualityData.eeat_score >= 6) {
        // Use content quality EEAT score as basis for detailed analysis
        eeatAnalysisData = generateEEATAnalysis(contentQualityData, technicalSeoData);
        console.log(`✅ EEAT analysis completed (score: ${eeatAnalysisData.eeat_score}/10)`);
      } else {
        eeatAnalysisData = getDefaultEEATAnalysis();
        console.log(`⚠️ Using default EEAT analysis`);
      }
    } catch (eeatError) {
      console.error(`❌ EEAT Analysis error: ${eeatError.message}`);
      eeatAnalysisData = getDefaultEEATAnalysis();
    }

    // Compile comprehensive analysis record
    const pageAnalysisRecord = {
      // Basic identifiers
      citation_url,
      citation_position: citation_position || 1,
      domain_name: domain,
      page_title: pageInfo ? pageInfo.title : `Page at ${domain}`,
      
      // Domain classification
      is_client_domain: isClientDomain,
      is_competitor_domain: isCompetitorDomain,
      mention_type: ['citation'],
      
      // SEO and technical analysis
      technical_seo: technicalSeoData,
      on_page_seo: onPageSeoData,
      content_quality: contentQualityData,
      page_performance: pagePerformanceData,
      domain_authority: domainAuthorityData,
      page_analysis: pageAnalysisData,
      eeat_analysis: eeatAnalysisData,
      
      // Brand analysis
      brand_mentioned: brandAnalysis.brand_mentioned,
      brand_in_title: brandAnalysis.brand_in_title,
      brand_mention_count: brandAnalysis.brand_mention_count,
      brand_context: brandAnalysis.brand_mentioned ? 'citation' : '',
      
      // Competitor analysis
      competitor_mentioned: competitorAnalysis.competitor_mentioned,
      competitor_names: competitorAnalysis.competitor_names,
      competitor_analysis: competitorAnalysis.competitor_analysis,
      competitor_context: competitorAnalysis.competitor_mentioned ? 'mentioned' : '',
      
      // Query context
      query_text,
      query_keyword: keyword,
      
      // Calculated scores
      relevance_score: calculateRelevanceScore(pageAnalysisData.page_relevance_type),
      content_quality_score: contentQualityData.content_depth_score || DEFAULT_SCORES.content_quality.content_depth_score,
      eeat_score: eeatAnalysisData ? eeatAnalysisData.eeat_score : DEFAULT_SCORES.content_quality.eeat_score,
      
      // Crawl metadata
      crawl_result: crawlResultData,
      crawl_error: crawlError,
      analysis_notes: crawlError ? 'Analysis with crawl limitations' : 'Complete analysis',
      
      // Timestamp
      created_at: new Date().toISOString()
    };

    console.log(`\n✅ PAGE ANALYSIS COMPLETED SUCCESSFULLY`);
    console.log(`📊 Final scores: Relevance=${pageAnalysisRecord.relevance_score}, Content=${pageAnalysisRecord.content_quality_score}, EEAT=${pageAnalysisRecord.eeat_score}`);

    return pageAnalysisRecord;

  } catch (error) {
    console.error(`❌ Error analyzing page ${citation_url}:`, error.message);
    throw error;
  }
}

/**
 * Extract basic page information from HTML
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @returns {Object} - Basic page information
 */
function extractPageInfo(html, url) {
  if (!html) {
    const domain = new URL(url).hostname;
    return { title: `Page at ${domain}`, domain };
  }

  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : `Page at ${domain}`;
  
  // Extract and count content elements
  const textContent = extractTextContent(html);
  const wordCount = (textContent.match(/\b\w+\b/g) || []).length;
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;
  
  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1] : '';
  
  // Count internal links
  const linkMatches = html.match(/<a[^>]*href=["\']([^"\']*)["\'][^>]*>/gi) || [];
  const internalLinkCount = linkMatches.filter(link => {
    const hrefMatch = link.match(/href=["\']([^"\']*)["\']/i);
    if (!hrefMatch) return false;
    const href = hrefMatch[1];
    
    if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
      return true;
    }
    
    try {
      const linkUrl = new URL(href, url);
      return domainsMatch(linkUrl.hostname, domain);
    } catch (e) {
      return href.includes(domain);
    }
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
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {string|null} crawlError - Crawl error if any
 * @returns {Object} - Technical SEO analysis
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
            const types = Array.isArray(schemaJson['@type']) ? schemaJson['@type'] : [schemaJson['@type']];
            schemaTypes.push(...types);
          }
        } catch (e) {
          console.warn('Invalid JSON-LD schema found');
        }
      }
    }
    
    // Accessibility and structure analysis
    const ariaLabelsPresent = html.includes('aria-') || html.includes('role=');
    const socialGraphsPresent = html.includes('property="og:') || html.includes('name="twitter:');
    const metaDescriptionPresent = html.includes('name="description"');
    
    // HTML structure scoring
    let htmlStructureScore = 3;
    
    // Semantic HTML usage
    const semanticHtmlUsage = /(<article|<section|<nav|<aside|<header|<footer|<main)/i.test(html);
    if (semanticHtmlUsage) htmlStructureScore += 1;
    
    // Heading structure
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    
    if (h1Count === 1) htmlStructureScore += 1;
    if (h2Count > 0) htmlStructureScore += 1;
    if (h3Count > 0 && h2Count >= h3Count) htmlStructureScore += 1;
    
    // Language declaration
    const hreflangDeclaration = html.includes('hreflang="') || html.includes('lang="');
    if (hreflangDeclaration) htmlStructureScore += 1;
    
    htmlStructureScore = Math.min(10, htmlStructureScore);
    
    return {
      is_valid: true,
      is_crawlable: true,
      http_response_code: 200,
      schema_markup_present: schemaMarkupPresent,
      schema_types: [...new Set(schemaTypes)],
      html_structure_score: htmlStructureScore,
      semantic_html_usage: semanticHtmlUsage,
      mobile_friendly: true,
      hreflang_declaration: hreflangDeclaration,
      meta_description_present: metaDescriptionPresent,
      aria_labels_present: ariaLabelsPresent,
      social_graphs_present: socialGraphsPresent
    };
  } catch (error) {
    console.error('Error in technical SEO analysis:', error);
    return getDefaultTechnicalSeo(url, error.message);
  }
}

/**
 * Extract on-page SEO data
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {Object} pageInfo - Basic page info
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
    
    // Determine content type
    let contentType = 'Unknown';
    const path = urlObj.pathname.toLowerCase();
    if (path.includes('/blog/')) contentType = 'Blog Post';
    else if (path.includes('/product/')) contentType = 'Product Page';
    else if (path.includes('/about/')) contentType = 'About Page';
    else if (path === '/' || path === '') contentType = 'Homepage';
    else if (html.includes('article') || html.includes('blog')) contentType = 'Article';
    
    // Count headings by type
    const headingCountType = {
      h1: (html.match(/<h1[^>]*>/gi) || []).length,
      h2: (html.match(/<h2[^>]*>/gi) || []).length,
      h3: (html.match(/<h3[^>]*>/gi) || []).length,
      h4: (html.match(/<h4[^>]*>/gi) || []).length,
      h5: (html.match(/<h5[^>]*>/gi) || []).length,
      h6: (html.match(/<h6[^>]*>/gi) || []).length
    };
    
    // Check for content elements
    const hasTable = html.includes('<table');
    const tableCount = (html.match(/<table(?:\s[^>]*)?>/gi) || []).length;
    const hasUnorderedList = html.includes('<ul');
    const unorderedListCount = (html.match(/<ul(?:\s[^>]*)?>/gi) || []).length;
    const hasOrderedList = html.includes('<ol');
    const orderedListCount = (html.match(/<ol(?:\s[^>]*)?>/gi) || []).length;
    
    // Check for authorship indicators
    const authorshipPatterns = ['author', 'byline', 'by:', 'written by', 'posted by'];
    const authorshipClear = authorshipPatterns.some(pattern => 
      html.toLowerCase().includes(pattern)
    );
    
    // Keyword analysis
    const keywordMatch = [];
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      const htmlLower = html.toLowerCase();
      
      if (htmlLower.includes(keywordLower)) {
        keywordMatch.push(keyword);
      }
      
      // Check variations
      const variations = [
        keyword.replace(/s$/, ''),
        keyword + 's',
        keyword.split(' ').reverse().join(' ')
      ];
      
      for (const variation of variations) {
        if (variation !== keyword && htmlLower.includes(variation.toLowerCase())) {
          keywordMatch.push(variation);
        }
      }
    }
    
    // Check for multimedia
    const videoPresent = html.includes('video') || 
                        html.includes('youtube.com') || 
                        html.includes('vimeo.com');
    
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
    console.error('Error in on-page SEO analysis:', error);
    return getDefaultOnPageSeo(url);
  }
}

/**
 * Analyze content quality using AI
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {string} queryText - Query for context
 * @param {string|null} crawlError - Crawl error if any
 * @returns {Object} - Content quality analysis
 */
async function analyzeContentQuality(html, url, queryText, crawlError) {
  if (!html || crawlError || !process.env.OPENAI_API_KEY) {
    return getDefaultContentQuality();
  }

  try {
    const textContent = extractTextContent(html);
    const truncatedContent = textContent.substring(0, 4000);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const prompt = `
Analyze this web page content that was cited in response to the query: "${queryText}"

URL: ${url}
Content: ${truncatedContent}

Return ONLY a JSON object with these fields:
{
  "content_depth_score": (1-10 score, 10 = most comprehensive),
  "content_uniqueness": (1-10 score, 10 = most unique),
  "eeat_score": (1-10 score, 10 = strongest expertise/authority signals),
  "citation_match_quality": (1-10 score, how well content matches the query),
  "rock_paper_scissors": "Rock|Paper|Scissors|Lizard|Spock (Rock=foundational, Paper=broad/thin, Scissors=opinion/review, Lizard=time-based, Spock=unique/speculative)",
  "has_statistics": (true/false),
  "has_quotes": (true/false),
  "has_research": (true/false),
  "has_citations": (true/false),
  "analysis_score": (1-10 overall quality),
  "topical_cluster": "Main topic category",
  "ai_content_detection": (1-10 score, 10 = most likely human-written)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content quality analyst. Return ONLY valid JSON with numeric scores on 1-10 scale (10 = best).'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    const defaultData = getDefaultContentQuality();

    // Normalize scores to 1-10 scale
    const normalizeScore = (score, defaultValue) => {
      const numScore = Number(score);
      if (isNaN(numScore) || numScore < 1 || numScore > 10) return defaultValue;
      return Math.round(numScore);
    };

    return {
      content_depth_score: normalizeScore(result.content_depth_score, defaultData.content_depth_score),
      content_uniqueness: normalizeScore(result.content_uniqueness, defaultData.content_uniqueness),
      eeat_score: normalizeScore(result.eeat_score, defaultData.eeat_score),
      citation_match_quality: normalizeScore(result.citation_match_quality, defaultData.citation_match_quality),
      analysis_score: normalizeScore(result.analysis_score, defaultData.analysis_score),
      ai_content_detection: normalizeScore(result.ai_content_detection, defaultData.ai_content_detection),
      rock_paper_scissors: result.rock_paper_scissors || defaultData.rock_paper_scissors,
      has_statistics: result.has_statistics || false,
      has_quotes: result.has_quotes || false,
      has_research: result.has_research || false,
      has_citations: result.has_citations || false,
      topical_cluster: result.topical_cluster || defaultData.topical_cluster
    };
    
  } catch (error) {
    console.error('Error in content quality analysis:', error);
    return getDefaultContentQuality();
  }
}

/**
 * Analyze page context in relation to query
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {string} queryText - Query text
 * @param {string} brandName - Brand name
 * @param {string[]} competitorNames - Competitor names
 * @param {string|null} crawlError - Crawl error if any
 * @returns {Object} - Page context analysis
 */
async function analyzePageContext(html, url, queryText, brandName, competitorNames, crawlError) {
  if (!html || crawlError || !process.env.OPENAI_API_KEY) {
    return getDefaultPageAnalysis();
  }

  try {
    const textContent = extractTextContent(html);
    const truncatedContent = textContent.substring(0, 4000);
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const prompt = `
Analyze this web page in relation to the query: "${queryText}"

URL: ${url}
Brand: ${brandName || 'None'}
Competitors: ${competitorNames.join(', ') || 'None'}
Content: ${truncatedContent}

Return ONLY a JSON object with these fields:
{
  "page_relevance_type": "direct|partial|misaligned",
  "page_intent_alignment": "high|moderate|low|mismatch",
  "content_format": "article|blog|landing_page|product|category|about|support|other",
  "content_depth": "comprehensive|overview|shallow",
  "brand_positioning": "prominent|mentioned|absent",
  "competitor_presence": "exclusive|featured|mentioned|none",
  "call_to_action_strength": "strong|moderate|passive|none",
  "content_recency": "recent|older|outdated|undated",
  "eeat_signals": "strong|moderate|weak",
  "user_experience_quality": "excellent|good|average|poor",
  "content_structure": "hierarchical|linear|fragmented",
  "analysis_notes": "Brief analysis of how well this page serves the query"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a page context analyst. Return ONLY valid JSON with the exact fields requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
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
    console.error('Error in page context analysis:', error);
    return getDefaultPageAnalysis();
  }
}

/**
 * Analyze brand mentions in content
 * @param {string} html - HTML content
 * @param {Object} pageInfo - Page information
 * @param {string} brandName - Brand name
 * @param {string} brandDomain - Brand domain
 * @param {boolean} isClientDomain - Whether this is client domain
 * @returns {Object} - Brand analysis
 */
function analyzeBrandMentions(html, pageInfo, brandName, brandDomain, isClientDomain) {
  let brandMentioned = false;
  let brandInTitle = false;
  let brandMentionCount = 0;

  if (brandName && pageInfo) {
    const titleLower = pageInfo.title.toLowerCase();
    const brandLower = brandName.toLowerCase();
    
    brandInTitle = titleLower.includes(brandLower);
    brandMentioned = brandInTitle || isClientDomain;
    
    if (html) {
      const regex = new RegExp(brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = html.match(regex);
      brandMentionCount = matches ? matches.length : 0;
    }
  }

  return {
    brand_mentioned: brandMentioned,
    brand_in_title: brandInTitle,
    brand_mention_count: brandMentionCount
  };
}

/**
 * Analyze competitor mentions in content
 * @param {string} html - HTML content
 * @param {Array} competitors - Competitor list
 * @param {boolean} isCompetitorDomain - Whether this is competitor domain
 * @returns {Object} - Competitor analysis
 */
function analyzeCompetitorMentions(html, competitors, isCompetitorDomain) {
  let competitorMentioned = isCompetitorDomain;
  let competitorNames = [];
  let competitorAnalysis = {};

  if (competitors && competitors.length > 0 && html) {
    for (const comp of competitors) {
      if (!comp.name) continue;
      
      const compNameRegex = new RegExp(comp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = html.match(compNameRegex);
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

  return {
    competitor_mentioned: competitorMentioned,
    competitor_names: competitorNames,
    competitor_analysis: competitorAnalysis
  };
}

/**
 * Calculate relevance score based on page relevance type
 * @param {string} relevanceType - Page relevance type
 * @returns {number} - Relevance score (0-1)
 */
function calculateRelevanceScore(relevanceType) {
  switch (relevanceType) {
    case 'direct': return 0.9;
    case 'partial': return 0.6;
    case 'misaligned': return 0.3;
    default: return 0.5;
  }
}

/**
 * Generate EEAT analysis based on content quality
 * @param {Object} contentQuality - Content quality data
 * @param {Object} technicalSeo - Technical SEO data
 * @returns {Object} - EEAT analysis
 */
function generateEEATAnalysis(contentQuality, technicalSeo) {
  const eeatScore = contentQuality.eeat_score;
  
  return {
    eeat_score: eeatScore,
    experience: {
      score: Math.max(5, eeatScore - 1),
      evidence: "Based on content quality analysis",
      real_world_application: contentQuality.has_statistics ? "Statistics present" : "Limited evidence"
    },
    expertise: {
      score: eeatScore,
      technical_depth: "Appropriate for topic",
      research_references: contentQuality.has_research ? "Research present" : "Limited references"
    },
    authoritativeness: {
      score: Math.max(5, eeatScore - 2),
      domain_credibility: "Moderate domain authority",
      comprehensiveness: contentQuality.content_depth_score >= 7 ? "Comprehensive" : "Moderate"
    },
    trustworthiness: {
      score: Math.max(5, eeatScore - 1),
      information_balance: "Balanced presentation",
      citation_presence: contentQuality.has_citations ? "Citations present" : "Limited citations"
    },
    strengths: [
      "Strong content depth and expertise signals",
      contentQuality.rock_paper_scissors === "Rock" ? "Foundational content" : "Quality structured content"
    ],
    improvement_areas: [
      contentQuality.has_citations ? "Could improve citation quality" : "Lacks sufficient citations",
      "Could enhance authority signals"
    ]
  };
}

// Default data functions
function getDefaultTechnicalSeo(url, errorReason = null) {
  return {
    is_valid: true,
    is_crawlable: !errorReason,
    http_response_code: errorReason ? 0 : 200,
    schema_markup_present: false,
    schema_types: [],
    html_structure_score: DEFAULT_SCORES.technical_seo.html_structure_score,
    semantic_html_usage: false,
    mobile_friendly: true,
    hreflang_declaration: false,
    meta_description_present: false,
    aria_labels_present: false,
    social_graphs_present: false
  };
}

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
    heading_count_type: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
    keyword_match: []
  };
}

function getDefaultContentQuality() {
  return {
    content_depth_score: DEFAULT_SCORES.content_quality.content_depth_score,
    content_uniqueness: DEFAULT_SCORES.content_quality.content_uniqueness,
    eeat_score: DEFAULT_SCORES.content_quality.eeat_score,
    citation_match_quality: DEFAULT_SCORES.content_quality.citation_match_quality,
    analysis_score: DEFAULT_SCORES.content_quality.analysis_score,
    ai_content_detection: DEFAULT_SCORES.content_quality.ai_content_detection,
    rock_paper_scissors: 'Rock',
    has_statistics: false,
    has_quotes: false,
    has_research: false,
    has_citations: false,
    topical_cluster: 'General'
  };
}

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

function getDefaultPagePerformance() {
  return {
    page_speed_score: DEFAULT_SCORES.page_performance.page_speed_score,
    firstContentfulPaint: 1000,
    largestContentfulPaint: 2500,
    totalBlockingTime: 100,
    cumulativeLayoutShift: 0.1,
    accessibility_score: DEFAULT_SCORES.page_performance.accessibility_score
  };
}

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

function getDefaultEEATAnalysis() {
  return {
    eeat_score: DEFAULT_SCORES.content_quality.eeat_score,
    experience: { score: 5, evidence: "Limited evidence" },
    expertise: { score: 5, technical_depth: "Basic level" },
    authoritativeness: { score: 5, domain_credibility: "Unknown" },
    trustworthiness: { score: 5, information_balance: "Uncertain" },
    strengths: ["Basic content structure"],
    improvement_areas: ["Needs more expertise signals", "Requires better citations"]
  };
}

export {
  analyzePage,
  extractPageInfo,
  extractTechnicalSeoData,
  extractOnPageSeoData,
  analyzeContentQuality,
  analyzePageContext,
  analyzeBrandMentions,
  analyzeCompetitorMentions,
  DEFAULT_SCORES
};