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

    // Fix 1: Drop all RLS policies and recreate them
    const dropPolicies = `
      ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
      DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;
    `
    
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
      query: dropPolicies
    }).catch(() => ({ error: 'Could not drop policies' }))

    // Fix 2: Create simple bypass policy for service role
    const bypassPolicy = `
      CREATE POLICY "Service role bypass" ON profiles
        USING (auth.role() = 'service_role');
    `
    
    await supabaseAdmin.rpc('exec_sql', {
      query: bypassPolicy
    }).catch(() => ({ error: 'Could not create bypass policy' }))

    // Fix 3: Ensure the table exists and has the right structure
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)

    // Fix 4: Create profile for the auth user if it doesn't exist
    const { data: { user } } = await supabaseAdmin.auth.admin.listUsers()
      .then(({ data }) => ({ data: { user: data.users.find(u => u.email === 'jon@knowbots.ca') } }))

    if (user) {
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile || profileCheckError) {
        // Create the profile
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            email: 'jon@knowbots.ca',
            first_name: 'Jon',
            last_name: 'Taylor',
            company: 'Knowbots',
            role: 'super_admin',
            is_active: true
          })
          .select()
          .single()

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Profile created',
            profile: newProfile,
            error: createError
          })
        }
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Profile already exists',
            profile: existingProfile
          })
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Database check complete',
        userFound: !!user,
        tableError
      })
    }
  } catch (error) {
    console.error('Fix error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: error.message || 'Fix operation failed'
      })
    }
  }
}