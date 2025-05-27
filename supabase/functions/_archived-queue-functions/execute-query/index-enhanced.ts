import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractEnhancedQueryMetadata, analyzeCompetitorMentionsEnhanced } from './enhanced-metadata'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryRequest {
  query_text: string
  keyword: string
  query_intent: string
  platform: 'chatgpt' | 'perplexity'
  brand_name: string
  brand_domain: string
  competitors: Competitor[]
}

interface Competitor {
  name: string
  domain: string
  pattern?: string
}

// Function to query ChatGPT with better citation handling
async function queryChatGPT(query: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  console.log('Querying ChatGPT with:', query)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources using [1], [2], etc. format. Include the actual URLs for your citations.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.1 // Lower temperature for more deterministic responses
    })
  })

  if (!response.ok) {
    throw new Error(`ChatGPT API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log('ChatGPT raw response:', JSON.stringify(data, null, 2))
  
  const content = data.choices[0].message.content
  
  // Extract citations from content
  const citations = extractChatGPTCitations(content)
  
  return {
    content,
    citations
  }
}

// Extract citations from ChatGPT response
function extractChatGPTCitations(content: string) {
  const citations = []
  
  // Define regular expressions for different citation formats
  const numberCitationRegex = /\[(\d+)\].*?(?:https?:\/\/[\w\d.\/?=&\-_#]+)/g
  const urlRegex = /(https?:\/\/[\w\d.\/?=&\-_#]+)/g
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  
  // Try to extract numbered citations with URLs
  const contentLines = content.split('\n')
  
  // First, check for markdown links
  let match
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    try {
      const [_, linkText, url] = match
      const domain = new URL(url).hostname
      
      console.log(`Found markdown citation: ${linkText} - ${url}`)
      
      // If the same URL isn't already added (avoid duplicates)
      if (!citations.some(c => c.url === url)) {
        citations.push({
          citation: linkText,
          citation_number: citations.length + 1,
          url: url,
          domain: domain
        })
      }
    } catch (e) {
      console.error('Error parsing citation URL:', e)
    }
  }
  
  // If we didn't find any markdown links, try to extract from footnotes
  if (citations.length === 0) {
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i]
      const matches = [...line.matchAll(numberCitationRegex)]
      
      for (const match of matches) {
        const citationNumber = parseInt(match[1])
        const urlMatches = [...line.matchAll(urlRegex)]
        
        if (urlMatches.length > 0) {
          try {
            const url = urlMatches[0][0]
            const domain = new URL(url).hostname
            
            console.log(`Found citation [${citationNumber}]: ${url}`)
            
            citations.push({
              citation: `[${citationNumber}]`,
              citation_number: citationNumber,
              url: url,
              domain: domain
            })
          } catch (e) {
            console.error('Error parsing citation URL:', e)
          }
        }
      }
    }
  }
  
  // If we still don't have citations, just look for URLs in the content
  if (citations.length === 0) {
    const urlMatches = [...content.matchAll(urlRegex)]
    
    for (let i = 0; i < urlMatches.length; i++) {
      try {
        const url = urlMatches[i][0]
        // Skip if URL is part of markdown as we'd have caught it already
        if (content.includes(`](${url})`)) continue 
        
        const domain = new URL(url).hostname
        
        console.log(`Found URL citation: ${url}`)
        
        citations.push({
          citation: `Source ${i + 1}`,
          citation_number: i + 1,
          url: url,
          domain: domain
        })
      } catch (e) {
        console.error('Error parsing URL citation:', e)
      }
    }
  }
  
  console.log(`Extracted ${citations.length} citations from ChatGPT response`)
  return citations
}

// Function to query Perplexity with citation handling
async function queryPerplexity(query: string) {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!apiKey) {
    throw new Error('Perplexity API key not configured')
  }
  
  console.log('Querying Perplexity with:', query)
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'pplx-70b-online',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides informative answers with citations. Always cite your sources with proper links.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.1,
      max_tokens: 1024
    })
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`Perplexity API error - Status: ${response.status}, Body: ${errorBody}`)
    throw new Error(`Perplexity API error: ${response.statusText} - ${errorBody}`)
  }

  const data = await response.json()
  console.log('Perplexity raw response:', JSON.stringify(data, null, 2))
  
  const content = data.choices[0].message.content
  
  // Extract citations from content and merge with API citations if provided
  let citations = []
  
  // Check if Perplexity provided citations in the response
  if (data.citations && Array.isArray(data.citations)) {
    console.log('Found Perplexity API citations:', data.citations.length)
    citations = data.citations.map((citation, index) => ({
      citation: `[${index + 1}]`,
      citation_number: index + 1,
      url: citation.url || citation,
      domain: citation.url ? new URL(citation.url).hostname : new URL(citation).hostname,
      title: citation.title || ''
    }))
  }
  
  // Also extract from content
  const contentCitations = extractPerplexityCitations(content)
  
  // Merge and deduplicate
  if (contentCitations.length > 0 && citations.length === 0) {
    citations = contentCitations
  }
  
  return {
    content,
    citations
  }
}

// Extract citations from Perplexity response content
function extractPerplexityCitations(content: string) {
  const citations = []
  
  console.log('Extracting citations from Perplexity content')
  
  // Perplexity often uses [1], [2] format with URLs
  const citationPattern = /\[(\d+)\](?:.*?)(https?:\/\/[^\s\]]+)/g
  const matches = [...content.matchAll(citationPattern)]
  
  for (const match of matches) {
    const citationNumber = parseInt(match[1])
    const url = match[2]
    
    try {
      const domain = new URL(url).hostname
      citations.push({
        citation: `[${citationNumber}]`,
        citation_number: citationNumber,
        url: url,
        domain: domain
      })
    } catch (e) {
      console.error('Error parsing Perplexity URL:', url, e)
    }
  }
  
  // If no bracketed citations, look for URLs
  if (citations.length === 0) {
    console.log('No bracketed citations found in Perplexity, looking for plain URLs')
    const urlPattern = /https?:\/\/[^\s\]<>]+/g
    const urls = content.match(urlPattern) || []
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      try {
        const domain = new URL(url).hostname
        citations.push({
          citation: `[${i + 1}]`,
          citation_number: i + 1,
          url: url,
          domain: domain
        })
      } catch (e) {
        console.error('Error parsing Perplexity plain URL:', url, e)
      }
    }
  }
  
  console.log(`Extracted ${citations.length} citations from Perplexity content`)
  return citations
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as QueryRequest
    const { 
      query_text, 
      keyword, 
      query_intent, 
      platform,
      brand_name,
      brand_domain,
      competitors = []
    } = body

    console.log(`Executing query on ${platform}: "${query_text}"`)
    console.log(`Brand: ${brand_name} (${brand_domain})`)
    console.log(`Competitors: ${JSON.stringify(competitors)}`)

    // Execute query based on platform
    let response = ''
    let citations = []
    
    if (platform === 'chatgpt') {
      const result = await queryChatGPT(query_text)
      response = result.content
      citations = result.citations
    } else {
      const result = await queryPerplexity(query_text)
      response = result.content
      citations = result.citations
    }

    console.log(`Response length: ${response.length}`)
    console.log(`Citations found: ${citations.length}`)
    console.log('Citations:', JSON.stringify(citations, null, 2))

    // Use enhanced competitor analysis
    console.log('Starting enhanced competitor analysis...')
    const competitorAnalysis = await analyzeCompetitorMentionsEnhanced(
      response,
      brand_name,
      brand_domain,
      competitors,
      citations
    )
    console.log('Enhanced competitor analysis result:', competitorAnalysis)

    // Use enhanced metadata extraction
    console.log('Starting enhanced metadata extraction...')
    const metadata = await extractEnhancedQueryMetadata(
      query_text, 
      response, 
      query_intent,
      brand_name,
      competitors
    )
    console.log('Enhanced metadata extraction result:', metadata)

    // Analyze brand sentiment
    console.log('Starting brand sentiment analysis...')
    const brandSentiment = await analyzeBrandSentiment(response, brand_name)
    console.log('Brand sentiment:', brandSentiment)

    // Create comprehensive result object with all required fields
    const result = {
      query_text,
      keyword,
      query_intent,
      platform,
      response_content: response,
      citations,
      citation_count: citations.length,
      
      // Brand data
      brand_mention: competitorAnalysis.brand_mention_type !== 'none',
      brand_mentioned: competitorAnalysis.brand_mention_type !== 'none',
      brand_mention_count: competitorAnalysis.brand_mention_count || 0,
      brand_sentiment: brandSentiment || 0,
      brand_mention_type: competitorAnalysis.brand_mention_type || 'none',
      brand_positioning: competitorAnalysis.brand_positioning || 'none',
      
      // Competitor data
      competitor_mentions: competitorAnalysis.competitors_mentioned || [],
      competitor_mentioned_names: competitorAnalysis.competitor_names || [],
      competitor_count: (competitorAnalysis.competitor_names || []).length,
      total_competitor_mentions: competitorAnalysis.total_competitor_mentions || 0,
      competitor_context: competitorAnalysis.competitor_context || 'none',
      competitor_analysis: competitorAnalysis,
      
      // Query metadata
      query_category: metadata.query_category || 'general',
      query_topic: metadata.query_topic || 'general',
      query_type: metadata.query_type || 'informational',
      funnel_stage: metadata.funnel_stage || 'awareness',
      query_complexity: metadata.query_complexity || 'simple',
      
      // Response metadata
      response_match: metadata.response_match || 'direct',
      response_outcome: metadata.response_outcome || 'answer',
      action_orientation: metadata.action_orientation || 'medium',
      query_competition: metadata.query_competition || 'opportunity',
      
      // Timestamps
      timestamp: new Date().toISOString()
    }

    console.log('Final result structure created with all required fields')

    return new Response(
      JSON.stringify({
        success: true,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in execute-query:', error)
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

// Analyze brand sentiment using OpenAI
async function analyzeBrandSentiment(response: string, brandName: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey || !brandName) {
    return 0
  }

  try {
    // Truncate response to avoid token limits
    const truncatedResponse = response.length > 2000 ? response.substring(0, 2000) + '...' : response
    
    const sentimentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis assistant. Analyze the sentiment of brand mentions and return a sentiment score.'
          },
          {
            role: 'user',
            content: `Analyze the sentiment towards "${brandName}" in this text. Return ONLY a JSON object with a "sentiment" field containing a number between -1 (very negative) and 1 (very positive):\n\n${truncatedResponse}`
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
        response_format: { type: 'json_object' }
      })
    })

    if (sentimentResponse.ok) {
      const data = await sentimentResponse.json()
      const result = JSON.parse(data.choices[0].message.content)
      return result.sentiment || 0
    }
  } catch (error) {
    console.error('Error analyzing brand sentiment:', error)
  }

  return 0
}