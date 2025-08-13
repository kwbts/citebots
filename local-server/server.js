import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { executeQuery } from './lib/executeQuery.js';
import { analyzeCitation } from './lib/analyzeCitation.js';
// Note: We're now using the enhanced modules with detailed logging

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client with service key for full access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Server state
let isProcessing = false;
let processedCount = 0;
let errorCount = 0;
let startTime = null;

app.use(express.json());

// Add CORS headers for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    processing: isProcessing,
    uptime: process.uptime(),
    processed: processedCount,
    errors: errorCount,
    startTime,
    lastCheck: new Date().toISOString()
  });
});

// Manual trigger endpoint
app.post('/trigger', async (req, res) => {
  try {
    if (isProcessing) {
      return res.json({ 
        success: false, 
        message: 'Already processing'
      });
    }

    console.log('Manual trigger requested');
    processQueue().catch(console.error);

    res.json({ 
      success: true, 
      message: 'Processing started'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main queue processing function with enhanced logging
async function processQueue() {
  if (isProcessing) {
    console.log('⏱️ QUEUE BUSY: Already processing, skipping this cycle');
    return;
  }

  isProcessing = true;
  startTime = new Date().toISOString();

  console.log(`\n==========================================================`);
  console.log(`🚀 QUEUE PROCESSING: Starting at ${startTime}`);
  console.log(`==========================================================\n`);

  try {
    // Reset any stuck items first
    await resetStuckItems();

    const batchSize = parseInt(process.env.BATCH_SIZE) || 3;
    console.log(`📊 BATCH SIZE: Processing up to ${batchSize} items per cycle`);

    let hasWork = true;
    let cycleCount = 0;

    while (hasWork) {
      cycleCount++;
      console.log(`\n🔄 PROCESSING CYCLE ${cycleCount}: Checking for pending items`);

      // Get pending items
      let pendingItems;
      try {
        const { data, error } = await supabase
          .from('analysis_queue')
          .select('*')
          .eq('status', 'pending')
          .lt('attempts', 3)
          .order('created_at', { ascending: true })
          .limit(batchSize);

        if (error) {
          console.error(`❌ DATABASE ERROR: Failed to fetch queue items: ${error.message}`);
          break;
        }

        pendingItems = data;
      } catch (fetchError) {
        console.error(`❌ QUEUE ERROR: Failed to query pending items: ${fetchError.message}`);
        break;
      }

      if (!pendingItems || pendingItems.length === 0) {
        console.log(`✅ QUEUE EMPTY: No pending items found, finishing processing`);
        hasWork = false;
        break;
      }

      console.log(`📋 PENDING ITEMS: Found ${pendingItems.length} items to process`);

      // Log item details for better visibility
      console.log(`📊 ITEMS SUMMARY:`);
      for (const [index, item] of pendingItems.entries()) {
        console.log(`  ${index + 1}. Item ${item.id}:`);
        console.log(`     - Created: ${new Date(item.created_at).toLocaleString()}`);
        console.log(`     - Query: "${item.query_data?.query_text?.substring(0, 50)}${item.query_data?.query_text?.length > 50 ? '...' : ''}"`);
        console.log(`     - Platform: ${item.query_data?.platform || 'Unknown'}`);
      }

      // Process items sequentially
      for (const [index, item] of pendingItems.entries()) {
        console.log(`\n📝 PROCESSING ITEM ${index + 1}/${pendingItems.length}: ${item.id}`);

        try {
          await processQueueItem(item);
          processedCount++;
          console.log(`✅ ITEM COMPLETE: Successfully processed item ${item.id}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ ITEM ERROR: Failed to process item ${item.id}: ${error.message}`);
          await handleItemError(item, error);
        }

        // Add delay between items to avoid rate limits
        const delayMs = 2000;
        console.log(`⏱️ RATE LIMIT: Adding ${delayMs}ms delay before next item`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      // Check if we should continue processing or take a break
      if (cycleCount >= 5) {
        console.log(`\n⏱️ CYCLE LIMIT: Reached maximum of ${cycleCount} cycles, pausing processing`);
        hasWork = false;
      }
    }

  } catch (error) {
    console.error(`\n❌ QUEUE ERROR: Unexpected error during processing: ${error.message}`);
    console.error(`🔍 STACK TRACE: ${error.stack}`);
  } finally {
    const endTime = new Date().toISOString();
    const duration = Date.now() - new Date(startTime).getTime();
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);

    isProcessing = false;

    console.log(`\n==========================================================`);
    console.log(`🏁 QUEUE PROCESSING COMPLETED: ${endTime}`);
    console.log(`⏱️ DURATION: ${durationMinutes}m ${durationSeconds}s`);
    console.log(`📊 SUMMARY: Processed ${processedCount} items, Encountered ${errorCount} errors`);
    console.log(`==========================================================\n`);
  }
}

// Process a single queue item
async function processQueueItem(item) {
  console.log(`\n==========================================================`);
  console.log(`🔄 PROCESSING QUEUE ITEM: ${item.id}`);
  console.log(`🕒 START TIME: ${new Date().toISOString()}`);
  console.log(`==========================================================\n`);

  if (!item.query_data || !item.query_data.query_text) {
    console.error(`❌ QUEUE ERROR: Invalid queue item - missing query_data or query_text`);
    throw new Error('Invalid queue item: missing query_data or query_text');
  }

  const { query_data } = item;
  console.log(`📊 QUEUE DATA: Processing query "${query_data.query_text}"`);
  console.log(`🔍 PLATFORM: ${query_data.platform || 'Unknown'}`);
  console.log(`🏢 CLIENT: ${query_data.client?.name || 'None'}`);

  // Mark item as processing
  console.log(`\n🔄 DATABASE: Marking item as processing`);
  try {
    await supabase
      .from('analysis_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        processor_id: 'local-server'
      })
      .eq('id', item.id);
    console.log(`✅ DATABASE: Item marked as processing`);
  } catch (updateError) {
    console.error(`❌ DATABASE ERROR: Failed to mark item as processing: ${updateError.message}`);
    throw updateError;
  }

  // Create query record
  console.log(`\n📝 DATABASE: Creating query record`);
  let queryRecord;
  try {
    const { data, error } = await supabase
      .from('analysis_queries')
      .insert({
        analysis_run_id: item.analysis_run_id,
        query_text: query_data.query_text,
        query_keyword: query_data.keyword || null,
        query_intent: query_data.intent || null,
        data_source: query_data.platform,
        status: 'pending',
        is_custom: query_data.is_custom || false
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ DATABASE ERROR: Failed to create query record: ${error.message}`);
      throw new Error(`Failed to create query record: ${error.message}`);
    }

    queryRecord = data;
    console.log(`✅ DATABASE: Query record created with ID: ${queryRecord.id}`);
  } catch (queryError) {
    console.error(`❌ DATABASE ERROR: Query creation failed: ${queryError.message}`);
    throw queryError;
  }

  // Execute the query using our local function
  console.log(`\n🔍 QUERY: Executing query "${query_data.query_text}"`);
  console.log(`🔍 QUERY DETAILS: Platform ${query_data.platform}, Keyword "${query_data.keyword || 'none'}"`);

  const queryStartTime = Date.now();
  let queryResult;
  try {
    queryResult = await executeQuery({
      query_text: query_data.query_text,
      keyword: query_data.keyword || '',
      query_intent: query_data.intent || '',
      platform: query_data.platform,
      brand_name: query_data.client?.name || '',
      brand_domain: query_data.client?.domain || '',
      competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : []
    });

    const queryDuration = Date.now() - queryStartTime;
    console.log(`✅ QUERY: Execution completed in ${queryDuration}ms`);
    console.log(`📊 QUERY RESULTS: ${queryResult.citation_count || 0} citations found`);
  } catch (executeError) {
    console.error(`❌ QUERY ERROR: Failed to execute query: ${executeError.message}`);
    throw executeError;
  }

  // Update query with results
  console.log(`\n📝 DATABASE: Updating query record with results`);
  try {
    await supabase
      .from('analysis_queries')
      .update({
        // Core fields
        query_text: queryResult.query_text,
        query_keyword: queryResult.keyword,
        data_source: queryResult.platform,
        model_response: queryResult.response_content,

        // Classification fields
        query_category: queryResult.query_category,
        query_topic: queryResult.query_topic,
        query_type: queryResult.query_type,
        query_intent: queryResult.query_intent,
        funnel_stage: queryResult.funnel_stage,
        query_complexity: queryResult.query_complexity,

        // Response metadata
        response_match: queryResult.response_match,
        response_outcome: queryResult.response_outcome,
        action_orientation: queryResult.action_orientation,
        query_competition: queryResult.query_competition,

        // Citation data
        citation_count: queryResult.citation_count || 0,

        // Brand analysis
        brand_mentioned: queryResult.brand_mention || false,
        brand_sentiment: queryResult.brand_sentiment || 0,
        brand_mention_type: queryResult.brand_mention_type,
        brand_mention_count: queryResult.brand_mention_count || 0,
        brand_positioning: queryResult.brand_positioning,

        // Competitor analysis
        competitor_mentioned_names: queryResult.competitor_mentioned_names || [],
        competitor_count: queryResult.competitor_count || 0,
        competitor_context: queryResult.competitor_context,
        total_competitor_mentions: queryResult.total_competitor_mentions || 0,
        competitor_analysis: queryResult.competitor_analysis || null,

        // Status
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', queryRecord.id);

    console.log(`✅ DATABASE: Query record updated successfully`);
  } catch (updateError) {
    console.error(`❌ DATABASE ERROR: Failed to update query record: ${updateError.message}`);
    throw updateError;
  }

  // Process citations if available
  const citations = queryResult.citations;
  if (Array.isArray(citations) && citations.length > 0) {
    console.log(`\n🔗 CITATIONS: Processing ${citations.length} citations`);

    const pageAnalyses = [];
    for (const [index, citation] of citations.entries()) {
      if (!citation || !citation.url) {
        console.log(`⚠️ CITATION WARNING: Skipping citation at index ${index} - missing URL`);
        continue;
      }

      console.log(`\n🔗 CITATION ${index + 1}/${citations.length}: ${citation.url}`);

      try {
        // Enhanced citation analysis with PageSpeed and domain metrics
        console.log(`📊 ANALYZING CITATION: Position ${citation.citation_number || index + 1}`);
        const pageAnalysis = await analyzeCitation({
          query_id: queryRecord.id,
          citation_url: citation.url,
          citation_position: citation.citation_number || index + 1,
          query_text: query_data.query_text,
          keyword: query_data.keyword || '',
          brand_name: query_data.client?.name || '',
          brand_domain: query_data.client?.domain || '',
          competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : [],
          options: {
            // Enable enhanced features
            enhanced: true,
            verbose: true, // Enable verbose logging
            // Enable these if you have API keys configured
            pagespeed: !!process.env.PAGESPEED_API_KEY || !!process.env.GOOGLE_PAGESPEED_API_KEY,
            moz: true // Use smart domain metrics system
          }
        });

        if (pageAnalysis) {
          pageAnalyses.push(pageAnalysis);
          console.log(`✅ CITATION ANALYSIS: Successfully analyzed ${citation.url}`);
          console.log(`📊 ANALYSIS SUMMARY:`);
          console.log(`  - Technical SEO Score: ${pageAnalysis.technical_seo?.html_structure_score || 'N/A'}/10`);
          console.log(`  - Content Depth: ${pageAnalysis.content_quality?.content_depth_score || 'N/A'}/5`);
          console.log(`  - Brand Mentioned: ${pageAnalysis.brand_mentioned ? 'Yes' : 'No'}`);
        }
      } catch (error) {
        console.error(`❌ CITATION ERROR: Failed to analyze citation ${citation.url}:`, error.message);
        console.error(`🔄 STACK TRACE: ${error.stack}`);
      }

      // Add longer delay between citations for API rate limits
      console.log(`⏱️ RATE LIMIT: Adding 3-second delay before next citation`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (pageAnalyses.length > 0) {
      console.log(`\n📝 DATABASE: Saving ${pageAnalyses.length} page analyses to query record`);
      try {
        await supabase
          .from('analysis_queries')
          .update({
            associated_pages: pageAnalyses,
            associated_pages_count: pageAnalyses.length
          })
          .eq('id', queryRecord.id);

        console.log(`✅ DATABASE: Associated pages saved successfully`);
      } catch (updateError) {
        console.error(`❌ DATABASE ERROR: Failed to save associated pages: ${updateError.message}`);
        // Continue processing even if this fails
      }
    }
  } else {
    console.log(`⚠️ CITATIONS: No citations found in query result`);
  }

  // Mark queue item as completed
  console.log(`\n📝 DATABASE: Marking queue item as completed`);
  try {
    await supabase
      .from('analysis_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', item.id);

    console.log(`✅ DATABASE: Queue item marked as completed`);
  } catch (updateError) {
    console.error(`❌ DATABASE ERROR: Failed to mark queue item as completed: ${updateError.message}`);
    throw updateError;
  }

  // Update analysis run progress
  console.log(`\n📊 DATABASE: Updating analysis run progress`);
  await updateAnalysisRunProgress(item.analysis_run_id);

  console.log(`\n==========================================================`);
  console.log(`✅ QUEUE ITEM COMPLETED: ${item.id}`);
  console.log(`🕒 END TIME: ${new Date().toISOString()}`);
  console.log(`⏱️ DURATION: ${Date.now() - new Date(item.started_at || Date.now()).getTime()}ms`);
  console.log(`==========================================================\n`);
}

// Handle item processing error with enhanced logging
async function handleItemError(item, error) {
  console.log(`\n==========================================================`);
  console.log(`❌ QUEUE ITEM ERROR: ${item.id}`);
  console.log(`🕒 ERROR TIME: ${new Date().toISOString()}`);
  console.log(`==========================================================\n`);

  const newAttempts = (item.attempts || 0) + 1;
  const maxAttempts = item.max_attempts || 3;

  console.log(`📊 ERROR DETAILS:`);
  console.log(`  - Error message: ${error.message}`);
  console.log(`  - Current attempt: ${newAttempts} of ${maxAttempts}`);
  console.log(`  - Query: "${item.query_data?.query_text || 'Unknown'}"`);
  console.log(`  - Error type: ${error.name || 'Unknown'}`);

  // Log full stack trace for detailed diagnostics
  console.error(`🔍 STACK TRACE:\n${error.stack || 'No stack trace available'}`);

  try {
    if (newAttempts >= maxAttempts) {
      // Mark as permanently failed
      console.log(`\n⛔ MAX ATTEMPTS REACHED: Marking item as permanently failed`);

      await supabase
        .from('analysis_queue')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
          attempts: newAttempts
        })
        .eq('id', item.id);

      console.log(`✅ DATABASE: Item ${item.id} marked as failed after ${newAttempts} attempts`);
    } else {
      // Reset to pending for retry
      console.log(`\n🔄 RETRY SCHEDULED: Resetting item for retry (attempt ${newAttempts}/${maxAttempts})`);

      await supabase
        .from('analysis_queue')
        .update({
          status: 'pending',
          error_message: error.message,
          processor_id: null,
          started_at: null,
          attempts: newAttempts
        })
        .eq('id', item.id);

      console.log(`✅ DATABASE: Item ${item.id} reset to pending for retry`);
      console.log(`⏱️ RETRY: Next attempt will be attempt ${newAttempts + 1}/${maxAttempts}`);
    }
  } catch (updateError) {
    console.error(`\n❌ DATABASE ERROR: Failed to update item status: ${updateError.message}`);
    console.error(`⚠️ WARNING: Queue item ${item.id} may be stuck in processing state`);
  }

  console.log(`\n==========================================================`);
  console.log(`📝 ERROR HANDLING COMPLETE: ${item.id}`);
  console.log(`==========================================================\n`);
}

// Reset stuck items with detailed logging
async function resetStuckItems() {
  console.log(`\n🔍 CHECKING FOR STUCK ITEMS: ${new Date().toISOString()}`);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  console.log(`⏱️ TIMEOUT THRESHOLD: Items started before ${fiveMinutesAgo}`);

  try {
    // First check how many stuck items we have
    const { count, error: countError } = await supabase
      .from('analysis_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'processing')
      .lt('started_at', fiveMinutesAgo);

    if (countError) {
      console.error(`❌ DATABASE ERROR: Failed to count stuck items: ${countError.message}`);
      return;
    }

    if (count === 0) {
      console.log(`✅ NO STUCK ITEMS: No processing items older than 5 minutes`);
      return;
    }

    console.log(`⚠️ FOUND ${count} STUCK ITEMS: Attempting to reset to pending state`);

    // Get details of stuck items for better logging
    const { data: stuckItems, error: listError } = await supabase
      .from('analysis_queue')
      .select('id, started_at, processor_id, query_data')
      .eq('status', 'processing')
      .lt('started_at', fiveMinutesAgo);

    if (listError) {
      console.error(`❌ DATABASE ERROR: Failed to list stuck items: ${listError.message}`);
    } else if (stuckItems && stuckItems.length > 0) {
      console.log(`📋 STUCK ITEMS DETAILS:`);
      for (const item of stuckItems) {
        const stuckDuration = Date.now() - new Date(item.started_at).getTime();
        const stuckMinutes = Math.floor(stuckDuration / 60000);
        console.log(`  - Item ${item.id}: Stuck for ${stuckMinutes} minutes`);
        console.log(`    Processor: ${item.processor_id || 'Unknown'}`);
        console.log(`    Query: "${item.query_data?.query_text?.substring(0, 50)}..."`);
      }
    }

    // Reset the stuck items
    const { data, error } = await supabase
      .from('analysis_queue')
      .update({
        status: 'pending',
        processor_id: null,
        started_at: null,
        error_message: 'Reset due to timeout (stuck in processing state)'
      })
      .eq('status', 'processing')
      .lt('started_at', fiveMinutesAgo)
      .select();

    if (error) {
      console.error(`❌ DATABASE ERROR: Failed to reset stuck items: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`✅ RESET COMPLETE: ${data.length} stuck items reset to pending state`);
      console.log(`⏱️ ITEMS WILL BE PICKED UP: Next queue processing cycle`);
    }
  } catch (error) {
    console.error(`❌ ERROR CHECKING STUCK ITEMS: ${error.message}`);
  }
}

// Update analysis run progress
async function updateAnalysisRunProgress(analysisRunId) {
  try {
    // Get run data
    const { data: runData } = await supabase
      .from('analysis_runs')
      .select('queries_total')
      .eq('id', analysisRunId)
      .single();
    
    if (!runData) return;
    
    // Count completed items
    const { count: completedCount } = await supabase
      .from('analysis_queue')
      .select('id', { count: 'exact', head: true })
      .eq('analysis_run_id', analysisRunId)
      .eq('status', 'completed');
    
    const totalQueries = runData.queries_total || 0;
    const isCompleted = completedCount >= totalQueries;
    
    // Update run status
    await supabase
      .from('analysis_runs')
      .update({
        status: isCompleted ? 'completed' : 'running',
        updated_at: new Date().toISOString(),
        ...(isCompleted && { completed_at: new Date().toISOString() })
      })
      .eq('id', analysisRunId);
    
  } catch (error) {
    console.error('Error updating analysis run progress:', error);
  }
}

// API Endpoint for running a standalone page analysis with enhanced logging
app.post('/analyze-page', async (req, res) => {
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  console.log(`\n==========================================================`);
  console.log(`🔍 API REQUEST: /analyze-page (${requestId})`);
  console.log(`🕒 TIMESTAMP: ${new Date().toISOString()}`);
  console.log(`==========================================================\n`);

  try {
    const { url, query, keyword, brand, competitors } = req.body;

    console.log(`📊 REQUEST DETAILS (${requestId}):`);
    console.log(`  - URL: ${url || 'Not provided'}`);
    console.log(`  - Query: "${query || 'Not provided'}"`);
    console.log(`  - Keyword: "${keyword || 'Not provided'}"`);
    console.log(`  - Brand: ${brand?.name || 'Not provided'}`);
    console.log(`  - Competitors: ${Array.isArray(competitors) ? competitors.length : 0} provided`);

    if (!url) {
      console.log(`❌ REQUEST ERROR (${requestId}): URL is required`);
      return res.status(400).json({
        success: false,
        message: 'URL is required',
        request_id: requestId
      });
    }

    console.log(`🔍 STARTING ANALYSIS (${requestId}): ${url}`);
    const startTime = Date.now();

    // Configure analysis request with verbose logging
    const analysisRequest = {
      citation_url: url,
      citation_position: 1,
      query_text: query || 'Page analysis',
      keyword: keyword || '',
      brand_name: brand?.name || '',
      brand_domain: brand?.domain || '',
      competitors: Array.isArray(competitors) ? competitors : [],
      options: {
        enhanced: true,
        verbose: true, // Enable detailed logging
        pagespeed: !!process.env.PAGESPEED_API_KEY || !!process.env.GOOGLE_PAGESPEED_API_KEY,
        moz: true
      }
    };

    // Log API key status
    console.log(`🔑 API KEYS (${requestId}):`);
    console.log(`  - PageSpeed: ${!!process.env.PAGESPEED_API_KEY ? 'Available' : 'Not configured'}`);
    console.log(`  - OpenAI: ${!!process.env.OPENAI_API_KEY ? 'Available' : 'Not configured'}`);
    console.log(`  - ScrapingBee: ${!!process.env.SCRAPINGBEE_API_KEY ? 'Available' : 'Not configured'}`);

    // Perform the analysis
    console.log(`🧠 RUNNING ANALYSIS (${requestId}): Starting analyzeCitation function`);
    const result = await analyzeCitation(analysisRequest);

    // Calculate duration
    const duration = Date.now() - startTime;
    console.log(`\n✅ ANALYSIS COMPLETE (${requestId}): Completed in ${duration}ms`);

    // Log results summary
    console.log(`📊 RESULTS SUMMARY (${requestId}):`);
    console.log(`  - Technical SEO Score: ${result.technical_seo?.html_structure_score || 'N/A'}/10`);
    console.log(`  - Content Depth: ${result.content_quality?.content_depth_score || 'N/A'}/10`);
    console.log(`  - Brand Mentioned: ${result.brand_mentioned ? 'Yes' : 'No'}`);
    console.log(`  - Page Speed Score: ${result.page_performance?.page_speed_score || 'N/A'}/100`);
    console.log(`  - Domain Authority: ${result.domain_authority?.domain_authority || 'N/A'}`);

    // Send response
    res.json({
      success: true,
      request_id: requestId,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      analysis: result
    });

    console.log(`\n==========================================================`);
    console.log(`📤 RESPONSE SENT (${requestId}): Success`);
    console.log(`==========================================================\n`);
  } catch (error) {
    console.error(`\n❌ ANALYSIS ERROR (${requestId}): ${error.message}`);
    console.error(`🔍 STACK TRACE (${requestId}):\n${error.stack}`);

    res.status(500).json({
      success: false,
      request_id: requestId,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    console.log(`\n==========================================================`);
    console.log(`📤 ERROR RESPONSE SENT (${requestId}): ${error.message}`);
    console.log(`==========================================================\n`);
  }
});

// Start the server with enhanced startup logging
app.listen(PORT, () => {
  // Calculate a more readable poll interval
  const pollInterval = parseInt(process.env.POLL_INTERVAL) || 3600000; // 1 hour default
  const pollMinutes = Math.floor(pollInterval / 60000);
  const pollSeconds = Math.floor((pollInterval % 60000) / 1000);

  console.log(`\n==========================================================`);
  console.log(`🚀 CITEBOTS LOCAL SERVER`);
  console.log(`==========================================================`);
  console.log(`📅 STARTUP TIME: ${new Date().toISOString()}`);
  console.log(`🌐 SERVER PORT: ${PORT}`);
  console.log(`⏱️ POLL INTERVAL: ${pollMinutes > 0 ? `${pollMinutes}m ` : ''}${pollSeconds}s`);
  console.log(`📦 BATCH SIZE: ${parseInt(process.env.BATCH_SIZE) || 3} items per cycle`);

  // Log configuration status
  console.log(`\n⚙️ CONFIGURATION STATUS:`);
  console.log(`  - Supabase: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  - ScrapingBee: ${process.env.SCRAPINGBEE_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  - OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  - PageSpeed: ${process.env.PAGESPEED_API_KEY ? '✅ Configured' : '❌ Not configured'}`);

  // Log endpoint information
  console.log(`\n🔌 API ENDPOINTS:`);
  console.log(`  - 📊 Status: http://localhost:${PORT}/status`);
  console.log(`  - ❤️ Health: http://localhost:${PORT}/health`);
  console.log(`  - 🔧 Manual trigger: POST http://localhost:${PORT}/trigger`);
  console.log(`  - 🔍 Page analysis: POST http://localhost:${PORT}/analyze-page`);

  console.log(`\n🔄 QUEUE PROCESSING:`);
  console.log(`  - Polling every ${pollMinutes > 0 ? `${pollMinutes} minutes` : `${pollSeconds} seconds`}`);
  console.log(`  - First poll will start in 5 seconds`);
  console.log(`  - Manual trigger available via API endpoint`);

  console.log(`\n📋 DIAGNOSTICS:`);
  console.log(`  - Enhanced logging is enabled for all components`);
  console.log(`  - Detailed error reporting is enabled`);
  console.log(`  - Emoji prefixes are used for easy log scanning`);
  console.log(`==========================================================\n`);

  // Start polling for queue items after a short delay
  setTimeout(() => {
    console.log(`\n🔄 INITIAL QUEUE CHECK: Starting first queue processing cycle`);
    processQueue().catch(error => {
      console.error(`❌ INITIAL QUEUE ERROR: ${error.message}`);
    });

    // Set up regular polling interval
    setInterval(() => {
      if (!isProcessing) {
        processQueue().catch(error => {
          console.error(`❌ QUEUE ERROR: ${error.message}`);
        });
      }
    }, pollInterval);

  }, 5000); // 5-second initial delay
});

// Graceful shutdown with enhanced logging
process.on('SIGTERM', () => {
  console.log(`\n==========================================================`);
  console.log(`🛑 SHUTDOWN: Received SIGTERM signal`);
  console.log(`🕒 TIME: ${new Date().toISOString()}`);
  console.log(`📊 STATS: Processed ${processedCount} items, Encountered ${errorCount} errors`);

  if (isProcessing) {
    console.log(`⚠️ WARNING: Shutdown during active processing - some items may need to be reset`);
  } else {
    console.log(`✅ CLEAN SHUTDOWN: No active processing at shutdown time`);
  }

  console.log(`👋 GOODBYE: Server shutting down gracefully`);
  console.log(`==========================================================\n`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`\n==========================================================`);
  console.log(`🛑 SHUTDOWN: Received SIGINT signal (Ctrl+C)`);
  console.log(`🕒 TIME: ${new Date().toISOString()}`);
  console.log(`📊 STATS: Processed ${processedCount} items, Encountered ${errorCount} errors`);

  if (isProcessing) {
    console.log(`⚠️ WARNING: Shutdown during active processing - some items may need to be reset`);
  } else {
    console.log(`✅ CLEAN SHUTDOWN: No active processing at shutdown time`);
  }

  console.log(`👋 GOODBYE: Server shutting down gracefully`);
  console.log(`==========================================================\n`);
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log(`\n==========================================================`);
  console.log(`❌ UNCAUGHT EXCEPTION: ${error.message}`);
  console.log(`🕒 TIME: ${new Date().toISOString()}`);
  console.log(`🔍 STACK TRACE:\n${error.stack}`);
  console.log(`⚠️ WARNING: Server continuing despite uncaught exception`);
  console.log(`==========================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log(`\n==========================================================`);
  console.log(`❌ UNHANDLED REJECTION: ${reason}`);
  console.log(`🕒 TIME: ${new Date().toISOString()}`);
  console.log(`🔍 PROMISE: ${promise}`);
  console.log(`⚠️ WARNING: Server continuing despite unhandled rejection`);
  console.log(`==========================================================\n`);
});