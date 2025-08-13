/**
 * Simple Database Schema Check with Direct SQL
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Checking content_briefs table schema...\n');
  
  try {
    // Check if the table exists by listing all tables
    const { data: listTablesData, error: listTablesError } = await supabase
      .from('content_briefs')
      .select('id')
      .limit(1);
    
    if (listTablesError && listTablesError.code === '42P01') {
      console.error('❌ Table content_briefs does not exist');
      console.log('\nYou need to create the table first. The SQL script for creating the table is:');
      console.log('/Users/jontaylor/Documents/kb-citebots/scripts/create-content-briefs-table-fixed.sql');
      
      // End the script early
      return;
    } else if (listTablesError) {
      console.error('⚠️ Error accessing content_briefs table:', listTablesError.message);
      // We can continue as the table might exist but have other issues
    } else {
      console.log('✅ Table content_briefs exists');
    }
    
    // Check if the tracking columns exist by trying to access them directly
    const trackingColumns = [
      'processing_metrics',
      'source_attribution',
      'ai_models_used',
      'quality_metrics',
      'client_context'
    ];
    
    console.log('\nChecking for required columns:');
    
    const missingColumns = [];
    
    // For each column, try to select it and see if it works
    for (const column of trackingColumns) {
      try {
        const query = `SELECT ${column} FROM content_briefs LIMIT 1`;
        const { data, error } = await supabase.rpc('run_sql_query', { query });
        
        if (error) {
          if (error.message.includes('function run_sql_query') || 
              error.message.includes('does not exist')) {
            console.log('⚠️ Cannot check columns directly. Creating run_sql_query function...');
            
            // Create a helper function to run SQL queries
            const createFuncQuery = `
              CREATE OR REPLACE FUNCTION run_sql_query(query text)
              RETURNS json
              LANGUAGE plpgsql
              SECURITY DEFINER
              AS $$
              DECLARE
                result json;
              BEGIN
                EXECUTE query INTO result;
                RETURN result;
              EXCEPTION WHEN OTHERS THEN
                RETURN json_build_object('error', SQLERRM);
              END;
              $$;
            `;
            
            const { error: createError } = await supabase.rpc('exec_sql', { sql_string: createFuncQuery });
            
            if (createError) {
              if (createError.message.includes('function exec_sql') ||
                  createError.message.includes('does not exist')) {
                console.log('⚠️ Cannot create helper functions. Will use alternative approach.');
                break;
              } else {
                throw new Error(`Failed to create helper function: ${createError.message}`);
              }
            }
            
            // Try the column check again
            const { data: retryData, error: retryError } = await supabase.rpc('run_sql_query', { query });
            
            if (retryError) {
              missingColumns.push(column);
              console.log(`❌ Column ${column.padEnd(20)} is missing`);
            } else {
              console.log(`✅ Column ${column.padEnd(20)} exists`);
            }
          } else if (error.message.includes('column') && error.message.includes('does not exist')) {
            missingColumns.push(column);
            console.log(`❌ Column ${column.padEnd(20)} is missing`);
          } else {
            throw new Error(`Error checking column ${column}: ${error.message}`);
          }
        } else {
          console.log(`✅ Column ${column.padEnd(20)} exists`);
        }
      } catch (err) {
        console.log(`⚠️ Cannot verify column ${column}: ${err.message}`);
        // Assume it's missing to be safe
        missingColumns.push(column);
      }
    }
    
    // Alternative approach using raw tables list
    if (missingColumns.length === trackingColumns.length) {
      console.log('\n⚠️ Could not verify columns directly. Checking SQL script status...');
      
      console.log('\nTo ensure all required columns exist, run the SQL script:');
      console.log('/Users/jontaylor/Documents/kb-citebots/scripts/add-brief-tracking-fields.sql');
      
      // Show the basic SQL needed
      console.log('\nOr run these SQL commands manually:');
      trackingColumns.forEach(col => {
        console.log(`ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS ${col} JSONB DEFAULT NULL;`);
      });
    } else if (missingColumns.length > 0) {
      console.log('\nYou need to add the missing columns. Run the SQL script:');
      console.log('/Users/jontaylor/Documents/kb-citebots/scripts/add-brief-tracking-fields.sql');
      
      console.log('\nOr run these SQL commands manually:');
      missingColumns.forEach(col => {
        console.log(`ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS ${col} JSONB DEFAULT NULL;`);
      });
    } else {
      console.log('\n✅ All required columns exist in the content_briefs table');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

// Run the check
checkSchema();