import OpenAI from 'openai'
import { useSupabaseAdmin } from '../utils/supabase'

const perplexityApiKey = process.env.PERPLEXITY_API_KEY
const openAIApiKey = process.env.OPENAI_API_KEY

// Same prompts as edge function
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

// Parsing prompts
const parsePrompts = {
  industry: `Extract the primary industry, secondary industry, and sub-industry from the text. Remove any headings, markdown formatting, or special characters. Return clean values only.

Return as JSON: {"primary": "short industry name", "secondary": "short industry name", "subIndustry": "specific niche"}

Example: {"primary": "Software", "secondary": "Marketing Technology", "subIndustry": "Email Campaign Tools"}`,

  businessModel: `Extract ONLY the business model type (B2B, B2C, B2B2C, etc.) from the text. Return as JSON: {"model": "B2B"} or similar. Do not include descriptions or explanations.`,

  targetAudience: `Extract target audience segments. Each segment must be 1-3 words maximum. Return as JSON: {"segments": ["segment1", "segment2", ...]}.

Example: {"segments": ["Marketing Teams", "Enterprise Companies", "Digital Agencies", "Small Businesses"]}`,

  competitors: `Extract company names and their domain URLs. Return as JSON: {"competitors": [{"name": "Company Name", "domain": "domain.com"}, ...]}.

Only include actual company names and valid domains, not descriptions.`,

  keyProducts: `Extract key products or services as short terms (1-3 words each). Return as JSON: {"products": ["product1", "product2", ...]}.

Example: {"products": ["Email Builder", "Campaign Analytics", "Template Library", "A/B Testing"]}`,

  usps: `Extract unique selling propositions as short phrases (1-5 words each). Return as JSON: {"usps": ["usp1", "usp2", ...]}.

Example: {"usps": ["No-code platform", "Real-time analytics", "Enterprise security", "99.9% uptime"]}`,

  geographicFocus: `Extract the geographic scope (global/regional/local) and specific regions. Return as JSON: {"focus": "global/regional/local", "regions": ["region1", "region2", ...]}.

Example: {"focus": "global", "regions": ["North America", "Europe", "Asia Pacific"]}`,

  brandVoice: `Extract brand voice characteristics as single descriptive words or short phrases (1-2 words). Return as JSON: {"voice": ["descriptor1", "descriptor2", ...]}.

Example: {"voice": ["Professional", "Innovative", "Customer-focused", "Technical"]}`,

  customerProblems: `Extract customer problems as short phrases (1-5 words each). Return as JSON: {"problems": ["problem1", "problem2", ...]}.

Example: {"problems": ["Email design complexity", "Campaign performance tracking", "Template consistency", "Team collaboration"]}`,

  useCases: `Extract use cases as short phrases (1-5 words each). Return as JSON: {"cases": ["case1", "case2", ...]}.

Example: {"cases": ["Newsletter creation", "Product announcements", "Event invitations", "Customer onboarding"]}`,

  terminology: `Extract industry-specific terms as single words or short phrases (1-3 words). Return as JSON: {"terms": ["term1", "term2", ...]}.

Example: {"terms": ["ESP", "CTR", "Open rate", "Deliverability", "Segmentation"]}`,

  regulations: `Extract regulatory considerations as short phrases (1-5 words each). Return as JSON: {"regulations": ["regulation1", "regulation2", ...]}.

Example: {"regulations": ["GDPR compliance", "CAN-SPAM Act", "Data privacy", "Email consent"]}`
}

async function queryPerplexity(prompt: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
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

async function parseWithChatGPT(perplexityResponse: string, parsePrompt: string) {
  const openai = new OpenAI({ apiKey: openAIApiKey })
  
  // Clean the Perplexity response first
  const cleanedResponse = perplexityResponse
    .replace(/#+\s*/g, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/`/g, '') // Remove code markers
    .trim()

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a data parser that extracts clean, structured information from text. Remove all markdown formatting, headings, and special characters. Return only valid JSON with short, concise values as specified. Never include the original formatting or structure from the input text.'
      },
      {
        role: 'user',
        content: `${parsePrompt}\n\nText to parse:\n${cleanedResponse}`
      }
    ],
    temperature: 0.1,
    max_tokens: 500
  })

  try {
    return JSON.parse(response.choices[0].message.content!)
  } catch (e) {
    console.error('Failed to parse ChatGPT response:', response.choices[0].message.content)
    return null
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { clientName, clientDomain, clientId } = body

    if (!clientName || !clientDomain) {
      throw new Error('Client name and domain are required')
    }

    if (!perplexityApiKey || !openAIApiKey) {
      throw new Error('API keys not configured')
    }

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
      queryPerplexity(prompts.industryClassification(clientName)),
      queryPerplexity(prompts.businessModelAndAudience(clientName)),
      queryPerplexity(prompts.competitors(clientName)),
      queryPerplexity(prompts.productsAndUsps(clientName)),
      queryPerplexity(prompts.geographicAndBrand(clientName)),
      queryPerplexity(prompts.problemsAndUseCases(clientName)),
      queryPerplexity(prompts.terminologyAndRegulations(clientName))
    ])

    // Parse all responses with ChatGPT
    const [
      industry,
      businessModel,
      targetAudience,
      competitors,
      keyProducts,
      usps,
      geographic,
      brandVoice,
      customerProblems,
      useCases,
      terminology,
      regulations
    ] = await Promise.all([
      parseWithChatGPT(industryResponse, parsePrompts.industry),
      parseWithChatGPT(businessModelResponse, parsePrompts.businessModel),
      parseWithChatGPT(businessModelResponse, parsePrompts.targetAudience),
      parseWithChatGPT(competitorsResponse, parsePrompts.competitors),
      parseWithChatGPT(productsResponse, parsePrompts.keyProducts),
      parseWithChatGPT(productsResponse, parsePrompts.usps),
      parseWithChatGPT(geographicResponse, parsePrompts.geographicFocus),
      parseWithChatGPT(geographicResponse, parsePrompts.brandVoice),
      parseWithChatGPT(problemsResponse, parsePrompts.customerProblems),
      parseWithChatGPT(problemsResponse, parsePrompts.useCases),
      parseWithChatGPT(terminologyResponse, parsePrompts.terminology),
      parseWithChatGPT(terminologyResponse, parsePrompts.regulations)
    ])

    // Structure all the data as arrays
    const enhancedData = {
      industry_primary: industry?.primary || '',
      industry_secondary: industry?.secondary || '',
      sub_industry: industry?.subIndustry || '',
      business_model: businessModel?.model || '',
      target_audience: targetAudience?.segments || [],
      key_products: keyProducts?.products || [],
      unique_selling_props: usps?.usps || [],
      geographic_focus: geographic?.focus || '',
      geographic_regions: geographic?.regions || [],
      brand_voice: brandVoice?.voice || [],
      customer_problems: customerProblems?.problems || [],
      use_cases: useCases?.cases || [],
      industry_terminology: terminology?.terms || [],
      regulatory_considerations: regulations?.regulations || [],
      ai_enhanced_at: new Date().toISOString(),
      ai_enhancement_count: 1
    }

    // Update client with enhanced data
    if (clientId) {
      const supabase = useSupabaseAdmin()

      const { error: updateError } = await supabase
        .from('clients')
        .update(enhancedData)
        .eq('id', clientId)
      
      if (updateError) throw updateError
      
      // Add AI-sourced competitors
      if (competitors?.competitors) {
        for (const competitor of competitors.competitors) {
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
    }

    return {
      success: true,
      data: enhancedData,
      competitors
    }
  } catch (error: any) {
    console.error('API Error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})