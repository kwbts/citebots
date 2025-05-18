import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      model: 'gpt-4',
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
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ChatGPT error:', errorText)
    throw new Error(`ChatGPT API error: ${response.statusText}`)
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
  
  console.log('Extracting citations from ChatGPT content')
  
  // Pattern 1: [1] with URL immediately after or at end
  const citationWithUrlPattern = /\[(\d+)\](?:.*?)(https?:\/\/[^\s\]]+)/g
  let matches = [...content.matchAll(citationWithUrlPattern)]
  
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
      console.error('Error parsing URL:', url, e)
    }
  }
  
  // Pattern 2: Look for references section at the end
  const referencesPattern = /(?:References|Sources|Citations):?\s*([\s\S]*?)$/i
  const referencesMatch = content.match(referencesPattern)
  
  if (referencesMatch) {
    const referencesText = referencesMatch[1]
    const refPattern = /\[(\d+)\]\s*(https?:\/\/[^\s\]]+)/g
    const refMatches = [...referencesText.matchAll(refPattern)]
    
    for (const match of refMatches) {
      const citationNumber = parseInt(match[1])
      const url = match[2]
      
      try {
        const domain = new URL(url).hostname
        
        // Check if we already have this citation
        const exists = citations.some(c => c.citation_number === citationNumber)
        if (!exists) {
          citations.push({
            citation: `[${citationNumber}]`,
            citation_number: citationNumber,
            url: url,
            domain: domain
          })
        }
      } catch (e) {
        console.error('Error parsing reference URL:', url, e)
      }
    }
  }
  
  // Pattern 3: Just look for any URLs if no citations found
  if (citations.length === 0) {
    console.log('No bracketed citations found, looking for plain URLs')
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
        console.error('Error parsing plain URL:', url, e)
      }
    }
  }
  
  console.log(`Extracted ${citations.length} citations from ChatGPT`)
  return citations
}

// Function to query Perplexity
async function queryPerplexity(query: string) {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!apiKey) {
    throw new Error('Perplexity API key not configured')
  }

  console.log('Querying Perplexity with:', query)

  const requestBody = {
    model: 'sonar',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Provide detailed information with citations.'
      },
      {
        role: 'user',
        content: query
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    return_citations: true
  }
  
  console.log('Perplexity request:', JSON.stringify(requestBody, null, 2))
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
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

    // Analyze competitor mentions
    const competitorAnalysis = await analyzeCompetitorMentions(
      response, 
      brand_name, 
      brand_domain, 
      competitors,
      citations
    )
    
    // Extract metadata
    const metadata = await extractQueryMetadata(query_text, response, query_intent)
    
    // Analyze brand sentiment
    const brandSentiment = await analyzeBrandSentiment(response, brand_name)

    // Create comprehensive result object
    const result = {
      query_text,
      keyword,
      query_intent,
      platform,
      response_content: response,
      citations,
      citation_count: citations.length,
      brand_mention: competitorAnalysis.brand_mention_type !== 'none',
      brand_mention_count: competitorAnalysis.brand_mention_count,
      competitor_mentions: competitorAnalysis.competitors_mentioned,
      metadata: {
        ...metadata,
        ...competitorAnalysis,
        brand_sentiment: brandSentiment
      },
      timestamp: new Date().toISOString()
    }

    console.log('Final result structure:', {
      ...result,
      response_content: '[truncated]'
    })

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

