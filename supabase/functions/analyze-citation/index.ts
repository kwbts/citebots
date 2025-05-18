import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

// Helper function to escape regex special characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Safe function to find mentions with context
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

// Function to crawl a page using ScrapingBee
async function crawlPage(url: string) {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY')
  if (!apiKey) {
    console.error('ScrapingBee API key not found in environment')
    throw new Error('ScrapingBee API key not configured')
  }

  console.log(`Attempting to crawl URL: ${url}`)
  
  // Validate URL
  try {
    new URL(url)
  } catch (e) {
    console.error(`Invalid URL provided: ${url}`)
    throw new Error(`Invalid URL format: ${url}`)
  }

  const params = new URLSearchParams({
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
  })

  console.log('Making request to ScrapingBee API...')
  
  const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`)
  
  console.log(`ScrapingBee response status: ${response.status}`)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`ScrapingBee error response: ${errorText}`)
    
    if (response.status === 401) {
      throw new Error('ScrapingBee authentication failed - check API key')
    } else if (response.status === 429) {
      throw new Error('ScrapingBee rate limit exceeded')
    } else if (response.status === 404) {
      throw new Error(`URL not found: ${url}`)
    } else {
      throw new Error(`ScrapingBee error (${response.status}): ${response.statusText}`)
    }
  }

  const html = await response.text()
  console.log(`Successfully crawled page: ${url} (received ${html.length} characters)`)
  return html
}

// Function to extract data from HTML
function extractFromHtml(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const mainContent = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
  
  const wordCount = mainContent.split(/\s+/).length
  const imageCount = (html.match(/<img[^>]*>/gi) || []).length
  const videoPresent = /<video[^>]*>|<iframe[^>]*youtube|<iframe[^>]*vimeo/i.test(html)
  
  const headingCounts = {
    h1: (html.match(/<h1[^>]*>/gi) || []).length,
    h2: (html.match(/<h2[^>]*>/gi) || []).length,
    h3: (html.match(/<h3[^>]*>/gi) || []).length,
    h4: (html.match(/<h4[^>]*>/gi) || []).length,
    h5: (html.match(/<h5[^>]*>/gi) || []).length,
    h6: (html.match(/<h6[^>]*>/gi) || []).length,
  }
  
  const totalHeadings = Object.values(headingCounts).reduce((a, b) => a + b, 0)
  
  const hasTable = /<table[^>]*>/i.test(html)
  const tableCount = (html.match(/<table[^>]*>/gi) || []).length
  const hasUnorderedList = /<ul[^>]*>/i.test(html)
  const unorderedListCount = (html.match(/<ul[^>]*>/gi) || []).length
  const hasOrderedList = /<ol[^>]*>/i.test(html)
  const orderedListCount = (html.match(/<ol[^>]*>/gi) || []).length
  
  const schemaMarkupPresent = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html)
  const ariaLabelsPresent = /aria-label=|aria-labelledby=/i.test(html)
  
  const domain = new URL(url).hostname
  const internalLinkRegex = new RegExp(`<a[^>]*href=["'](?:https?:)?\/\/${escapeRegex(domain)}[^"']*["']`, 'gi')
  const internalLinkCount = (html.match(internalLinkRegex) || []).length
  
  return {
    pageTitle: titleMatch ? titleMatch[1].trim() : '',
    metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '',
    mainContent: mainContent.substring(0, 5000),
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
    ariaLabelsPresent,
    internalLinkCount,
    url
  }
}

// Function to analyze content using OpenAI
async function analyzeContentWithAI(pageData: any, queryText: string, brandName: string, competitors: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  // Find brand and competitor mentions safely
  const brandMentions = findMentionsWithContext(pageData.mainContent, brandName);
  const competitorAnalysis: any = {};
  
  for (const competitor of competitors || []) {
    const compName = competitor.name || '';
    if (compName) {
      const mentions = findMentionsWithContext(pageData.mainContent, compName);
      competitorAnalysis[compName] = mentions.length;
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as AnalyzeCitationRequest
    console.log('Received analyze-citation request:', JSON.stringify(body, null, 2))
    
    const { 
      query_id, 
      citation_url, 
      citation_position,
      query_text,
      keyword,
      brand_name,
      brand_domain,
      competitors
    } = body

    if (!citation_url) {
      throw new Error('citation_url is required')
    }

    // Crawl the page
    console.log(`Crawling ${citation_url}`)
    const html = await crawlPage(citation_url)
    
    // Extract basic data
    const extractedData = extractFromHtml(html, citation_url)
    
    // Analyze with AI
    console.log('Analyzing content with AI')
    const aiAnalysis = await analyzeContentWithAI(extractedData, query_text, brand_name, competitors)
    
    // Determine if it's client or competitor domain
    const domain = new URL(citation_url).hostname
    const isClientDomain = domain.includes(brand_domain)
    let isCompetitorDomain = false
    
    for (const competitor of competitors) {
      if (domain.includes(competitor.domain || competitor.pattern)) {
        isCompetitorDomain = true
        break
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
    )

    // Create page analysis record
    const pageAnalysis = {
      query_id,
      page_analysis_id: `${domain.replace(/\./g, '_')}_${Date.now()}`,
      citation_url,
      citation_position,
      domain_name: domain,
      is_client_domain: isClientDomain,
      is_competitor_domain: isCompetitorDomain,
      mention_type: ['citation'],
      analysis_notes: aiAnalysis.analysis_notes,
      
      technical_seo: {
        is_valid: true,
        is_crawlable: true,
        http_response_code: 200,
        schema_markup_present: extractedData.schemaMarkupPresent,
        schema_types: [],
        html_structure_score: 3,
        semantic_html_usage: extractedData.totalHeadings > 0,
        mobile_friendly: true,
        hreflang_declaration: false,
        date_created: null,
        date_modified: null,
        cdn_usage: false,
        meta_description_present: !!extractedData.metaDescription,
        aria_labels_present: extractedData.ariaLabelsPresent,
        aria_labels_types: [],
        social_graphs_present: false
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
        page_title: extractedData.pageTitle,
        content_type: aiAnalysis.content_type,
        meta_description: extractedData.metaDescription,
        word_count: extractedData.wordCount,
        image_count: extractedData.imageCount,
        video_present: extractedData.videoPresent,
        has_table: extractedData.hasTable,
        has_table_count: extractedData.tableCount,
        has_unordered_list: extractedData.hasUnorderedList,
        has_unordered_list_count: extractedData.unorderedListCount,
        has_ordered_list: extractedData.hasOrderedList,
        has_ordered_list_count: extractedData.orderedListCount,
        internal_link_count: extractedData.internalLinkCount,
        folder_depth: citation_url.split('/').length - 3,
        authorship_clear: false,
        heading_count: extractedData.totalHeadings,
        heading_count_type: extractedData.headingCounts,
        keyword_match: [keyword]
      },
      
      content_quality: {
        content_depth_score: aiAnalysis.content_depth_score,
        readability_score: 3,
        sentiment_score: aiAnalysis.sentiment_score,
        content_uniqueness: aiAnalysis.content_uniqueness,
        content_optimization_score: aiAnalysis.content_optimization_score,
        has_statistics: aiAnalysis.has_statistics,
        has_quotes: aiAnalysis.has_quotes,
        has_citations: false,
        has_research: aiAnalysis.has_research,
        analysis_score: aiAnalysis.analysis_score,
        rock_paper_scissors: aiAnalysis.rock_paper_scissors,
        citation_match_quality: aiAnalysis.citation_match_quality,
        eeat_score: 3,
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
    }

    // Insert into database
    const { data, error } = await serviceClient
      .from('page_analyses')
      .insert(pageAnalysis)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        page_analysis: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Citation analysis error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})