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
    const { action } = body

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

    let result = {}

    switch (action) {
      case 'check-tables':
        // List all tables
        const { data: tables, error: tablesError } = await supabaseAdmin
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .eq('table_schema', 'public')
        
        result.tables = tables
        result.tablesError = tablesError
        break

      case 'check-profiles':
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*')
        
        result.profiles = profiles
        result.profilesError = profilesError
        break

      case 'check-auth-users':
        // List auth users
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        
        result.users = users?.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        }))
        result.usersError = usersError
        break

      case 'get-user-profile':
        const { userId } = body
        if (!userId) throw new Error('userId required')
        
        // Get specific profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        result.profile = profile
        result.profileError = profileError
        break

      case 'create-profile':
        const { profileData } = body
        if (!profileData) throw new Error('profileData required')
        
        // Create or update profile
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .upsert(profileData)
          .select()
          .single()
        
        result.profile = newProfile
        result.createError = createError
        break

      default:
        throw new Error('Invalid action')
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Debug error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message || 'Debug operation failed'
      })
    }
  }
}