// Enhanced metadata extraction for execute-query function

async function extractEnhancedQueryMetadata(query: string, response: string, intent: string, brandName: string, competitors: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return getDefaultMetadata(query, intent)
  }

  // Create a comprehensive prompt for better metadata extraction
  const competitorList = Array.isArray(competitors) ? competitors.map(c => c.name).join(', ') : '';
  
  const prompt = `
Analyze this search query and AI response to extract comprehensive metadata.

Query: "${query}"
Response: "${response}"
Brand: "${brandName}"
Competitors: "${competitorList}"

Provide a detailed analysis in JSON format with the following fields:

{
  "query_category": "Choose one: general/product/service/comparison/troubleshooting/educational/pricing/features/reviews",
  "query_topic": "Specific topic (e.g., 'workforce management', 'email templates', 'construction trends')",
  "query_type": "Choose one: informational/navigational/transactional/commercial/investigational",
  "query_intent": "User's primary intent",
  "funnel_stage": "Choose one: awareness/consideration/decision/retention/advocacy",
  "query_complexity": "Choose one: simple/moderate/complex/sophisticated",
  "response_match": "Choose one: direct/partial/tangential/comprehensive/inadequate",
  "response_outcome": "Choose one: answer/recommendation/comparison/explanation/guide/referral",
  "action_orientation": "Choose one: high/medium/low/none",
  "query_competition": "Choose one: high/moderate/low/opportunity/niche",
  "content_depth": "Choose one: surface/moderate/deep/expert",
  "commercial_intent": "Choose one: none/low/medium/high/immediate",
  "brand_relevance": "Choose one: central/mentioned/tangential/absent",
  "competitor_context": "How competitors are mentioned",
  "user_sophistication": "Choose one: novice/intermediate/advanced/expert",
  "urgency_level": "Choose one: none/low/medium/high/critical",
  "solution_focus": "Choose one: problem/solution/comparison/education",
  "industry_specificity": "Choose one: general/industry-specific/niche",
  "geographic_relevance": "Choose one: global/regional/local/none",
  "temporal_context": "Choose one: current/trending/evergreen/historical"
}

Be specific and accurate in your categorization based on the actual content.`

  try {
    const metadataResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert in query analysis and SEO metadata extraction. Provide precise categorization based on the content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })
    })

    if (metadataResponse.ok) {
      const data = await metadataResponse.json()
      const metadata = JSON.parse(data.choices[0].message.content)
      
      // Map enhanced fields back to expected format
      return {
        query_category: metadata.query_category || 'general',
        query_topic: metadata.query_topic || 'general',
        query_type: metadata.query_type || 'informational',
        funnel_stage: metadata.funnel_stage || 'awareness',
        query_complexity: metadata.query_complexity || 'simple',
        response_match: metadata.response_match || 'direct',
        response_outcome: metadata.response_outcome || 'answer',
        action_orientation: metadata.action_orientation || 'medium',
        query_competition: metadata.query_competition || 'opportunity',
        // Additional enhanced fields
        content_depth: metadata.content_depth || 'moderate',
        commercial_intent: metadata.commercial_intent || 'low',
        brand_relevance: metadata.brand_relevance || 'mentioned',
        user_sophistication: metadata.user_sophistication || 'intermediate',
        urgency_level: metadata.urgency_level || 'low',
        solution_focus: metadata.solution_focus || 'solution',
        industry_specificity: metadata.industry_specificity || 'general',
        geographic_relevance: metadata.geographic_relevance || 'global',
        temporal_context: metadata.temporal_context || 'current'
      }
    }
  } catch (error) {
    console.error('Error extracting enhanced metadata:', error)
  }

  return getDefaultMetadata(query, intent)
}

// Enhanced competitor analysis function
async function analyzeCompetitorMentionsEnhanced(response: string, brandName: string, brandDomain: string, competitors: any[], citations: any[]) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  
  const competitorAnalysis = []
  const mentionedCompetitors = new Set<string>()
  
  // First, check citations for domains
  const citationsList = Array.isArray(citations) ? citations : []
  for (const citation of citationsList) {
    if (!citation || !citation.domain) continue
    
    const domain = citation.domain.toLowerCase()
    
    // Check if it's the brand domain
    if (domain.includes(brandDomain.toLowerCase())) {
      // Brand citation found
    }
    
    // Check if it's a competitor domain
    const competitorsList = Array.isArray(competitors) ? competitors : []
    for (const comp of competitorsList) {
      if (!comp || !comp.domain) continue
      
      const compDomain = comp.domain.toLowerCase()
      if (domain.includes(compDomain)) {
        mentionedCompetitors.add(comp.name)
      }
    }
  }
  
  // Now use GPT to analyze mentions in the text
  if (apiKey) {
    try {
      const competitorNames = Array.isArray(competitors) ? competitors.map(c => c.name).join(', ') : '';
      
      const prompt = `
Analyze this response for brand and competitor mentions:

Response: "${response}"
Brand: "${brandName}"
Competitors: ${competitorNames}

Provide analysis in JSON format:
{
  "brand_mentions": {
    "direct_mentions": number of times brand is mentioned directly,
    "indirect_mentions": number of implied references,
    "mention_context": "positive/neutral/negative/mixed",
    "sentiment_score": -1 to 1,
    "prominence": "primary/secondary/minimal/none"
  },
  "competitor_mentions": [
    {
      "name": "competitor name",
      "mention_count": number of mentions,
      "context": "comparison/alternative/referenced/featured",
      "sentiment": "positive/neutral/negative",
      "relative_position": "superior/equal/inferior/unclear"
    }
  ],
  "overall_competitive_landscape": "brand-favorable/competitor-favorable/neutral/mixed",
  "recommendation_strength": "strong/moderate/weak/none",
  "market_positioning": "leader/challenger/niche/unclear"
}`

      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are an expert in competitive analysis and brand sentiment analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 600,
          response_format: { type: 'json_object' }
        })
      })

      if (analysisResponse.ok) {
        const data = await analysisResponse.json()
        const analysis = JSON.parse(data.choices[0].message.content)
        
        return {
          brand_mention_type: analysis.brand_mentions.prominence !== 'none' ? 'direct' : 'none',
          brand_mention_count: analysis.brand_mentions.direct_mentions + analysis.brand_mentions.indirect_mentions,
          brand_sentiment: analysis.brand_mentions.sentiment_score,
          competitors_mentioned: analysis.competitor_mentions.map((c: any) => ({
            name: c.name,
            mentions: c.mention_count,
            type: c.context,
            sentiment: c.sentiment,
            position: c.relative_position
          })),
          competitor_names: analysis.competitor_mentions.map((c: any) => c.name),
          overall_landscape: analysis.overall_competitive_landscape,
          recommendation_strength: analysis.recommendation_strength,
          market_positioning: analysis.market_positioning
        }
      }
    } catch (error) {
      console.error('Error in enhanced competitor analysis:', error)
    }
  }
  
  // Fallback to basic analysis
  const responseLower = response.toLowerCase()
  const brandMentionCount = (response.match(new RegExp(brandName, 'gi')) || []).length
  
  return {
    brand_mention_type: brandMentionCount > 0 ? 'direct' : 'none',
    brand_mention_count: brandMentionCount,
    competitors_mentioned: Array.from(mentionedCompetitors).map(name => ({
      name,
      mentions: 1,
      type: 'mentioned'
    })),
    competitor_names: Array.from(mentionedCompetitors)
  }
}

// Export the enhanced functions
export { extractEnhancedQueryMetadata, analyzeCompetitorMentionsEnhanced }