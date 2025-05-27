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
  query_text?: string
  platform?: string
  client_id?: string
  client_name?: string
  client_domain?: string
  competitors?: any[]
  query_data?: any
  attempts: number
}

serve(async (req) => {
  console.log('Queue worker invoked')
  
  // Handle CORS preflight requests - respond immediately
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', {
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
  if (!item || !item.id || !item.analysis_run_id) {
    throw new Error('Invalid queue item: missing required fields')
  }

  console.log(`Processing queue item ${item.id}`)
  
  // Extract query data - handle both direct properties and query_data object
  const query_text = item.query_text || (item.query_data?.query_text)
  const platform = item.platform || (item.query_data?.platform) || 'chatgpt'
  const keyword = item.query_data?.keyword || ''
  const query_intent = item.query_data?.intent || ''
  
  // Get client information from either direct properties or query_data
  const client_id = item.client_id || item.query_data?.client?.id
  const client_name = item.client_name || item.query_data?.client?.name || ''
  const client_domain = item.client_domain || item.query_data?.client?.domain || ''
  const competitors = item.competitors || item.query_data?.client?.competitors || []
  
  // Validate query data
  if (!query_text) {
    throw new Error('Invalid queue item: missing query_text')
  }
  
  // Generate a query_id to avoid NULL constraint violation
  const query_id = `q_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
  
  console.log(`Processing query: "${query_text}" for platform ${platform}`)
  console.log(`Client: ${client_name}, Domain: ${client_domain}`)
  
  // Create the query record
  const { data: queryRecord, error: queryError } = await supabase
    .from('analysis_queries')
    .insert({
      analysis_run_id: item.analysis_run_id,
      query_text: query_text,
      query_keyword: keyword,
      query_intent: query_intent,
      data_source: platform === 'both' ? 'chatgpt' : platform,
      status: 'pending',
      query_id: query_id  // Explicitly provide a query_id
    })
    .select()
    .single()
  
  if (queryError) {
    throw new Error(`Failed to create query record: ${queryError.message}`)
  }
  
  // Execute the query using existing infrastructure
  try {
    console.log(`Calling execute-query function for: "${query_text}"`)
    const executeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          query_text: query_text,
          keyword: keyword,
          query_intent: query_intent,
          platform: platform === 'both' ? 'chatgpt' : platform,
          brand_name: client_name,
          brand_domain: client_domain,
          competitors: Array.isArray(competitors) ? competitors : []
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
    
    console.log(`Successfully executed query, updating database record`)
    
    // Correctly extract the result data from the structure returned by execute-query
    const queryData = executeResult.result || {};

    // Update the query with results
    await supabase
      .from('analysis_queries')
      .update({
        ...queryData,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', queryRecord.id);

    // Process citations if available - make sure we access the right property
    const citations = queryData.citations;
    if (Array.isArray(citations) && citations.length > 0) {
      console.log(`Processing ${citations.length} citations from query result`);
      
      // Process each citation
      const citationPromises = citations.map(async (citation: any, index: number) => {
        if (!citation || !citation.url) {
          console.warn('Skipping invalid citation:', citation);
          return null;
        }
        
        try {
          console.log(`Analyzing citation: ${citation.url}`)
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
                query_text: query_text,
                keyword: keyword,
                brand_name: client_name,
                brand_domain: client_domain,
                competitors: Array.isArray(competitors) ? competitors : []
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
            console.log(`Successfully analyzed citation: ${citation.url}`)
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
        console.log(`Updating query with ${pageAnalyses.length} analyzed pages`)
        await supabase
          .from('analysis_queries')
          .update({
            associated_pages: pageAnalyses,
            associated_pages_count: pageAnalyses.length
          })
          .eq('id', queryRecord.id);
      }
    } else {
      console.log(`No citations found for query`)
    }
  } catch (error) {
    // Update query status to failed
    console.error(`Error processing query: ${error.message}`)
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
      
      await supabase
        .from('analysis_runs')
        .update({
          queries_completed: newCompleted,
          status: newCompleted >= totalQueries ? 'completed' : 'running',
          updated_at: new Date().toISOString()
        })
        .eq('id', item.analysis_run_id);
    }
  } catch (error) {
    console.error(`Error updating analysis run: ${error.message}`);
    // Don't throw here - this is non-critical
  }
  
  console.log(`Successfully processed queue item ${item.id}`);
}