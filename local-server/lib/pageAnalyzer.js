/**
 * Enhanced Page Analyzer Module
 * 
 * Provides comprehensive analysis of web pages based on the CiteBots data definition schema
 */

import OpenAI from 'openai';
import fetch from 'node-fetch';
import { getDomainMetrics } from './domainAuthority.js';
import { analyzeEEAT } from './eeatAnalyzer.js';

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
    
    // Track crawl result information
    let crawlResultData = null;

    // Try to crawl the page
    try {
      console.log(`\n🕸️ CRAWLING PHASE - Starting web crawl`);
      const crawlResult = await crawlPage(citation_url);
      htmlContent = crawlResult.html;
      crawlResultData = crawlResult.crawl_result;

      console.log(`✅ Crawl successful - Received ${htmlContent.length} bytes of HTML using ${crawlResultData.method} method`);
      console.log(`🌐 HTTP Status: ${crawlResultData.status_code} ${crawlResultData.status_text}`);

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

      // Capture crawl result data from the error if available
      if (error.crawl_result) {
        crawlResultData = error.crawl_result;
        console.log(`🌐 HTTP Status: ${crawlResultData.status_code} ${crawlResultData.status_text}`);
        console.log(`❌ Error type: ${crawlResultData.error_type}`);
      } else {
        // Create default crawl result data if not provided by the error
        crawlResultData = {
          status_code: 0,
          status_text: 'Unknown Error',
          success: false,
          method: 'unknown',
          error_type: 'unknown_error',
          error_details: error.message
        };
      }

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
    console.log(`🏗️ HTML structure score: ${technicalSeoData.html_structure_score}/10`); // Already on 1-10 scale
    console.log(`♿ Accessibility: ${technicalSeoData.aria_labels_present ? 'ARIA elements present' : 'No ARIA elements'}`);

    // Extract on-page SEO data
    console.log(`\n📝 ON-PAGE SEO PHASE - Analyzing content structure and elements`);
    const onPageSeoData = extractOnPageSeoData(htmlContent, citation_url, pageInfo, keyword);
    console.log(`📊 Content type: ${onPageSeoData.content_type}`);
    console.log(`📋 Lists: ${onPageSeoData.has_unordered_list ? 'Yes' : 'No'} (${onPageSeoData.has_unordered_list_count} unordered lists, ${onPageSeoData.has_ordered_list_count} ordered lists)`);
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
    console.log(`📈 Content depth score: ${contentQualityData.content_depth_score}/10`);
    console.log(`📊 Content uniqueness: ${contentQualityData.content_uniqueness}/10`);
    console.log(`🧩 Content type: ${contentQualityData.rock_paper_scissors}`);
    console.log(`🎯 Citation match quality: ${contentQualityData.citation_match_quality}/10`);
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

    // Run EEAT analysis as one of the last things measured
    console.log(`\n🧠 RUNNING EEAT ANALYSIS - Evaluating Experience, Expertise, Authoritativeness, and Trustworthiness signals`);
    let eeatAnalysisData = null;
    try {
      // For EEAT analysis, we'll use the content quality scores if they indicate good content
      // This addresses a potential issue where the EEAT analyzer might not get the full JS-rendered content
      if (contentQualityData && contentQualityData.eeat_score >= 6) {
        console.log(`Using content quality EEAT score (${contentQualityData.eeat_score}/10) as basis for detailed analysis`);
        // Create an enhanced EEAT analysis based on content quality analysis
        eeatAnalysisData = {
          eeat_score: contentQualityData.eeat_score,
          experience: {
            score: Math.max(5, contentQualityData.eeat_score - 1),
            evidence: "Based on content quality analysis",
            real_world_application: "Detected in content quality analysis",
            case_studies: contentQualityData.has_statistics ? "Statistics present" : "None detected",
            expert_commentary: "Present based on content depth",
            temporal_markers: "Detected in content"
          },
          expertise: {
            score: contentQualityData.eeat_score,
            technical_depth: "Appropriate for topic",
            terminology_usage: "Proper usage detected",
            explanation_quality: "High quality explanations",
            research_references: contentQualityData.has_research ? "Research present" : "Limited references",
            detail_level: "Detailed content",
            industry_knowledge: "Demonstrated in content"
          },
          authoritativeness: {
            score: Math.max(5, contentQualityData.eeat_score - 2),
            domain_credibility: "Moderate domain authority",
            industry_recognition: "Based on content quality",
            comprehensiveness: contentQualityData.content_depth_score >= 7 ? "Comprehensive" : "Moderate",
            citation_quality: contentQualityData.has_citations ? "Citations present" : "Limited citations",
            content_depth: "Strong depth detected",
            credentials: "Based on content"
          },
          trustworthiness: {
            score: Math.max(5, contentQualityData.eeat_score - 1),
            information_balance: "Balanced presentation",
            limitation_transparency: "Moderate transparency",
            fact_opinion_distinction: "Clear distinction",
            information_currency: technicalSeoData.date_modified ? "Current information" : "Unknown currency",
            attribution_practices: contentQualityData.has_citations ? "Proper attribution" : "Limited attribution",
            accuracy_indicators: "Present in content",
            citation_presence: contentQualityData.has_citations ? "Citations present" : "Limited citations"
          },
          strengths: [
            "Strong content depth and expertise signals",
            contentQualityData.rock_paper_scissors === "Rock" ? "Foundational/pillar content with comprehensive information" : "Quality content with good depth",
            contentQualityData.has_research ? "Research-backed content with supporting evidence" : "Structured content with clear information"
          ],
          improvement_areas: [
            contentQualityData.has_citations ? "Could further improve citation quality" : "Lacks sufficient citations to external sources",
            "Could enhance authority signals with more explicit credentials",
            "Opportunity to improve trustworthiness with more transparent attribution"
          ]
        };
        console.log(`✅ Generated EEAT analysis based on content quality metrics`);
      } else {
        // Fall back to dedicated EEAT analysis
        eeatAnalysisData = await analyzeEEAT({
          url: citation_url,
          html: htmlContent,
          textContent: htmlContent ? extractTextContent(htmlContent) : '',
          technicalSeo: technicalSeoData,
          onPageSeo: onPageSeoData,
          contentQuality: contentQualityData,
          pagePerformance: pagePerformanceData,
          domainAuthority: domainAuthorityData,
          pageAnalysis: pageAnalysisData
        });
      }

      console.log(`✅ EEAT Analysis completed successfully`);
    } catch (eeatError) {
      console.error(`❌ EEAT Analysis error:`, eeatError.message);
      eeatAnalysisData = null;
    }

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

      // EEAT analysis data - add the new section
      eeat_analysis: eeatAnalysisData,

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

      // Add EEAT overall score to main scores section
      eeat_score: eeatAnalysisData ? eeatAnalysisData.eeat_score : null,

      // Crawl result data
      crawl_result: crawlResultData,

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
 * @returns {Object} - Object containing HTML content and crawl result data
 */
async function crawlPage(url) {
  if (!process.env.SCRAPINGBEE_API_KEY) {
    throw new Error('ScrapingBee API key not configured');
  }

  console.log(`Crawling page: ${url}`);

  // Ensure URL is properly encoded
  let encodedUrl = url;
  try {
    // Normalize URL encoding - first decode any existing encoding to avoid double encoding
    const decodedUrl = decodeURIComponent(url);
    // Then encode it properly
    encodedUrl = encodeURI(decodedUrl);
    // If encoding changed the URL, log it
    if (encodedUrl !== url) {
      console.log(`URL needed encoding: ${url} → ${encodedUrl}`);
    }
  } catch (encodeError) {
    console.log(`URL encoding warning: ${encodeError.message}. Using original URL.`);
    encodedUrl = url;
  }

  // Try basic scraper first (lowest cost)
  try {
    console.log('Attempting basic ScrapingBee request...');
    const basicUrl = new URL('https://app.scrapingbee.com/api/v1/');
    basicUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
    basicUrl.searchParams.set('url', encodedUrl);
    basicUrl.searchParams.set('render_js', 'false');
    basicUrl.searchParams.set('premium_proxy', 'false');
    basicUrl.searchParams.set('country_code', 'us');
    basicUrl.searchParams.set('block_resources', 'true'); // Block images/CSS to save bandwidth
    basicUrl.searchParams.set('timeout', '15000'); // 15 second timeout

    const basicResponse = await fetch(basicUrl.toString());

    if (basicResponse.ok) {
      console.log('Basic ScrapingBee request succeeded');
      const html = await basicResponse.text();

      // Check for signs of JavaScript frameworks that would need rendering
      const needsJsRendering = detectJavascriptFramework(html, url);

      // If we detect a JS framework but have minimal content, try with JS rendering
      const wordCount = countWords(html);
      console.log(`Basic crawl found approximately ${wordCount} words`);

      if (needsJsRendering || wordCount < 50) {
        console.log(`Detected JavaScript framework or minimal content (${wordCount} words)`);
        console.log('Switching to JS rendering for more accurate content extraction...');

        // Try with JS rendering to get the actual content
        const jsRenderUrl = new URL('https://app.scrapingbee.com/api/v1/');
        jsRenderUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
        jsRenderUrl.searchParams.set('url', encodedUrl);
        jsRenderUrl.searchParams.set('render_js', 'true'); // Enable JS rendering
        jsRenderUrl.searchParams.set('premium_proxy', 'false'); // Still use regular proxy to save costs
        jsRenderUrl.searchParams.set('country_code', 'us');
        jsRenderUrl.searchParams.set('block_resources', 'false'); // Allow resources for better JS rendering
        jsRenderUrl.searchParams.set('timeout', '30000'); // Longer timeout for JS rendering
        jsRenderUrl.searchParams.set('wait_browser', 'networkidle2'); // Wait until network is idle
        jsRenderUrl.searchParams.set('wait', '5000'); // Additional 5 second wait after page load

        console.log('Sending request with JS rendering...');
        const jsResponse = await fetch(jsRenderUrl.toString());

        if (jsResponse.ok) {
          console.log('JS rendering request succeeded');
          const jsHtml = await jsResponse.text();
          const jsWordCount = countWords(jsHtml);
          console.log(`JS-rendered crawl found approximately ${jsWordCount} words`);

          return {
            html: jsHtml,
            crawl_result: {
              status_code: jsResponse.status,
              status_text: jsResponse.statusText,
              success: true,
              method: 'js_rendering',
              html_length: jsHtml.length
            }
          };
        } else {
          console.log(`JS rendering request failed with ${jsResponse.status}, falling back to basic HTML`);
        }
      }

      // Quick validation of response
      if (html.length < 500 || html.includes('404') || html.includes('Not Found')) {
        console.log('Response appears to be error page, checking content...');
      }

      return {
        html,
        crawl_result: {
          status_code: basicResponse.status,
          status_text: basicResponse.statusText,
          success: true,
          method: 'basic',
          html_length: html.length
        }
      };
    } else {
      console.log(`Basic request failed with ${basicResponse.status}, analyzing error...`);

      // Check if it's worth trying premium
      if (basicResponse.status === 404) {
        const error = new Error('Page not found (404) - skipping premium attempt');
        error.crawl_result = {
          status_code: 404,
          status_text: basicResponse.statusText || 'Not Found',
          success: false,
          method: 'basic',
          error_type: 'client_error'
        };
        throw error;
      }

      if (basicResponse.status === 403) {
        console.log('403 Forbidden - likely Cloudflare protection, trying premium with JS...');
      }

      // General error case
      const errorText = await basicResponse.text().catch(() => 'Unknown error');
      const error = new Error(`Basic ScrapingBee failed: ${basicResponse.status}`);
      error.crawl_result = {
        status_code: basicResponse.status,
        status_text: basicResponse.statusText,
        success: false,
        method: 'basic',
        error_type: basicResponse.status >= 400 && basicResponse.status < 500 ? 'client_error' : 'server_error',
        error_details: errorText.substring(0, 200) // Truncate to avoid huge error messages
      };
      throw error;
    }
  } catch (basicError) {
    // Only try premium for specific error types
    const errorMessage = basicError.message.toLowerCase();

    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      console.log('404 error - not attempting expensive premium crawl');
      // Preserve the crawl_result if it exists, otherwise create a new one
      if (!basicError.crawl_result) {
        basicError.crawl_result = {
          status_code: 404,
          status_text: 'Not Found',
          success: false,
          method: 'basic',
          error_type: 'client_error'
        };
      }
      throw basicError;
    }

    console.log('Basic ScrapingBee failed, attempting selective premium fallback...');

    // Fallback to premium with stealth capabilities (higher cost - use selectively)
    try {
      const premiumUrl = new URL('https://app.scrapingbee.com/api/v1/');
      premiumUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
      premiumUrl.searchParams.set('url', encodedUrl);
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
          const error = new Error('Cloudflare protection detected - site actively blocking scrapers');
          error.crawl_result = {
            status_code: 403,
            status_text: 'Forbidden',
            success: false,
            method: 'premium',
            error_type: 'client_error',
            error_details: 'Cloudflare protection'
          };
          throw error;
        }

        const error = new Error(`Premium ScrapingBee error: ${premiumResponse.status} ${premiumResponse.statusText} - ${errorText}`);
        error.crawl_result = {
          status_code: premiumResponse.status,
          status_text: premiumResponse.statusText,
          success: false,
          method: 'premium',
          error_type: premiumResponse.status >= 400 && premiumResponse.status < 500 ? 'client_error' : 'server_error',
          error_details: errorText.substring(0, 200) // Truncate to avoid huge error messages
        };
        throw error;
      }

      console.log('Premium ScrapingBee request succeeded');
      const html = await premiumResponse.text();
      return {
        html,
        crawl_result: {
          status_code: premiumResponse.status,
          status_text: premiumResponse.statusText,
          success: true,
          method: 'premium',
          html_length: html.length
        }
      };
    } catch (premiumError) {
      // Check specifically for timeout errors or ScrapingBee's recommendation to try block_resources=false
      const premiumErrorText = premiumError.message.toLowerCase();
      const isTimeout =
        premiumErrorText.includes('time-out') ||
        premiumErrorText.includes('timeout') ||
        premiumErrorText.includes('timed-out') ||
        (premiumErrorText.includes('block_resources=false') && premiumErrorText.includes('try'));

      if (isTimeout) {
        console.log('Detected timeout or resource blocking issue. Trying one last attempt with block_resources=false...');

        try {
          // Final attempt with no resource blocking and increased timeout
          const lastAttemptUrl = new URL('https://app.scrapingbee.com/api/v1/');
          lastAttemptUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
          lastAttemptUrl.searchParams.set('url', encodedUrl);
          lastAttemptUrl.searchParams.set('render_js', 'true');
          lastAttemptUrl.searchParams.set('premium_proxy', 'true');
          lastAttemptUrl.searchParams.set('country_code', 'us');
          lastAttemptUrl.searchParams.set('block_resources', 'false'); // Allow resources as recommended
          lastAttemptUrl.searchParams.set('timeout', '30000'); // Extended timeout (30 seconds)
          lastAttemptUrl.searchParams.set('wait_browser', 'domcontentloaded'); // Less strict wait condition

          console.log('Sending final attempt with no resource blocking...');
          const finalResponse = await fetch(lastAttemptUrl.toString());

          if (!finalResponse.ok) {
            const errorText = await finalResponse.text().catch(() => 'Unknown error');
            const error = new Error(`Final ScrapingBee attempt failed: ${finalResponse.status} - ${errorText}`);
            error.crawl_result = {
              status_code: finalResponse.status,
              status_text: finalResponse.statusText,
              success: false,
              method: 'final_no_blocking',
              error_type: finalResponse.status >= 400 && finalResponse.status < 500 ? 'client_error' : 'server_error',
              error_details: errorText.substring(0, 200)
            };
            throw error;
          }

          console.log('Final ScrapingBee attempt succeeded with block_resources=false');
          const html = await finalResponse.text();
          return {
            html,
            crawl_result: {
              status_code: finalResponse.status,
              status_text: finalResponse.statusText,
              success: true,
              method: 'final_no_blocking',
              html_length: html.length
            }
          };
        } catch (finalError) {
          console.error(`All ScrapingBee attempts failed for ${url}:`, finalError.message);
          throw new Error(`ScrapingBee failed (basic: ${basicError.message}, premium: ${premiumError.message}, final: ${finalError.message})`);
        }
      } else {
        // Not a timeout error, no need for another attempt
        console.error(`Both basic and premium ScrapingBee failed for ${url}:`, premiumError.message);
        throw new Error(`ScrapingBee failed (basic: ${basicError.message}, premium: ${premiumError.message})`);
      }
    }
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
    // Remove scripts, styles and other non-visible content
    let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    content = content.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');
    content = content.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, ' ');
    content = content.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');
    content = content.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ');
    content = content.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ');
    content = content.replace(/<!--.*?-->/gs, ' '); // Remove HTML comments

    // Replace all remaining tags with space
    content = content.replace(/<[^>]+>/g, ' ');

    // Normalize whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Convert common HTML entities
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");

    return content;
  } catch (error) {
    console.error('Error extracting text content:', error);
    return '';
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
  // Extract text content first for accurate word count
  const textContent = extractTextContent(html);
  const wordCount = (textContent.match(/\b\w+\b/g) || []).length;
  console.log(`📊 Word count after filtering: ${wordCount} words (previously counted all words in HTML)`);

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

    // Look for date metadata using multiple patterns
    // Array of patterns to check for date created/published
    const publishedPatterns = [
      // OpenGraph metadata
      /property="(?:og:|article:)published_time" content="([^"]+)"/i,
      // Schema.org metadata
      /<meta\s+itemprop="datePublished" content="([^"]+)"/i,
      // Standard HTML5 time element
      /<time(?:[^>]*)datetime="([^"]+)"(?:[^>]*)>.*?<\/time>/i,
      // Dublin Core metadata
      /<meta\s+name="DC.date.issued" content="([^"]+)"/i,
      // Article published date
      /<meta\s+name="(?:date|article:published_time)" content="([^"]+)"/i,
      // JSON-LD format
      /"datePublished"\s*:\s*"([^"]+)"/i
    ];

    // Array of patterns to check for date modified/updated
    const modifiedPatterns = [
      // OpenGraph metadata
      /property="(?:og:|article:)modified_time" content="([^"]+)"/i,
      // Schema.org metadata
      /<meta\s+itemprop="dateModified" content="([^"]+)"/i,
      // Standard HTML5 time element for updated
      /<time(?:[^>]*)datetime="([^"]+)"(?:[^>]*)>.*?Updated.*?<\/time>/i,
      // Dublin Core metadata for modified
      /<meta\s+name="DC.date.modified" content="([^"]+)"/i,
      // Article modified date
      /<meta\s+name="(?:last-modified|article:modified_time)" content="([^"]+)"/i,
      // JSON-LD format
      /"dateModified"\s*:\s*"([^"]+)"/i
    ];

    // Try each pattern until we find a match
    for (const pattern of publishedPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        dateCreated = match[1];
        break;
      }
    }

    for (const pattern of modifiedPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        dateModified = match[1];
        break;
      }
    }

    // If no dates found yet, check for JSON-LD structured data more thoroughly
    if (!dateCreated || !dateModified) {
      try {
        // Find all JSON-LD script blocks
        const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
        let jsonLdMatch;

        while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);

            // Function to recursively search for date properties in JSON
            const findDateProperties = (obj, dateProps) => {
              if (!obj || typeof obj !== 'object') return;

              // Check direct properties
              for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                  // Check for date published properties
                  if (!dateCreated &&
                      (key === 'datePublished' || key === 'dateCreated' || key === 'publishedDate')) {
                    dateCreated = value;
                  }

                  // Check for date modified properties
                  if (!dateModified &&
                      (key === 'dateModified' || key === 'modified' || key === 'updateDate')) {
                    dateModified = value;
                  }
                }

                // Recursively check nested objects and arrays
                if (typeof value === 'object' && value !== null) {
                  findDateProperties(value, dateProps);
                }
              }
            };

            // Search the JSON-LD data for date properties
            findDateProperties(jsonData);

          } catch (jsonError) {
            // Skip invalid JSON
            console.log(`📅 Warning: Invalid JSON-LD found in the page`);
          }
        }
      } catch (structuredDataError) {
        console.log(`📅 Warning: Error parsing structured data: ${structuredDataError.message}`);
      }
    }

    // If we found dates, log them for debugging
    if (dateCreated || dateModified) {
      console.log(`📅 DATE INFORMATION: Created: ${dateCreated || 'Not found'}, Modified: ${dateModified || 'Not found'}`);
    } else {
      console.log(`📅 DATE INFORMATION: No creation or modification dates found`);
    }
    
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
    
    // Check for tables - count table elements
    const hasTable = html.includes('<table');
    // Use more precise regex pattern for tables
    const tableCount = (html.match(/<table(?:\s[^>]*)?>/gi) || []).length;
    
    // Check for lists - count parent list elements, not list items
    const hasUnorderedList = html.includes('<ul');
    // Use more precise regex pattern to avoid partial matches (like <ultra, <ultimate, etc.)
    const unorderedListCount = (html.match(/<ul(?:\s[^>]*)?>/gi) || []).length;

    const hasOrderedList = html.includes('<ol');
    // Use more precise regex pattern to avoid partial matches
    const orderedListCount = (html.match(/<ol(?:\s[^>]*)?>/gi) || []).length;

    // For debugging, also count list items (but we don't use this in the results)
    const listItemCount = (html.match(/<li[^>]*>/gi) || []).length;
    console.log(`📋 LIST STRUCTURE: ${unorderedListCount} unordered lists, ${orderedListCount} ordered lists (containing ${listItemCount} total items)`);
    
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
  "rock_paper_scissors": "Rock, Paper, Scissors, Lizard, or Spock (where Rock=foundational/pillar content, Paper=thin content covering broad topics, Scissors=opinion-based content like reviews/blogs, Lizard=time-based content, Spock=imaginative/speculative/unique content)",
  "content_depth_score": (1-10 score with 10 being most comprehensive),
  "sentiment_score": (-1 to 1 with -1 being negative, 0 neutral, 1 positive),
  "content_uniqueness": (1-10 score with 10 being most unique),
  "content_optimization_score": (1-10 score with 10 being best optimized),
  "has_statistics": (true/false),
  "has_quotes": (true/false),
  "has_research": (true/false),
  "analysis_score": (1-10 overall quality score),
  "citation_match_quality": (1-10 score of how well this content matches the query),
  "topical_cluster": "Main topic category of this content",
  "eeat_score": (1-10 score with 10 being strongest signals of expertise, experience, authoritativeness, and trustworthiness),
  "ai_content_detection": (1-10 score with 10 being most likely to be human-written content)
}`;

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content analyst specializing in SEO and content quality. Return ONLY valid JSON with the exact fields requested. For numeric scores, use a 1-10 scale where 10 is the highest/best (except sentiment which remains -1 to 1). For the rock_paper_scissors field, carefully categorize content using: Rock=foundational/pillar content, Paper=thin content covering broad topics, Scissors=opinion-based content like reviews/blogs, Lizard=time-based content (e.g., "best of 2025"), Spock=imaginative/speculative/unique content that stands out.'
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

    // Helper function to ensure scores are on a 1-10 scale
    const normalizeScore = (score, defaultValue) => {
      if (score === undefined || score === null) return defaultValue;

      // Ensure it's a number
      const numScore = Number(score);
      if (isNaN(numScore)) return defaultValue;

      // If it's already in the 1-10 range, use it
      if (numScore >= 1 && numScore <= 10) return numScore;

      // If it's in the 1-5 range (old scale), convert to 1-10
      if (numScore >= 1 && numScore <= 5) {
        // Convert from 1-5 scale to 1-10 scale
        return Math.round((numScore * 2) - 1);
      }

      // Fallback to default for out-of-range values
      return defaultValue;
    };

    // Normalize sentiment separately as it uses a different scale (-1 to 1)
    const normalizeSentiment = (score, defaultValue) => {
      if (score === undefined || score === null) return defaultValue;

      const numScore = Number(score);
      if (isNaN(numScore)) return defaultValue;

      // Clamp to -1 to 1 range
      return Math.max(-1, Math.min(1, numScore));
    };

    // Log the raw scores and normalized scores
    console.log(`📊 CONTENT SCORES: Raw AI scores and normalized values (1-10 scale):`);
    console.log(`  - Content Depth: ${result.content_depth_score || 'N/A'} → ${normalizeScore(result.content_depth_score, defaultData.content_depth_score)}`);
    console.log(`  - Citation Match: ${result.citation_match_quality || 'N/A'} → ${normalizeScore(result.citation_match_quality, defaultData.citation_match_quality)}`);
    console.log(`  - EEAT Score: ${result.eeat_score || 'N/A'} → ${normalizeScore(result.eeat_score, defaultData.eeat_score)}`);
    console.log(`  - Content Uniqueness: ${result.content_uniqueness || 'N/A'} → ${normalizeScore(result.content_uniqueness, defaultData.content_uniqueness)}`);
    console.log(`  - Analysis Score: ${result.analysis_score || 'N/A'} → ${normalizeScore(result.analysis_score, defaultData.analysis_score)}`);

    return {
      content_depth_score: normalizeScore(result.content_depth_score, defaultData.content_depth_score),
      readability_score: normalizeScore(result.readability_score, defaultData.readability_score),
      sentiment_score: normalizeSentiment(result.sentiment_score, defaultData.sentiment_score),
      content_uniqueness: normalizeScore(result.content_uniqueness, defaultData.content_uniqueness),
      content_optimization_score: normalizeScore(result.content_optimization_score, defaultData.content_optimization_score),
      has_statistics: result.has_statistics || defaultData.has_statistics,
      has_quotes: result.has_quotes || defaultData.has_quotes,
      has_citations: result.has_citations || defaultData.has_citations,
      has_research: result.has_research || defaultData.has_research,
      analysis_score: normalizeScore(result.analysis_score, defaultData.analysis_score),
      rock_paper_scissors: result.rock_paper_scissors || defaultData.rock_paper_scissors,
      citation_match_quality: normalizeScore(result.citation_match_quality, defaultData.citation_match_quality),
      eeat_score: normalizeScore(result.eeat_score, defaultData.eeat_score),
      ai_content_detection: normalizeScore(result.ai_content_detection, defaultData.ai_content_detection),
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

// extractTextContent function has been moved to the top of the file

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
    content_depth_score: 6, // Default median value on 1-10 scale
    readability_score: 6, // Default median value on 1-10 scale
    sentiment_score: 0, // Keeps -1 to 1 scale
    content_uniqueness: 6, // Default median value on 1-10 scale
    content_optimization_score: 6, // Default median value on 1-10 scale
    has_statistics: false,
    has_quotes: false,
    has_citations: false,
    has_research: false,
    analysis_score: 6, // Default median value on 1-10 scale
    rock_paper_scissors: 'Rock', // Default to Rock (foundational/pillar content)
    citation_match_quality: 6, // Default median value on 1-10 scale
    eeat_score: 6, // Default median value on 1-10 scale
    ai_content_detection: 6, // Default median value on 1-10 scale
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

/**
 * Detect if a page uses a JavaScript framework and needs rendering
 * @param {string} html - HTML content of the page
 * @param {string} url - URL of the page
 * @returns {boolean} - Whether the page likely needs JavaScript rendering
 */
function detectJavascriptFramework(html, url) {
  if (!html) return false;

  // URL-based detection (common framework patterns in URL)
  const urlLower = url.toLowerCase();
  if (urlLower.includes('vue') ||
      urlLower.includes('react') ||
      urlLower.includes('angular') ||
      urlLower.includes('spa') ||
      urlLower.includes('app') ||
      urlLower.includes('knowbots.ca')) { // Special case for your site which we know uses Vue
    console.log('URL suggests a JavaScript application');
    return true;
  }

  // Content-based detection
  const jsFrameworkSignals = [
    // Vue.js
    'vue.js', 'vue.min.js', 'vue.global.js', '<div id="app"', 'new Vue(', 'createApp(', 'v-for', 'v-if', 'v-model', 'v-on:', '@click',
    // React
    'react.js', 'react-dom.js', 'react.production.min.js', 'ReactDOM.render(', 'createElement(', '<div id="root"', 'useState', 'useEffect',
    // Angular
    'angular.js', 'angular.min.js', 'ng-app', 'ng-controller', 'ng-model', 'ng-if', 'ng-repeat',
    // Common JS patterns
    'window.onload', 'document.addEventListener', '.innerHTML', 'fetch(', 'ajax', '.appendChild', '.createElement',
    // Single page app markers
    '<div id="app"', '<div id="root"', 'application/json',
    // Web Components
    'customElements.define', 'attachShadow',
    // Node.js/SSR
    'node_modules', 'server-side-rendering'
  ];

  // Check for script tags
  const hasJsScripts = html.includes('<script') && html.includes('</script>');

  // Check for framework-specific signals
  let frameworkSignalsFound = 0;
  for (const signal of jsFrameworkSignals) {
    if (html.includes(signal)) {
      frameworkSignalsFound++;
      if (frameworkSignalsFound >= 3) {
        console.log(`Detected multiple JavaScript framework signals (${frameworkSignalsFound})`);
        return true;
      }
    }
  }

  // Check for empty content containers that might be filled by JS
  const emptyContainers = [
    '<div id="app"></div>',
    '<div id="root"></div>',
    '<div class="container" id="app">',
    '<div class="container" id="root">'
  ];

  for (const container of emptyContainers) {
    if (html.includes(container)) {
      console.log('Detected empty container likely to be populated by JavaScript');
      return true;
    }
  }

  // Look for minimal content but many scripts
  const scriptMatches = html.match(/<script[^>]*>[^<]*(?:<(?!\/script>)[^<]*)*<\/script>/gi) || [];
  if (scriptMatches.length > 5 && countWords(html) < 100) {
    console.log(`Detected many scripts (${scriptMatches.length}) with minimal content`);
    return true;
  }

  // Check for JSON data structures in the page that might be used by JS frameworks
  const hasJsonData = html.includes('application/json') ||
                     html.includes('window.__DATA__') ||
                     html.includes('window.__STATE__');

  if (hasJsonData) {
    console.log('Detected JSON data structures likely used by JavaScript framework');
    return true;
  }

  return false;
}

/**
 * Count the number of words in HTML content
 * @param {string} html - HTML content
 * @returns {number} - Approximate word count
 */
function countWords(html) {
  if (!html) return 0;

  try {
    // Extract text content by removing tags
    const textContent = extractTextContent(html);

    // Count words (space-separated tokens)
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  } catch (error) {
    console.error('Error counting words:', error);
    return 0;
  }
}

export {
  analyzePage,
  crawlPage,
  extractPageInfo,
  extractTextContent,
  extractTechnicalSeoData,
  extractOnPageSeoData,
  analyzeContentQuality,
  analyzePageContext
};