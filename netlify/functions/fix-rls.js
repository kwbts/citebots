const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NUXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Simple test query first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)

    if (testError) {
      console.log('Test error:', testError)
    }

    // Now let's try to fix the RLS
    const result = {
      testQuery: { data: testData, error: testError },
      actions: []
    }

    // Get all profiles using service key (bypasses RLS)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
    
    result.profiles = {
      count: profiles?.length || 0,
      error: profilesError?.message
    }

    // Find Jon's profile
    const jonProfile = profiles?.find(p => p.email === 'jon@knowbots.ca')
    result.jonProfile = jonProfile

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Fix RLS error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message,
        stack: error.stack
      })
    }
  }
}