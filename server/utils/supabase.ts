import { createClient } from '@supabase/supabase-js'

let supabaseAdmin: any = null

export const useSupabaseAdmin = () => {
  if (supabaseAdmin) return supabaseAdmin
  
  const config = useRuntimeConfig()
  
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