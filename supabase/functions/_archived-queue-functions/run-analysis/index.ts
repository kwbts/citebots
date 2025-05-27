import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RunAnalysisRequest {
  client_id: string
  platform: 'chatgpt' | 'perplexity' | 'both'
  test_mode?: boolean
  keywords?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    // Parse request body
    const { client_id, platform, test_mode, keywords: testKeywords } = await req.json() as RunAnalysisRequest

    // Validate input
    if (!client_id || !platform) {
      throw new Error('Missing required fields: client_id, platform')
    }

    // Try to find client by created_by first, then user_id
    let client = null
    let clientError = null
    
    // First try with created_by
    const { data: clientByCreatedBy, error: createdByError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .eq('created_by', user.id)
      .single()
    
    if (!createdByError && clientByCreatedBy) {
      client = clientByCreatedBy
    } else {
      // Try with user_id if created_by failed
      const { data: clientByUserId, error: userIdError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', client_id)
        .eq('user_id', user.id)
        .single()
      
      if (!userIdError && clientByUserId) {
        client = clientByUserId
      } else {
        clientError = createdByError || userIdError
      }
    }

    if (!client) {
      throw new Error('Client not found or unauthorized')
    }

    // Fetch competitors from the competitors table
    const { data: competitors, error: competitorsError } = await supabaseClient
      .from('competitors')
      .select('name, domain')
      .eq('client_id', client_id)

    if (competitorsError) {
      console.error('Error fetching competitors:', competitorsError)
    }

    // Format competitors for the edge functions (add pattern field)
    const formattedCompetitors = (competitors || []).map(comp => ({
      name: comp.name,
      domain: comp.domain,
      pattern: comp.domain // Use domain as pattern
    }))

    // Create a new analysis run with service role client
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    const batch_id = `${platform}_${Date.now()}`
    
    // Use test keywords if in test mode, otherwise use client keywords
    const keywords = test_mode && testKeywords ? testKeywords : (client.keywords || [])
    
    // In test mode, only use one intent for quick validation
    const intents = test_mode ? ['direct_experience'] : ['direct_experience', 'recommendation_request', 'comparison_question']
    
    // Calculate total queries (keywords × intents × platforms)
    const platformCount = platform === 'both' ? 2 : 1
    const queries_total = keywords.length * intents.length * platformCount

    const { data: analysisRun, error: runError } = await serviceClient
      .from('analysis_runs')
      .insert({
        client_id,
        batch_id,
        platform,
        status: 'pending',
        intents,
        keywords,
        competitors: formattedCompetitors,
        queries_total,
        queries_completed: 0,
        test_mode: test_mode || false,
        created_by: user.id
      })
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`)
    }

    console.log('Created analysis run:', analysisRun.id)

    // Start the analysis workflow
    if (platform === 'both') {
      // If both platforms, run sequentially
      try {
        // Run ChatGPT analysis
        await runPlatformAnalysis(analysisRun.id, 'chatgpt', keywords, intents, client, formattedCompetitors, serviceClient)
        
        // Then run Perplexity analysis
        await runPlatformAnalysis(analysisRun.id, 'perplexity', keywords, intents, client, formattedCompetitors, serviceClient)
      } catch (error) {
        console.error('Error in analysis workflow:', error)
        
        // Update run status to failed
        await serviceClient
          .from('analysis_runs')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', analysisRun.id)
        
        throw error
      }
    } else {
      // Single platform
      await runPlatformAnalysis(analysisRun.id, platform, keywords, intents, client, formattedCompetitors, serviceClient)
    }

    // Update run status to running
    await serviceClient
      .from('analysis_runs')
      .update({ status: 'running' })
      .eq('id', analysisRun.id)

    return new Response(
      JSON.stringify({
        success: true,
        analysis_run_id: analysisRun.id,
        message: `Analysis started for ${queries_total} queries`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in run-analysis:', error)
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

async function runPlatformAnalysis(
  analysisRunId: string,
  platform: string,
  keywords: string[],
  intents: string[],
  client: any,
  competitors: any[],
  serviceClient: any
) {
  console.log(`Starting ${platform} analysis for ${keywords.length} keywords`)

  for (const keyword of keywords) {
    for (const intent of intents) {
      // Generate query based on intent
      const query = generateQuery(keyword, intent, client.name)
      
      try {
        // Call process-query edge function
        const processResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            analysis_run_id: analysisRunId,
            query_text: query,
            keyword: keyword,
            query_intent: intent,
            platform,
            client: {
              id: client.id,
              name: client.name,
              domain: client.domain,
              competitors: competitors
            }
          })
        })

        const processResult = await processResponse.json()
        
        if (!processResult.success) {
          console.error(`Failed to process query "${query}":`, processResult.error)
        }
      } catch (error) {
        console.error(`Error processing query "${query}":`, error)
      }
    }
  }
}

function generateQuery(keyword: string, intent: string, brandName: string): string {
  const templates = {
    direct_experience: [
      `How to use ${keyword}?`,
      `${keyword} setup guide`,
      `Getting started with ${keyword}`,
      `${keyword} tutorial`,
      `${keyword} implementation`
    ],
    recommendation_request: [
      `Best ${keyword} solutions`,
      `Recommended ${keyword} tools`,
      `Top ${keyword} platforms`,
      `${keyword} comparison`,
      `Which ${keyword} should I choose?`
    ],
    comparison_question: [
      `${brandName} vs competitors for ${keyword}`,
      `Compare ${keyword} solutions`,
      `${keyword} alternatives comparison`,
      `Best ${keyword} vs others`,
      `${keyword} platform comparison`
    ]
  }

  const intentTemplates = templates[intent] || templates.direct_experience
  const randomTemplate = intentTemplates[Math.floor(Math.random() * intentTemplates.length)]
  
  return randomTemplate
}