const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkBriefStatus(briefId) {
  const { data, error } = await supabase
    .from('content_briefs')
    .select('status, title, content, logs')
    .eq('id', briefId)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Final Status:', data.status);
  console.log('Has content:', data.content !== null);
  
  if (data.content) {
    console.log('Content sections:');
    console.log('- Summary:', data.content.summary !== undefined);
    console.log('- Table of contents:', data.content.table_of_contents?.length || 0);
    console.log('- Content suggestions:', data.content.content_suggestions?.length || 0);
    console.log('- Research links:', data.content.research_links?.length || 0);
  }
  
  console.log('Total processing steps:', data.logs.steps.length);
  
  if (data.logs.steps.length > 0) {
    const lastStep = data.logs.steps[data.logs.steps.length - 1];
    console.log('Last step:', lastStep.step);
    console.log('Last step timestamp:', lastStep.timestamp);
  }
}

const briefId = process.argv[2] || '85acaf02-973d-41e4-83a1-f3a2939e54a9';
checkBriefStatus(briefId);