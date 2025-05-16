// Server-side utilities are auto-imported

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
  // Get request body
  const body = await readBody(event)
  const { firstName, lastName, email, company, role } = body

  // Validate required fields
  if (!firstName || !lastName || !email || !company) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // Only allow super admin creation for jon@knowbots.ca
  if (email === 'jon@knowbots.ca' && role !== 'super_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid role for this email'
    })
  }

  // Get admin client
  const supabaseAdmin = useSupabaseAdmin()

  // Generate password
  const password = generatePassword()

  try {
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
      
      if (authError) {
        console.error('Auth creation error:', authError)
        throw authError
      }
      userId = authUser.user.id
    }

    console.log('User ID:', userId)

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

    if (profileError) {
      console.error('Profile error:', profileError)
      throw profileError
    }
    
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
    
    if (requestError) {
      console.error('Access request error:', requestError)
      throw requestError
    }
    
    return {
      success: true,
      password,
      message: existingUser ? 'Account updated successfully' : 'Account created successfully'
    }
  } catch (error) {
    console.error('Provisioning error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create account'
    })
  }
})