// Helper functions (existing ones would go here)
async function analyzeCompetitorMentions(response: string, brandName: string, brandDomain: string, competitors: Competitor[], citations: any[]) {
  // Implementation from existing code
  const competitorAnalysis = []
  const mentionedCompetitors = new Set<string>()
  
  // Check citations for competitor domains
  for (const citation of citations) {
    if (!citation.domain) continue
    
    const domain = citation.domain.toLowerCase()
    
    // Check if it's a competitor domain
    for (const comp of competitors || []) {
      if (!comp || !comp.domain) continue
      
      const compDomain = comp.domain.toLowerCase()
      if (domain.includes(compDomain)) {
        mentionedCompetitors.add(comp.name)
      }
    }
  }
  
  // Check for competitor names in response text
  const responseLower = response.toLowerCase()
  for (const comp of competitors || []) {
    if (!comp || !comp.name) continue
    
    const namePattern = comp.name.toLowerCase()
    if (responseLower.includes(namePattern)) {
      mentionedCompetitors.add(comp.name)
    }
  }
  
  // Analyze brand mention
  let brandMentionType = 'none'
  let brandMentionCount = 0
  
  // Check for brand domain in citations
  let brandInCitations = false
  for (const citation of citations) {
    if (!citation.domain) continue
    
    const domain = citation.domain.toLowerCase()
    if (brandDomain && domain.includes(brandDomain.toLowerCase())) {
      brandInCitations = true
      break
    }
  }
  
  // Check for brand name in response
  const brandLower = brandName.toLowerCase()
  if (responseLower.includes(brandLower) || brandInCitations) {
    const brandRegex = new RegExp(brandLower, 'gi')
    const matches = response.match(brandRegex)
    brandMentionCount = matches ? matches.length : (brandInCitations ? 1 : 0)
    
    if (responseLower.includes(`recommend ${brandLower}`) || 
        responseLower.includes(`${brandLower} is the best`) ||
        responseLower.includes(`best ${brandLower}`)) {
      brandMentionType = 'recommendation'
    } else if (responseLower.includes(`${brandLower} is`) || 
               responseLower.includes(`${brandLower} offers`) ||
               responseLower.includes(`${brandLower} provides`)) {
      brandMentionType = 'featured'
    } else {
      brandMentionType = 'mentioned'
    }
  }
  
  // Build competitor analysis
  for (const compName of mentionedCompetitors) {
    const compLower = compName.toLowerCase()
    const compRegex = new RegExp(compLower, 'gi')
    const compMatches = response.match(compRegex)
    const mentionCount = compMatches ? compMatches.length : 1
    
    let mentionType = 'mentioned'
    if (responseLower.includes(`recommend ${compLower}`) || 
        responseLower.includes(`${compLower} is the best`)) {
      mentionType = 'recommendation'
    } else if (responseLower.includes(`${compLower} is`) || 
               responseLower.includes(`${compLower} offers`)) {
      mentionType = 'featured'
    }
    
    competitorAnalysis.push({
      name: compName,
      mentions: mentionCount,
      type: mentionType
    })
  }
  
  return {
    brand_mention_type: brandMentionType,
    brand_mention_count: brandMentionCount,
    competitors_mentioned: competitorAnalysis,
    competitor_names: Array.from(mentionedCompetitors)
  }
}

async function extractQueryMetadata(query: string, response: string, intent: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return getDefaultMetadata(query, intent)
  }

  const prompt = `
Analyze this query and response to extract metadata:

Query: "${query}"
Response: "${response}"

Extract the following in JSON format:
{
  "query_category": "general/product/service/comparison/troubleshooting/educational",
  "query_topic": "main topic area",
  "query_type": "informational/navigational/transactional/commercial",
  "funnel_stage": "awareness/consideration/decision/retention",
  "query_complexity": "simple/moderate/complex",
  "response_match": "direct/partial/tangential",
  "response_outcome": "answer/recommendation/comparison/explanation",
  "action_orientation": "high/medium/low/none",
  "query_competition": "high/moderate/low/opportunity"
}`

  try {
    const metadataResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a query analysis expert. Extract metadata from queries and responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    if (metadataResponse.ok) {
      const data = await metadataResponse.json()
      return JSON.parse(data.choices[0].message.content)
    }
  } catch (error) {
    console.error('Error extracting metadata:', error)
  }

  return getDefaultMetadata(query, intent)
}

function getDefaultMetadata(query: string, intent: string) {
  const isQuestion = query.includes('?')
  const isComparison = query.toLowerCase().includes('compare') || query.toLowerCase().includes('vs')
  
  return {
    query_category: isComparison ? 'comparison' : 'general',
    query_topic: 'general',
    query_type: isQuestion ? 'informational' : 'navigational',
    funnel_stage: 'awareness',
    query_complexity: query.split(' ').length > 10 ? 'complex' : 'simple',
    response_match: 'direct',
    response_outcome: 'answer',
    action_orientation: 'medium',
    query_competition: 'opportunity'
  }
}

async function analyzeBrandSentiment(response: string, brandName: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return 0
  }

  try {
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
            content: 'You are a sentiment analysis expert. Analyze the sentiment of brand mentions.'
          },
          {
            role: 'user',
            content: `Analyze the sentiment of mentions of "${brandName}" in this text. Return a number between -1 (negative) and 1 (positive):\n\n${response}`
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    })

    if (sentimentResponse.ok) {
      const data = await sentimentResponse.json()
      const sentimentText = data.choices[0].message.content
      const sentiment = parseFloat(sentimentText) || 0
      return Math.max(-1, Math.min(1, sentiment))
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
  }

  return 0
}