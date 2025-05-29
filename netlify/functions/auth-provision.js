const { createClient } = require('@supabase/supabase-js')

// Generate secure password
function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

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
    const { firstName, lastName, email, company, role, clientId } = body

    console.log('Creating user with data:', { firstName, lastName, email, company, role, clientId })

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    // Validate client assignment for client role
    if (role === 'client' && !clientId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Client ID required for client role users' })
      }
    }

    // Only allow super admin creation for jon@knowbots.ca
    if (email === 'jon@knowbots.ca' && role !== 'super_admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid role for this email' })
      }
    }

    // Validate environment variables
    if (!process.env.NUXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NUXT_PUBLIC_SUPABASE_URL environment variable')
    }

    if (!process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')
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

    // Generate password
    const password = generatePassword()

    console.log('Processing user:', email)

    // First, check if user already exists by checking profiles table (more efficient)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    let existingUser = null
    if (existingProfile) {
      // Get the auth user by ID if profile exists
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingProfile.id)
      existingUser = authUser.user
    }
    
    let userId
    
    if (existingUser) {
      console.log('User already exists, updating...')
      // Update existing user's password
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password }
      )
      if (updateError) throw updateError
      userId = existingUser.id
    } else {
      console.log('Creating new user...')
      // Create new auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      if (authError) throw authError
      userId = authUser.user.id
    }

    // Create or update profile (upsert to handle any race conditions)
    const profileData = {
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      company,
      role: role || 'client',
      account_type: role || 'client' // Set account_type to match role
    }

    // Add client assignment for client users
    if (role === 'client' && clientId) {
      profileData.client_account_id = clientId
    }

    console.log('Creating profile with data:', profileData)

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      throw profileError
    }

    // Note: Client assignment is now handled via client_account_id in profiles table
    // No need for separate client_access table in Phase 1 implementation

    // Store or update access request record
    const requestData = {
      email,
      first_name: firstName,
      last_name: lastName,
      company,
      role: role || 'client',
      status: 'approved',
      approved_at: new Date().toISOString(),
      generated_password: password
    }

    // Add client_id if provided
    if (clientId) {
      requestData.client_id = clientId
    }

    const { error: requestError } = await supabaseAdmin
      .from('access_requests')
      .upsert(requestData, {
        onConflict: 'email'
      })

    if (requestError) throw requestError
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        password,
        message: existingUser ? 'Account updated successfully' : 'Account created successfully'
      })
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      details: error
    })
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || 'Failed to create account',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}