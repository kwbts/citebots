import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// ChatGPT business intelligence research - simplified and focused
async function enhanceClientWithChatGPT(clientName: string, clientDomain: string, openAIKey: string) {
  const prompt = `Analyze ${clientName} (website: ${clientDomain}) and provide business intelligence. Focus on finding highly relevant, specific information. Competitors should be direct competitors based on attributes similar to ${clientName}.

Return ONLY a JSON object with this exact structure:

{
  "industry_primary": "primary industry (1-3 words)",
  "industry_secondary": "secondary industry (1-3 words)",
  "sub_industry": "specific niche (1-4 words)",
  "business_model": "B2B/B2C/B2B2C/etc",
  "target_audience": ["audience1", "audience2", "audience3"],
  "key_products": ["product1", "product2", "product3"],
  "unique_selling_props": ["usp1", "usp2", "usp3"],
  "geographic_focus": "global/regional/local",
  "geographic_regions": ["region1", "region2", "region3"],
  "brand_voice": ["voice1", "voice2", "voice3"],
  "customer_problems": ["problem1", "problem2", "problem3"],
  "use_cases": ["case1", "case2", "case3"],
  "industry_terminology": ["term1", "term2", "term3"],
  "regulatory_considerations": ["reg1", "reg2", "reg3"],
  "competitors": [
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"},
    {"name": "Competitor Name", "domain": "domain.com"}
  ]
}

IMPORTANT: Return exactly 5 competitors and 3 items for other arrays. Use valid JSON format only.`

  console.log('Making OpenAI API request...')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: 'You are a business research assistant. Your goal is to provide accurate and specific information. Research companies and return accurate business data in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  })

  console.log('OpenAI response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', response.status, errorText)
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Raw OpenAI response:', JSON.stringify(data, null, 2))

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenAI response structure:', data)
    throw new Error('Invalid response structure from OpenAI')
  }

  try {
    const content = data.choices[0].message.content
    console.log('Content to parse:', content)

    if (!content) {
      throw new Error('Empty content from OpenAI')
    }

    const parsed = JSON.parse(content)
    console.log('Successfully parsed JSON:', parsed)
    return parsed
  } catch (e) {
    console.error('Failed to parse ChatGPT response as JSON:', e)
    console.error('Content was:', data.choices[0].message.content)
    throw new Error(`Invalid JSON response from ChatGPT: ${e.message}`)
  }
}

// Helper function to ensure array limits with different limits per field type
function limitArrayFields(data: any): any {
  const result = { ...data }

  // Competitors get 5 items (priority)
  const competitorFields = ['competitors']
  competitorFields.forEach(field => {
    if (Array.isArray(result[field])) {
      result[field] = result[field].slice(0, 5)
    } else if (result[field]) {
      result[field] = [result[field]].slice(0, 5)
    } else {
      result[field] = []
    }
  })

  // All other fields get 3 items max
  const standardFields = [
    'target_audience',
    'key_products',
    'unique_selling_props',
    'geographic_regions',
    'brand_voice',
    'customer_problems',
    'use_cases',
    'industry_terminology',
    'regulatory_considerations'
  ]

  standardFields.forEach(field => {
    if (Array.isArray(result[field])) {
      result[field] = result[field].slice(0, 3)
    } else if (result[field]) {
      result[field] = [result[field]].slice(0, 3)
    } else {
      result[field] = []
    }
  })

  return result
}

serve(async (req) => {
  console.log('Edge function called:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.json()
    console.log('Raw request body:', requestBody)

    const { clientName, clientDomain, clientId } = requestBody
    console.log('Extracted data:', { clientName, clientDomain, clientId })

    if (!clientName || !clientDomain) {
      console.error('Missing required fields:', { clientName, clientDomain })
      throw new Error('Client name and domain are required')
    }
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Starting ChatGPT research for:', clientName)
    
    // Get enhanced data from ChatGPT with web search
    const rawData = await enhanceClientWithChatGPT(clientName, clientDomain, openAIApiKey)
    console.log('Raw ChatGPT data:', rawData)
    
    // Ensure array fields are limited (5 for competitors, 3 for others)
    const enhancedData = limitArrayFields(rawData)
    console.log('Limited enhanced data:', enhancedData)
    
    // Separate competitors from client data
    const { competitors, ...clientData } = enhancedData

    // Add metadata
    const finalData = {
      ...clientData,
      ai_enhanced_at: new Date().toISOString(),
      ai_enhancement_count: 1,
      ai_enhancement_status: 'completed'
    }

    // Update client with enhanced data (excluding competitors)
    if (clientId) {
      const { error: updateError } = await supabase
        .from('clients')
        .update(finalData)
        .eq('id', clientId)

      if (updateError) throw updateError
      
      // Add AI-sourced competitors to competitors table
      if (competitors && Array.isArray(competitors)) {
        console.log('Adding competitors to database:', competitors)

        for (const competitor of competitors) {
          if (competitor.name && competitor.domain) {
            // Use upsert to handle duplicates gracefully
            const { error: competitorError } = await supabase
              .from('competitors')
              .upsert({
                client_id: clientId,
                name: competitor.name,
                domain: competitor.domain,
                source: 'ai',
                ai_data: { enhanced_data: clientData }
              }, {
                onConflict: 'client_id,domain'
              })

            if (competitorError) {
              console.error('Error upserting competitor:', competitorError)
            } else {
              console.log('Upserted competitor:', competitor.name)
            }
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: finalData,
        competitors: competitors || [],
        summary: {
          total_fields_enhanced: Object.keys(finalData).length,
          array_fields_limited: true,
          max_competitors: 5,
          max_other_fields: 3
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Edge function error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Detailed error response for debugging
    const errorResponse = {
      success: false,
      error: error.message,
      type: error.constructor.name,
      stack: error.stack,
      details: {
        openAIKey: Deno.env.get('OPENAI_API_KEY') ? 'Set' : 'Missing',
        supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Set' : 'Missing',
        supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Missing'
      },
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})