import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessQueryRequest {
  analysis_run_id: string
  query_text: string
  keyword: string
  query_intent: string
  platform: 'chatgpt' | 'perplexity' | 'both'
  client: {
    id: string
    name: string
    domain: string
    competitors: any[]
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as ProcessQueryRequest
    const { 
      analysis_run_id,
      query_text, 
      keyword,
      query_intent,
      platform, 
      client 
    } = body

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

    // Create query record
    const queryId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data: queryRecord, error: queryError } = await serviceClient
      .from('analysis_queries')
      .insert({
        analysis_run_id,
        query_id: queryId,
        query_text,
        query_keyword: keyword,
        query_intent,
        data_source: platform,
        status: 'running'
      })
      .select()
      .single()

    if (queryError) {
      throw new Error(`Failed to create query: ${queryError.message}`)
    }

    try {
      // Execute the query using our existing edge function
      const queryResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          query_text,
          keyword,
          platform,
          brand_name: client.name,
          brand_domain: client.domain,
          competitors: client.competitors
        })
      })

      const queryResult = await queryResponse.json()

      console.log('Query result structure:', JSON.stringify(queryResult, null, 2))

      if (!queryResult || !queryResult.success) {
        throw new Error(queryResult?.error || 'Invalid query response')
      }

      // Extract the actual result data
      const resultData = queryResult.result || queryResult

      if (!resultData) {
        console.error('No result data found in query response')
        throw new Error('Empty query result')
      }

      console.log('Result data structure:', JSON.stringify({
        has_response_content: !!resultData.response_content,
        has_response: !!resultData.response,
        has_citations: !!resultData.citations,
        citations_type: Array.isArray(resultData.citations) ? 'array' : typeof resultData.citations,
        citations_length: Array.isArray(resultData.citations) ? resultData.citations.length : 'N/A'
      }))

      // Update query with response
      await serviceClient
        .from('analysis_queries')
        .update({
          model_response: resultData.response_content || resultData.response,
          citation_count: resultData.citations ? resultData.citations.length : 0,
          brand_mentioned: resultData.brand_mention || false,
          status: 'analyzing_citations'
        })
        .eq('id', queryRecord.id)

      // Process each citation
      let processedCitations = 0
      const citations = resultData.citations || []

      console.log(`Processing ${citations.length} citations`)

      if (!Array.isArray(citations)) {
        console.error('Citations is not an array:', citations)
        throw new Error('Invalid citations format')
      }

      for (let i = 0; i < citations.length; i++) {
        const citation = citations[i]
        if (!citation || typeof citation !== 'object') {
          console.error(`Invalid citation at index ${i}:`, citation)
          continue
        }

        try {
          // Analyze the citation
          const citationResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-citation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              query_id: queryRecord.id,
              citation_url: citation.url,
              citation_position: citation.citation_number || i + 1,
              query_text,
              keyword,
              brand_name: client.name,
              brand_domain: client.domain,
              competitors: client.competitors
            })
          })

          const citationResult = await citationResponse.json()
          
          if (citationResult.success) {
            processedCitations++
          } else {
            console.error(`Failed to analyze citation ${citation.url}:`, citationResult.error)
          }
        } catch (citationError) {
          console.error(`Error processing citation ${citation.url}:`, citationError)
        }
      }

      // Update query as completed
      await serviceClient
        .from('analysis_queries')
        .update({
          associated_pages_count: processedCitations,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', queryRecord.id)

      // Update analysis run progress
      const { data: runData } = await serviceClient
        .from('analysis_runs')
        .select('queries_completed, queries_total')
        .eq('id', analysis_run_id)
        .single()

      if (runData) {
        const newCompleted = (runData.queries_completed || 0) + 1
        const isComplete = newCompleted >= runData.queries_total

        await serviceClient
          .from('analysis_runs')
          .update({
            queries_completed: newCompleted,
            status: isComplete ? 'completed' : 'running',
            completed_at: isComplete ? new Date().toISOString() : null
          })
          .eq('id', analysis_run_id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          query_id: queryRecord.id,
          citations_processed: processedCitations,
          total_citations: queryResult.citations.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (error) {
      // Update query as failed
      await serviceClient
        .from('analysis_queries')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', queryRecord.id)

      throw error
    }

  } catch (error) {
    console.error('Process query error:', error)
    
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