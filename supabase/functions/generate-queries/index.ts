import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Generate queries with only two intent types:
// 1. recommendation_request - Seeking advice or recommendations
// 2. comparison_question - Comparing options or alternatives

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface GenerateQueriesRequest {
  client_id: string
  keywords: string[]
  count?: number // Number of queries per intent type (default: 5)
}

interface ClientInfo {
  name: string
  domain: string
  industry?: string
  target_audience?: string[]
  key_products?: string[]
  unique_selling_props?: string[]
  brand_voice?: string[]
  customer_problems?: string[]
  use_cases?: string[]
  competitors?: any[]
}

async function generateNaturalQueries(
  keyword: string, 
  clientInfo: ClientInfo,
  intent: string,
  count: number = 5
) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const clientContext = `
Client: ${clientInfo.name}
Industry: ${clientInfo.industry || 'Not specified'}
Target Audience: ${clientInfo.target_audience?.join(', ') || 'General'}
Key Products: ${clientInfo.key_products?.join(', ') || 'Not specified'}
Unique Selling Props: ${clientInfo.unique_selling_props?.join(', ') || 'Not specified'}
Brand Voice: ${clientInfo.brand_voice?.join(', ') || 'Professional'}
Customer Problems: ${clientInfo.customer_problems?.join(', ') || 'Not specified'}
Use Cases: ${clientInfo.use_cases?.join(', ') || 'Not specified'}
`

  const prompt = `Generate ${count} natural language queries about "${keyword}" that real users might ask when looking for ${intent}.

Context:
${clientContext}

Guidelines:
1. Create queries that sound natural and conversational
2. Consider the client's industry and target audience
3. Vary the query structure and complexity
4. Include different perspectives (buyer, user, researcher)
5. Don't be too promotional or biased toward the brand
6. Consider the search intent: ${intent}

Query Intent Types:
- recommendation_request: Seeking advice or recommendations
- comparison_question: Comparing options or alternatives

Return exactly ${count} unique queries as a JSON array of strings. Example format:
["What is the best CRM software?", "How do I choose a marketing platform?", "Compare top email marketing tools"]

Make them sound like real search queries or questions people would ask.`

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
          content: 'You are an expert at generating natural search queries that real users would type or ask. Generate diverse, realistic queries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      // response_format: { type: 'json_object' } // Removing this to avoid format issues
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('OpenAI response:', data)

  let result
  try {
    result = JSON.parse(data.choices[0].message.content)
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError)
    throw new Error('Invalid response format from OpenAI')
  }

  // Ensure we have an array of queries
  const queries = Array.isArray(result) ? result : (result.queries || [])
  console.log('Extracted queries:', queries)

  return queries
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    console.log('Generate queries request received')

    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false
        }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request
    const body = await req.json()
    console.log('Request body:', body)
    const { client_id, keywords, count = 5 } = body as GenerateQueriesRequest

    // Fetch client info
    console.log('Fetching client:', client_id)
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*, competitors(*)')
      .eq('id', client_id)
      .eq('created_by', user.id)
      .single()

    console.log('Client data:', client, 'Error:', clientError)

    if (clientError || !client) {
      throw new Error('Client not found or unauthorized')
    }

    // Generate queries for each keyword and intent combination
    const allQueries = []
    const intents = ['recommendation_request', 'comparison_question']

    console.log('Starting query generation for keywords:', keywords)

    for (const keyword of keywords) {
      for (const intent of intents) {
        try {
          console.log(`Generating queries for ${keyword} - ${intent}`)

          const queries = await generateNaturalQueries(
            keyword,
            client,
            intent,
            count
          )

          console.log(`Generated ${queries.length} queries`)

          // Format queries with metadata
          const formattedQueries = queries.map((query: string) => ({
            query_text: query,
            keyword: keyword,
            intent: intent,
            selected: true, // Default to selected
            metadata: {
              client_name: client.name,
              client_domain: client.domain,
              generated_at: new Date().toISOString()
            }
          }))

          allQueries.push(...formattedQueries)
        } catch (error) {
          console.error(`Error generating queries for ${keyword} - ${intent}:`, error)
          // Add a fallback query
          allQueries.push({
            query_text: `What is ${keyword}?`,
            keyword: keyword,
            intent: intent,
            selected: true,
            metadata: {
              client_name: client.name,
              client_domain: client.domain,
              generated_at: new Date().toISOString(),
              fallback: true
            }
          })
        }
      }
    }

    console.log(`Total queries generated: ${allQueries.length}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        queries: allQueries,
        total: allQueries.length,
        client: {
          id: client.id,
          name: client.name,
          domain: client.domain
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error generating queries:', error)
    
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