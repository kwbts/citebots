import { createClient } from '@supabase/supabase-js';

// Function to crawl a page using ScrapingBee
async function crawlPage(url) {
  if (!process.env.SCRAPINGBEE_API_KEY) {
    throw new Error('ScrapingBee API key not configured');
  }

  console.log(`Crawling page: ${url}`);

  try {
    const scrapingBeeUrl = new URL('https://app.scrapingbee.com/api/v1/');
    scrapingBeeUrl.searchParams.set('api_key', process.env.SCRAPINGBEE_API_KEY);
    scrapingBeeUrl.searchParams.set('url', url);
    scrapingBeeUrl.searchParams.set('render_js', 'false');
    scrapingBeeUrl.searchParams.set('premium_proxy', 'true');
    scrapingBeeUrl.searchParams.set('country_code', 'us');

    const response = await fetch(scrapingBeeUrl.toString());

    if (!response.ok) {
      throw new Error(`ScrapingBee error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
    throw error;
  }
}

// Function to extract basic page information from HTML
function extractPageInfo(html, url) {
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

// Function to generate default analysis when crawling fails
function getDefaultAnalysis(url) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const folderDepth = urlObj.pathname.split('/').filter(p => p.length > 0).length;
  
  return {
    // Technical SEO
    technical_seo: {
      is_valid: true,
      cdn_usage: false,
      date_created: null,
      is_crawlable: false,
      schema_types: [],
      date_modified: null,
      mobile_friendly: true,
      aria_labels_types: [],
      http_response_code: 0,
      aria_labels_present: false,
      semantic_html_usage: false,
      hreflang_declaration: false,
      html_structure_score: 3,
      schema_markup_present: false,
      social_graphs_present: false,
      meta_description_present: false
    },
    
    // On-page SEO
    on_page_seo: {
      has_table: false,
      page_title: `Page at ${domain}`,
      word_count: 0,
      image_count: 0,
      content_type: 'Unknown',
      folder_depth: folderDepth,
      heading_count: 0,
      keyword_match: [],
      video_present: false,
      has_table_count: 0,
      authorship_clear: false,
      has_ordered_list: false,
      meta_description: '',
      has_unordered_list: false,
      heading_count_type: {
        h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0
      },
      internal_link_count: 0,
      has_ordered_list_count: 0,
      has_unordered_list_count: 0
    },
    
    // Content quality
    content_quality: {
      eeat_score: 3,
      has_quotes: false,
      has_research: false,
      has_citations: false,
      analysis_score: 3,
      has_statistics: false,
      sentiment_score: 0,
      topical_cluster: 'General',
      readability_score: 3,
      content_uniqueness: 3,
      content_depth_score: 3,
      rock_paper_scissors: 'Rock',
      ai_content_detection: 3,
      citation_match_quality: 3,
      content_optimization_score: 3
    },
    
    // Page performance
    page_performance: {
      page_speed_score: 50,
      totalBlockingTime: 100,
      accessibility_score: 3,
      firstContentfulPaint: 1000,
      cumulativeLayoutShift: 0.1,
      largestContentfulPaint: 2500
    },
    
    // Domain authority
    domain_authority: {
      spam_score: 2,
      domain_name: domain,
      backlink_count: 100,
      page_authority: 20,
      link_propensity: 0.5,
      domain_authority: 30,
      referring_domains: 50
    },
    
    // Page analysis
    page_analysis: {
      eeat_signals: 'weak',
      content_depth: 'shallow',
      content_format: 'article',
      content_recency: 'undated',
      brand_positioning: 'absent',
      content_structure: 'linear',
      competitor_presence: 'none',
      page_relevance_type: 'partial',
      page_intent_alignment: 'moderate',
      call_to_action_strength: 'none',
      user_experience_quality: 'average'
    }
  };
}

// Main citation analysis function
export async function analyzeCitation(requestData) {
  const {
    query_id,
    citation_url,
    citation_position,
    query_text,
    keyword,
    brand_name,
    brand_domain,
    competitors = []
  } = requestData;

  console.log(`Analyzing citation: ${citation_url}`);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );

  try {
    const urlObj = new URL(citation_url);
    const domain = urlObj.hostname;
    const pageAnalysisId = domain.replace(/\./g, '_') + '_' + Date.now();

    // Check if this is a client or competitor domain
    const isClientDomain = brand_domain && domain.includes(brand_domain.toLowerCase());
    const competitorMatch = competitors.find(comp => 
      comp.domain && domain.includes(comp.domain.toLowerCase())
    );
    const isCompetitorDomain = !!competitorMatch;

    let crawlError = null;
    let pageInfo = null;
    let analysisData = getDefaultAnalysis(citation_url);

    // Try to crawl the page
    try {
      const html = await crawlPage(citation_url);
      pageInfo = extractPageInfo(html, citation_url);
      
      // Update analysis with actual data
      analysisData.on_page_seo = {
        ...analysisData.on_page_seo,
        page_title: pageInfo.title,
        word_count: pageInfo.wordCount,
        image_count: pageInfo.imageCount,
        heading_count: pageInfo.headingCount,
        meta_description: pageInfo.metaDescription,
        internal_link_count: pageInfo.internalLinkCount,
        keyword_match: keyword ? [keyword] : [],
        content_type: pageInfo.wordCount > 500 ? 'Article' : 'Unknown'
      };
      
      analysisData.technical_seo.is_crawlable = true;
      analysisData.technical_seo.meta_description_present = !!pageInfo.metaDescription;
    } catch (error) {
      crawlError = error.message;
      console.error(`Failed to crawl ${citation_url}:`, error.message);
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
      
      if (brandMentioned) {
        brandMentionCount = (pageInfo.title.match(new RegExp(brand_name, 'gi')) || []).length;
      }
    }

    // Check for competitor mentions
    let competitorMentioned = false;
    let competitorNames = [];
    let competitorAnalysis = {};

    if (competitors && competitors.length > 0 && pageInfo) {
      const titleLower = pageInfo.title.toLowerCase();
      
      for (const comp of competitors) {
        if (comp.name && titleLower.includes(comp.name.toLowerCase())) {
          competitorMentioned = true;
          competitorNames.push(comp.name);
        }
      }
      
      if (competitorMentioned || isCompetitorDomain) {
        competitorAnalysis = {
          mentioned_competitors: competitorNames,
          competitor_context: 'title_mention'
        };
      }
    }

    // Create the page analysis record
    const pageAnalysisRecord = {
      query_id,
      page_analysis_id: pageAnalysisId,
      citation_url,
      citation_position: citation_position || 1,
      domain_name: domain,
      is_client_domain: isClientDomain,
      is_competitor_domain: isCompetitorDomain,
      mention_type: ['citation'],
      analysis_notes: crawlError ? 'Default analysis used due to crawl or AI error' : 'Analysis completed',
      
      // SEO and technical data
      technical_seo: analysisData.technical_seo,
      on_page_seo: analysisData.on_page_seo,
      content_quality: analysisData.content_quality,
      page_performance: analysisData.page_performance,
      domain_authority: analysisData.domain_authority,
      page_analysis: analysisData.page_analysis,
      
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
      relevance_score: 0.6,
      content_quality_score: 3,
      
      // Error handling
      crawl_error: crawlError,
      created_at: new Date().toISOString()
    };

    // Insert into database
    const { data: insertedRecord, error: insertError } = await supabase
      .from('page_analyses')
      .insert(pageAnalysisRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting page analysis:', insertError);
      throw new Error(`Failed to save page analysis: ${insertError.message}`);
    }

    console.log(`✅ Page analysis saved for ${citation_url}`);
    return insertedRecord;

  } catch (error) {
    console.error(`Error analyzing citation ${citation_url}:`, error.message);
    throw error;
  }
}