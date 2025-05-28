import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { executeQuery } from './lib/executeQuery.js';
import { analyzeCitation } from './lib/analyzeCitation.js';

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

// Main queue processing function
async function processQueue() {
  if (isProcessing) {
    console.log('Already processing, skipping');
    return;
  }

  isProcessing = true;
  startTime = new Date().toISOString();
  
  try {
    console.log('🚀 Starting queue processing...');
    
    // Reset any stuck items first
    await resetStuckItems();
    
    const batchSize = parseInt(process.env.BATCH_SIZE) || 3;
    let hasWork = true;
    
    while (hasWork) {
      // Get pending items
      const { data: pendingItems, error } = await supabase
        .from('analysis_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(batchSize);
      
      if (error) {
        console.error('Error fetching queue items:', error);
        break;
      }
      
      if (!pendingItems || pendingItems.length === 0) {
        console.log('No pending items found');
        hasWork = false;
        break;
      }
      
      console.log(`Processing ${pendingItems.length} items...`);
      
      // Process items sequentially
      for (const item of pendingItems) {
        try {
          await processQueueItem(item);
          processedCount++;
          console.log(`✅ Processed item ${item.id}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error processing item ${item.id}:`, error.message);
          await handleItemError(item, error);
        }
        
        // Add delay between items
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
  } catch (error) {
    console.error('Queue processing error:', error);
  } finally {
    isProcessing = false;
    console.log(`🏁 Queue processing completed. Processed: ${processedCount}, Errors: ${errorCount}`);
  }
}

// Process a single queue item
async function processQueueItem(item) {
  console.log(`Processing queue item ${item.id}`);
  
  if (!item.query_data || !item.query_data.query_text) {
    throw new Error('Invalid queue item: missing query_data or query_text');
  }
  
  const { query_data } = item;
  
  // Mark item as processing
  await supabase
    .from('analysis_queue')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      processor_id: 'local-server'
    })
    .eq('id', item.id);
  
  // Create query record
  const { data: queryRecord, error: queryError } = await supabase
    .from('analysis_queries')
    .insert({
      analysis_run_id: item.analysis_run_id,
      query_text: query_data.query_text,
      query_keyword: query_data.keyword || null,
      query_intent: query_data.intent || null,
      data_source: query_data.platform,
      status: 'pending'
    })
    .select()
    .single();
  
  if (queryError) {
    throw new Error(`Failed to create query record: ${queryError.message}`);
  }
  
  // Execute the query using our local function
  const queryResult = await executeQuery({
    query_text: query_data.query_text,
    keyword: query_data.keyword || '',
    query_intent: query_data.intent || '',
    platform: query_data.platform,
    brand_name: query_data.client?.name || '',
    brand_domain: query_data.client?.domain || '',
    competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : []
  });
  
  // Update query with results
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
  
  // Process citations if available
  const citations = queryResult.citations;
  if (Array.isArray(citations) && citations.length > 0) {
    console.log(`Processing ${citations.length} citations`);
    
    const pageAnalyses = [];
    for (const [index, citation] of citations.entries()) {
      if (!citation || !citation.url) continue;
      
      try {
        const pageAnalysis = await analyzeCitation({
          query_id: queryRecord.id,
          citation_url: citation.url,
          citation_position: citation.citation_number || index + 1,
          query_text: query_data.query_text,
          keyword: query_data.keyword || '',
          brand_name: query_data.client?.name || '',
          brand_domain: query_data.client?.domain || '',
          competitors: Array.isArray(query_data.client?.competitors) ? query_data.client.competitors : []
        });
        
        if (pageAnalysis) {
          pageAnalyses.push(pageAnalysis);
        }
      } catch (error) {
        console.error(`Error analyzing citation ${citation.url}:`, error.message);
      }
      
      // Add delay between citations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (pageAnalyses.length > 0) {
      await supabase
        .from('analysis_queries')
        .update({
          associated_pages: pageAnalyses,
          associated_pages_count: pageAnalyses.length
        })
        .eq('id', queryRecord.id);
    }
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
  await updateAnalysisRunProgress(item.analysis_run_id);
}

// Handle item processing error
async function handleItemError(item, error) {
  const newAttempts = (item.attempts || 0) + 1;
  const maxAttempts = item.max_attempts || 3;
  
  if (newAttempts >= maxAttempts) {
    // Mark as permanently failed
    await supabase
      .from('analysis_queue')
      .update({
        status: 'failed',
        error_message: error.message,
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
        error_message: error.message,
        processor_id: null,
        started_at: null,
        attempts: newAttempts
      })
      .eq('id', item.id);
    
    console.log(`Item ${item.id} reset to pending for retry (attempt ${newAttempts}/${maxAttempts})`);
  }
}

// Reset stuck items
async function resetStuckItems() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('analysis_queue')
    .update({
      status: 'pending',
      processor_id: null,
      started_at: null
    })
    .eq('status', 'processing')
    .lt('started_at', fiveMinutesAgo)
    .select();
  
  if (error) {
    console.error('Error resetting stuck items:', error);
  } else if (data && data.length > 0) {
    console.log(`Reset ${data.length} stuck items`);
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

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Citebots Local Server running on port ${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🔧 Manual trigger: POST http://localhost:${PORT}/trigger`);
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}/status`);
  
  // Start polling for queue items
  const pollInterval = parseInt(process.env.POLL_INTERVAL) || 3600000; // 1 hour default
  
  setInterval(() => {
    if (!isProcessing) {
      processQueue().catch(console.error);
    }
  }, pollInterval);
  
  console.log(`🔄 Polling every ${pollInterval}ms for new queue items`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});