/**
 * Database Schema Check Script
 * Checks if the content_briefs table has the required columns for tracking metrics
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
    // Directly check if content_briefs table exists by attempting to access it
    const { data: briefsCheck, error: briefsError } = await supabase
      .from('content_briefs')
      .select('id')
      .limit(1);

    if (briefsError && briefsError.code === '42P01') { // Table doesn't exist error
      console.log('❌ content_briefs table does not exist');
      console.log('\nRun the following SQL to create the table:');
      console.log(generateCreateTableSQL());
      return;
    } else if (briefsError) {
      console.log('⚠️ Error checking content_briefs table:', briefsError.message);
      // Continue anyway to see if we can get column info
    } else {
      console.log('✅ content_briefs table exists');
    }

    // Use a direct SQL query to get column information
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'content_briefs' });

    if (columnError) {
      // If the RPC doesn't exist, create it first
      if (columnError.message.includes('function get_table_columns') ||
          columnError.message.includes('does not exist')) {

        console.log('Creating helper function for schema inspection...');

        // Create the function to inspect table columns
        const { error: createFuncError } = await supabase.rpc('exec_sql', {
          sql_string: `
            CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
            RETURNS TABLE(column_name text, data_type text)
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              RETURN QUERY EXECUTE '
                SELECT column_name::text, data_type::text
                FROM information_schema.columns
                WHERE table_schema = ''public''
                AND table_name = ''' || table_name || '''
              ';
            END;
            $$;
          `
        });

        if (createFuncError) {
          throw new Error(`Cannot create helper function: ${createFuncError.message}`);
        }

        // Try again with the newly created function
        const { data: retryColumns, error: retryError } = await supabase
          .rpc('get_table_columns', { table_name: 'content_briefs' });

        if (retryError) {
          throw new Error(`Still cannot get columns: ${retryError.message}`);
        }

        columns = retryColumns;
      } else {
        throw new Error(`Error checking columns: ${columnError.message}`);
      }
    }
    
    if (columnError) {
      throw new Error(`Error checking columns: ${columnError.message}`);
    }
    
    const columnNames = columns.map(c => c.column_name);
    console.log('\nChecking for required tracking columns:');
    
    const requiredColumns = [
      'processing_metrics',
      'source_attribution',
      'ai_models_used',
      'quality_metrics',
      'client_context'
    ];
    
    const missingColumns = [];
    
    requiredColumns.forEach(col => {
      if (columnNames.includes(col)) {
        console.log(`✅ ${col.padEnd(20)} exists`);
      } else {
        console.log(`❌ ${col.padEnd(20)} missing`);
        missingColumns.push(col);
      }
    });
    
    if (missingColumns.length > 0) {
      console.log('\nYou need to add the missing columns. Run the SQL script:');
      console.log('/Users/jontaylor/Documents/kb-citebots/scripts/add-brief-tracking-fields.sql');
      
      console.log('\nOr run the following SQL commands:');
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

function generateCreateTableSQL() {
  return `
CREATE TABLE public.content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id),
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  audience TEXT NOT NULL,
  style_guide TEXT,
  custom_instructions TEXT,
  research_depth TEXT NOT NULL,
  platforms JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  content JSONB,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logs JSONB,
  processing_metrics JSONB,
  source_attribution JSONB,
  ai_models_used JSONB,
  quality_metrics JSONB,
  client_context JSONB
);
`;
}

// Run the check
checkSchema();