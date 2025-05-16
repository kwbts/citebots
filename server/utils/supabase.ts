import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | null = null

export function useSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin
  
  const config = useRuntimeConfig()
  
  console.log('Supabase config check:', {
    hasUrl: !!config.public.supabaseUrl,
    hasServiceKey: !!config.supabaseServiceKey,
    url: config.public.supabaseUrl?.substring(0, 50) + '...'
  })
  
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials')
  }
  
  supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  return supabaseAdmin
}