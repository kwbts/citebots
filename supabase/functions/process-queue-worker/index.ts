import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Standard response headers for all responses (includes CORS)
const responseHeaders = { 
  ...corsHeaders, 
  'Content-Type': 'application/json' 
};

interface QueueItem {
  id: string
  analysis_run_id: string
  query_data: {
    query_text: string
    keyword: string
    intent: string
    platform: 'chatgpt' | 'perplexity' | 'both'
    client: {
      id: string
      name: string
      domain: string
      competitors: Array<{
        name: string
        domain: string
        pattern: string
      }>
    }
  }
  attempts: number
}

serve(async (req) => {
  console.log('Queue worker invoked')
  
  // Handle CORS preflight requests - respond immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse request to get optional parameters
    const requestBody = await req.json().catch(err => {
      console.error('Error parsing request JSON:', err);
      return {};  // Default empty object if JSON parsing fails
    });
    
    const batch_size = requestBody.batch_size || 3;
    const max_runtime = requestBody.max_runtime || 25000;
    
    console.log(`Worker configuration: batch_size=${batch_size}, max_runtime=${max_runtime}ms`);
    
    // Create service client for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    const startTime = Date.now()
    let processedCount = 0
    let errorCount = 0
    
    // Process batches until timeout approaches
    while (Date.now() - startTime < max_runtime) {
      console.log(`Claiming batch of ${batch_size} items...`)
      
      // Claim a batch of work atomically
      const { data: batch, error: claimError } = await supabase
        .rpc('claim_queue_batch', { 
          p_batch_size: batch_size,
          p_processor_id: crypto.randomUUID()
        })
      
      if (claimError) {
        console.error('Error claiming batch:', claimError)
        break
      }
      
      if (!batch || !Array.isArray(batch) || batch.length === 0) {
        console.log('No pending items found')
        break
      }
      
      console.log(`Processing ${batch.length} queue items`)
      
      // Process items in parallel within the batch
      const results = await Promise.allSettled(
        batch.map(async (item: QueueItem) => {
          try {
            await processQueueItem(item, supabase)
            processedCount++
          } catch (error) {
            errorCount++
            console.error(`Error processing item ${item.id}:`, error)
            
            // Record the failure
            try {
              await supabase.rpc('handle_queue_failure', {
                p_queue_id: item.id,
                p_error_message: error.message || 'Unknown error',
                p_error_details: {
                  error: String(error),
                  timestamp: new Date().toISOString(),
                  attempts: item.attempts
                }
              })
            } catch (rpcError) {
              console.error('Failed to record queue failure:', rpcError)
            }
          }
        })
      )
      
      // Check if we have time for another batch
      const remainingTime = max_runtime - (Date.now() - startTime)
      if (remainingTime < 5000) { // Less than 5 seconds remaining
        console.log('Approaching timeout, stopping processing')
        break
      }
    }
    
    const response = {
      success: true,
      processed: processedCount,
      errors: errorCount,
      runtime: Date.now() - startTime
    }
    
    console.log('Worker completed:', response)
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: responseHeaders,
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
      { 
        headers: responseHeaders,
        status: 500
      }
    )
  }
})

