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
    // Parse request body
    const body = await req.json() as RunCustomAnalysisRequest
    const { client_id, platform, queries } = body
    
    // Filter only selected queries
    const selectedQueries = queries.filter(q => q.selected)
    
    // Calculate total queries (multiply by 2 if platform is "both")
    const platformCount = platform === 'both' ? 2 : 1
    const queries_total = selectedQueries.length * platformCount
    
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
    
    // Quick validation - use service client for faster response
    const { data: client } = await serviceClient
      .from('clients')
      .select('id, name, domain')
      .eq('id', client_id)
      .single()
    
    if (!client) {
      throw new Error('Client not found')
    }
    
    // Create analysis run
    const batch_id = `custom_${platform}_${Date.now()}`
    const { data: analysisRun, error: runError } = await serviceClient
      .from('analysis_runs')
      .insert({
        client_id,
        batch_id,
        platform,
        status: 'running',
        queries_total,
        queries_completed: 0,
        created_by: body.created_by || null
      })
      .select()
      .single()
    
    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`)
    }
    
    // Return immediately with success response
    const response = new Response(
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
    
    // Process queries asynchronously (non-blocking)
    processQueriesAsync(analysisRun.id, selectedQueries, platform, client, serviceClient)
    
    return response
    
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

// Process queries asynchronously
async function processQueriesAsync(
  analysisRunId: string,
  selectedQueries: CustomQuery[],
  platform: string,
  client: any,
  serviceClient: any
) {
  try {
    // Fetch competitors
    const { data: competitors } = await serviceClient
      .from('competitors')
      .select('name, domain')
      .eq('client_id', client.id)
    
    const formattedCompetitors = (competitors || []).map(comp => ({
      name: comp.name,
      domain: comp.domain,
      pattern: comp.domain
    }))
    
    // Determine platforms
    const platforms = platform === 'both' ? ['chatgpt', 'perplexity'] : [platform]
    
    // Process each query for each platform
    let processedCount = 0
    for (const currentPlatform of platforms) {
      for (const query of selectedQueries) {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              analysis_run_id: analysisRunId,
              query_text: query.query_text,
              keyword: query.keyword,
              query_intent: query.intent,
              platform: currentPlatform,
              client: {
                id: client.id,
                name: client.name,
                domain: client.domain,
                competitors: formattedCompetitors
              }
            })
          })
          
          processedCount++
          
          // Update progress
          await serviceClient
            .from('analysis_runs')
            .update({
              queries_completed: processedCount
            })
            .eq('id', analysisRunId)
            
        } catch (error) {
          console.error(`Error processing query: ${error}`)
        }
      }
    }
    
    // Mark as completed
    await serviceClient
      .from('analysis_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', analysisRunId)
      
  } catch (error) {
    console.error('Background processing error:', error)
    
    // Mark as failed
    await serviceClient
      .from('analysis_runs')
      .update({
        status: 'failed',
        error_message: String(error)
      })
      .eq('id', analysisRunId)
  }
}