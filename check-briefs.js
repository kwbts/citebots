// Simple script to check for briefs in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBriefs() {
  try {
    console.log('\n🔍 Checking for briefs in the database...');
    
    // Check if content_briefs table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('content_briefs')
      .select('count(*)')
      .limit(1)
      .maybeSingle();
    
    if (tableError) {
      console.error('\n❌ Error: content_briefs table may not exist');
      console.error(`   ${tableError.message}`);
      return;
    }
    
    console.log('✅ content_briefs table exists\n');
    
    // Get all briefs
    const { data: briefs, error } = await supabase
      .from('content_briefs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ Database error: ${error.message}`);
      return;
    }
    
    if (!briefs || briefs.length === 0) {
      console.log('⚠️ No briefs found in the database.\n');
      console.log('Try creating a brief first. Check if you can access:');
      console.log('1. /dashboard/actions/content-brief (brief creation page)');
      console.log('2. Verify your database permissions\n');
      return;
    }
    
    console.log(`🎉 Found ${briefs.length} briefs in the database:\n`);
    
    briefs.forEach((brief, i) => {
      console.log(`${i+1}. ID: ${brief.id}`);
      console.log(`   Title: ${brief.title}`);
      console.log(`   Status: ${brief.status}`);
      console.log(`   Created: ${new Date(brief.created_at).toLocaleString()}`);
      console.log(`   Content:`, brief.content ? '✅ Present' : '❌ Missing');
      console.log(`   URL: /dashboard/actions/content-brief/view/${brief.id}\n`);
    });
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Copy any brief ID from above');
    console.log('2. Visit: /dashboard/actions/content-brief/view/[paste-id-here]');
    console.log('3. Check browser console for errors\n');
    
  } catch (error) {
    console.error('Error checking briefs:', error.message);
  }
}

// Run the function
checkBriefs();