import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-use-queue, x-platform',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Standard response headers for all responses (includes CORS)
const responseHeaders = { 
  ...corsHeaders, 
  'Content-Type': 'application/json' 
};

// Configuration settings
const MAX_DIRECT_PROCESS_QUERIES = 1; // Maximum number of queries to process directly
const QUEUE_DEFAULT = true; // Always default to queue mode for reliability

// Helper function to determine whether to use queue
function shouldUseQueue(req: Request, body: any, queryCount: number): boolean {
  // Check various sources for queue flag

  // 1. Check header flag
  const useQueueHeader = req.headers.get('x-use-queue');
  if (useQueueHeader !== null) {
    console.log(`Queue header found: ${useQueueHeader}`);
    return useQueueHeader.toLowerCase() === 'true';
  }

  // 2. Check body for _use_queue
  if (body && typeof body._use_queue !== 'undefined') {
    console.log(`Queue flag found in body: ${body._use_queue}`);
    return body._use_queue === true;
  }

  // 3. Always use queue for more than a small number of queries
  const platformInfo = body?._platform_info || 'single';
  const totalQueries = platformInfo === 'both' ? queryCount * 2 : queryCount;

  if (totalQueries > MAX_DIRECT_PROCESS_QUERIES) {
    console.log(`Using queue because ${totalQueries} queries exceeds direct processing limit`);
    return true;
  }

  // 4. Otherwise, use the default (now set to true)
  return QUEUE_DEFAULT;
}

