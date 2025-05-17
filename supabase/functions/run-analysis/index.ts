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

    // Verify user owns this client
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .eq('created_by', user.id)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found or unauthorized')
    }

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
    const competitors = client.competitors || []
    
    // In test mode, only use one intent for quick validation
    const intents = test_mode ? ['direct_experience'] : ['direct_experience', 'recommendation_request', 'comparison_question']
    
    // Calculate total queries (keywords × intents)
    const queries_total = keywords.length * intents.length

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
    
    // Update status to running
    await serviceClient
      .from('analysis_runs')
      .update({ status: 'running' })
      .eq('id', analysisRun.id)

    // Process queries - in test mode just one, otherwise all
    const queriesToProcess = []
    
    if (test_mode && keywords.length > 0) {
      // Test mode: just one query
      queriesToProcess.push({
        text: `What is ${keywords[0]}?`,
        keyword: keywords[0],
        intent: 'direct_experience'
      })
    } else {
      // Full mode: all keyword/intent combinations
      for (const keyword of keywords) {
        for (const intent of intents) {
          let queryText = ''
          switch (intent) {
            case 'direct_experience':
              queryText = `What is your experience with ${keyword}?`
              break
            case 'recommendation_request':
              queryText = `Can you recommend the best ${keyword}?`
              break
            case 'comparison_question':
              queryText = `Compare the top ${keyword} options`
              break
            default:
              queryText = `Tell me about ${keyword}`
          }
          
          queriesToProcess.push({
            text: queryText,
            keyword: keyword,
            intent: intent
          })
        }
      }
    }
    
    // Process queries
    if (queriesToProcess.length > 0) {
      let processedQueries = 0
      
      for (const query of queriesToProcess) {
        try {
          // Process each query using our process-query edge function
          const processResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              analysis_run_id: analysisRun.id,
              query_text: query.text,
              keyword: query.keyword,
              query_intent: query.intent,
              platform: platform === 'both' ? 'chatgpt' : platform,
              client: {
                id: client.id,
                name: client.name,
                domain: client.domain,
                competitors: competitors
              }
            })
          })
          
          const processResult = await processResponse.json()
          
          if (processResult.success) {
            processedQueries++
            console.log(`Processed query: ${query.text}`)
          } else {
            console.error(`Failed to process query: ${query.text}`, processResult.error)
          }
        } catch (error) {
          console.error(`Error processing query: ${query.text}`, error)
        }
        
        // In test mode, break after first query
        if (test_mode) {
          break
        }
      }
      
      // Final status update
      const finalStatus = processedQueries === queriesToProcess.length ? 'completed' : 'partial'
      await serviceClient
        .from('analysis_runs')
        .update({
          status: finalStatus,
          queries_completed: processedQueries,
          completed_at: finalStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', analysisRun.id)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis_run: analysisRun,
        message: 'Analysis started successfully. Check status for updates.'
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