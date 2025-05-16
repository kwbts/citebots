import { createClient } from '@supabase/supabase-js'

// For client-side - use runtime config
export const useSupabaseClient = () => {
  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
}

// For server-side - we'll create this in the server utils