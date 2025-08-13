/**
 * Directly runs the SQL script to add tracking fields to the content_briefs table
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
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

async function runScript() {
  console.log('Adding tracking fields to content_briefs table...\n');
  
  // Path to the SQL script
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'add-brief-tracking-fields.sql');
  
  try {
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ SQL script not found at: ${scriptPath}`);
      
      // Create the script if it doesn't exist
      console.log('Creating the SQL script...');
      
      // SQL script content
      const sqlScript = `-- Add tracking fields to content_briefs table
-- This script adds new fields for monitoring brief generation performance and quality

-- Check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_briefs') THEN
    RAISE EXCEPTION 'Table content_briefs does not exist';
  END IF;
END
$$;

-- 1. Processing metrics for tracking timing and resource usage
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS processing_metrics JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.processing_metrics IS 
'Tracks performance metrics like timing and resource usage during brief generation:
{
  "total_processing_time_ms": 120000,
  "query_generation_time_ms": 5000,
  "llm_research_time_ms": 45000,
  "web_scraping_time_ms": 30000,
  "content_analysis_time_ms": 25000,
  "brief_assembly_time_ms": 15000,
  "urls_processed": 25,
  "total_tokens_used": 15000
}';

-- 2. Source attribution to track where information comes from
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS source_attribution JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.source_attribution IS 
'Tracks the sources of information used in the brief:
{
  "chatgpt_citations": 12,
  "perplexity_citations": 8,
  "google_search_results": 15,
  "primary_urls": 10,
  "secondary_urls": 15,
  "competitor_urls": 5,
  "citation_domains": ["example.com", "competitor.com", "research.org"]
}';

-- 3. AI model usage to track which models contributed
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS ai_models_used JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.ai_models_used IS 
'Tracks AI models used during brief generation:
{
  "claude": {
    "model_version": "claude-sonnet-4-20250514",
    "usage": "insight_generation",
    "tokens_used": 5000
  },
  "gpt": {
    "model_version": "gpt-4o",
    "usage": "content_analysis",
    "tokens_used": 8000
  },
  "perplexity": {
    "model_version": "llama-3-70b-online",
    "usage": "research",
    "tokens_used": 2000
  }
}';

-- 4. Quality metrics to assess brief output quality
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.quality_metrics IS 
'Metrics to assess the quality of the generated brief:
{
  "statistics_count": 15,
  "expert_quotes_count": 5,
  "citation_count": 20,
  "competitor_insight_count": 8,
  "toc_sections_count": 6,
  "research_links_count": 12,
  "word_count": 2500,
  "claude_enhanced": true
}';

-- 5. Enhanced client context tracking
ALTER TABLE content_briefs 
ADD COLUMN IF NOT EXISTS client_context JSONB DEFAULT NULL;

COMMENT ON COLUMN content_briefs.client_context IS 
'Enhanced client data used for brief generation:
{
  "market_position": "leader|challenger|niche",
  "differentiators": ["unique technology", "industry expertise"],
  "competitors_analyzed": ["competitor1.com", "competitor2.com"],
  "industry_context": "specific industry insights used"
}';

-- Index for faster queries on these new JSONB fields
CREATE INDEX IF NOT EXISTS idx_content_briefs_quality_metrics ON content_briefs USING GIN (quality_metrics);
CREATE INDEX IF NOT EXISTS idx_content_briefs_ai_models_used ON content_briefs USING GIN (ai_models_used);

-- Output confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added tracking fields to content_briefs table';
END
$$;`;
      
      // Write the script
      fs.writeFileSync(path.join(__dirname, 'add-brief-tracking-fields.sql'), sqlScript, 'utf8');
      console.log(`✅ Created SQL script at: ${path.join(__dirname, 'add-brief-tracking-fields.sql')}`);
      
      // Use the local path now
      scriptPath = path.join(__dirname, 'add-brief-tracking-fields.sql');
    }
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip DO blocks as they're problematic through RPC
      if (stmt.toUpperCase().includes('DO $$')) {
        console.log(`⚠️ Skipping DO block (${i+1}/${statements.length})`);
        continue;
      }
      
      // Skip COMMENT statements as they're often problematic through RPC
      if (stmt.toUpperCase().includes('COMMENT ON')) {
        console.log(`⚠️ Skipping COMMENT statement (${i+1}/${statements.length})`);
        continue;
      }
      
      console.log(`Executing statement ${i+1}/${statements.length}...`);
      
      // Add the column directly
      if (stmt.toUpperCase().includes('ALTER TABLE')) {
        const column = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/);
        if (column && column[1]) {
          console.log(`Adding column: ${column[1]}`);
          
          const { error } = await supabase
            .from('content_briefs')
            .update({ [column[1]]: null })
            .eq('id', 'will-not-match-anything');
            
          if (error && error.code === '42703') {
            console.log(`Column ${column[1]} doesn't exist yet, adding it...`);
            
            // Create the column directly using raw SQL via the supabase-js API
            const { error: alterError } = await supabase.rpc('exec_sql', { 
              sql_string: stmt
            });
            
            if (alterError) {
              if (alterError.message.includes('function exec_sql') || 
                  alterError.message.includes('does not exist')) {
                console.log(`⚠️ Cannot execute SQL directly. Please run the SQL script manually.`);
                break;
              } else {
                console.error(`❌ Error executing statement: ${alterError.message}`);
              }
            } else {
              console.log(`✅ Column added successfully`);
            }
          } else if (error && error.message.includes('column')) {
            console.log(`❌ Error accessing column: ${error.message}`);
          } else {
            console.log(`✅ Column already exists`);
          }
        }
      }
      
      // Create indexes
      if (stmt.toUpperCase().includes('CREATE INDEX')) {
        const indexMatch = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/);
        if (indexMatch && indexMatch[1]) {
          console.log(`Creating index: ${indexMatch[1]}`);
          
          const { error } = await supabase.rpc('exec_sql', { 
            sql_string: stmt
          });
          
          if (error) {
            if (error.message.includes('function exec_sql') || 
                error.message.includes('does not exist')) {
              console.log(`⚠️ Cannot create index directly. Please run the SQL script manually.`);
              break;
            } else {
              console.error(`❌ Error creating index: ${error.message}`);
            }
          } else {
            console.log(`✅ Index created successfully`);
          }
        }
      }
    }
    
    console.log('\n===========================');
    console.log('Schema Update Summary');
    console.log('===========================');
    console.log('The script has attempted to add the tracking fields to the content_briefs table.');
    console.log('If you encountered any errors, please run the SQL script manually:');
    console.log(scriptPath);
    console.log('\nTo run the script manually, use:');
    console.log('psql -h YOUR_SUPABASE_HOST -d postgres -U postgres -f scripts/add-brief-tracking-fields.sql');
    console.log('\nOr copy and paste the SQL into the Supabase SQL Editor in the dashboard.');
    
  } catch (error) {
    console.error('Error running script:', error.message);
    console.log('\nPlease run the SQL script manually:');
    console.log('/Users/jontaylor/Documents/kb-citebots/scripts/add-brief-tracking-fields.sql');
  }
}

// Run the script
runScript();