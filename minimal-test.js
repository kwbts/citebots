// Minimal test file for Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Hardcode URL for testing purposes
const SUPABASE_URL = 'https://trmaeodthlywcjwfzdka.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace this with your actual anon key

async function testConnection() {
  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Supabase client created');
    console.log('Client:', supabase);
    
    console.log('Checking auth configuration...');
    // Just a simple auth check
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error.message);
      return;
    }
    
    console.log('Auth check successful');
    console.log('Session data:', data);
    
  } catch (err) {
    console.error('Exception during connection test:', err);
  }
}

testConnection();