serve(async (req) => {
  console.log('Custom analysis request received');
  
  // CRITICAL: Send CORS headers immediately for all methods
  const originalHeaders = new Headers(req.headers);

  // Handle CORS preflight requests - respond immediately
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }

  // For other methods, ensure CORS headers are sent immediately
  if (req.headers.get('x-use-queue') === 'true') {
    console.log('Queue mode requested - using queue for processing');
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
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
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const requestJson = await req.json().catch(err => {
      console.error('Error parsing request JSON:', err);
      throw new Error('Invalid JSON in request body');
    });
    
    const { client_id, platform, queries } = requestJson;
    console.log('Request data:', { client_id, platform, queryCount: queries?.length });

    // Validate required fields
    if (!client_id) throw new Error('Missing client_id');
    if (!platform) throw new Error('Missing platform');
    if (!Array.isArray(queries)) throw new Error('Queries must be an array');

    // Filter only selected queries
    const selectedQueries = queries.filter(q => q.selected);
    
    if (selectedQueries.length === 0) {
      throw new Error('No queries selected');
    }

    // Get client
    const { data: client } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (!client) {
      throw new Error('Client not found or unauthorized');
    }

    // Verify client ownership (checking both created_by and user_id columns)
    if (client.created_by !== user.id && client.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this client');
    }

    // Get competitors from separate table
    const { data: competitors } = await supabaseClient
      .from('competitors')
      .select('*')
      .eq('client_id', client_id);
    
    // Format competitors with pattern field
    const formattedCompetitors = (competitors || []).map(comp => ({
      name: comp.name,
      domain: comp.domain,
      pattern: comp.name.toLowerCase()
    }));

    // Create service client for faster operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Calculate total queries
    const platformCount = platform === 'both' ? 2 : 1;
    const queries_total = selectedQueries.length * platformCount;
    
    // Extract keywords and intents
    const keywords = [...new Set(selectedQueries.map(q => q.keyword).filter(k => k))];
    const intents = [...new Set(selectedQueries.map(q => q.intent).filter(i => i))];

    // Determine if we should use queue-based processing
    const useQueue = shouldUseQueue(req, requestJson, selectedQueries.length);
    console.log(`Processing method: ${useQueue ? 'queue' : 'sync'}`);

    // Create analysis run
    const batch_id = `custom_${platform}_${Date.now()}`;
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
        processing_method: useQueue ? 'queue' : 'sync',
        test_mode: false,
        created_by: user.id,
        competitors: formattedCompetitors // Store competitors with the run
      })
      .select()
      .single();

    if (runError) {
      throw new Error(`Failed to create analysis run: ${runError.message}`);
    }

    console.log('Created analysis run:', analysisRun.id);

    if (useQueue) {
      // Queue-based processing - add all queries to the queue
      console.log(`Adding ${selectedQueries.length} queries to queue for processing`);
      
      // Use a single analysis run ID for all queries to prevent duplicates
      const analysisRunId = analysisRun.id;
      
      for (const query of selectedQueries) {
        try {
          // Handle queue differently for 'both' platform
          if (platform === 'both') {
            // Queue one per platform but using the same analysis run ID
            await queueQuery(analysisRunId, query, 'chatgpt', client, formattedCompetitors, serviceClient);
            await queueQuery(analysisRunId, query, 'perplexity', client, formattedCompetitors, serviceClient);
          } else {
            // Queue for the specified platform
            await queueQuery(analysisRunId, query, platform, client, formattedCompetitors, serviceClient);
          }
        } catch (error) {
          console.error(`Error queueing query "${query.query_text}":`, error);
          // Continue queueing other queries even if one fails
        }
      }
      
      // Update analysis run status
      await serviceClient
        .from('analysis_runs')
        .update({ status: 'queued' })
        .eq('id', analysisRun.id);
      
      // Trigger queue worker to start processing
      // Trigger multiple workers in parallel to process more items faster
      try {
        // Trigger 3 workers in parallel with larger batch sizes
        const workerPromises = [];
        for (let i = 0; i < 3; i++) {
          workerPromises.push(
            fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-queue-worker`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                batch_size: 10,  // Increased batch size for faster processing
                max_runtime: 25000 // Maximum allowed runtime in milliseconds
              })
            })
          );
        }

        // Wait for all workers to be triggered
        await Promise.all(workerPromises);
        console.log('Multiple queue workers triggered in parallel');

        // Schedule a follow-up trigger after a delay to ensure all items are processed
        // This is a fire-and-forget operation that ensures queued items don't get stuck
        setTimeout(async () => {
          try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-queue-worker`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                batch_size: 20,  // Use a larger batch size for the follow-up
                max_runtime: 25000
              })
            });
            console.log('Scheduled follow-up worker executed');
          } catch (error) {
            console.error('Follow-up worker scheduling failed:', error);
            // Non-critical error, don't block
          }
        }, 20000); // Wait 20 seconds before firing follow-up
      } catch (workerError) {
        console.error('Failed to trigger queue workers:', workerError);
        // Non-critical error, don't throw
      }
      
      // Return immediately with success
      return new Response(
        JSON.stringify({
          success: true,
          analysis_run_id: analysisRun.id,
          processing_method: 'queue'
        }),
        {
          headers: responseHeaders,
          status: 200
        }
      );
    } else {
      // Synchronous processing - limited direct processing
      // Split queries into initial batch and queue batches
      const initialBatch = selectedQueries.slice(0, MAX_DIRECT_PROCESS_QUERIES);
      const queueBatch = selectedQueries.slice(MAX_DIRECT_PROCESS_QUERIES);

      console.log(`Processing ${initialBatch.length} queries directly and queuing ${queueBatch.length} for background processing`);

      // Process the initial batch directly
      if (initialBatch.length > 0) {
        for (const query of initialBatch) {
          if (platform === 'both') {
            // Process for both platforms
            try {
              // Process for ChatGPT
              await processQuery(
                analysisRun.id,
                query.query_text,
                query.keyword,
                query.intent,
                'chatgpt',
                client,
                formattedCompetitors,
                serviceClient
              );
              
              // Process for Perplexity
              await processQuery(
                analysisRun.id,
                query.query_text,
                query.keyword,
                query.intent,
                'perplexity',
                client,
                formattedCompetitors,
                serviceClient
              );
            } catch (error) {
              console.error(`Error processing query "${query.query_text}":`, error);
            }
          } else {
            // Process for single platform
            try {
              await processQuery(
                analysisRun.id,
                query.query_text,
                query.keyword,
                query.intent,
                platform,
                client,
                formattedCompetitors,
                serviceClient
              );
            } catch (error) {
              console.error(`Error processing query "${query.query_text}":`, error);
            }
          }
        }
      }

      // Queue remaining queries for background processing
      if (queueBatch.length > 0) {
        for (const query of queueBatch) {
          try {
            if (platform === 'both' || platform === 'chatgpt') {
              await queueQuery(
                analysisRun.id,
                query,
                'chatgpt',
                client,
                formattedCompetitors,
                serviceClient
              );
            }
            
            if (platform === 'both' || platform === 'perplexity') {
              await queueQuery(
                analysisRun.id,
                query,
                'perplexity',
                client,
                formattedCompetitors,
                serviceClient
              );
            }
          } catch (error) {
            console.error(`Error queuing query "${query.query_text}":`, error);
          }
        }
      }

      // Update analysis run status to running
      await serviceClient
        .from('analysis_runs')
        .update({ status: 'running' })
        .eq('id', analysisRun.id);

      // Return success in the expected format
      return new Response(
        JSON.stringify({
          success: true,
          analysis_run_id: analysisRun.id,
          processing_method: 'sync'
        }),
        {
          headers: responseHeaders,
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Custom analysis error:', error);
    
    // Always use the same response headers for errors to ensure CORS headers are sent
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }),
      {
        headers: responseHeaders,
        status: 400
      }
    );
  }
});

