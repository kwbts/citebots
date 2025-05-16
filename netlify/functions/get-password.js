const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { email } = body

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required' })
      }
    }

    // Only allow super admin to retrieve passwords
    if (email !== 'jon@knowbots.ca') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NUXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the password from access_requests table
    const { data: accessRequest, error } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !accessRequest) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No access request found for this email' })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        password: accessRequest.generated_password,
        userData: {
          email: accessRequest.email,
          firstName: accessRequest.first_name,
          lastName: accessRequest.last_name,
          company: accessRequest.company,
          status: accessRequest.status,
          approvedAt: accessRequest.approved_at
        }
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message || 'Failed to retrieve password'
      })
    }
  }
}