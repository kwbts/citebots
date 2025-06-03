// Test Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== SUPABASE CONNECTION TEST ===');
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Service Key available:', !!process.env.SUPABASE_SERVICE_KEY);

async function testConnection() {
  try {
    console.log('\nTesting Supabase connection...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Test simple query
    console.log('Querying analysis_queue table...');
    const { data: pendingItems, error, count } = await supabase
      .from('analysis_queue')
      .select('id, created_at, status', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
    
    console.log(`\n✅ CONNECTION SUCCESSFUL!`);
    console.log(`Found ${pendingItems.length} pending items in the queue.`);
    
    if (pendingItems.length > 0) {
      console.log('\nPending items:');
      pendingItems.forEach((item, index) => {
        console.log(`${index + 1}. Item ${item.id} - Created: ${item.created_at}`);
      });
      
      // Test the count functionality too
      const { count: exactCount, error: countError } = await supabase
        .from('analysis_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (!countError) {
        console.log(`\nTotal pending items: ${exactCount}`);
      }
    }
    
    // Also check if we can actually access analysis_run records
    console.log('\nChecking analysis_runs table access...');
    const { data: runs, error: runsError } = await supabase
      .from('analysis_runs')
      .select('id, status, created_at')
      .limit(3);
    
    if (runsError) {
      console.error(`❌ Cannot access analysis_runs table: ${runsError.message}`);
    } else {
      console.log(`✅ Successfully accessed analysis_runs table. Found ${runs.length} records.`);
    }
    
    // Check poll interval
    const pollInterval = process.env.POLL_INTERVAL ? parseInt(process.env.POLL_INTERVAL) : 3600000;
    console.log(`\nCurrent poll interval is set to: ${pollInterval}ms (${pollInterval/1000} seconds)`);
    
    if (pollInterval > 60000) {
      console.warn(`⚠️ WARNING: Poll interval is set to ${pollInterval/1000} seconds, which is quite long. Items may remain in the queue for a while.`);
      console.log(`Consider setting a shorter interval (5-30 seconds) for development in your .env file:`);
      console.log(`POLL_INTERVAL=5000  # 5 seconds`);
    }
    
  } catch (error) {
    console.error(`\n❌ CONNECTION ERROR: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    console.log('\nPossible issues:');
    console.log('1. Invalid SUPABASE_URL or SUPABASE_SERVICE_KEY');
    console.log('2. Network connectivity issues');
    console.log('3. Supabase service is down');
    console.log('4. RLS policies preventing access with the service role');
  }
}

testConnection().catch(console.error);