// Helper function to process a single query
async function processQuery(
  analysisRunId: string,
  queryText: string,
  keyword: string,
  intent: string,
  platform: string,
  client: any,
  competitors: any[],
  serviceClient: any
) {
  console.log(`Processing query: "${queryText}" for ${platform}`);
  
  // Call the process-query function
  const processResponse = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        analysis_run_id: analysisRunId,
        query_text: queryText,
        keyword: keyword,
        query_intent: intent,
        platform,
        client: {
          id: client.id,
          name: client.name,
          domain: client.domain,
          competitors: competitors
        }
      })
    }
  );
  
  try {
    if (!processResponse.ok) {
      const errorText = await processResponse.text().catch(() => 'Unknown error');
      throw new Error(`Process query failed with status ${processResponse.status}: ${errorText}`);
    }
    
    const processResult = await processResponse.json().catch(err => {
      throw new Error(`Failed to parse process-query response: ${err.message}`);
    });
    
    if (!processResult.success) {
      throw new Error(processResult.error || 'Failed to process query');
    }
    
    return processResult;
  } catch (error) {
    console.error(`Error processing query "${queryText}":`, error);
    throw new Error(`Failed to process query: ${error.message}`);
  }
}

// Helper function to queue a query for background processing
async function queueQuery(
  analysisRunId: string,
  query: any,
  specificPlatform: string,
  client: any,
  competitors: any[],
  serviceClient: any
) {
  const queryText = query.query_text || '';
  if (!queryText) {
    throw new Error('Missing query text');
  }
  
  console.log(`Queuing query: "${queryText}" for ${specificPlatform}`);
  
  // Store query data in standardized format
  const queryData = {
    query_text: queryText,
    keyword: query.keyword || '',
    intent: query.intent || '',
    platform: specificPlatform,
    client: {
      id: client.id,
      name: client.name,
      domain: client.domain,
      competitors: competitors
    }
  };
  
  // Add to the analysis_queue table
  const { data, error } = await serviceClient
    .from('analysis_queue')
    .insert({
      analysis_run_id: analysisRunId,
      query_data: queryData,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error(`Failed to queue query "${queryText}":`, error);
    throw new Error(`Failed to queue query: ${error.message}`);
  }
  
  return data;
}