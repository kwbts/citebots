// Test file for current Supabase setup
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const dotenv = require('dotenv')

// Try to load from .env file
try {
  dotenv.config()
  console.log('Loaded .env file')
} catch (err) {
  console.log('Could not load .env file:', err.message)
}

// Get environment variables
const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('Environment Variables:')
console.log('NUXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'Not set')
console.log('NUXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set (value hidden)' : 'Not set')
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set (value hidden)' : 'Not set')

async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required environment variables')
    return
  }

  try {
    console.log('\nTesting anonymous client connection...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test public data query
    console.log('Testing public data query...')
    const { data: publicData, error: publicError } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact', head: true })
    
    if (publicError) {
      console.error('Error with public data query:', publicError.message)
      console.error('Error details:', publicError)
    } else {
      console.log('Public data query successful:', publicData)
    }
    
    // Test auth status
    console.log('\nChecking auth status...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth error:', authError.message)
    } else {
      console.log('Auth check successful')
      console.log('Session:', authData.session ? 'Active' : 'None')
    }
    
    // Test service role if available
    if (supabaseServiceKey) {
      console.log('\nTesting service role connection...')
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const { data: adminData, error: adminError } = await adminClient
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true })
      
      if (adminError) {
        console.error('Error with service role query:', adminError.message)
        console.error('Error details:', adminError)
      } else {
        console.log('Service role query successful:', adminData)
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()