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
    console.log('Creating user with email:', email)

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw authError
    }

    console.log('User created:', authUser.user.id)
    
    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        role: role || 'client'
      })
    
    if (profileError) throw profileError
    
    // Store access request record
    const { error: requestError } = await supabaseAdmin
      .from('access_requests')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        status: 'approved',
        approved_at: new Date().toISOString(),
        generated_password: password
      })
    
    if (requestError) throw requestError
    
    return {
      success: true,
      password,
      message: 'Account created successfully'
    }
  } catch (error) {
    console.error('Provisioning error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create account'
    })
  }
})