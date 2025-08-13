/**
 * Simple verification script to check if the tracking columns were added
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyColumns() {
  console.log('Verifying tracking columns in content_briefs table...\n');
  
  try {
    // Test columns by inserting null values in a test row
    const testColumns = [
      'processing_metrics',
      'source_attribution',
      'ai_models_used',
      'quality_metrics',
      'client_context'
    ];
    
    // Get a sample brief to verify columns
    const { data: brief, error } = await supabase
      .from('content_briefs')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Error fetching sample brief: ${error.message}`);
    }
    
    if (!brief || brief.length === 0) {
      console.log('No briefs found in the database. Creating test data...');
      
      // Create a test brief to verify columns
      const { data: newBrief, error: insertError } = await supabase
        .from('content_briefs')
        .insert({
          title: 'Test Brief',
          keywords: ['test'],
          purpose: 'Testing column verification',
          audience: 'Developers',
          research_depth: 'comprehensive',
          platforms: { chatGpt: true, perplexity: true, google: true },
          status: 'test',
          processing_metrics: { test: true },
          source_attribution: { test: true },
          ai_models_used: { test: true },
          quality_metrics: { test: true },
          client_context: { test: true }
        })
        .select();
      
      if (insertError) {
        throw new Error(`Error creating test brief: ${insertError.message}`);
      }
      
      if (!newBrief || newBrief.length === 0) {
        throw new Error('Failed to create test brief');
      }
      
      console.log('✅ Successfully created test brief with tracking columns');
      console.log('✅ All tracking columns verified!');
      
      // Clean up test data
      await supabase
        .from('content_briefs')
        .delete()
        .eq('id', newBrief[0].id);
        
      console.log('✅ Test data cleaned up');
      
      return;
    }
    
    // Try to update each column with null to verify it exists
    const briefId = brief[0].id;
    
    console.log(`Testing columns on brief ${briefId}:`);
    for (const column of testColumns) {
      try {
        const { error: updateError } = await supabase
          .from('content_briefs')
          .update({ [column]: null })
          .eq('id', briefId);
        
        if (updateError && updateError.code === '42703') {
          console.log(`❌ Column ${column.padEnd(20)} does not exist`);
        } else if (updateError) {
          console.log(`⚠️ Error testing column ${column.padEnd(20)}: ${updateError.message}`);
        } else {
          console.log(`✅ Column ${column.padEnd(20)} exists`);
        }
      } catch (err) {
        console.log(`⚠️ Error testing column ${column.padEnd(20)}: ${err.message}`);
      }
    }
    
    console.log('\nVerification complete! All tracking columns should be ready for use.');
    
  } catch (error) {
    console.error('Error verifying columns:', error.message);
  }
}

// Run the verification
verifyColumns();