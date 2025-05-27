import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Standard response headers for all responses (includes CORS)
const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json'
};

serve(async (req) => {
  console.log('Queue worker invoked');
  
  // Handle CORS preflight requests - respond immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse request to get optional parameters
    const requestBody = await req.json().catch((err) => {
      console.error('Error parsing request JSON:', err);
      return {}; // Default empty object if JSON parsing fails
    });
    
    const batch_size = requestBody.batch_size || 1; // Process 1 item at a time
    const max_runtime = requestBody.max_runtime || 900000; // 15 minutes (Edge Function limit)
    const delay_start = requestBody.delay_start || 0;
    
    console.log(`Worker configuration: batch_size=${batch_size}, max_runtime=${max_runtime}ms, delay_start=${delay_start}ms`);

    // Add startup delay to prevent resource contention
    if (delay_start > 0) {
      console.log(`Delaying start by ${delay_start}ms to prevent resource contention`);
      await new Promise(resolve => setTimeout(resolve, delay_start));
    }

    // Create service client for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', 
      {
        auth: {
          persistSession: false
        }
      }
    );

    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    // CRITICAL: Reset any stuck items before starting
    try {
      console.log('Resetting stuck items before processing...');
      const { data: resetResult, error: resetError } = await supabase
        .rpc('reset_stuck_queue_items');

      if (resetError) {
        console.error('Error resetting stuck items:', resetError);
      } else {
        console.log(`Reset ${resetResult || 0} stuck items`);
      }
    } catch (resetError) {
      console.error('Failed to reset stuck items:', resetError);
    }
    
    // Process batches until timeout approaches
    while (Date.now() - startTime < max_runtime) {
      console.log(`Claiming batch of ${batch_size} items...`);
      
      // Claim a batch of work atomically using optimized function
      const { data: batch, error: claimError } = await supabase
        .rpc('claim_queue_batch_optimized', {
          p_batch_size: batch_size,
          p_processor_id: crypto.randomUUID()
        });
      
      if (claimError) {
        console.error('Error claiming batch:', claimError);
        break;
      }
      
      if (!batch || !Array.isArray(batch) || batch.length === 0) {
        console.log('No pending items found');
        break;
      }
      
      console.log(`Processing ${batch.length} queue items`);
      
      // Process items sequentially with delays to prevent 503 BOOT_ERROR
      console.log('Processing items sequentially with 2-second delays to prevent resource contention');

      for (const [index, item] of batch.entries()) {
        try {
          // Add delay between items to prevent concurrent function starts
          if (index > 0) {
            console.log(`Adding 2-second delay before processing item ${index + 1}/${batch.length}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          await processQueueItem(item, supabase);
          processedCount++;
          console.log(`Successfully processed item ${item.id} (${index + 1}/${batch.length})`);
        } catch (error) {
          errorCount++;
          console.error(`Error processing item ${item.id}:`, error);

          // CRITICAL: Mark queue item as failed or pending for retry
          try {
            const newAttempts = (item.attempts || 0) + 1;
            const maxAttempts = item.max_attempts || 3;

            if (newAttempts >= maxAttempts) {
              // Mark as permanently failed
              await supabase
                .from('analysis_queue')
                .update({
                  status: 'failed',
                  error_message: error.message || 'Unknown error',
                  completed_at: new Date().toISOString(),
                  attempts: newAttempts
                })
                .eq('id', item.id);

              console.log(`Item ${item.id} marked as failed after ${newAttempts} attempts`);
            } else {
              // Reset to pending for retry
              await supabase
                .from('analysis_queue')
                .update({
                  status: 'pending',
                  error_message: error.message || 'Unknown error',
                  processor_id: null,
                  started_at: null,
                  attempts: newAttempts
                })
                .eq('id', item.id);

              console.log(`Item ${item.id} reset to pending for retry (attempt ${newAttempts}/${maxAttempts})`);
            }
          } catch (resetError) {
            console.error('CRITICAL: Failed to reset queue item status:', resetError);
            // If we can't reset the item, it will remain stuck in "processing"
          }
        }
      }
      
      // Check if we have time for another batch
      const remainingTime = max_runtime - (Date.now() - startTime);
      if (remainingTime < 5000) { // Less than 5 seconds remaining
        console.log('Approaching timeout, stopping processing');
        break;
      }
    }
    
    // Check for remaining work and trigger continuation if needed
    let continuationTriggered = false;
    try {
      const { data: remainingWork, error: countError } = await supabase
        .from('analysis_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('attempts', 3); // Only count items that haven't hit max attempts

      if (!countError && remainingWork > 0) {
        console.log(`Found ${remainingWork} remaining items. Triggering IMMEDIATE continuation worker.`);

        // Trigger another worker instance IMMEDIATELY (setTimeout doesn't work reliably in Edge Functions)
        try {
          const continueResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-queue-worker`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              batch_size: 3, // Smaller batches for more frequent continuation
              max_runtime: 90000, // 90 seconds
              delay_start: 2000  // 2 second delay before processing
            })
          });

          if (continueResponse.ok) {
            console.log('Continuation worker triggered successfully');
            continuationTriggered = true;
          } else {
            const errorText = await continueResponse.text().catch(() => 'Unknown error');
            console.error(`Failed to trigger continuation worker: ${continueResponse.status} - ${errorText}`);
          }
        } catch (triggerError) {
          console.error('Failed to trigger continuation worker:', triggerError);
        }
      } else if (countError) {
        console.error('Error checking for remaining work:', countError);
      } else {
        console.log('No remaining work found. Processing complete.');
      }
    } catch (continuationError) {
      console.error('Error in continuation logic:', continuationError);
    }

    const response = {
      success: true,
      processed: processedCount,
      errors: errorCount,
      runtime: Date.now() - startTime,
      continuation_triggered: continuationTriggered
    };

    console.log('Worker completed:', response);
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: responseHeaders,
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error' 
      }),
      { 
        headers: responseHeaders,
        status: 500
      }
    );
  }
});

