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

// Function to query ChatGPT
async function queryChatGPT(query: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

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
          content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible.'
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
    throw new Error(`ChatGPT API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Function to query Perplexity
async function queryPerplexity(query: string) {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
  if (!apiKey) {
    throw new Error('Perplexity API key not configured')
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When answering questions, provide detailed information and cite your sources where possible.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      return_citations: true
    })
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    citations: data.citations || []
  }
}

// Function to extract metadata from query using OpenAI
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

// Default metadata based on intent
function getDefaultMetadata(query: string, intent: string) {
  const isQuestion = query.includes('?')
  const isComparison = query.toLowerCase().includes('compare') || query.toLowerCase().includes('vs')
  
  return {
    query_category: isComparison ? 'comparison' : 'general',
    query_topic: 'Marketing Technology',
    query_type: isQuestion ? 'informational' : 'navigational',
    funnel_stage: intent === 'direct_experience' ? 'awareness' : 
                  intent === 'recommendation_request' ? 'consideration' : 'decision',
    query_complexity: query.split(' ').length > 10 ? 'complex' : 'simple',
    response_match: 'direct',
    response_outcome: intent === 'recommendation_request' ? 'recommendation' : 'answer',
    action_orientation: intent === 'recommendation_request' ? 'high' : 'medium',
    query_competition: 'opportunity'
  }
}

// Function to analyze brand sentiment
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
            content: 'Analyze sentiment on a scale of -1 (negative) to 1 (positive).'
          },
          {
            role: 'user',
            content: `Rate the sentiment toward "${brandName}" in: "${response}". Return only a number between -1 and 1.`
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    })

    if (sentimentResponse.ok) {
      const data = await sentimentResponse.json()
      return parseFloat(data.choices[0].message.content) || 0
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
  }

  return 0
}

// Enhanced competitor analysis function that matches original citebots logic
async function analyzeCompetitorMentions(response: string, brandName: string, brandDomain: string, competitors: Competitor[], citations: any[]) {
  const mentionedCompetitors = new Set<string>()
  const competitorAnalysis = []
  
  // Check for competitor domains in citations (matching original logic)
  for (const citation of citations) {
    try {
      if (!citation || !citation.url) continue
      
      const domain = new URL(citation.url).hostname.toLowerCase()
      
      for (const comp of competitors || []) {
        if (!comp) continue
        
        // Use pattern if available, otherwise use domain
        const pattern = comp.pattern || comp.domain
        if (!pattern) continue
        
        const regexPattern = pattern.replace(/\./g, '\\.')
        const regex = new RegExp(regexPattern, 'i')
        
        if (regex.test(domain)) {
          mentionedCompetitors.add(comp.name)
        }
      }
    } catch (e) {
      // Skip invalid URLs
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
    try {
      if (!citation || !citation.url) continue
      
      const domain = new URL(citation.url).hostname.toLowerCase()
      if (brandDomain && domain.includes(brandDomain.toLowerCase())) {
        brandInCitations = true
        break
      }
    } catch (e) {
      // Skip invalid URLs
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
  
  // Build competitor analysis for each mentioned competitor
  for (const compName of mentionedCompetitors) {
    const compLower = compName.toLowerCase()
    const compRegex = new RegExp(compLower, 'gi')
    const compMatches = response.match(compRegex)
    const mentionCount = compMatches ? compMatches.length : 1 // At least 1 if in citations
    
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
  
  // Calculate competitor context
  let competitorContext = 'none'
  const totalCompetitorMentions = competitorAnalysis.reduce((sum, comp) => sum + comp.mentions, 0)
  
  if (competitorAnalysis.length === 0) {
    competitorContext = 'none'
  } else if (brandMentionCount === 0) {
    competitorContext = 'only_competitors'
  } else if (brandMentionCount > totalCompetitorMentions) {
    competitorContext = 'brand_dominant'
  } else if (brandMentionCount === totalCompetitorMentions) {
    competitorContext = 'equal_mention'
  } else {
    competitorContext = 'competitor_dominant'
  }
  
  // Analyze positioning
  let brandPositioning = 'not_mentioned'
  
  if (brandMentionType !== 'none') {
    if (competitorContext === 'brand_dominant' || competitorContext === 'none') {
      brandPositioning = 'strong'
    } else if (competitorContext === 'equal_mention') {
      brandPositioning = 'neutral'
    } else {
      brandPositioning = 'weak'
    }
  }
  
  return {
    brand_mention_type: brandMentionType,
    brand_mention_count: brandMentionCount,
    competitors_mentioned: competitorAnalysis,
    competitor_context: competitorContext,
    brand_positioning: brandPositioning,
    total_competitor_mentions: totalCompetitorMentions,
    competitor_names: Array.from(mentionedCompetitors)
  }
}

// Extract citations from response
function extractCitations(response: string, platform: string) {
  const citations = []
  
  if (platform === 'perplexity') {
    // Perplexity format: [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g
    const matches = [...response.matchAll(citationRegex)]
    
    for (const match of matches) {
      const citation = match[0]
      const citationNumber = parseInt(match[1])
      
      // Find the URL - usually appears after the citation or at the end
      const urlRegex = new RegExp(`\\[${citationNumber}\\].*?(https?://[^\\s\\]]+)`, 'i')
      const urlMatch = response.match(urlRegex)
      
      if (urlMatch) {
        citations.push({
          citation,
          citation_number: citationNumber,
          url: urlMatch[1],
          domain: new URL(urlMatch[1]).hostname
        })
      }
    }
  } else {
    // ChatGPT or generic format - look for URLs
    const urlRegex = /https?:\/\/[^\s\]]+/g
    const urls = response.match(urlRegex) || []
    
    for (let i = 0; i < urls.length; i++) {
      try {
        const url = urls[i]
        citations.push({
          citation: `[${i + 1}]`,
          citation_number: i + 1,
          url,
          domain: new URL(url).hostname
        })
      } catch (error) {
        console.error('Error parsing URL:', error)
      }
    }
  }
  
  return citations
}

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
    let perplexityCitations = []
    
    if (platform === 'chatgpt') {
      response = await queryChatGPT(query_text)
    } else {
      const perplexityResponse = await queryPerplexity(query_text)
      response = perplexityResponse.content
      perplexityCitations = perplexityResponse.citations || []
    }

    // Extract citations
    const citations = extractCitations(response, platform)
    
    // If Perplexity provided citations, merge them
    if (perplexityCitations.length > 0) {
      for (let i = 0; i < perplexityCitations.length; i++) {
        const citation = perplexityCitations[i]
        if (citations[i]) {
          citations[i].title = citation.title
          citations[i].url = citation.url || citations[i].url
          citations[i].domain = new URL(citations[i].url).hostname
        }
      }
    }

    // Extract metadata
    const metadata = await extractQueryMetadata(query_text, response, query_intent)

    // Analyze competitor mentions (now includes citation checking)
    const competitorAnalysis = await analyzeCompetitorMentions(
      response, 
      brand_name, 
      brand_domain, 
      competitors,
      citations
    )
    
    // Analyze brand sentiment
    const brandSentiment = await analyzeBrandSentiment(response, brand_name)

    // Create result object
    const result = {
      query_text,
      keyword,
      query_intent,
      platform,
      response_content: response,
      citations,
      metadata: {
        ...metadata,
        ...competitorAnalysis,
        brand_sentiment: brandSentiment
      },
      brand_mention: competitorAnalysis.brand_mention_type !== 'none',
      brand_mention_count: competitorAnalysis.brand_mention_count,
      competitor_mentions: competitorAnalysis.competitors_mentioned,
      competitor_mentioned_names: competitorAnalysis.competitor_names,
      timestamp: new Date().toISOString()
    }

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