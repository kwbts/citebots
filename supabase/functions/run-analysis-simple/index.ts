import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, platform, test_mode, keywords: testKeywords } = await req.json()

    // Validate input
    if (!client_id || !platform) {
      throw new Error('Missing required fields: client_id, platform')
    }

    // Create service client
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    // Get client data
    const { data: client, error: clientError } = await serviceClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    const batch_id = `${platform}_${Date.now()}`
    
    // Use test keywords if in test mode, otherwise use client keywords
    const keywords = test_mode && testKeywords ? testKeywords : (client.keywords || [])
    
    // In test mode, only use one intent for quick validation
    const intents = test_mode ? ['direct_experience'] : ['direct_experience', 'recommendation_request', 'comparison_question']
    
    // Calculate total queries (keywords × intents)
    const queries_total = keywords.length * intents.length

    // Create analysis run
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
        queries_completed: 0
      })
      .select()
      .single()

    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis_run: analysisRun,
        message: 'Analysis started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in run-analysis function:', error)
    
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