async function processQueueItem(item, supabase) {
  if (!item || !item.id || !item.analysis_run_id || !item.query_data) {
    throw new Error('Invalid queue item: missing required fields');
  }

  console.log(`Processing queue item ${item.id}`);

  const { query_data } = item;

  // Validate query data
  if (!query_data.query_text) {
    throw new Error('Invalid queue item: missing query_text');
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
    .single();

  if (queryError) {
    throw new Error(`Failed to create query record: ${queryError.message}`);
  }

  // Add a delay to ensure database operation completes and commits
  await new Promise((resolve) => setTimeout(resolve, 500));
  
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
    );
    
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
      const citationPromises = citations.map(async (citation, index) => {
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
  
  // Update analysis run status (but not counts - let the trigger handle counts)
  try {
    // Check if all queries are completed based on the run's total count
    const { data: runData, error: runError } = await supabase
      .from('analysis_runs')
      .select('queries_total')
      .eq('id', item.analysis_run_id)
      .single();
    
    if (runError) {
      console.warn(`Failed to get analysis run data: ${runError.message}`);
      return;
    }
    
    if (runData) {
      // Count completed items to check if run is finished
      const { count: completedCount, error: countError } = await supabase
        .from('analysis_queue')
        .select('id', { count: 'exact', head: true })
        .eq('analysis_run_id', item.analysis_run_id)
        .eq('status', 'completed');
      
      if (countError) {
        console.warn(`Failed to count completed items: ${countError.message}`);
        return;
      }
      
      const totalQueries = typeof runData.queries_total === 'number' ? runData.queries_total : 0;
      const isCompleted = completedCount >= totalQueries;
      
      // Only update status and timestamps, not the count fields
      if (isCompleted) {
        await supabase
          .from('analysis_runs')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          })
          .eq('id', item.analysis_run_id);
      } else {
        await supabase
          .from('analysis_runs')
          .update({
            status: 'running',
            updated_at: new Date().toISOString()
          })
          .eq('id', item.analysis_run_id);
      }

      // Add delay after updating the run status to ensure frontend sees the updated status
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(`Error updating analysis run: ${error.message}`);
    // Don't throw here - this is non-critical
  }
  
  console.log(`Successfully processed queue item ${item.id}`);
}