async function processQueueItem(item: QueueItem, supabase: any) {
  if (!item || !item.id || !item.analysis_run_id || !item.query_data) {
    throw new Error('Invalid queue item: missing required fields')
  }

  console.log(`Processing queue item ${item.id}`)

  const { query_data } = item

  // Validate query data
  if (!query_data.query_text) {
    throw new Error('Invalid queue item: missing query_text')
  }

  // Create the query record
  const { data: queryRecord, error: queryError } = await supabase
    .from('analysis_queries')
    .insert({
      analysis_run_id: item.analysis_run_id,
      query_text: query_data.query_text,
      query_keyword: query_data.keyword || null,
      query_intent: query_data.intent || null,
      data_source: query_data.platform === 'both' ? 'chatgpt' : query_data.platform,
      status: 'pending'
    })
    .select()
    .single()

  if (queryError) {
    throw new Error(`Failed to create query record: ${queryError.message}`)
  }

  // Add a delay to ensure database operation completes and commits
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Execute the query using existing infrastructure
  try {
    const executeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          query_text: query_data.query_text,
          keyword: query_data.keyword || '',
          query_intent: query_data.intent || '',
          platform: query_data.platform === 'both' ? 'chatgpt' : query_data.platform,
          brand_name: query_data.client?.name || '',
          brand_domain: query_data.client?.domain || '',
          competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : []
        })
      }
    )
    
    if (!executeResponse.ok) {
      const errorText = await executeResponse.text().catch(() => 'Unknown error');
      throw new Error(`Query execution failed with status ${executeResponse.status}: ${errorText}`);
    }
  
    const executeResult = await executeResponse.json().catch(err => {
      throw new Error(`Failed to parse execute-query response: ${err.message}`);
    });
    
    if (!executeResult.success) {
      throw new Error(`Query execution failed: ${executeResult.error || 'Unknown error'}`);
    }
    
    // Correctly extract the result data from the structure returned by execute-query
    const queryData = executeResult.result || {};

    // Update the query with results - explicitly map all fields to ensure they're all included
    await supabase
      .from('analysis_queries')
      .update({
        // Core fields
        query_text: queryData.query_text,
        query_keyword: queryData.keyword,
        data_source: queryData.platform,
        model_response: queryData.response_content,

        // Classification fields
        query_category: queryData.query_category,
        query_topic: queryData.query_topic,
        query_type: queryData.query_type,
        query_intent: queryData.query_intent,
        funnel_stage: queryData.funnel_stage,
        query_complexity: queryData.query_complexity,

        // Response metadata
        response_match: queryData.response_match,
        response_outcome: queryData.response_outcome,
        action_orientation: queryData.action_orientation,
        query_competition: queryData.query_competition,

        // Citation data
        citation_count: queryData.citation_count || 0,

        // Brand analysis
        brand_mentioned: queryData.brand_mention || false,
        brand_sentiment: queryData.brand_sentiment || 0,
        brand_mention_type: queryData.brand_mention_type,
        brand_mention_count: queryData.brand_mention_count || 0,
        brand_positioning: queryData.brand_positioning,

        // Competitor analysis
        competitor_mentioned_names: queryData.competitor_mentioned_names || [],
        competitor_count: queryData.competitor_count || 0,
        competitor_context: queryData.competitor_context,
        total_competitor_mentions: queryData.total_competitor_mentions || 0,
        competitor_analysis: queryData.competitor_analysis || null,

        // Status fields
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', queryRecord.id);

    // Add delay to ensure the query update is complete before citations processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Process citations if available - make sure we access the right property
    const citations = queryData.citations;
    if (Array.isArray(citations) && citations.length > 0) {
      console.log(`Processing ${citations.length} citations`);
      
      // Process each citation
      const citationPromises = citations.map(async (citation: any, index: number) => {
        if (!citation || !citation.url) {
          console.warn('Skipping invalid citation:', citation);
          return null;
        }
        
        try {
          const citationResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-citation`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                query_id: queryRecord.id,
                citation_url: citation.url,
                citation_position: citation.citation_number || index + 1,
                query_text: query_data.query_text,
                keyword: query_data.keyword || '',
                brand_name: query_data.client?.name || '',
                brand_domain: query_data.client?.domain || '',
                competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : []
              })
            }
          );
          
          if (!citationResponse.ok) {
            const errorText = await citationResponse.text().catch(() => 'Unknown error');
            console.error(`Failed to analyze citation ${citation.url} with status ${citationResponse.status}: ${errorText}`);
            return null;
          }
          
          const citationResult = await citationResponse.json().catch(err => {
            console.error(`Failed to parse analyze-citation response: ${err.message}`);
            return { success: false, error: err.message };
          });
          
          if (citationResult.success) {
            return citationResult.page_analysis;
          } else {
            console.error(`Failed to analyze citation ${citation.url}:`, citationResult.error);
            return null;
          }
        } catch (error) {
          console.error(`Error processing citation ${citation.url}:`, error);
          return null;
        }
      });
      
      // Wait for all citation analyses to complete
      const pageAnalyses = (await Promise.all(citationPromises)).filter(Boolean);
      
      if (pageAnalyses.length > 0) {
        // Update query with associated pages
        await supabase
          .from('analysis_queries')
          .update({
            associated_pages: pageAnalyses,
            associated_pages_count: pageAnalyses.length
          })
          .eq('id', queryRecord.id);

        // Add delay to ensure associated pages are properly saved
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    // Update query status to failed
    await supabase
      .from('analysis_queries')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error'
      })
      .eq('id', queryRecord.id);
    
    // Re-throw error to be caught by the caller
    throw error;
  }
  
  // Mark queue item as completed
  await supabase
    .from('analysis_queue')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', item.id);
  
  // Update analysis run progress
  try {
    const { data: runData, error: runError } = await supabase
      .from('analysis_runs')
      .select('queries_completed, queries_total')
      .eq('id', item.analysis_run_id)
      .single();
    
    if (runError) {
      console.warn(`Failed to get analysis run data: ${runError.message}`);
      return;
    }
    
    if (runData) {
      // Safely increment completed count
      const currentCompleted = typeof runData.queries_completed === 'number' ? runData.queries_completed : 0;
      const totalQueries = typeof runData.queries_total === 'number' ? runData.queries_total : 0;
      const newCompleted = currentCompleted + 1;
      
      const isCompleted = newCompleted >= totalQueries;
      await supabase
        .from('analysis_runs')
        .update({
          queries_completed: newCompleted,
          status: isCompleted ? 'completed' : 'running',
          updated_at: new Date().toISOString(),
          // Set completed_at if the run is now complete
          ...(isCompleted ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', item.analysis_run_id);

      // Add delay after updating the run status to ensure frontend sees the updated status
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(`Error updating analysis run: ${error.message}`);
    // Don't throw here - this is non-critical
  }
  
  console.log(`Successfully processed queue item ${item.id}`);
}