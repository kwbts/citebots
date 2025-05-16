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
    const { firstName, lastName, email, company, role } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      }
    }

    // Only allow super admin creation for jon@knowbots.ca
    if (email === 'jon@knowbots.ca' && role !== 'super_admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Invalid role for this email' })
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

    // Generate password
    const password = generatePassword()

    console.log('Processing user:', email)
    
    // First, check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === email)
    
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
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        role: role || 'client'
      }, {
        onConflict: 'id'
      })

    if (profileError) throw profileError
    
    // Store or update access request record
    const { error: requestError } = await supabaseAdmin
      .from('access_requests')
      .upsert({
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        status: 'approved',
        approved_at: new Date().toISOString(),
        generated_password: password
      }, {
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
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message || 'Failed to create account'
      })
    }
  }
}