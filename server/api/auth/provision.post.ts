import { createClient } from '@supabase/supabase-js'

// Generate secure password
function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default defineEventHandler(async (event) => {
  // Only allow POST
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  try {
    const body = await readBody(event)
    const { firstName, lastName, email, company, role, clientId } = body

    console.log('Creating user with data:', { firstName, lastName, email, company, role, clientId })

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Validate client assignment for client role
    if (role === 'client' && !clientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client ID required for client role users'
      })
    }

    // Only allow super admin creation for jon@knowbots.ca
    if (email === 'jon@knowbots.ca' && role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Invalid role for this email'
      })
    }

    const config = useRuntimeConfig()

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceKey,
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
      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }
      userId = existingUser.id
    } else {
      console.log('Creating new user...')
      // Create new auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      if (authError) {
        console.error('Auth creation error:', authError)
        throw authError
      }
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

    console.log('Creating access request with data:', requestData)

    const { error: requestError } = await supabaseAdmin
      .from('access_requests')
      .upsert(requestData, {
        onConflict: 'email'
      })

    if (requestError) {
      console.error('Access request error:', requestError)
      throw requestError
    }
    
    console.log('User created successfully!')
    
    return {
      success: true,
      password,
      message: existingUser ? 'Account updated successfully' : 'Account created successfully'
    }
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      details: error
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create account'
    })
  }
})