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
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Step 1: Get the super admin user
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`)
    }
    
    const adminUser = users.find(u => u.email === 'jon@knowbots.ca')
    
    if (!adminUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Admin user not found' })
      }
    }

    // Step 2: Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .maybeSingle()

    console.log('Profile check:', { existingProfile, checkError })

    // Step 3: Create or update profile
    if (!existingProfile) {
      const profileData = {
        id: adminUser.id,
        email: adminUser.email,
        first_name: 'Jon',
        last_name: 'Taylor',
        company: 'Knowbots',
        role: 'super_admin',
        is_active: true
      }

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          action: 'created',
          profile: newProfile,
          error: createError ? createError.message : null
        })
      }
    } else {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: 'Jon',
          last_name: 'Taylor',
          company: 'Knowbots',
          role: 'super_admin',
          is_active: true
        })
        .eq('id', adminUser.id)
        .select()
        .single()

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          action: 'updated',
          profile: updatedProfile,
          error: updateError ? updateError.message : null
        })
      }
    }
  } catch (error) {
    console.error('Error in simple-fix:', error)
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