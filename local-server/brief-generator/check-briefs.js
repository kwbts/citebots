const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBriefs() {
  try {
    // Get all briefs
    const { data: briefs, error } = await supabase
      .from('content_briefs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!briefs || briefs.length === 0) {
      console.log('No briefs found in the database.');
      return;
    }

    console.log(`Found ${briefs.length} briefs in the database:\n`);
    
    briefs.forEach((brief, index) => {
      console.log(`Brief #${index + 1}:`);
      console.log(`ID: ${brief.id}`);
      console.log(`Title: ${brief.title}`);
      console.log(`Status: ${brief.status}`);
      console.log(`Created: ${new Date(brief.created_at).toLocaleString()}`);
      console.log(`Client ID: ${brief.client_id || 'None (generic)'}`);
      
      // Check if content exists and is properly structured
      if (brief.content) {
        console.log('Content structure:');
        const contentKeys = Object.keys(brief.content);
        console.log(`  - Has ${contentKeys.length} keys: ${contentKeys.join(', ')}`);
        
        // Check for specific expected keys
        const expectedKeys = ['summary', 'content_suggestions', 'table_of_contents', 'research_links'];
        const missingKeys = expectedKeys.filter(key => !contentKeys.includes(key));
        
        if (missingKeys.length > 0) {
          console.log(`  - WARNING: Missing expected keys: ${missingKeys.join(', ')}`);
        } else {
          console.log('  - All expected content keys are present');
        }
      } else {
        console.log('Content: None (Empty or null)');
      }
      
      console.log('-----------------------------------');
    });
    
    // Print the first brief's content structure in detail
    if (briefs.length > 0 && briefs[0].content) {
      console.log('\nDetailed structure of the most recent brief:');
      console.log(JSON.stringify(briefs[0].content, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking briefs:', error.message);
  }
}

// Run the function
checkBriefs();
