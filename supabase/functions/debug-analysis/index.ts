import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the incoming request
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    const body = await req.json()
    console.log('Request body:', body)
    
    // Get auth header
    const authHeader = req.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    // Test Supabase client creation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Env vars present:', {
      url: !!supabaseUrl,
      anonKey: !!supabaseKey,
      serviceKey: !!serviceKey
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        debug: {
          method: req.method,
          body: body,
          hasAuth: !!authHeader,
          envVars: {
            url: !!supabaseUrl,
            anonKey: !!supabaseKey,
            serviceKey: !!serviceKey
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Debug function error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})