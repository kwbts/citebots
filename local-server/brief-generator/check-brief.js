#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkBrief(briefId) {
  const { data: brief, error } = await supabase
    .from('content_briefs')
    .select('*')
    .eq('id', briefId)
    .single();
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log('📊 Brief:', brief.title);
  console.log('Status:', brief.status);
  console.log('Strategic Overview:', brief.strategic_overview ? `${brief.strategic_overview.length} chars` : 'None');
  console.log('Created:', brief.created_at);
  console.log('Updated:', brief.updated_at);
  
  if (brief.logs && brief.logs.steps) {
    console.log('\n📝 Processing Steps:');
    brief.logs.steps.forEach((step, i) => {
      console.log(`  ${i+1}. ${step.step}: ${step.timestamp}`);
      if (step.data && step.data.error) {
        console.log(`      ❌ Error: ${step.data.error}`);
      }
    });
  }
}

const briefId = process.argv[2] || "db9ae15d-7581-41fc-8600-ab068ab93a99";
checkBrief(briefId).catch(console.error);