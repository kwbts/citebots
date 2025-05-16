import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }
  
  // Only allow super admin to retrieve passwords
  if (email !== 'jon@knowbots.ca') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized'
    })
  }
  
  const supabase = await serverSupabaseServiceRole(event)
  
  try {
    // Get the password from access_requests table
    const { data: accessRequest, error } = await supabase
      .from('access_requests')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No access request found for this email'
      })
    }
    
    return {
      password: accessRequest.generated_password,
      userData: {
        email: accessRequest.email,
        firstName: accessRequest.first_name,
        lastName: accessRequest.last_name,
        company: accessRequest.company,
        status: accessRequest.status,
        approvedAt: accessRequest.approved_at
      }
    }
  } catch (error) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve password'
    })
  }
})