import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface CustomQuery {
  query_text: string
  keyword: string
  intent: string
  selected: boolean
}

interface RunCustomAnalysisRequest {
  client_id: string
  platform: 'chatgpt' | 'perplexity' | 'both'
  queries: CustomQuery[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
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
    const { client_id, platform, queries } = await req.json() as RunCustomAnalysisRequest

    // Validate input
    if (!client_id || !platform || !queries || queries.length === 0) {
      throw new Error('Missing required fields: client_id, platform, queries')
    }

    // Filter only selected queries
    const selectedQueries = queries.filter(q => q.selected)
    if (selectedQueries.length === 0) {
      throw new Error('No queries selected')
    }

    // Try to find client by created_by first, then user_id
    let client = null
    
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

    const batch_id = `custom_${platform}_${Date.now()}`

    // Add validation for selectedQueries
    console.log('Selected queries:', selectedQueries)

    if (!selectedQueries || !Array.isArray(selectedQueries)) {
      throw new Error('Invalid selectedQueries format')
    }

    // Extract unique keywords and intents from selected queries
    const keywords = [...new Set(selectedQueries.map(q => q.keyword).filter(k => k))]
    const intents = [...new Set(selectedQueries.map(q => q.intent).filter(i => i))]
    
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
        queries_total: selectedQueries.length,
        queries_completed: 0,
        test_mode: false,
        created_by: user.id
      })
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`)
    }

    console.log('Created custom analysis run:', analysisRun.id)

    // Process each selected query
    console.log(`Processing ${selectedQueries.length} queries`)

    for (const query of selectedQueries) {
      try {
        console.log(`Processing query: "${query.query_text}"`)

        // Call process-query edge function for each query
        const processResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            analysis_run_id: analysisRun.id,
            query_text: query.query_text,
            keyword: query.keyword,
            query_intent: query.intent,
            platform,
            client: {
              id: client.id,
              name: client.name,
              domain: client.domain,
              competitors: formattedCompetitors
            }
          })
        })

        const processResult = await processResponse.json()

        if (!processResult.success) {
          console.error(`Failed to process query "${query.query_text}":`, processResult.error)
        } else {
          console.log(`Successfully processed query: "${query.query_text}"`)
        }
      } catch (error) {
        console.error(`Error processing query "${query.query_text}":`, error.message || error)
      }
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
        message: `Custom analysis started for ${selectedQueries.length} queries`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in run-custom-analysis:', error)
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