// Test file to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Hardcode these values for testing purposes only
// In production, always use environment variables
const SUPABASE_URL = 'https://trmaeodthlywcjwfzdka.supabase.co'; // From your CLAUDE.md file
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

console.log('Testing Supabase connection with:');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key:', SUPABASE_ANON_KEY ? 'Set (value hidden)' : 'Not set/using placeholder');

async function testConnection() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test query - just check if public schema exists
    console.log('Attempting to connect to Supabase...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Result:', data);
    
  } catch (err) {
    console.error('Exception during connection test:', err.message);
  }
}

testConnection();