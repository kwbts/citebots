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
  console.log('Custom analysis request received')
  
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

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { client_id, platform, queries } = await req.json() as RunCustomAnalysisRequest
    console.log('Request data:', { client_id, platform, queryCount: queries?.length })

    // Filter only selected queries
    const selectedQueries = queries.filter(q => q.selected)
    
    if (selectedQueries.length === 0) {
      throw new Error('No queries selected')
    }

    // Get client
    const { data: client } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .eq('created_by', user.id)
      .single()

    if (!client) {
      throw new Error('Client not found or unauthorized')
    }

    // Create service client for faster operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    // Calculate total queries
    const platformCount = platform === 'both' ? 2 : 1
    const queries_total = selectedQueries.length * platformCount
    
    // Extract keywords and intents
    const keywords = [...new Set(selectedQueries.map(q => q.keyword).filter(k => k))]
    const intents = [...new Set(selectedQueries.map(q => q.intent).filter(i => i))]

    // Create analysis run
    const batch_id = `custom_${platform}_${Date.now()}`
    const { data: analysisRun, error: runError } = await serviceClient
      .from('analysis_runs')
      .insert({
        client_id,
        batch_id,
        platform,
        status: 'pending',
        intents,
        keywords,
        queries_total,
        queries_completed: 0,
        test_mode: false,
        created_by: user.id
      })
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`)
    }

    console.log('Created analysis run:', analysisRun.id)

    // Return success immediately
    return new Response(
      JSON.stringify({
        success: true,
        analysis_run_id: analysisRun.id,
        batch_id: analysisRun.batch_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Custom analysis error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})