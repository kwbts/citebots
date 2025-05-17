import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Perplexity API prompts
const prompts = {
  industryClassification: (clientName: string) => 
    `What is the primary and secondary industry classification for ${clientName}? Also identify their specific sub-industry or niche within these broader categories. Format your response with clear headings for Primary Industry, Secondary Industry, and Sub-industry Specifics.`,
  
  businessModelAndAudience: (clientName: string) =>
    `Analyze ${clientName}'s business model (whether they are B2B, B2C, B2B2C, etc.) and describe their target audience demographics in detail. Include age ranges, professional backgrounds, income levels, and any other relevant demographic factors for their ideal customers.`,
  
  competitors: (clientName: string) =>
    `Who are the top 3-5 primary competitors of ${clientName}? For each competitor, provide their name, website, and a brief description of how they compete with ${clientName} in the market.`,
  
  productsAndUsps: (clientName: string) =>
    `List the key products or services offered by ${clientName} and identify their unique selling propositions (USPs). What makes their offerings different from competitors? What specific value do they provide that others don't?`,
  
  geographicAndBrand: (clientName: string) =>
    `Determine ${clientName}'s geographic focus (whether they operate globally, regionally, or locally) and analyze their brand voice/tone. Is their communication formal, conversational, technical, inspirational, or something else? Provide specific examples from their website or marketing materials if possible.`,
  
  problemsAndUseCases: (clientName: string) =>
    `What are the common customer problems that ${clientName} solves with their products/services? Also identify 3-5 typical use cases for their offerings. For each use case, briefly describe the scenario, the customer need, and how ${clientName}'s solution addresses it.`,
  
  terminologyAndRegulations: (clientName: string) =>
    `Compile a glossary of industry-specific terminology or jargon commonly used by ${clientName} and their industry. Also identify any major regulatory considerations, compliance requirements, or legal frameworks that affect ${clientName}'s business operations and marketing activities.`
}

async function queryPerplexity(prompt: string, apiKey: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

function parseIndustryResponse(response: string) {
  const lines = response.split('\n')
  const result = {
    primary: '',
    secondary: '',
    subIndustry: ''
  }
  
  for (const line of lines) {
    if (line.toLowerCase().includes('primary industry')) {
      result.primary = line.split(':').pop()?.trim() || ''
    } else if (line.toLowerCase().includes('secondary industry')) {
      result.secondary = line.split(':').pop()?.trim() || ''
    } else if (line.toLowerCase().includes('sub-industry')) {
      result.subIndustry = line.split(':').pop()?.trim() || ''
    }
  }
  
  return result
}

function parseCompetitorsResponse(response: string) {
  const competitors = []
  const lines = response.split('\n')
  
  for (const line of lines) {
    // Look for patterns like "1. CompanyName (website.com)"
    const match = line.match(/\d+\.\s*([^(]+)\s*\(([^)]+)\)/)
    if (match) {
      competitors.push({
        name: match[1].trim(),
        domain: match[2].trim()
      })
    }
  }
  
  return competitors
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { clientName, clientDomain, clientId } = await req.json()
    
    if (!clientName || !clientDomain) {
      throw new Error('Client name and domain are required')
    }
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Execute all Perplexity queries
    const [
      industryResponse,
      businessModelResponse,
      competitorsResponse,
      productsResponse,
      geographicResponse,
      problemsResponse,
      terminologyResponse
    ] = await Promise.all([
      queryPerplexity(prompts.industryClassification(clientName), perplexityApiKey),
      queryPerplexity(prompts.businessModelAndAudience(clientName), perplexityApiKey),
      queryPerplexity(prompts.competitors(clientName), perplexityApiKey),
      queryPerplexity(prompts.productsAndUsps(clientName), perplexityApiKey),
      queryPerplexity(prompts.geographicAndBrand(clientName), perplexityApiKey),
      queryPerplexity(prompts.problemsAndUseCases(clientName), perplexityApiKey),
      queryPerplexity(prompts.terminologyAndRegulations(clientName), perplexityApiKey)
    ])
    
    // Parse responses
    const industry = parseIndustryResponse(industryResponse)
    const competitors = parseCompetitorsResponse(competitorsResponse)
    
    // Structure all the data
    const enhancedData = {
      industry_primary: industry.primary,
      industry_secondary: industry.secondary,
      sub_industry: industry.subIndustry,
      business_model: businessModelResponse.match(/B2[BC]2?C?/)?.[0] || 'Unknown',
      target_audience: { raw: businessModelResponse },
      key_products: { raw: productsResponse },
      unique_selling_props: { raw: productsResponse },
      geographic_focus: geographicResponse.match(/(global|regional|local)/i)?.[0] || 'Unknown',
      brand_voice: { raw: geographicResponse },
      customer_problems: { raw: problemsResponse },
      use_cases: { raw: problemsResponse },
      industry_terminology: { raw: terminologyResponse },
      regulatory_considerations: { raw: terminologyResponse },
      ai_enhanced_at: new Date().toISOString(),
      ai_enhancement_count: 1
    }
    
    // Update client with enhanced data
    if (clientId) {
      const { error: updateError } = await supabase
        .from('clients')
        .update(enhancedData)
        .eq('id', clientId)
      
      if (updateError) throw updateError
      
      // Add AI-sourced competitors
      for (const competitor of competitors) {
        const { error: competitorError } = await supabase
          .from('competitors')
          .insert({
            client_id: clientId,
            name: competitor.name,
            domain: competitor.domain,
            source: 'ai',
            ai_data: { raw: competitorsResponse }
          })
        
        if (competitorError) {
          console.error('Error adding competitor:', competitorError)
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: enhancedData,
        competitors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})