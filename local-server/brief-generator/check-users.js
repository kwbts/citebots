#!/usr/bin/env node

/**
 * Check what users exist in the database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('👥 CHECKING USERS IN DATABASE');
  console.log('=' .repeat(50));
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .limit(10);
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles found:', profiles.length);
      profiles.forEach((profile, i) => {
        console.log(`  ${i+1}. ${profile.email} (${profile.id}) - ${profile.role}`);
      });
    }
    
    // Check if there are any existing content briefs to see what user IDs are being used
    const { data: briefs, error: briefsError } = await supabase
      .from('content_briefs')
      .select('id, created_by, title, status')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (briefsError) {
      console.log('❌ Error fetching briefs:', briefsError.message);
    } else {
      console.log('\n📄 Recent Briefs:');
      briefs.forEach((brief, i) => {
        console.log(`  ${i+1}. ${brief.title} (${brief.id}) - User: ${brief.created_by}, Status: ${brief.status}`);
      });
    }
    
    // Try to use the first profile ID for testing
    if (profiles && profiles.length > 0) {
      console.log(`\n✅ Use this user ID for testing: ${profiles[0].id}`);
      return profiles[0].id;
    } else {
      console.log('\n❌ No users found in database');
      return null;
    }
    
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
    return null;
  }
}

checkUsers().then(userId => {
  if (userId) {
    console.log(`\n💡 To test the server, use userId: "${userId}"`);
  }
}).catch(error => {
  console.error('❌ Check failed:', error);
});