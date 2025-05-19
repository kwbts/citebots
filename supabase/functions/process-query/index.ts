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
  console.log('Process query request received')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as ProcessQueryRequest
    console.log('Request body:', JSON.stringify(body, null, 2))
    
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
    
    console.log('Creating query record')
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
      console.error('Query creation error:', queryError)
      throw new Error(`Failed to create query: ${queryError.message}`)
    }

    console.log('Query record created:', queryRecord.id)

    try {
      // Execute the query using our existing edge function
      console.log('Executing query via edge function')
      const queryResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          query_text,
          keyword,
          query_intent,
          platform,
          brand_name: client.name,
          brand_domain: client.domain,
          competitors: client.competitors
        })
      })

      console.log('Execute query response status:', queryResponse.status)
      const queryResult = await queryResponse.json()
      
      console.log('Query result keys:', Object.keys(queryResult || {}))
      console.log('Query result success:', queryResult?.success)

      if (!queryResult || !queryResult.success) {
        throw new Error(queryResult?.error || 'Invalid query response')
      }

      // Extract the actual result data
      const resultData = queryResult.result || queryResult

      if (!resultData) {
        console.error('No result data found in query response:', JSON.stringify(queryResult))
        throw new Error('Empty query result')
      }

      console.log('Result data keys:', Object.keys(resultData))
      console.log('Has citations:', 'citations' in resultData)
      console.log('Citations type:', typeof resultData.citations)

      // Update query with response - FIXED: include more metadata
      await serviceClient
        .from('analysis_queries')
        .update({
          model_response: resultData.response_content || resultData.response,
          citation_count: Array.isArray(resultData.citations) ? resultData.citations.length : 0,
          brand_mentioned: resultData.brand_mention || false,
          brand_sentiment: resultData.metadata?.brand_sentiment || 0,
          competitor_mentioned_names: resultData.metadata?.competitor_names || [],
          competitor_count: Array.isArray(resultData.metadata?.competitors_mentioned) ? resultData.metadata.competitors_mentioned.length : 0,
          // Add metadata from the query result
          query_category: resultData.metadata?.query_category || 'general',
          query_topic: resultData.metadata?.query_topic || 'general',
          query_type: resultData.metadata?.query_type || 'informational',
          funnel_stage: resultData.metadata?.funnel_stage || 'awareness',
          query_complexity: resultData.metadata?.query_complexity || 'simple',
          response_match: resultData.metadata?.response_match || 'direct',
          response_outcome: resultData.metadata?.response_outcome || 'answer',
          action_orientation: resultData.metadata?.action_orientation || 'medium',
          query_competition: resultData.metadata?.query_competition || 'opportunity',
          brand_mention_type: resultData.metadata?.brand_mention_type || 'none',
          competitor_context: resultData.metadata?.competitor_names?.join(', ') || 'none',
          status: 'analyzing_citations'
        })
        .eq('id', queryRecord.id)

      // Process each citation
      let processedCitations = 0
      const citations = resultData.citations || []
      const pageAnalyses = []

      // SAFE LENGTH ACCESS
      const citationCount = Array.isArray(citations) ? citations.length : 0
      console.log(`Processing ${citationCount} citations`)

      if (!Array.isArray(citations)) {
        console.error('Citations is not an array:', JSON.stringify(citations))
        // Don't throw, just skip citation processing
        console.log('Skipping citation processing due to invalid format')
      } else {
        for (let i = 0; i < citations.length; i++) {
          const citation = citations[i]
          if (!citation || typeof citation !== 'object') {
            console.error(`Invalid citation at index ${i}:`, citation)
            continue
          }
          
          console.log(`Processing citation ${i + 1}:`, citation.url || 'no url')
          
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
            
            if (citationResult.success && citationResult.page_analysis) {
              processedCitations++
              pageAnalyses.push(citationResult.page_analysis)
              console.log(`Successfully analyzed citation ${i + 1}`)
            } else {
              console.error(`Failed to analyze citation ${citation.url}:`, citationResult.error)
            }
          } catch (citationError) {
            console.error(`Error processing citation ${citation.url}:`, citationError.message || citationError)
          }
        }
      }

      // FIXED: Store the associated pages in the query record
      console.log(`Storing ${pageAnalyses.length} page analyses`)
      
      // Update query as completed with associated pages
      console.log('Updating query status to completed')
      const updateData = {
        associated_pages: pageAnalyses,
        associated_pages_count: processedCitations,
        status: 'completed',
        completed_at: new Date().toISOString()
      }
      
      console.log('Update data:', {
        ...updateData,
        associated_pages: `[${pageAnalyses.length} pages]`
      })
      
      await serviceClient
        .from('analysis_queries')
        .update(updateData)
        .eq('id', queryRecord.id)

      // Update analysis run progress
      console.log('Updating analysis run progress')
      const { data: runData } = await serviceClient
        .from('analysis_runs')
        .select('queries_completed, queries_total')
        .eq('id', analysis_run_id)
        .single()

      if (runData) {
        const newQueriesCompleted = (runData.queries_completed || 0) + 1
        const progress = runData.queries_total > 0 
          ? Math.round((newQueriesCompleted / runData.queries_total) * 100) 
          : 0

        await serviceClient
          .from('analysis_runs')
          .update({
            queries_completed: newQueriesCompleted,
            progress,
            status: newQueriesCompleted >= runData.queries_total ? 'completed' : 'running'
          })
          .eq('id', analysis_run_id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          query_id: queryRecord.id,
          citations_processed: processedCitations,
          page_analyses_count: pageAnalyses.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (error) {
      console.error('Process query error:', error)
      
      // Update query status to failed
      await serviceClient
        .from('analysis_queries')
        .update({
          status: 'failed',
          error_message: error.message || String(error)
        })
        .eq('id', queryRecord.id)

      throw error
    }

  } catch (error) {
    console.error('Process query error:', error)
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