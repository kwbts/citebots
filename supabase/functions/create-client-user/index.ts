import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Generate secure password
function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { firstName, lastName, email, company, role, clientId } = await req.json()

    console.log('Creating user with data:', { firstName, lastName, email, company, role, clientId })

    // Validate required fields
    if (!firstName || !lastName || !email || !company) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate client assignment for client role
    if (role === 'client' && !clientId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Client ID required for client role users' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Only allow super admin creation for jon@knowbots.ca
    if (email === 'jon@knowbots.ca' && role !== 'super_admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid role for this email' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get requesting user from JWT
    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with service role (built-in to edge functions)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify requesting user is super admin
    const { data: { user: requestingUser }, error: authError } = 
      await supabaseAdmin.auth.getUser(token)

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if requesting user is super admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('account_type, role')
      .eq('id', requestingUser.id)
      .single()

    if (!profile || (profile.account_type !== 'super_admin' && profile.role !== 'super_admin')) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Super admin access required' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate password
    const password = generatePassword()

    console.log('Processing user:', email)

    // Check if user already exists by checking profiles table (more efficient)
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
      account_type: role || 'client'
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
    
    return new Response(JSON.stringify({
      success: true,
      password,
      message: existingUser ? 'Account updated successfully' : 'Account created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      details: error
    })
    
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Failed to create account'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})